import { useState } from 'react';
import { Upload as UploadIcon, File, CheckCircle, AlertCircle, X } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useDbName } from '../../hooks/useDbName';

const AdminUpload = () => {
  const dbName = useDbName();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [primaryKey, setPrimaryKey] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadStatus(null);
      } else {
        setUploadStatus({
          type: 'error',
          message: 'Please select a CSV file'
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadStatus(null);
      } else {
        setUploadStatus({
          type: 'error',
          message: 'Please select a CSV file'
        });
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a file to upload'
      });
      return;
    }

    if (!dbName) {
      setUploadStatus({
        type: 'error',
        message: 'Database name not available. Please log in again.'
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus(null);
      
      const response = await adminApi.uploadCSV(selectedFile, primaryKey || null, dbName);
      
      if (response.success !== false) {
        setUploadStatus({
          type: 'success',
          message: `Successfully uploaded ${selectedFile.name}. ${response.message || ''}`
        });
        setSelectedFile(null);
        setPrimaryKey('');
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Failed to upload CSV:', err);
      setUploadStatus({
        type: 'error',
        message: err.response?.data?.error || err.message || 'Failed to upload CSV. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadStatus(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Upload CSV</h1>
        <p className="text-gray-600 mt-2">Import data from CSV files into your database</p>
      </div>

      <div className="max-w-2xl">
        {uploadStatus && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
              uploadStatus.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {uploadStatus.type === 'success' ? (
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            ) : (
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            )}
            <p
              className={`flex-1 ${
                uploadStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {uploadStatus.message}
            </p>
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* File upload area */}
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${selectedFile ? 'bg-gray-50' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <File className="text-primary-600" size={24} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              ) : (
                <>
                  <UploadIcon className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop your CSV file here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">or</p>
                  <label className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2 cursor-pointer">
                    <span>Browse Files</span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-4">
                    Supported format: CSV files only
                  </p>
                </>
              )}
            </div>

            {/* Primary key input */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Key (Optional)
              </label>
              <input
                type="text"
                value={primaryKey}
                onChange={(e) => setPrimaryKey(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., id, user_id"
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify a column name to use as the primary key for the table
              </p>
            </div>
          </div>

          {/* Upload button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPrimaryKey('');
                setUploadStatus(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUploading || !selectedFile}
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isUploading || !selectedFile}
            >
              <UploadIcon size={20} />
              <span>{isUploading ? 'Uploading...' : 'Upload CSV'}</span>
            </button>
          </div>
        </form>

        {/* Information card */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8 bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Upload Guidelines</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>CSV files should have headers in the first row</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Column names will be used as field names in the database</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>If a table with the same name exists, it will be replaced</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Optionally specify a primary key column for better performance</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;

