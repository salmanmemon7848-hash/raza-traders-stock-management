import React, { useRef, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import {
  Download, Upload, Database, Trash2, Building2, Save, Plus, X, Settings as Cog,
} from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';
import { Card, CardHeader, CardBody } from '../common/Card';
import ConfirmDialog from '../common/ConfirmDialog';
import { useBackup } from '../../hooks/useBackup';
import { useExport } from '../../hooks/useExport';

const Settings = () => {
  const { settings, dispatch, success } = useAppContext();
  const { exportProductsCSV, exportCustomersCSV, exportInvoicesCSV } = useExport();
  const { exportBackup, importBackup, clearAllData } = useBackup();

  const [form, setForm] = useState({
    companyName: settings.companyName || '',
    companyAddress: settings.companyAddress || '',
    companyPhone: settings.companyPhone || '',
    companyEmail: settings.companyEmail || '',
    gstNumber: settings.gstNumber || '',
    defaultGstRate: settings.defaultGstRate || 18,
    lowStockThreshold: settings.lowStockThreshold || 5,
  });
  const [newCategory, setNewCategory] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileRef = useRef(null);

  const updateField = (k, v) => setForm({ ...form, [k]: v });

  const saveCompany = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        companyName: form.companyName.trim(),
        companyAddress: form.companyAddress.trim(),
        companyPhone: form.companyPhone.trim(),
        companyEmail: form.companyEmail.trim(),
        gstNumber: form.gstNumber.trim(),
        defaultGstRate: parseFloat(form.defaultGstRate) || 18,
        lowStockThreshold: parseInt(form.lowStockThreshold, 10) || 5,
      },
    });
    success('Settings saved');
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    dispatch({ type: 'ADD_EXPENSE_CATEGORY', payload: newCategory.trim() });
    setNewCategory('');
    success('Category added');
  };

  const removeCategory = (cat) => {
    dispatch({ type: 'DELETE_EXPENSE_CATEGORY', payload: cat });
  };

  return (
    <div className="page-shell">
      <PageHeader title="Settings" subtitle="Business details, defaults, and data management." />

      {/* Company info */}
      <Card>
        <CardHeader title="Business details" subtitle="Used on invoices and reports" icon={<Building2 size={18} />} />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Business name" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} />
            <Input label="GST number / GSTIN" value={form.gstNumber} onChange={(e) => updateField('gstNumber', e.target.value)} placeholder="22AAAAA0000A1Z5" />
            <Input label="Phone" value={form.companyPhone} onChange={(e) => updateField('companyPhone', e.target.value)} prefix="+91" />
            <Input label="Email" value={form.companyEmail} onChange={(e) => updateField('companyEmail', e.target.value)} type="email" />
            <div className="sm:col-span-2">
              <Input label="Address" value={form.companyAddress} onChange={(e) => updateField('companyAddress', e.target.value)} placeholder="Shop address as you want it on bills" />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Defaults */}
      <Card>
        <CardHeader title="Defaults" subtitle="Sensible defaults across the app" icon={<Cog size={18} />} />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Default GST rate (%)"
              type="number"
              value={form.defaultGstRate}
              onChange={(e) => updateField('defaultGstRate', e.target.value)}
              hint="Used as the starting GST rate on new bills"
            />
            <Input
              label="Low-stock threshold"
              type="number"
              value={form.lowStockThreshold}
              onChange={(e) => updateField('lowStockThreshold', e.target.value)}
              hint="Products at or below this quantity show as low stock"
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={saveCompany} icon={<Save size={16} />}>Save settings</Button>
          </div>
        </CardBody>
      </Card>

      {/* Expense categories */}
      <Card>
        <CardHeader title="Expense categories" subtitle="Tap to remove. Defaults always available." />
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {(settings.expenseCategories || []).map(cat => (
              <button
                key={cat}
                onClick={() => removeCategory(cat)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm hover:bg-danger-50 hover:text-danger-700 transition-colors"
              >
                {cat}
                <X size={12} />
              </button>
            ))}
            {(settings.expenseCategories || []).length === 0 && (
              <p className="text-sm text-slate-500">No custom categories yet.</p>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
            />
            <Button icon={<Plus size={16} />} onClick={addCategory}>Add</Button>
          </div>
        </CardBody>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader title="Export data" subtitle="Download spreadsheets of your business data" icon={<Download size={18} />} />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button variant="outline" fullWidth onClick={exportProductsCSV}>Products CSV</Button>
            <Button variant="outline" fullWidth onClick={exportCustomersCSV}>Customers CSV</Button>
            <Button variant="outline" fullWidth onClick={exportInvoicesCSV}>Invoices CSV</Button>
          </div>
        </CardBody>
      </Card>

      {/* Backup */}
      <Card>
        <CardHeader title="Backup & restore" subtitle="Full JSON snapshot of your data" icon={<Database size={18} />} />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button variant="primary" icon={<Download size={16} />} onClick={exportBackup} fullWidth>
              Export full backup
            </Button>
            <input
              type="file"
              ref={fileRef}
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])}
            />
            <Button variant="outline" icon={<Upload size={16} />} onClick={() => fileRef.current?.click()} fullWidth>
              Restore from backup
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Danger zone */}
      <Card className="border-danger-200">
        <CardHeader title="Danger zone" subtitle="Permanent actions — be careful" />
        <CardBody>
          <p className="text-sm text-slate-600 mb-3">
            This wipes all products, customers, bills, payments, and product requests both on this device and in the cloud.
          </p>
          <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => setShowClearConfirm(true)}>
            Clear all data
          </Button>
        </CardBody>
      </Card>

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearAllData}
        title="Delete everything?"
        message="This permanently removes all products, customers, invoices, expenses, payments, and product requests. This cannot be undone."
        confirmLabel="Yes, clear everything"
      />
    </div>
  );
};

export default Settings;
