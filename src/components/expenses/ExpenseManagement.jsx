import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { Plus, Download, FileSpreadsheet } from 'lucide-react';
import { exportExpensesCSV, exportExpensesPDF } from '../../utils/pdfGenerator';

const ExpenseManagement = () => {
  const { expenses, dispatch, success, error } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const handleSaveExpense = (expenseData) => {
    try {
      if (editingExpense) {
        // Update existing expense
        dispatch({ type: 'UPDATE_EXPENSE', payload: expenseData });
        success('Expense updated successfully');
      } else {
        // Add new expense
        dispatch({ type: 'ADD_EXPENSE', payload: expenseData });
        success('Expense added successfully');
      }
      setIsFormOpen(false);
      setEditingExpense(null);
    } catch (err) {
      console.error('Error saving expense:', err);
      error('Failed to save expense');
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  const handleExportCSV = () => {
    try {
      exportExpensesCSV(expenses);
      success('Expenses exported as CSV');
    } catch (err) {
      error('Failed to export expenses');
    }
  };

  const handleExportPDF = () => {
    try {
      exportExpensesPDF(expenses);
      success('Expenses exported as PDF');
    } catch (err) {
      error('Failed to export expenses');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
            <p className="text-sm text-gray-600 mt-1">Track and manage your business expenses</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExportPDF}
              variant="outline"
              icon={<Download size={18} />}
            >
              Export PDF
            </Button>
            
            <Button
              onClick={handleExportCSV}
              variant="outline"
              icon={<FileSpreadsheet size={18} />}
            >
              Export CSV
            </Button>
            
            <Button
              onClick={() => setIsFormOpen(true)}
              variant="primary"
              icon={<Plus size={18} />}
            >
              Add New Expense
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
          <p className="text-sm text-blue-700 font-semibold mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-blue-900">
            ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
          <p className="text-sm text-green-700 font-semibold mb-1">This Month</p>
          <p className="text-3xl font-bold text-green-900">
            ₹{expenses
              .filter(exp => {
                const expDate = new Date(exp.date);
                const now = new Date();
                return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
              })
              .reduce((sum, exp) => sum + exp.amount, 0)
              .toLocaleString()}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-200">
          <p className="text-sm text-purple-700 font-semibold mb-1">Today's Expenses</p>
          <p className="text-3xl font-bold text-purple-900">
            ₹{expenses
              .filter(exp => new Date(exp.date).toDateString() === new Date().toDateString())
              .reduce((sum, exp) => sum + exp.amount, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Expense List */}
      <ExpenseList onEdit={handleEditExpense} />

      {/* Add/Edit Expense Modal */}
      <Modal isOpen={isFormOpen} onClose={handleCancelForm}>
        <ExpenseForm
          expense={editingExpense}
          onSave={handleSaveExpense}
          onCancel={handleCancelForm}
        />
      </Modal>
    </div>
  );
};

export default ExpenseManagement;
