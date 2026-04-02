import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';
import Input from '../common/Input';
import { X, Save } from 'lucide-react';

const ExpenseForm = ({ expense, onSave, onCancel }) => {
  const { settings } = useAppContext();
  
  const [formData, setFormData] = useState({
    title: expense?.title || '',
    amount: expense?.amount?.toString() || '',
    category: expense?.category || '',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    notes: expense?.notes || '',
    customCategory: '' // For "Other" category
  });
  
  const [errors, setErrors] = useState({});

  // Default categories + Other option
  const defaultCategories = [
    'Rent',
    'Electricity Bill',
    'Staff Salary',
    'Transport / Delivery',
    'Maintenance / Repair',
    'Other' // ← Added Other option
  ];
  
  const customCategories = settings.expenseCategories || [];
  // Show custom categories separately (not including "Other")
  const allCategories = [...defaultCategories, ...customCategories];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Expense title is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    // Validate custom category if "Other" is selected
    if (formData.category === 'Other' && !formData.customCategory?.trim()) {
      errors.customCategory = 'Please enter a custom category name';
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    try {
      // Determine final category name
      const finalCategory = formData.category === 'Other' && formData.customCategory?.trim() 
        ? formData.customCategory.trim() 
        : formData.category;

      // Save the expense
      onSave({
        ...expense,
        ...formData,
        category: finalCategory,
        amount: parseFloat(formData.amount)
      });
      
      // If "Other" was selected and a custom category was entered, save it to settings for future use
      if (formData.category === 'Other' && formData.customCategory?.trim()) {
        const newCategory = formData.customCategory.trim();
        const existingCategories = settings.expenseCategories || [];
        // Only add if it doesn't already exist
        if (!existingCategories.includes(newCategory)) {
          // This will be handled by the parent component through context
        }
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      setErrors({ general: 'Failed to save expense. Please try again.' });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {expense ? 'Edit Expense' : 'Add New Expense'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          ❌ {errors.general}
        </div>
      )}

      {/* Expense Title */}
      <Input
        label="Expense Title *"
        type="text"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        placeholder="e.g., Electricity Bill, Rent, Transport"
        error={errors.title}
        required
      />

      {/* Amount */}
      <Input
        label="Amount (₹) *"
        type="number"
        value={formData.amount}
        onChange={(e) => handleChange('amount', e.target.value)}
        placeholder="Enter amount"
        min="0.01"
        step="0.01"
        error={errors.amount}
        required
      />

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Category *
        </label>
        <select
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow bg-white text-gray-900 ${
            errors.category ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select Category</option>
          {allCategories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
        
        {/* Custom Category Input - Shows when "Other" is selected */}
        {formData.category === 'Other' && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label className="block text-sm font-semibold text-yellow-800 mb-2">
              ➕ Enter Custom Category Name *
            </label>
            <input
              type="text"
              value={formData.customCategory}
              onChange={(e) => handleChange('customCategory', e.target.value)}
              placeholder="e.g., Furniture Polishing, Repair Tools, etc."
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-shadow text-gray-900 ${
                errors.customCategory ? 'border-red-300' : 'border-gray-300'
              }`}
              autoFocus
            />
            {errors.customCategory && (
              <p className="mt-1 text-sm text-red-600">{errors.customCategory}</p>
            )}
            <p className="mt-2 text-xs text-yellow-700">
              💡 This category will be saved and available for future use
            </p>
          </div>
        )}
      </div>

      {/* Date */}
      <Input
        label="Date *"
        type="date"
        value={formData.date}
        onChange={(e) => handleChange('date', e.target.value)}
        error={errors.date}
        required
      />

      {/* Notes (Optional) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional details about this expense..."
          rows="3"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow resize-none text-gray-900"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          icon={<Save size={18} />}
        >
          {expense ? 'Update Expense' : 'Add Expense'}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
