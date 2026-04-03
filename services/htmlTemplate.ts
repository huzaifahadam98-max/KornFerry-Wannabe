export const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BSN LES | Comprehensive Report - \${employee.name}</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        bsn: {
                            teal: '#009FA9',
                            dark: '#005B82',
                            light: '#E6F6F7',
                            accent: '#F39C12',
                            gray: '#64748B',
                            purple: '#6366F1'
                        }
                    },
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                    }
                }
            }
        }
    </script>

    <style>
        body { background-color: #F8FAFC; color: #1E293B; scroll-behavior: smooth; }
        .report-page { 
            max-width: 210mm; 
            margin: 0 auto; 
            background: white; 
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); 
            padding: 40px; 
            margin-bottom: 40px; 
            min-height: 297mm; 
            position: relative; 
            display: flex;
            flex-direction: column;
        }
        .interactive-btn { transition: all 0.2s; }
        .interactive-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .sticky-nav { position: fixed; left: 20px; top: 50%; transform: translateY(-50%); z-index: 40; }
        .nav-dot { width: 12px; height: 12px; border-radius: 50%; background-color: #CBD5E1; margin-bottom: 16px; cursor: pointer; transition: all 0.3s; position: relative; }
        .nav-dot:hover, .nav-dot.active { background-color: #009FA9; transform: scale(1.2); }
        .nav-tooltip { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); background: #1E293B; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; opacity: 0; white-space: nowrap; pointer-events: none; transition: opacity 0.2s; }
        .nav-dot:hover .nav-tooltip { opacity: 1; }
        .info-card { transition: all 0.4s ease; cursor: pointer; }
        .info-grid:hover .info-card { opacity: 0.4; transform: scale(0.95); }
        .info-grid .info-card:hover { opacity: 1; transform: scale(1.05); z-index: 10; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        
        .heatmap-cell { transition: transform 0.2s; border: 1px solid rgba(255,255,255,0.1); }
        .heatmap-cell:hover { transform: scale(1.05); z-index: 10; border-color: rgba(0,0,0,0.2); }

        @media print { 
            body { background-color: white; } 
            .report-page { 
                box-shadow: none; 
                margin: 0; 
                padding: 15mm; 
                min-height: 297mm;
                break-after: page;
            } 
            /* Page Break Logic */
            #page-qualitative, #page-heatmap, #page-appendix, .page-break-point {
                break-before: page;
            }
            .no-print { display: none !important; } 
            .sticky-nav { display: none !important; } 
            .info-grid:hover .info-card { opacity: 1; transform: none; } 
            .info-grid .info-card:hover { transform: none; box-shadow: none; } 
        }
    </style>
</head>
<body class="antialiased">

    <div class="sticky-nav no-print hidden lg:block">
        <div class="nav-dot active" onclick="document.getElementById('page-cover').scrollIntoView()"><span class="nav-tooltip">Cover</span></div>
        <div class="nav-dot" onclick="document.getElementById('page-background').scrollIntoView()"><span class="nav-tooltip">Framework</span></div>
        <div class="nav-dot" onclick="document.getElementById('page-overview').scrollIntoView()"><span class="nav-tooltip">Scores Overview</span></div>
        <div class="nav-dot" onclick="document.getElementById('page-dashboard').scrollIntoView()"><span class="nav-tooltip">Insights</span></div>
        <div class="nav-dot" onclick="document.getElementById('page-stallers').scrollIntoView()"><span class="nav-tooltip">Stallers & IDP</span></div>
        <div class="nav-dot" onclick="document.getElementById('page-qualitative').scrollIntoView()"><span class="nav-tooltip">Appx I: Comments</span></div>
        <div class="nav-dot" onclick="document.getElementById('page-heatmap').scrollIntoView()"><span class="nav-tooltip">Appx II: Heatmap</span></div>
        <div class="nav-dot" onclick="document.getElementById('page-appendix').scrollIntoView()"><span class="nav-tooltip">Appx III: Questions</span></div>
    </div>

    <div class="fixed top-6 right-6 z-50 no-print">
        <button onclick="window.print()" class="bg-bsn-dark text-white px-6 py-3 rounded-full shadow-lg hover:bg-bsn-teal transition-all font-semibold flex items-center gap-2 interactive-btn">
            <i class="fas fa-print"></i> Export Full PDF
        </button>
    </div>

    <div id="page-cover" class="report-page justify-between overflow-hidden">
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-bsn-teal opacity-5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div class="mt-20">
            <div class="inline-block px-4 py-2 bg-bsn-light text-bsn-dark font-bold tracking-widest text-xs uppercase rounded mb-8 border border-bsn-teal/20">Confidential Comprehensive Report</div>
            <h1 class="text-6xl font-extrabold text-bsn-dark tracking-tight mb-4">LES</h1>
            <p class="text-2xl text-bsn-teal font-medium">Leadership Effectiveness Survey</p>
        </div>
        <div class="my-auto">
            <div class="w-24 h-24 bg-bsn-dark text-white rounded-2xl flex items-center justify-center text-4xl font-bold mb-6 shadow-xl">\${initials}</div>
            <h2 class="text-4xl font-bold text-slate-800 mb-2">\${employee.name}</h2>
            <p class="text-xl text-slate-500">Employee ID: \${employee.id} | \${employee.jobTitle}</p>
            <div class="h-1 w-20 bg-bsn-accent mt-8"></div>
        </div>
        <div class="mb-10 flex justify-between items-end">
            <div class="flex items-center gap-4">
                <div class="text-right border-r border-slate-300 pr-4">
                    <p class="text-sm text-slate-500 uppercase font-bold">Generated</p>
                    <p class="text-lg font-bold text-bsn-dark">\${today}</p>
                </div>
                <div class="text-left">
                    <p class="text-sm text-slate-500 uppercase font-bold">Organization</p>
                    <p class="text-lg font-bold text-bsn-dark">Bank Simpanan Nasional</p>
                </div>
            </div>
            <p class="text-xs text-slate-400">© 2026 BSN Organisational Performance.</p>
        </div>
    </div>

    <div id="page-background" class="report-page">
        <header class="flex justify-between items-center border-b border-slate-200 pb-4 mb-8">
            <h3 class="text-lg font-bold text-bsn-gray">Survey Overview & Framework</h3>
            <span class="text-xs text-slate-400">\${employee.name} / ID: \${employee.id}</span>
        </header>

        <div class="mb-10">
            <h4 class="text-sm font-bold text-bsn-teal uppercase tracking-widest mb-3">Background</h4>
            <p class="text-sm text-slate-600 leading-relaxed mb-6">
                As part of the annual performance review, this leadership assessment was conducted to evaluate the capabilities of the incumbent against the organization's evolving strategic needs. The assessment employs a validated multi-rater framework, integrating cross-hierarchical perspectives to enhance objectivity, reliability, and developmental insight.
            </p>
        </div>

        <h4 class="text-sm font-bold text-bsn-teal uppercase tracking-widest mb-6">Four Key Areas of Leadership</h4>
        <div class="grid grid-cols-2 gap-6 h-[500px] info-grid">
            <div class="info-card bg-gradient-to-br from-bsn-teal to-[#007A82] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-between group">
                <div>
                    <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 text-2xl backdrop-blur-sm"><i class="fas fa-fingerprint"></i></div>
                    <h5 class="text-2xl font-bold mb-1">Personal Traits</h5>
                    <p class="text-white/80 text-xs uppercase tracking-wider font-semibold">6 Dimensions</p>
                </div>
                <p class="text-sm opacity-90 leading-relaxed">Focuses on intrinsic qualities, passion, organizational structure, and emotional intelligence.</p>
            </div>
            <div class="info-card bg-gradient-to-br from-bsn-dark to-[#004260] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-between group">
                <div>
                    <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 text-2xl backdrop-blur-sm"><i class="fas fa-chess"></i></div>
                    <h5 class="text-2xl font-bold mb-1">Capabilities</h5>
                    <p class="text-white/80 text-xs uppercase tracking-wider font-semibold">8 Dimensions</p>
                </div>
                <p class="text-sm opacity-90 leading-relaxed">Evaluates direction, business judgment, competitive edge, and execution efficiency.</p>
            </div>
            <div class="info-card bg-white rounded-2xl p-8 border-2 border-bsn-accent relative overflow-hidden shadow-lg flex flex-col justify-between group">
                <div>
                    <div class="w-12 h-12 bg-bsn-accent/10 text-bsn-accent rounded-lg flex items-center justify-center mb-4 text-2xl"><i class="fas fa-building"></i></div>
                    <h5 class="text-2xl font-bold text-slate-800 mb-1">Culture (CARE)</h5>
                    <p class="text-slate-400 text-xs uppercase tracking-wider font-bold">4 Core Values</p>
                </div>
                <p class="text-sm text-slate-600 leading-relaxed">Measures alignment with BSN's core values: Committed, Agile, Respectful, and Ethical behaviors.</p>
            </div>
            <div class="info-card bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-between group">
                <div>
                    <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 text-2xl backdrop-blur-sm"><i class="fas fa-heart"></i></div>
                    <h5 class="text-2xl font-bold mb-1">Motivation</h5>
                    <p class="text-white/80 text-xs uppercase tracking-wider font-semibold">Outcome Measure</p>
                </div>
                <p class="text-sm opacity-90 leading-relaxed">A direct measure of team confidence, morale, and willingness to perform under leadership.</p>
            </div>
        </div>
    </div>

    <div id="page-overview" class="report-page">
        <header class="flex justify-between items-center border-b border-slate-200 pb-4 mb-8">
            <h3 class="text-lg font-bold text-bsn-gray">Executive Summary: Scores</h3>
            <span class="text-xs text-slate-400">\${employee.name} / ID: \${employee.id}</span>
        </header>

        <div class="bg-bsn-light rounded-xl p-8 mb-8 border border-bsn-teal/20">
            <div class="flex items-start justify-between mb-2">
                <div>
                    <span class="text-xs font-bold text-bsn-dark uppercase tracking-wider">Leadership Profile</span>
                    <h2 class="text-3xl font-bold text-bsn-dark mt-1">\${analysis.archetype.title}</h2>
                </div>
                <div class="text-right">
                    <p class="text-sm text-slate-500 font-bold uppercase tracking-wider">Overall LES Score</p>
                    <p class="text-5xl font-black text-bsn-dark mt-1">\${employee.overallLES}%</p>
                    <p class="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Overall PMS Score: \${employee.overallPMS}</p>
                </div>
            </div>
            
            <!-- Spider Chart Area -->
            <div class="h-[380px] w-full relative mb-4">
                <canvas id="spiderChart"></canvas>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
            <div class="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <p class="text-xs text-bsn-teal font-bold uppercase mb-1">Top Alignment</p>
                <p class="text-lg font-bold text-slate-800">\${analysis.dominantInsights.strengths[0]?.competency || 'N/A'}</p>
                <p class="text-sm text-slate-500 leading-relaxed">\${analysis.dominantInsights.strengths[0]?.evidence || 'N/A'}</p>
            </div>
            <div class="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <p class="text-xs text-blue-500 font-bold uppercase mb-1">Development Area</p>
                <p class="text-lg font-bold text-slate-800">\${analysis.dominantInsights.opportunities[0]?.competency || 'N/A'}</p>
                <p class="text-sm text-slate-500 leading-relaxed">\${analysis.dominantInsights.opportunities[0]?.evidence || 'N/A'}</p>
            </div>
        </div>
    </div>

    <div id="page-dashboard" class="report-page">
        <header class="flex justify-between items-center border-b border-slate-200 pb-4 mb-8">
            <h3 class="text-lg font-bold text-bsn-gray">Dominant Insights & Archetype</h3>
            <span class="text-xs text-slate-400">\${employee.name} / ID: \${employee.id}</span>
        </header>

        <div class="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
            <div>
                <div class="inline-flex items-center gap-2 bg-indigo-50 text-bsn-purple px-4 py-1.5 rounded-full text-xs font-bold border border-indigo-100 mb-6">
                    <i class="fas fa-user-circle"></i>
                    Archetype: \${analysis.archetype.title}
                </div>
                <div class="bg-slate-50 border-l-4 border-slate-200 p-6 italic text-slate-600 leading-relaxed text-sm">
                    "\${analysis.archetype.description}"
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-6 mb-10">
            <div class="bg-[#F0FDF4] border border-green-100 rounded-xl p-6">
                <p class="text-[10px] font-extrabold text-green-700 uppercase tracking-widest mb-3">Top Strengths</p>
                <div class="space-y-4">
                    \${analysis.dominantInsights.strengths.slice(0, 2).map(s => \`
                    <div>
                        <h4 class="font-bold text-slate-800 text-sm">\${s.competency}</h4>
                        <p class="text-xs text-slate-600 mt-1 leading-relaxed">\${s.evidence}</p>
                    </div>
                    \`).join('')}
                </div>
            </div>
            <div class="bg-[#FFF7ED] border border-orange-100 rounded-xl p-6">
                <p class="text-[10px] font-extrabold text-orange-700 uppercase tracking-widest mb-3">Development Needs</p>
                <div class="space-y-4">
                    \${analysis.dominantInsights.opportunities.slice(0, 2).map(o => \`
                    <div>
                        <h4 class="font-bold text-slate-800 text-sm">\${o.competency}</h4>
                        <p class="text-xs text-slate-600 mt-1 leading-relaxed">\${o.evidence}</p>
                    </div>
                    \`).join('')}
                </div>
            </div>
        </div>

        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i class="fas fa-eye text-bsn-purple"></i> Perception Gap Analysis
        </h3>
        <div class="grid grid-cols-2 border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-10">
            <div class="p-6 border-r border-slate-200">
                <h4 class="font-bold text-slate-800 text-sm mb-2">Public Arena (Aligned Views)</h4>
                <p class="text-xs text-slate-600 leading-relaxed">\${analysis.johariWindow.publicArena}</p>
            </div>
            <div class="p-6">
                <h4 class="font-bold text-slate-800 text-sm mb-2">Blind Spots (External Perception)</h4>
                <p class="text-xs text-slate-600 leading-relaxed">\${analysis.johariWindow.blindSpots}</p>
            </div>
        </div>
    </div>

    <div id="page-stallers" class="report-page">
        <header class="flex justify-between items-center border-b border-slate-200 pb-4 mb-8">
            <h3 class="text-lg font-bold text-bsn-gray">Career Stallers & Integrated Development Plan</h3>
            <span class="text-xs text-slate-400">\${employee.name} / ID: \${employee.id}</span>
        </header>

        <h3 class="text-sm font-bold text-red-500 uppercase tracking-widest mb-4">Potential Career Stallers</h3>
        <div class="grid grid-cols-2 gap-6 mb-12">
            \${analysis.stallers.slice(0, 2).map(s => \`
            <div class="flex gap-4 p-5 border border-slate-100 rounded-xl bg-slate-50">
                <span class="\${s.status === 'A Problem' ? 'bg-red-100 text-red-700' : s.status === 'A Potential Problem' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} text-[9px] font-black px-2 py-1 h-5 rounded uppercase tracking-tighter">\${s.status === 'A Problem' ? 'Staller' : s.status === 'A Potential Problem' ? 'Warning' : 'Clear'}</span>
                <div>
                    <h4 class="font-bold text-slate-800 text-sm">\${s.staller}</h4>
                    <p class="text-xs text-slate-500 leading-relaxed mt-1">\${s.impact}</p>
                </div>
            </div>
            \`).join('')}
        </div>

        <h3 class="text-sm font-bold text-bsn-teal uppercase tracking-widest mb-4">Integrated Development Plan (70-20-10)</h3>
        <div class="space-y-6">
            <div class="flex items-stretch overflow-hidden rounded-xl border border-slate-100 shadow-sm">
                <div class="bg-blue-600 text-white w-24 flex flex-col items-center justify-center shrink-0">
                    <span class="text-2xl font-black">70%</span>
                    <span class="text-[9px] uppercase font-bold tracking-widest opacity-80">Experience</span>
                </div>
                <div class="p-6 bg-white w-full">
                    <p class="text-sm text-slate-600 leading-relaxed">\${analysis.actionPlan.experience}</p>
                </div>
            </div>

            <div class="flex items-stretch overflow-hidden rounded-xl border border-slate-100 shadow-sm">
                <div class="bg-blue-500 text-white w-24 flex flex-col items-center justify-center shrink-0">
                    <span class="text-2xl font-black">20%</span>
                    <span class="text-[9px] uppercase font-bold tracking-widest opacity-80">Exposure</span>
                </div>
                <div class="p-6 bg-white w-full">
                    <p class="text-sm text-slate-600 leading-relaxed">\${analysis.actionPlan.exposure}</p>
                </div>
            </div>

            <div class="flex items-stretch overflow-hidden rounded-xl border border-slate-100 shadow-sm">
                <div class="bg-blue-400 text-white w-24 flex flex-col items-center justify-center shrink-0">
                    <span class="text-2xl font-black">10%</span>
                    <span class="text-[9px] uppercase font-bold tracking-widest opacity-80">Education</span>
                </div>
                <div class="p-6 bg-white w-full">
                    <p class="text-sm text-slate-600 leading-relaxed">\${analysis.actionPlan.education}</p>
                </div>
            </div>
        </div>
    </div>

    <div id="page-qualitative" class="report-page">
        <header class="flex justify-between items-center border-b border-slate-200 pb-4 mb-8">
            <h3 class="text-lg font-bold text-bsn-gray">Appendix I: Qualitative Comments Summary</h3>
            <span class="text-xs text-slate-400">Verbatim Feedback</span>
        </header>

        <div class="space-y-4">
            \${feedbackBlocks}
        </div>
        <div class="mt-auto pt-10 text-center text-slate-400 text-xs italic">* Note: Comments are extracted verbatim from raw survey data to preserve authenticity.</div>
    </div>

    <!-- Page: Heatmap -->
    <div id="page-heatmap" class="report-page">
        <header class="flex justify-between items-center border-b border-slate-200 pb-4 mb-8">
            <h3 class="text-lg font-bold text-bsn-gray">Appendix II: Competency Heatmap</h3>
            <span class="text-xs text-slate-400">Detailed Visual Analysis</span>
        </header>

        <!-- Legend -->
        <div class="flex flex-wrap items-center justify-center gap-6 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-bsn-dark"></div>
                <span class="text-xs font-bold text-slate-600">Mastery (≥ 90%)</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-emerald-500"></div>
                <span class="text-xs font-bold text-slate-600">Strength (80% - 89%)</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-yellow-400"></div>
                <span class="text-xs font-bold text-slate-600">Neutral (70% - 79%)</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-red-400"></div>
                <span class="text-xs font-bold text-slate-600">Develop (< 70%)</span>
            </div>
        </div>

        <div class="mb-6">
            <div class="flex justify-between items-end mb-4">
                <h4 class="text-sm font-bold text-bsn-dark uppercase tracking-wide">Dimension Performance Grid</h4>
                <div class="text-[10px] uppercase font-bold text-slate-400">Percent Score (%)</div>
            </div>
            
            <!-- Grid Container -->
            <div class="grid grid-cols-6 gap-3">
                \${heatmapCells}
            </div>
        </div>

        <div class="bg-slate-50 border-l-4 border-bsn-dark p-4 rounded text-xs text-slate-600 mb-4">
            <span class="font-bold">Legend & Remarks:</span><br>
            * <strong>Q13 & Q14</strong> were assessed exclusively by Superiors.<br>
            ** <strong>Q28</strong> was assessed exclusively by Subordinates.
        </div>
    </div>

    <!-- Page: Appendix III -->
    <div id="page-appendix" class="report-page">
        <header class="flex justify-between items-center border-b border-slate-200 pb-4 mb-8">
            <h3 class="text-lg font-bold text-bsn-gray">Appendix III: Survey Questions & Mapping</h3>
            <span class="text-xs text-slate-400">Reference Material</span>
        </header>

        <div class="grid grid-cols-1 gap-8">
            <div class="overflow-hidden rounded-lg border border-slate-200">
                <table class="w-full text-left text-xs text-slate-600">
                    <thead class="bg-slate-100 text-[10px] uppercase font-bold text-slate-500">
                        <tr>
                            <th class="p-3 w-16 border-r border-slate-200 text-center">No</th>
                            <th class="p-3 w-32">Competency Theme</th>
                            <th class="p-3">Question Description</th>
                            <th class="p-3 w-24">Assessed By</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <!-- Q1-Q20 -->
                        <tr><td class="p-3 font-bold text-bsn-teal border-r border-slate-200 text-center">Q01</td><td class="p-3 font-bold text-slate-800">Communication</td><td class="p-3">Promotes a culture of open dialogue by proactively seeking staff feedback and providing transparent guidance on work issues.</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr class="bg-slate-50"><td class="p-3 font-bold text-bsn-teal border-r border-slate-200 text-center">Q02</td><td class="p-3 font-bold text-slate-800">Communication</td><td class="p-3">Regularly briefs the team on Management decisions and clarifies departmental objectives to ensure alignment.</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr><td class="p-3 font-bold text-bsn-teal border-r border-slate-200 text-center">Q03</td><td class="p-3 font-bold text-slate-800">Communication</td><td class="p-3">Encourages constructive dialogue and healthy debate among staff to foster diverse perspectives.</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr class="bg-slate-50"><td class="p-3 font-bold text-bsn-teal border-r border-slate-200 text-center">Q04</td><td class="p-3 font-bold text-slate-800">Interpersonal</td><td class="p-3">Treats all employees with dignity and respect, ensuring unbiased and fair treatment of subordinates.</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr><td class="p-3 font-bold text-bsn-teal border-r border-slate-200 text-center">Q05</td><td class="p-3 font-bold text-slate-800">Interpersonal</td><td class="p-3">Maintains emotional composure and professional conduct, even during high-pressure or stressful situations.</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr class="bg-slate-50"><td class="p-3 font-bold text-bsn-teal border-r border-slate-200 text-center">Q06</td><td class="p-3 font-bold text-slate-800">Interpersonal</td><td class="p-3">Addresses conflict directly and professionally, facilitating open discussions to reach constructive resolutions.</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr><td class="p-3 font-bold text-bsn-dark border-r border-slate-200 text-center">Q07</td><td class="p-3 font-bold text-slate-800">Employee Development</td><td class="p-3">Cultivates an environment that encourages continuous learning, skill enhancement, and professional growth.</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr class="bg-slate-50"><td class="p-3 font-bold text-bsn-dark border-r border-slate-200 text-center">Q08</td><td class="p-3 font-bold text-slate-800">Employee Development</td><td class="p-3">Provides specific, constructive, and timely feedback to help staff improve their performance.</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr><td class="p-3 font-bold text-bsn-dark border-r border-slate-200 text-center">Q09</td><td class="p-3 font-bold text-slate-800">Employee Development</td><td class="p-3">Actively recognizes and celebrates staff for high performance and significant contributions.</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr class="bg-slate-50"><td class="p-3 font-bold text-bsn-dark border-r border-slate-200 text-center">Q10</td><td class="p-3 font-bold text-slate-800">Employee Development</td><td class="p-3">Proactively shares knowledge and experience, acting as a dedicated coach and mentor to others.</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr><td class="p-3 font-bold text-bsn-dark border-r border-slate-200 text-center">Q11</td><td class="p-3 font-bold text-slate-800">Achievement</td><td class="p-3">Continually expands functional knowledge and expertise to effectively support BSN’s strategic objectives</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr class="bg-slate-50"><td class="p-3 font-bold text-bsn-dark border-r border-slate-200 text-center">Q12</td><td class="p-3 font-bold text-slate-800">Achievement</td><td class="p-3">Consistently raises performance standards to meet the evolving needs of the Bank.</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr><td class="p-3 font-bold text-bsn-dark border-r border-slate-200 text-center">Q13</td><td class="p-3 font-bold text-slate-800">Achievement</td><td class="p-3">Demonstrates an unwavering focus on delivering high-quality results and operational excellence.</td><td class="p-3 font-semibold text-[10px] text-bsn-accent uppercase">All</td></tr>
                        <tr class="bg-slate-50"><td class="p-3 font-bold text-bsn-dark border-r border-slate-200 text-center">Q14</td><td class="p-3 font-bold text-slate-800">Achievement</td><td class="p-3">Consistently achieves targets and adapts effectively in a fast-paced, dynamic environment.</td><td class="p-3 font-semibold text-[10px] text-bsn-accent uppercase">All</td></tr>
                        <tr><td class="p-3 font-bold text-bsn-accent border-r border-slate-200 text-center">Q15</td><td class="p-3 font-bold text-slate-800">Team Leadership</td><td class="p-3"> Cultivates positive working relationships by being approachable, collaborative, and easy to engage with.</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr class="bg-slate-50"><td class="p-3 font-bold text-bsn-accent border-r border-slate-200 text-center">Q16</td><td class="p-3 font-bold text-slate-800">Team Leadership</td><td class="p-3">Understands and respects the unique role and contribution of each employee within the department.</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr><td class="p-3 font-bold text-bsn-accent border-r border-slate-200 text-center">Q17</td><td class="p-3 font-bold text-slate-800">Team Leadership</td><td class="p-3">Motivates and empowers staff to achieve both individual and departmental goals.</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr class="bg-slate-50"><td class="p-3 font-bold text-bsn-accent border-r border-slate-200 text-center">Q18</td><td class="p-3 font-bold text-slate-800">Team Leadership</td><td class="p-3">Creates an inclusive work environment that values teamwork and fosters cross-functional collaboration.</td><td class="p-3 font-semibold text-[10px] uppercase">All</td></tr>
                        <tr><td class="p-3 font-bold text-bsn-purple border-r border-slate-200 text-center">Q19</td><td class="p-3 font-bold text-slate-800">Team Leadership</td><td class="p-3">Takes full accountability for the team’s performance and collective results.</td><td class="p-3 font-semibold text-[10px] text-bsn-dark uppercase">All</td></tr>
                        <tr class="bg-slate-50"><td class="p-3 font-bold text-bsn-purple border-r border-slate-200 text-center">Q20</td><td class="p-3 font-bold text-slate-800">Delegation</td><td class="p-3">Optimizes resources and prioritizes tasks effectively to ensure deliverables are met on time.</td><td class="p-3 font-semibold text-[10px] text-bsn-dark uppercase">All</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Appendix III Continued (New Page for Print) -->
    <div class="report-page page-break-point">
        <header class="flex justify-between items-center border-b border-slate-200 pb-4 mb-8">
            <h3 class="text-lg font-bold text-bsn-gray">Appendix III: Survey Questions (Cont.)</h3>
            <span class="text-xs text-slate-400">Reference Material</span>
        </header>
        <div class="overflow-hidden rounded-lg border border-slate-200">
            <table class="w-full text-left text-xs text-slate-600">
                <thead class="bg-slate-100 text-[10px] uppercase font-bold text-slate-500">
                    <tr>
                        <th class="p-3 w-16 border-r border-slate-200 text-center">No</th>
                        <th class="p-3 w-32">Competency Theme</th>
                        <th class="p-3">Question Description</th>
                        <th class="p-3 w-24">Assessed By</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <!-- Q21-Q28 -->
                    <tr><td class="p-3 font-bold text-bsn-purple border-r border-slate-200 text-center">Q21</td><td class="p-3 font-bold text-slate-800">Delegation</td><td class="p-3">Delegates tasks with clear instructions and expectations, ensuring high standards of quality are maintained.</td><td class="p-3 font-semibold text-[10px] text-bsn-dark uppercase">All</td></tr>
                    <tr class="bg-slate-50"><td class="p-3 font-bold text-bsn-purple border-r border-slate-200 text-center">Q22</td><td class="p-3 font-bold text-slate-800">Delegation</td><td class="p-3">Maintains accountability for the outcomes of work delegated to subordinates, providing support where necessary.</td><td class="p-3 font-semibold text-[10px] text-bsn-dark uppercase">All</td></tr>
                    <tr><td class="p-3 font-bold text-bsn-purple border-r border-slate-200 text-center">Q23</td><td class="p-3 font-bold text-slate-800">Delegation</td><td class="p-3">Instills a sense of urgency and momentum in the team to drive efficient task completion.</td><td class="p-3 font-semibold text-[10px] text-bsn-dark uppercase">All</td></tr>
                    <tr class="bg-slate-50"><td class="p-3 font-bold text-bsn-purple border-r border-slate-200 text-center">Q24</td><td class="p-3 font-bold text-slate-800">Key Attributes</td><td class="p-3">I feel motivated to work in the Bank under his leadership.</td><td class="p-3 font-semibold text-[10px] text-bsn-purple uppercase">All</td></tr>
                    <tr class="bg-slate-50"><td class="p-3 font-bold text-bsn-purple border-r border-slate-200 text-center">Q25</td><td class="p-3 font-bold text-slate-800">Key Attributes</td><td class="p-3">Positive Attitude - Maintains an optimistic outlook and motivates staff during challenging situations.</td><td class="p-3 font-semibold text-[10px] text-bsn-dark uppercase">All</td></tr>
                    <tr><td class="p-3 font-bold text-bsn-purple border-r border-slate-200 text-center">Q26</td><td class="p-3 font-bold text-slate-800">Key Attributes</td><td class="p-3">Empathic - Regularly shows empathy by actively listening to staff’s concerns and addressing their needs.</td><td class="p-3 font-semibold text-[10px] text-bsn-dark uppercase">All</td></tr>
                    <tr class="bg-slate-50"><td class="p-3 font-bold text-bsn-purple border-r border-slate-200 text-center">Q27</td><td class="p-3 font-bold text-slate-800">Key Attributes</td><td class="p-3">Passionate - Displays passion for work by consistently going above and beyond to drive results.</td><td class="p-3 font-semibold text-[10px] text-bsn-dark uppercase">All</td></tr>
                    <tr><td class="p-3 font-bold text-bsn-purple border-r border-slate-200 text-center">Q28</td><td class="p-3 font-bold text-slate-800">Key Attributes</td><td class="p-3">Visionary - Provides a clear vision for the team by setting strategic goals.</td><td class="p-3 font-semibold text-[10px] text-bsn-dark uppercase">All</td></tr>
                </tbody>
            </table>
        </div>

        <div class="mt-8 mx-auto max-w-4xl p-4 bg-[#fff4b4] border border-[#f0e18a] rounded-md text-center">
            <p class="text-sm leading-relaxed text-slate-700">
                <span class="font-bold text-[#9c631d]">Note on Methodology:</span> 
                This report was generated using Generative AI to synthesize and theme feedback provided by the respondents. 
                While the insights are derived directly from participant data to ensure objectivity, these insights 
                should be viewed as a guide for development rather than a definitive psychological profile.
            </p>
        </div>
        <div class="mt-auto pt-20 text-center text-[10px] text-slate-400 uppercase tracking-[0.2em]">End of Comprehensive Report</div>
    </div>

    <script>
        const ctxSpider = document.getElementById('spiderChart').getContext('2d');
        const spiderData = {
            labels: \${radarLabels},
            datasets: [
                { 
                    label: 'Superior', 
                    data: \${radarSupData}, 
                    borderColor: '#F39C12', 
                    backgroundColor: 'rgba(243, 156, 18, 0.15)',
                    pointBackgroundColor: '#F39C12',
                    borderWidth: 2,
                    pointRadius: 3
                },
                { 
                    label: 'Subordinate', 
                    data: \${radarSubData}, 
                    borderColor: '#005B82', 
                    backgroundColor: 'rgba(0, 91, 130, 0.15)',
                    pointBackgroundColor: '#005B82',
                    borderWidth: 2,
                    pointRadius: 3
                },
                { 
                    label: 'Peer', 
                    data: \${radarPeerData}, 
                    borderColor: '#94A3B8', 
                    backgroundColor: 'rgba(148, 163, 184, 0.15)',
                    pointBackgroundColor: '#94A3B8',
                    borderWidth: 2,
                    pointRadius: 3
                }
            ]
        };

        new Chart(ctxSpider, {
            type: 'radar',
            data: spiderData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { display: true, color: '#F1F5F9' },
                        grid: { color: '#E2E8F0' },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: { stepSize: 20, display: true, backdropColor: 'transparent' },
                        pointLabels: {
                            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '700' },
                            color: '#1E293B'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { 
                            usePointStyle: true, 
                            padding: 20, 
                            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' } 
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1E293B',
                        padding: 10,
                        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
                        bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.parsed.r !== null) label += context.parsed.r.toFixed(0) + '%';
                                return label;
                            }
                        }
                    }
                }
            }
        });

        window.onload = function() {
            const dots = document.querySelectorAll('.nav-dot');
            const sections = document.querySelectorAll('.report-page');
            window.addEventListener('scroll', () => { 
                let current = ""; 
                sections.forEach(s => { 
                    if (window.pageYOffset >= s.offsetTop - 100) current = s.getAttribute('id'); 
                }); 
                dots.forEach(d => { 
                    d.classList.remove('active'); 
                    if (d.getAttribute('onclick').includes(current)) d.classList.add('active'); 
                }); 
            });
        }
    </script>
</body>
</html>`;
