import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { Employee, AnalysisResult, CompetencyScore, ReportCategory } from '../types';
import { generateHtmlReport } from './reportGenerator';

// Competency Definitions (For CE/CO Dynamic Matching)
const COMPETENCIES_NORMAL_FALLBACK = [
  'Communication', 'Interpersonal Skills', 'Achievement Orientation', 
  'Team Leadership', 'Employee Development', 'Delegation', 'Key Attributes'
];

const COMPETENCIES_CE_CO = [
  // Personal Leadership Traits
  'Purpose', 'Curiosity', 'Organization', 'Communications', 'Realistic Optimism', 'EQ',
  // Leadership Capabilities
  'Direction', 'Business Judgement', 'Competitive Edge', 'Building Talents', 'Inspirational', 'Execution', 'Influence', 'Collaboration',
  // Organization Culture
  'Committed', 'Agile', 'Respectful', 'Ethical',
  // Team Motivation
  'Team Motivation'
];

// Helper to normalize marks: 1.0 -> 100, 0.85 -> 85
const normalizeScore = (val: any): number => {
    let score = parseFloat(val) || 0;
    // If score is a decimal percentage (e.g., 0.8, 1.0), convert to 100 scale
    // We assume valid scores > 0. If it's already > 1 (e.g. 85), we keep it as is.
    if (score > 0 && score <= 1.0) {
        score = score * 100;
    }
    return score;
};

export const parseExcel = (file: File, category: ReportCategory = 'Normal'): Promise<Employee[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Use 'A' header option to get raw column access (A, B, C...)
        const rawData = XLSX.utils.sheet_to_json<any>(sheet, { header: "A", defval: "" });
        
        if (rawData.length === 0) {
            resolve([]);
            return;
        }

        const headerRow = rawData[0]; 

        // Helper to find column key dynamically
        const findCol = (search: string | RegExp) => {
             return Object.keys(headerRow).find(key => {
                 const val = String(headerRow[key]).toLowerCase().trim();
                 if (search instanceof RegExp) return search.test(val);
                 return val.includes(search.toLowerCase());
             });
        };

        const colId = findCol(/^employee id$/i) || 'A';
        const colName = findCol(/^name$/i) || 'B';
        const colTitle = findCol(/^job title$/i) || 'C';
        const colDept = findCol(/^department$/i) || 'D';
        
        const colOverallLES = findCol(/^overall les$/i) || 'BJ';
        const colOverallPMS = findCol(/^overall pms$/i) || 'BK';
        const colFeedback = findCol(/^feedback$/i) || 'BM';

        const employees: Employee[] = [];

        // Iterate data rows (Skip header row 0)
        for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];
            const name = row[colName];
            
            // Skip rows without a name
            if (!name) continue;

            let competencies: CompetencyScore[] = [];

            // The 7 competencies
            const compNames = [
                'Communication', 'Interpersonal', 'Employee Development', 
                'Achievement', 'Team Leadership', 'Delegation', 'Key Attributes'
            ];

            competencies = compNames.map(compName => {
                const cSup = findCol(new RegExp(`^Superior ${compName}$`, 'i'));
                const cSub = findCol(new RegExp(`^Subordinate ${compName}$`, 'i'));
                const cPeer = findCol(new RegExp(`^Peer ${compName}$`, 'i'));

                const supScore = cSup ? normalizeScore(row[cSup]) : 0;
                const subScore = cSub ? normalizeScore(row[cSub]) : 0;
                const peerScore = cPeer ? normalizeScore(row[cPeer]) : 0;

                const scores = [supScore, subScore, peerScore].filter(s => s > 0);
                const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                const gap = (subScore > 0 && supScore > 0) ? subScore - supScore : 0;

                return {
                    name: compName,
                    sup: supScore,
                    sub: subScore,
                    peer: peerScore,
                    avg,
                    gap
                };
            });

            const questions: number[] = [];
            for (let q = 1; q <= 28; q++) {
                const qKey = q < 10 ? `0${q}` : `${q}`;
                const colQ = findCol(new RegExp(`^Overall ${qKey}$`, 'i'));
                const qScore = colQ ? normalizeScore(row[colQ]) : 0;
                questions.push(qScore);
            }

            let overallLES = 0;
            if (colOverallLES && row[colOverallLES]) {
                overallLES = Math.round(parseFloat(row[colOverallLES]) * 100);
            }

            employees.push({
                id: row[colId] || 'Unknown',
                name: row[colName] || 'Unknown',
                jobTitle: row[colTitle] || 'Unknown',
                department: row[colDept] || 'Unknown',
                reportType: category,
                overallLES,
                overallPMS: colOverallPMS ? (row[colOverallPMS] || '') : '',
                questions,
                feedback: colFeedback ? (row[colFeedback] || '') : '',
                competencies
            });
        }
        
        resolve(employees);

      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};


