import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div 
      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        accept=".xlsx, .csv" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
          <Upload size={24} />
        </div>
        <div className="text-gray-600">
          <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
        </div>
        <p className="text-xs text-gray-500">Excel (.xlsx) or CSV files containing LES 360 data</p>
      </div>
    </div>
  );
};
