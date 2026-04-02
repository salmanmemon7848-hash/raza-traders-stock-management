import React, { useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useExport } from '../../hooks/useExport';
import { useBackup } from '../../hooks/useBackup';
import Button from '../common/Button';
import { Download, Upload, FileSpreadsheet, FileText, Database, Trash2 } from 'lucide-react';

const Settings = () => {
  const { settings, dispatch } = useAppContext();
  const { exportProductsCSV, exportCustomersCSV, exportInvoicesCSV } = useExport();
  const { exportBackup, importBackup, clearAllData } = useBackup();
  const fileInputRef = useRef(null);

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      importBackup(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Download size={20} className="mr-2" />
          Export Data
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Download your data in various formats for reporting or analysis
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button onClick={exportProductsCSV} variant="outline">
            <FileSpreadsheet size={20} className="mr-2" />
            Products CSV
          </Button>
          
          <Button onClick={exportCustomersCSV} variant="outline">
            <FileSpreadsheet size={20} className="mr-2" />
            Customers CSV
          </Button>
          
          <Button onClick={exportInvoicesCSV} variant="outline">
            <FileText size={20} className="mr-2" />
            Invoices CSV
          </Button>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Database size={20} className="mr-2" />
          Backup & Restore
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Create backups of all your data or restore from a previous backup
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button onClick={exportBackup} variant="primary">
            <Download size={20} className="mr-2" />
            Export Full Backup
          </Button>
          
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="secondary"
              className="w-full"
            >
              <Upload size={20} className="mr-2" />
              Import Backup
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-red-200">
        <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center">
          <Trash2 size={20} className="mr-2" />
          Danger Zone
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Permanently delete all data from the application. This action cannot be undone.
        </p>
        
        <Button onClick={clearAllData} variant="danger">
          <Trash2 size={20} className="mr-2" />
          Clear All Data
        </Button>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Company Name</p>
            <p className="font-semibold">{settings.companyName || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">GST Number</p>
            <p className="font-semibold">{settings.gstNumber || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-semibold">{settings.companyPhone || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold">{settings.companyEmail || 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
