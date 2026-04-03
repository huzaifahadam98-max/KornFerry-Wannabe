import React, { useState, useEffect } from 'react';
import { AnalysisResult, Employee } from '../types';
import { generateHtmlReport } from '../services/reportGenerator';
import { Download } from 'lucide-react';

interface ReportViewProps {
  employee: Employee;
  analysis: AnalysisResult;
}

export const ReportView: React.FC<ReportViewProps> = ({ employee, analysis }) => {
  const [reportHtml, setReportHtml] = useState('');

  useEffect(() => {
    if (employee && analysis) {
      const html = generateHtmlReport(employee, analysis);
      setReportHtml(html);
    }
  }, [employee, analysis]);

  const handleDownload = () => {
    if (!reportHtml) return;
    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = employee.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `${safeName}_${employee.id}_report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg w-full h-[calc(100vh-180px)] overflow-hidden relative">
        {reportHtml ? (
          <>
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
              >
                <Download size={18} />
                Download HTML
              </button>
            </div>
            <iframe
              srcDoc={reportHtml}
              className="w-full h-full border-0"
              title={`${employee.name} Report`}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Generating report...</p>
          </div>
        )}
    </div>
  );
};