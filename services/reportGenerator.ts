import { Employee, AnalysisResult, CompetencyScore } from '../types';
import { htmlTemplate } from './htmlTemplate';

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export const generateHtmlReport = (employee: Employee, analysis: AnalysisResult): string => {
    const initials = getInitials(employee.name);
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Customize Radar Labels based on report type to keep chart clean
    const radarLabels = JSON.stringify(employee.competencies.map(c => {
         if (employee.reportType === 'CE' || employee.reportType === 'CO') {
             return c.name.length > 15 ? c.name.substring(0, 12) + '...' : c.name;
         }
         return c.name.replace(' Skills', '').replace(' Orientation','').replace(' Development', '');
    }));

    const radarSupData = JSON.stringify(employee.competencies.map(c => c.sup));
    const radarSubData = JSON.stringify(employee.competencies.map(c => c.sub));
    const radarPeerData = JSON.stringify(employee.competencies.map(c => c.peer));

    let feedbackBlocks = employee.feedback.split('|')
        .map(f => f.trim())
        .filter(f => {
            if (f.length <= 10) return false;
            const normalized = f.toLowerCase().replace(/[^a-z0-9]/g, '');
            const ignoreList = ['nocomment', 'nocomments', 'nothingtoadd', 'noneatall', 'notapplicable', 'nothingatthismoment', 'noneatthistime', 'allgood', 'looksok', 'noadditionalcomments', 'noneatthismoment'];
            if (ignoreList.includes(normalized)) return false;
            return true;
        })
        .map(f => `
            <div class="bg-slate-50 p-5 rounded-lg border border-slate-100 shadow-sm">
                <p class="text-sm text-slate-700 leading-relaxed">"${f}"</p>
            </div>
    `).join('');

    if (!feedbackBlocks) {
        feedbackBlocks = `
            <div class="bg-slate-50 p-5 rounded-lg border border-slate-100 shadow-sm text-center">
                <p class="text-sm text-slate-500 italic">No relevant qualitative comments were provided.</p>
            </div>
        `;
    }

    const questionsMap = [
        { label: 'Q1 Comms', group: 'Communication' },
        { label: 'Q2 Comms', group: 'Communication' },
        { label: 'Q3 Comms', group: 'Communication' },
        { label: 'Q4 Interpersonal', group: 'Interpersonal' },
        { label: 'Q5 Interpersonal', group: 'Interpersonal' },
        { label: 'Q6 Interpersonal', group: 'Interpersonal' },
        { label: 'Q7 Emp Dev', group: 'Employee Development' },
        { label: 'Q8 Emp Dev', group: 'Employee Development' },
        { label: 'Q9 Emp Dev', group: 'Employee Development' },
        { label: 'Q10 Emp Dev', group: 'Employee Development' },
        { label: 'Q11 Achieve', group: 'Achievement' },
        { label: 'Q12 Achieve', group: 'Achievement' },
        { label: 'Q13 Achieve*', group: 'Achievement' },
        { label: 'Q14 Achieve*', group: 'Achievement' },
        { label: 'Q15 Team Lead', group: 'Team Leadership' },
        { label: 'Q16 Team Lead', group: 'Team Leadership' },
        { label: 'Q17 Team Lead', group: 'Team Leadership' },
        { label: 'Q18 Team Lead', group: 'Team Leadership' },
        { label: 'Q19 Team Lead', group: 'Team Leadership' },
        { label: 'Q20 Delegation', group: 'Delegation' },
        { label: 'Q21 Delegation', group: 'Delegation' },
        { label: 'Q22 Delegation', group: 'Delegation' },
        { label: 'Q23 Delegation', group: 'Delegation' },
        { label: 'Q24 Attributes', group: 'Key Attributes' },
        { label: 'Q25 Attributes', group: 'Key Attributes' },
        { label: 'Q26 Attributes', group: 'Key Attributes' },
        { label: 'Q27 Attributes', group: 'Key Attributes' },
        { label: 'Q28 Key Attributes**', group: 'Key Attributes' }
    ];

    const heatmapCells = employee.questions.map((score, index) => {
        const q = questionsMap[index] || { label: `Q${index + 1}`, group: 'Unknown' };
        let bgColor = 'bg-red-400';
        if (score >= 90) bgColor = 'bg-bsn-dark';
        else if (score >= 80) bgColor = 'bg-emerald-500';
        else if (score >= 70) bgColor = 'bg-yellow-400';

        return `
                <div class="heatmap-cell ${bgColor} h-24 rounded-lg p-3 flex flex-col justify-between text-white">
                    <span class="text-[9px] font-bold opacity-90 uppercase leading-tight">${q.label}</span><span class="text-2xl font-black">${Math.round(score)}%</span>
                </div>`;
    }).join('');

    let html = htmlTemplate;
    html = html.replace(/\$\{employee\.name\}/g, employee.name);
    html = html.replace(/\$\{employee\.id\}/g, employee.id);
    html = html.replace(/\$\{employee\.jobTitle\}/g, employee.jobTitle);
    html = html.replace(/\$\{initials\}/g, initials);
    html = html.replace(/\$\{today\}/g, today);
    html = html.replace(/\$\{employee\.overallLES\}/g, employee.overallLES.toString());
    html = html.replace(/\$\{employee\.overallPMS\}/g, employee.overallPMS);
    html = html.replace(/\$\{analysis\.archetype\.title\}/g, analysis.archetype.title);
    html = html.replace(/\$\{analysis\.archetype\.description\}/g, analysis.archetype.description);
    
    html = html.replace(/\$\{analysis\.dominantInsights\.strengths\[0\]\?\.competency \|\| 'N\/A'\}/g, analysis.dominantInsights.strengths[0]?.competency || 'N/A');
    html = html.replace(/\$\{analysis\.dominantInsights\.strengths\[0\]\?\.evidence \|\| 'N\/A'\}/g, analysis.dominantInsights.strengths[0]?.evidence || 'N/A');
    html = html.replace(/\$\{analysis\.dominantInsights\.opportunities\[0\]\?\.competency \|\| 'N\/A'\}/g, analysis.dominantInsights.opportunities[0]?.competency || 'N/A');
    html = html.replace(/\$\{analysis\.dominantInsights\.opportunities\[0\]\?\.evidence \|\| 'N\/A'\}/g, analysis.dominantInsights.opportunities[0]?.evidence || 'N/A');
    
    html = html.replace(/\$\{analysis\.johariWindow\.publicArena\}/g, analysis.johariWindow.publicArena);
    html = html.replace(/\$\{analysis\.johariWindow\.blindSpots\}/g, analysis.johariWindow.blindSpots);
    
    html = html.replace(/\$\{analysis\.actionPlan\.experience\}/g, analysis.actionPlan.experience);
    html = html.replace(/\$\{analysis\.actionPlan\.exposure\}/g, analysis.actionPlan.exposure);
    html = html.replace(/\$\{analysis\.actionPlan\.education\}/g, analysis.actionPlan.education);
    
    html = html.replace(/\$\{radarLabels\}/g, radarLabels);
    html = html.replace(/\$\{radarSupData\}/g, radarSupData);
    html = html.replace(/\$\{radarSubData\}/g, radarSubData);
    html = html.replace(/\$\{radarPeerData\}/g, radarPeerData);
    
    html = html.replace(/\$\{feedbackBlocks\}/g, feedbackBlocks);
    html = html.replace(/\$\{heatmapCells\}/g, heatmapCells);

    // Replace dynamic loops
    const strengthsHtml = analysis.dominantInsights.strengths.slice(0, 2).map(s => `
                    <div>
                        <h4 class="font-bold text-slate-800 text-sm">${s.competency}</h4>
                        <p class="text-xs text-slate-600 mt-1 leading-relaxed">${s.evidence}</p>
                    </div>
    `).join('');
    html = html.replace(/\$\{analysis\.dominantInsights\.strengths\.slice\(0, 2\)\.map\(s => `[\s\S]*?`\)\.join\(''\)\}/g, strengthsHtml);

    const oppsHtml = analysis.dominantInsights.opportunities.slice(0, 2).map(o => `
                    <div>
                        <h4 class="font-bold text-slate-800 text-sm">${o.competency}</h4>
                        <p class="text-xs text-slate-600 mt-1 leading-relaxed">${o.evidence}</p>
                    </div>
    `).join('');
    html = html.replace(/\$\{analysis\.dominantInsights\.opportunities\.slice\(0, 2\)\.map\(o => `[\s\S]*?`\)\.join\(''\)\}/g, oppsHtml);

    const stallersHtml = analysis.stallers.slice(0, 2).map(s => `
            <div class="flex gap-4 p-5 border border-slate-100 rounded-xl bg-slate-50">
                <span class="${s.status === 'A Problem' ? 'bg-red-100 text-red-700' : s.status === 'A Potential Problem' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} text-[9px] font-black px-2 py-1 h-5 rounded uppercase tracking-tighter">${s.status === 'A Problem' ? 'Staller' : s.status === 'A Potential Problem' ? 'Warning' : 'Clear'}</span>
                <div>
                    <h4 class="font-bold text-slate-800 text-sm">${s.staller}</h4>
                    <p class="text-xs text-slate-500 leading-relaxed mt-1">${s.impact}</p>
                </div>
            </div>
    `).join('');
    html = html.replace(/\$\{analysis\.stallers\.slice\(0, 2\)\.map\(s => `[\s\S]*?`\)\.join\(''\)\}/g, stallersHtml);

    return html;
};
