import React, { useState, useMemo, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { ReportView } from './components/ReportView';
import { parseExcel, generateBulkExcelReport } from './services/excelService';
import { analyzeEmployeeFeedback } from './services/geminiService';
import { Employee, AnalysisResult } from './types';
import { Users, FileSpreadsheet, Loader2, Search, DownloadCloud, Filter, CheckSquare, Square, X, AlertCircle, CheckCircle, Play } from 'lucide-react';

const App: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Bulk Export State Management
  const stopProcessingRef = useRef(false);
  const [bulkState, setBulkState] = useState<{
    isOpen: boolean;
    total: number;
    processed: number;
    success: number;
    failed: number;
    currentName: string;
    logs: string[];
    isComplete: boolean;
    isCancelled: boolean;
    results: { employee: Employee; analysis: AnalysisResult }[];
  }>({
    isOpen: false,
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    currentName: '',
    logs: [],
    isComplete: false,
    isCancelled: false,
    results: []
  });

  // Derived Data for Filters
  const uniqueDepartments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department).filter(Boolean));
    return ['All', ...Array.from(depts).sort()];
  }, [employees]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(employees.map(e => e.jobTitle).filter(Boolean));
    return ['All', ...Array.from(roles).sort()];
  }, [employees]);

  // Filter Logic
  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.id.toString().includes(searchTerm);
      const matchesDept = departmentFilter === 'All' || e.department === departmentFilter;
      const matchesRole = roleFilter === 'All' || e.jobTitle === roleFilter;
      return matchesSearch && matchesDept && matchesRole;
    });
  }, [employees, searchTerm, departmentFilter, roleFilter]);

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await parseExcel(file);
      // Filter out rows that might be empty or headers
      const validEmployees = data.filter(e => e.name && e.name !== 'Unknown');
      setEmployees(validEmployees);
      setSelectedIds(new Set()); // Reset selection on new upload
      setDepartmentFilter('All');
      setRoleFilter('All');
    } catch (err) {
      console.error(err);
      setError('Failed to parse Excel file. Please ensure it follows the correct format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (employee: Employee) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedEmployee(employee);
      // Reset previous analysis while loading new one
      setAnalysis(null);
      
      const result = await analyzeEmployeeFeedback(employee);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze data with AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Selection Handlers
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAllFiltered = () => {
    const allFilteredSelected = filteredEmployees.every(e => selectedIds.has(e.id));
    const newSet = new Set(selectedIds);
    
    if (allFilteredSelected) {
      // Deselect visible
      filteredEmployees.forEach(e => newSet.delete(e.id));
    } else {
      // Select visible
      filteredEmployees.forEach(e => newSet.add(e.id));
    }
    setSelectedIds(newSet);
  };

  const addBulkLog = (msg: string) => {
    setBulkState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-4), msg] // keep last 5 logs
    }));
  };

  const handleStopBulk = () => {
    stopProcessingRef.current = true;
    addBulkLog("Stopping process... finishing current item.");
    setBulkState(prev => ({ ...prev, isCancelled: true }));
  };

  const handleDownloadBulk = () => {
    if (bulkState.results.length === 0) {
      alert("No results to export.");
      return;
    }
    generateBulkExcelReport(bulkState.results);
  };

  const handleCloseBulkModal = () => {
    setBulkState(prev => ({ ...prev, isOpen: false }));
  };

  const handleBulkExport = async () => {
    const employeesToExport = employees.filter(e => selectedIds.has(e.id));

    if (employeesToExport.length === 0) {
        alert("Please select at least one employee to export.");
        return;
    }
    
    // Initialize Modal State
    stopProcessingRef.current = false;
    setBulkState({
      isOpen: true,
      total: employeesToExport.length,
      processed: 0,
      success: 0,
      failed: 0,
      currentName: '',
      logs: ['Starting bulk analysis process...'],
      isComplete: false,
      isCancelled: false,
      results: []
    });

    const results: { employee: Employee; analysis: AnalysisResult }[] = [];
    
    try {
      for (let i = 0; i < employeesToExport.length; i++) {
        if (stopProcessingRef.current) {
          addBulkLog("Process cancelled by user.");
          break;
        }

        const emp = employeesToExport[i];
        
        setBulkState(prev => ({
          ...prev,
          currentName: emp.name,
          processed: i, // Show completed count, so currently processing is i+1 conceptually
        }));

        // Reuse existing analysis if available
        if (selectedEmployee?.id === emp.id && analysis) {
           addBulkLog(`Using cached result for ${emp.name}`);
           results.push({ employee: emp, analysis: analysis });
           setBulkState(prev => ({ 
             ...prev, 
             success: prev.success + 1,
             results: [...prev.results, { employee: emp, analysis: analysis }] 
           }));
           continue;
        }

        // Retry logic
        let success = false;
        let retryCount = 0;
        const maxRetries = 3; // For regular errors (not 429)

        while (!success && !stopProcessingRef.current) {
          try {
            // Rate limiting delay
            // Gemini Free Tier often has 15 RPM limits. 4s delay = 15 RPM.
            // Using 4000ms delay to stay safe.
            const baseDelay = 4000;
            
            if (i > 0 || retryCount > 0) {
              await new Promise(r => setTimeout(r, baseDelay));
            }
            
            if (retryCount > 0) addBulkLog(`Retry ${retryCount} for ${emp.name}...`);
            else addBulkLog(`Analyzing ${emp.name}...`);

            const result = await analyzeEmployeeFeedback(emp);
            
            const item = { employee: emp, analysis: result };
            results.push(item);
            setBulkState(prev => ({ 
              ...prev, 
              success: prev.success + 1,
              results: [...prev.results, item] 
            }));
            
            success = true;

          } catch (e: any) {
             const errorMsg = e instanceof Error ? e.message : String(e);
             
             // Smart Rate Limit Handling (429)
             if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
                addBulkLog(`Daily/Minute Quota limit reached.`);
                
                // Extract wait time from error message like "Please retry in 32.206s"
                let waitTime = 32000; // Default safe wait
                const match = errorMsg.match(/retry in (\d+(\.\d+)?)s/);
                if (match && match[1]) {
                    // Parse seconds to ms, add 2s buffer
                    waitTime = Math.ceil(parseFloat(match[1])) * 1000 + 2000;
                }

                addBulkLog(`Pausing for ${Math.round(waitTime/1000)}s to cool down...`);
                await new Promise(r => setTimeout(r, waitTime));
                
                // Do NOT increment retryCount for quota errors, just loop again indefinitely
                continue; 
             }

             console.error(`Error analyzing ${emp.name}:`, e);
             retryCount++;
             
             if (retryCount >= maxRetries) {
               addBulkLog(`Failed to analyze ${emp.name} after ${maxRetries} attempts.`);
               setBulkState(prev => ({ ...prev, failed: prev.failed + 1 }));
               break; // Move to next employee
             }
          }
        }
      }
    } catch (err) {
      console.error(err);
      addBulkLog("Unexpected system error occurred.");
    } finally {
      setBulkState(prev => ({ 
        ...prev, 
        isComplete: true, 
        processed: prev.total, // Ensure bar is full if complete
        currentName: 'Completed',
        logs: [...prev.logs, "Processing finished."]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
      {/* Robust Bulk Progress Modal */}
      {bulkState.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {bulkState.isComplete ? 'Analysis Complete' : 'Generating Bulk Report'}
              </h3>
              {bulkState.isComplete && (
                <button onClick={handleCloseBulkModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Progress Circle/Status */}
              <div className="flex flex-col items-center justify-center text-center">
                {!bulkState.isComplete ? (
                  <Loader2 className="animate-spin text-indigo-600 mb-3" size={48} />
                ) : (
                  <div className="mb-3">
                    {bulkState.failed === 0 ? (
                      <CheckCircle className="text-green-500" size={48} />
                    ) : (
                      <AlertCircle className="text-orange-500" size={48} />
                    )}
                  </div>
                )}
                
                <h2 className="text-2xl font-bold text-gray-800">
                  {bulkState.success} / {bulkState.total}
                </h2>
                <p className="text-gray-500 text-sm">Successfully Analyzed</p>
                {bulkState.failed > 0 && (
                   <p className="text-red-500 text-sm font-medium mt-1">{bulkState.failed} Failed</p>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                   <span>Progress</span>
                   <span>{Math.round(((bulkState.success + bulkState.failed) / bulkState.total) * 100) || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${bulkState.isComplete ? 'bg-green-500' : 'bg-indigo-600'}`}
                    style={{ width: `${((bulkState.success + bulkState.failed) / bulkState.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 text-center truncate h-5">
                   {bulkState.isComplete ? 'Done' : `Processing: ${bulkState.currentName}`}
                </p>
              </div>

              {/* Log Window */}
              <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400 h-32 overflow-hidden flex flex-col justify-end">
                 {bulkState.logs.map((log, idx) => (
                   <div key={idx} className="truncate">> {log}</div>
                 ))}
              </div>
            </div>

            {/* Modal Footer (Actions) */}
            <div className="p-4 border-t bg-gray-50 flex gap-3 justify-end">
               {!bulkState.isComplete && !bulkState.isCancelled && (
                 <button 
                   onClick={handleStopBulk}
                   className="px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors"
                 >
                   Stop
                 </button>
               )}
               
               {/* Always allow download if results exist, even if stopped or incomplete */}
               <button 
                 onClick={handleDownloadBulk}
                 disabled={bulkState.results.length === 0}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold shadow-sm text-white transition-colors
                    ${bulkState.results.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                 `}
               >
                 <DownloadCloud size={18} />
                 Download Report {bulkState.results.length > 0 && `(${bulkState.results.length})`}
               </button>
               
               {bulkState.isComplete && (
                  <button 
                    onClick={handleCloseBulkModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <FileSpreadsheet className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">LES 360 Analytics</h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">Korn Ferry Leadership Architect</div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {employees.length === 0 ? (
          <div className="max-w-xl mx-auto mt-20">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Upload Survey Data</h2>
                <p className="text-center text-gray-500 mb-8">Upload the LES 360 Excel file to begin analysis</p>
                <FileUpload onFileUpload={handleFileUpload} />
                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar List */}
            <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-140px)] sticky top-24">
                {/* Controls Area */}
                <div className="p-4 border-b bg-gray-50 space-y-3 shrink-0">
                    <div className="flex justify-between items-center">
                      <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                          <Users size={18} /> Employees
                      </h2>
                      {employees.length > 0 && (
                        <button 
                          onClick={handleBulkExport}
                          disabled={bulkState.isOpen || selectedIds.size === 0}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          title="Generate bulk Excel report for selected"
                        >
                          <Play size={14} fill="currentColor" />
                          Start Bulk Analysis ({selectedIds.size})
                        </button>
                      )}
                    </div>
                    
                    {/* Search */}
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search name or ID..." 
                            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-700"
                      >
                        {uniqueDepartments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Depts' : d}</option>)}
                      </select>
                      <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-700"
                      >
                         {uniqueRoles.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
                      </select>
                    </div>

                    {/* Select All Toggle */}
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-200 mt-2">
                      <button 
                        onClick={toggleSelectAllFiltered}
                        className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                      >
                        {filteredEmployees.length > 0 && filteredEmployees.every(e => selectedIds.has(e.id)) ? (
                          <CheckSquare size={16} className="text-indigo-600" />
                        ) : (
                          <Square size={16} className="text-gray-400" />
                        )}
                        Select All Visible ({filteredEmployees.length})
                      </button>
                    </div>
                </div>

                {/* List Area */}
                <div className="overflow-y-auto flex-grow bg-white">
                    {filteredEmployees.map((emp) => {
                        const isSelected = selectedIds.has(emp.id);
                        const isActive = selectedEmployee?.id === emp.id;
                        return (
                          <div 
                            key={emp.id}
                            className={`flex items-stretch border-b transition-colors hover:bg-gray-50
                                ${isActive ? 'bg-indigo-50' : ''}
                            `}
                          >
                             {/* Checkbox Area */}
                             <div 
                                className="w-10 shrink-0 flex items-center justify-center cursor-pointer border-r border-transparent hover:bg-gray-100"
                                onClick={() => toggleSelection(emp.id)}
                             >
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  onChange={() => {}} // handled by div click
                                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 pointer-events-none"
                                />
                             </div>

                             {/* Content Area - Click to view analysis */}
                             <button
                                onClick={() => handleAnalyze(emp)}
                                className={`flex-grow text-left p-3 flex flex-col gap-0.5
                                    ${isActive ? 'border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent pl-4'}
                                `}
                             >
                                <span className="font-medium text-gray-900 text-sm">{emp.name}</span>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span className="truncate max-w-[120px]">{emp.jobTitle}</span>
                                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                  <span className="truncate max-w-[100px]">{emp.department}</span>
                                </div>
                             </button>
                          </div>
                        );
                    })}
                    {filteredEmployees.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                            <Filter className="mb-2 text-gray-300" size={24} />
                            No employees match your filters.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full lg:w-2/3">
                {isLoading ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px]">
                        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                        <p className="text-gray-600 font-medium text-lg">Analyzing 360° Feedback...</p>
                        <p className="text-gray-400 text-sm mt-2">Consulting Korn Ferry Framework</p>
                    </div>
                ) : analysis && selectedEmployee ? (
                    <ReportView employee={selectedEmployee} analysis={analysis} />
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px] text-center border-2 border-dashed border-gray-200">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <Users className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Select an Employee</h3>
                        <p className="text-gray-500 max-w-md">
                            Select employees using checkboxes to Bulk Export, or click a name to view the Leadership Effectiveness Report.
                        </p>
                    </div>
                )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;