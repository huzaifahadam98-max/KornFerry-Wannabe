import React, { useEffect } from 'react';
import { AnalysisResult, Employee } from '../types';
import { Download, User, BarChart2, Eye, AlertTriangle, Target } from 'lucide-react';
import { generateExcelReport } from '../services/excelService';

interface ReportViewProps {
  employee: Employee;
  analysis: AnalysisResult;
}

export const ReportView: React.FC<ReportViewProps> = ({ employee, analysis }) => {
  
  useEffect(() => {
    document.title = `${employee.name} - LES 360 Report`;
    return () => {
      document.title = 'LES 360 Leadership Architect';
    };
  }, [employee.name]);

  const handleExport = () => {
    generateExcelReport({
        employee,
        analysis,
        timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto my-8 print:shadow-none">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{employee.name}</h1>
          <p className="text-gray-500 font-medium">{employee.jobTitle} | {employee.department}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-bold text-sm border border-indigo-100">
            <User size={16} />
            Archetype: {analysis.archetype.title}
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="space-y-8">
        {/* Archetype Description */}
        <section>
          <p className="text-gray-700 leading-relaxed italic border-l-4 border-indigo-500 pl-4 bg-gray-50 py-3 pr-2 rounded-r">
            "{analysis.archetype.description}"
          </p>
        </section>

        {/* Dominant Insights */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 className="text-blue-500" /> Dominant Insights
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-5 border border-green-100">
              <h3 className="font-bold text-green-800 mb-3 uppercase text-sm tracking-wider">Top Strengths</h3>
              <ul className="space-y-3">
                {analysis.dominantInsights.strengths.map((item, idx) => (
                  <li key={idx}>
                    <span className="font-bold text-gray-900 block">{item.competency}</span>
                    <span className="text-sm text-gray-600">{item.evidence}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-orange-50 rounded-lg p-5 border border-orange-100">
              <h3 className="font-bold text-orange-800 mb-3 uppercase text-sm tracking-wider">Development Needs</h3>
              <ul className="space-y-3">
                {analysis.dominantInsights.opportunities.map((item, idx) => (
                  <li key={idx}>
                    <span className="font-bold text-gray-900 block">{item.competency}</span>
                    <span className="text-sm text-gray-600">{item.evidence}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Johari Window */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Eye className="text-purple-500" /> Perception Gap Analysis
          </h2>
          <div className="grid md:grid-cols-2 gap-0 border rounded-lg overflow-hidden">
             <div className="bg-gray-50 p-6 border-b md:border-b-0 md:border-r border-gray-200">
                <h3 className="font-bold text-gray-700 mb-2">Public Arena (Aligned Views)</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{analysis.johariWindow.publicArena}</p>
             </div>
             <div className="bg-white p-6">
                <h3 className="font-bold text-gray-700 mb-2">Blind Spots (External Perception)</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{analysis.johariWindow.blindSpots}</p>
             </div>
          </div>
        </section>

        {/* Stallers */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" /> Career Stallers & Stoppers
          </h2>
          <div className="space-y-3">
            {analysis.stallers.map((staller, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow">
                <div className={`
                  shrink-0 px-3 py-1 rounded text-xs font-bold uppercase mt-1
                  ${staller.status === 'A Problem' ? 'bg-red-100 text-red-700' : 
                    staller.status === 'A Potential Problem' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-green-100 text-green-700'}
                `}>
                  {staller.status}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{staller.staller}</h3>
                  <p className="text-sm text-gray-600 mt-1">{staller.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 70-20-10 Action Plan */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="text-cyan-500" /> Strategic Action Plan (70-20-10)
          </h2>
          <div className="space-y-4">
             <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-32 shrink-0 flex flex-col justify-center items-center bg-blue-600 text-white rounded-lg p-4">
                    <span className="text-2xl font-bold">70%</span>
                    <span className="text-xs uppercase opacity-80">Experience</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg flex-grow border border-gray-100">
                    <p className="text-gray-700 text-sm">{analysis.actionPlan.experience}</p>
                </div>
             </div>
             <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-32 shrink-0 flex flex-col justify-center items-center bg-blue-500 text-white rounded-lg p-4">
                    <span className="text-2xl font-bold">20%</span>
                    <span className="text-xs uppercase opacity-80">Exposure</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg flex-grow border border-gray-100">
                    <p className="text-gray-700 text-sm">{analysis.actionPlan.exposure}</p>
                </div>
             </div>
             <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-32 shrink-0 flex flex-col justify-center items-center bg-blue-400 text-white rounded-lg p-4">
                    <span className="text-2xl font-bold">10%</span>
                    <span className="text-xs uppercase opacity-80">Education</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg flex-grow border border-gray-100">
                    <p className="text-gray-700 text-sm">{analysis.actionPlan.education}</p>
                </div>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
};