export const generateBulkExcelReport = (reports: { employee: Employee; analysis: AnalysisResult }[]) => {
  const wb = XLSX.utils.book_new();

  const headers = [
    "Employee ID", "Name", "Job Title", "Department", "Report Type", "Date Generated",
    "Archetype", "Archetype Description",
    "Strength 1 Competency", "Strength 1 Evidence",
    "Strength 2 Competency", "Strength 2 Evidence",
    "Strength 3 Competency", "Strength 3 Evidence",
    "Opportunity 1 Competency", "Opportunity 1 Evidence",
    "Opportunity 2 Competency", "Opportunity 2 Evidence",
    "Opportunity 3 Competency", "Opportunity 3 Evidence",
    "Public Arena (Shared View)", "Blind Spots (External View)",
    "Staller 1 Name", "Staller 1 Status", "Staller 1 Impact",
    "Staller 2 Name", "Staller 2 Status", "Staller 2 Impact",
    "Staller 3 Name", "Staller 3 Status", "Staller 3 Impact",
    "Action Plan 70% (Experience)", "Action Plan 20% (Exposure)", "Action Plan 10% (Education)"
  ];

  const dataRows = reports.map(r => {
    const { employee, analysis } = r;
    const { dominantInsights, stallers } = analysis;

    const getStrength = (idx: number) => dominantInsights.strengths[idx] || { competency: "", evidence: "" };
    const getOpp = (idx: number) => dominantInsights.opportunities[idx] || { competency: "", evidence: "" };
    const getStaller = (idx: number) => stallers[idx] || { staller: "", status: "", impact: "" };

    return [
      employee.id, 
      employee.name, 
      employee.jobTitle, 
      employee.department,
      employee.reportType,
      new Date().toLocaleDateString(),
      analysis.archetype.title, 
      analysis.archetype.description,
      getStrength(0).competency, getStrength(0).evidence,
      getStrength(1).competency, getStrength(1).evidence,
      getStrength(2).competency, getStrength(2).evidence,
      getOpp(0).competency, getOpp(0).evidence,
      getOpp(1).competency, getOpp(1).evidence,
      getOpp(2).competency, getOpp(2).evidence,
      analysis.johariWindow.publicArena, 
      analysis.johariWindow.blindSpots,
      getStaller(0).staller, getStaller(0).status, getStaller(0).impact,
      getStaller(1).staller, getStaller(1).status, getStaller(1).impact,
      getStaller(2).staller, getStaller(2).status, getStaller(2).impact,
      analysis.actionPlan.experience, 
      analysis.actionPlan.exposure, 
      analysis.actionPlan.education
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  
  const wscols = headers.map(() => ({ wch: 20 }));
  const wideColumns = [6, 8, 10, 12, 14, 16, 18, 19, 20, 23, 26, 29, 30, 31, 32];
  wideColumns.forEach(i => {
    if (wscols[i]) wscols[i] = { wch: 50 };
  });
  
  ws['!cols'] = wscols;

  XLSX.utils.book_append_sheet(wb, ws, "LES 360 Consolidated Report");
  
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `LES360_Bulk_Report_${timestamp}.xlsx`);
};

export const generateBulkHtmlExport = async (reports: { employee: Employee; analysis: AnalysisResult }[]) => {
  const zip = new JSZip();

  reports.forEach(r => {
    const htmlContent = generateHtmlReport(r.employee, r.analysis);
    // Sanitize filename
    const safeName = r.employee.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    zip.file(`${safeName}_${r.employee.id}_report.html`, htmlContent);
  });

  const timestamp = new Date().toISOString().split('T')[0];
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `LES360_HTML_Reports_${timestamp}.zip`);
};
