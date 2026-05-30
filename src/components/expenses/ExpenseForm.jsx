import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const DEFAULT_CATEGORIES = [
  'Rent',
  'Electricity Bill',
  'Staff Salary',
  'Transport / Delivery',
  'Maintenance / Repair',
];

const today = () => new Date().toISOString().split('T')[0];

const ExpenseForm = ({ expense, onSave, onCancel }) => {
  const { settings } = useAppContext();
  const customCategories = settings.expenseCategories || [];
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...customCategories]));

  const isCustomInitially = expense && !allCategories.includes(expense.category);

  const [form, setForm] = useState({
    title: expense?.title || '',
    amount: expense?.amount?.toString() || '',
    category: isCustomInitially ? 'Other' : (expense?.category || ''),
    customCategory: isCustomInitially ? expense.category : '',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : today(),
    notes: expense?.notes || '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm({ ...form, [k]: v });
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Must be > 0';
    if (!form.category) errs.category = 'Pick a category';
    if (form.category === 'Other' && !form.customCategory.trim()) errs.customCategory = 'Enter the new category name';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const finalCategory = form.category === 'Other' ? form.customCategory.trim() : form.category;
    onSave({
      ...(expense || {}),
      title: form.title.trim(),
      amount: parseFloat(form.amount),
      category: finalCategory,
      date: form.date,
      notes: form.notes.trim(),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="What was this for?"
        required
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        error={errors.title}
        placeholder="e.g. October electricity bill"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Amount"
          required
          type="number"
          value={form.amount}
          onChange={(e) => set('amount', e.target.value)}
          error={errors.amount}
          prefix="₹"
          placeholder="0"
        />
        <Input
          label="Date"
          required
          type="date"
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
        />
      </div>

      <Select
        label="Category"
        required
        value={form.category}
        onChange={(e) => set('category', e.target.value)}
        error={errors.category}
      >
        <option value="">Select category</option>
        {allCategories.map(c => <option key={c}>{c}</option>)}
        <option value="Other">+ Add new category</option>
      </Select>

      {form.category === 'Other' && (
        <Input
          label="New category name"
          value={form.customCategory}
          onChange={(e) => set('customCategory', e.target.value)}
          error={errors.customCategory}
          placeholder="e.g. Marketing, Internet"
          hint="Saved for future use"
        />
      )}

      <div>
        <label className="form-label">Notes (optional)</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          className="pretty-input resize-none"
          placeholder="Anything to remember about this expense"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">{expense ? 'Update' : 'Add expense'}</Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
