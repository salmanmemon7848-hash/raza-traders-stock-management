import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Plus, Download, FileSpreadsheet, Receipt } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import PageHeader from '../common/PageHeader';
import StatCard from '../common/StatCard';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import { exportExpensesCSV, exportExpensesPDF } from '../../utils/pdfGenerator';
import { formatINR } from '../../utils/calculations';
import { isToday, isThisMonth } from '../../utils/dates';

const ExpenseManagement = () => {
  const { expenses, dispatch, success, error, settings } = useAppContext();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const todayTotal = useMemo(
    () => expenses.filter(e => isToday(e.date)).reduce((s, e) => s + e.amount, 0),
    [expenses]
  );
  const monthTotal = useMemo(
    () => expenses.filter(e => isThisMonth(e.date)).reduce((s, e) => s + e.amount, 0),
    [expenses]
  );

  const save = (data) => {
    if (editing) {
      dispatch({ type: 'UPDATE_EXPENSE', payload: data });
      success('Expense updated');
    } else {
      dispatch({ type: 'ADD_EXPENSE', payload: data });
      success('Expense added');

      // Persist custom category if new
      const defaults = ['Rent', 'Electricity Bill', 'Staff Salary', 'Transport / Delivery', 'Maintenance / Repair'];
      const customs = settings.expenseCategories || [];
      if (!defaults.includes(data.category) && !customs.includes(data.category)) {
        dispatch({ type: 'ADD_EXPENSE_CATEGORY', payload: data.category });
      }
    }
    setFormOpen(false);
    setEditing(null);
  };

  const onEdit = (e) => { setEditing(e); setFormOpen(true); };
  const onCancel = () => { setEditing(null); setFormOpen(false); };

  const handleExport = (fn, label) => {
    try { fn(expenses); success(`Exported as ${label}`); }
    catch { error('Export failed'); }
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Expenses"
        subtitle="Track every paisa going out so your profit numbers are real."
        actions={
          <>
            <Button variant="outline" icon={<Download size={16} />} onClick={() => handleExport(exportExpensesPDF, 'PDF')}>
              PDF
            </Button>
            <Button variant="outline" icon={<FileSpreadsheet size={16} />} onClick={() => handleExport(exportExpensesCSV, 'CSV')}>
              CSV
            </Button>
            <Button icon={<Plus size={16} />} onClick={() => setFormOpen(true)}>Add expense</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="All Time" value={formatINR(total)} icon={Receipt} tone="brand" />
        <StatCard label="This Month" value={formatINR(monthTotal)} icon={Receipt} tone="warning" />
        <StatCard label="Today" value={formatINR(todayTotal)} icon={Receipt} tone="danger" />
      </div>

      <ExpenseList onEdit={onEdit} />

      <Modal isOpen={formOpen} onClose={onCancel} title={editing ? 'Edit expense' : 'Add expense'} size="md">
        <ExpenseForm expense={editing} onSave={save} onCancel={onCancel} />
      </Modal>
    </div>
  );
};

export default ExpenseManagement;
