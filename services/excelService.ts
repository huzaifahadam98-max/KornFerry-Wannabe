import * as XLSX from 'xlsx';
import { Employee, ReportData, AnalysisResult } from '../types';

export const parseExcel = (file: File): Promise<Employee[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const employees: Employee[] = jsonData.map((row: any) => ({
          id: row['Employee ID'] || row['ID'] || 'Unknown',
          name: row['Name'] || 'Unknown',
          jobTitle: row['Job Title'] || row['Position'] || 'Unknown',
          department: row['Department'] || 'Unknown',
          superiorFeedback: row['(Qualitative) Overall Feedback-Superior'] || row['Superior Feedback'] || '',
          subordinateFeedback: row['(Qualitative) Overall Feedback-Subordinate'] || row['Subordinate Feedback'] || '',
          peerFeedback: row['(Qualitative) Overall Feedback-Peers'] || row['Peer Feedback'] || '',
        }));

        resolve(employees);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

const getReportSheetData = (employee: Employee, analysis: AnalysisResult) => {
  return [
    ["LES 360 Individual Report"],
    ["Employee Name", employee.name],
    ["Job Title", employee.jobTitle],
    ["Department", employee.department],
    ["Date Generated", new Date().toLocaleDateString()],
    [],
    ["Leadership Archetype", analysis.archetype.title],
    ["Description", analysis.archetype.description],
    [],
    ["Dominant Insights (Strengths)"],
    ...analysis.dominantInsights.strengths.map(s => [s.competency, s.evidence]),
    [],
    ["Dominant Insights (Opportunities)"],
    ...analysis.dominantInsights.opportunities.map(o => [o.competency, o.evidence]),
    [],
    ["Perception Gap Analysis (Johari Window)"],
    ["Public Arena", analysis.johariWindow.publicArena],
    ["Blind Spots", analysis.johariWindow.blindSpots],
    [],
    ["Career Stallers & Stoppers"],
    ...analysis.stallers.map(s => [s.staller, s.status, s.impact]),
    [],
    ["Strategic Action Plan (70-20-10)"],
    ["70% Experience", analysis.actionPlan.experience],
    ["20% Exposure", analysis.actionPlan.exposure],
    ["10% Education", analysis.actionPlan.education],
  ];
};

export const generateExcelReport = (report: ReportData) => {
  const wb = XLSX.utils.book_new();
  const summaryData = getReportSheetData(report.employee, report.analysis);
  const ws = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Styling adjustments (width)
  ws['!cols'] = [{ wch: 30 }, { wch: 80 }, { wch: 30 }];

  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${report.employee.name.replace(/\s+/g, '_')}_LES360_Report.xlsx`);
};

export const generateBulkExcelReport = (reports: { employee: Employee; analysis: AnalysisResult }[]) => {
  const wb = XLSX.utils.book_new();

  // Define Headers for the consolidated single sheet
  // This pivots the vertical data points into horizontal columns for easy filtering
  const headers = [
    "Employee ID", "Name", "Job Title", "Department", "Date Generated",
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

    // Helpers to safely get array items or return empty strings if fewer than 3 items exist
    const getStrength = (idx: number) => dominantInsights.strengths[idx] || { competency: "", evidence: "" };
    const getOpp = (idx: number) => dominantInsights.opportunities[idx] || { competency: "", evidence: "" };
    const getStaller = (idx: number) => stallers[idx] || { staller: "", status: "", impact: "" };

    return [
      employee.id, 
      employee.name, 
      employee.jobTitle, 
      employee.department, 
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

  // Create sheet with headers and data
  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  
  // Set column widths to make it readable
  const wscols = headers.map(() => ({ wch: 20 }));
  // Make specific columns (Description, Evidence, Action Plan) wider
  const wideColumns = [6, 8, 10, 12, 14, 16, 18, 19, 20, 23, 26, 29, 30, 31, 32];
  wideColumns.forEach(i => {
    if (wscols[i]) wscols[i] = { wch: 50 };
  });
  
  ws['!cols'] = wscols;

  XLSX.utils.book_append_sheet(wb, ws, "LES 360 Consolidated Report");
  
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `LES360_Bulk_Report_${timestamp}.xlsx`);
};