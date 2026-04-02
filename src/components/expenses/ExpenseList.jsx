import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';
import Input from '../common/Input';
import { Search, Filter, SortAsc, SortDesc, Edit, Trash2, FileText } from 'lucide-react';

const ExpenseList = ({ onEdit }) => {
  const { expenses, dispatch, success, error } = useAppContext();
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  // Get unique categories for filter
  const categories = [...new Set(expenses.map(e => e.category))];

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          expense.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || expense.category === filterCategory;
      const matchesDateFrom = !filterDateFrom || new Date(expense.date) >= new Date(filterDateFrom);
      const matchesDateTo = !filterDateTo || new Date(expense.date) <= new Date(filterDateTo);
      
      return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'amount') {
        return sortOrder === 'desc'
          ? b.amount - a.amount
          : a.amount - b.amount;
      }
      return 0;
    });

  const handleDelete = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      dispatch({ type: 'DELETE_EXPENSE', payload: expenseId });
      success('Expense deleted successfully');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or notes..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <Input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            placeholder="From Date"
          />

          {/* Date To */}
          <Input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            placeholder="To Date"
          />
        </div>

        {/* Sort and Clear Buttons */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
          <Button
            onClick={toggleSortOrder}
            variant="outline"
            size="sm"
            icon={sortBy === 'date' ? (sortOrder === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />) : null}
          >
            Sort by {sortBy === 'date' ? 'Date' : 'Amount'} ({sortOrder === 'desc' ? 'Newest/Highest' : 'Oldest/Lowest'})
          </Button>
          
          <Button
            onClick={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}
            variant="outline"
            size="sm"
            icon={<Filter size={16} />}
          >
            {sortBy === 'date' ? 'Sort by Amount' : 'Sort by Date'}
          </Button>

          {(searchTerm || filterCategory || filterDateFrom || filterDateTo) && (
            <Button
              onClick={clearFilters}
              variant="secondary"
              size="sm"
            >
              Clear Filters
            </Button>
          )}

          <div className="ml-auto text-sm text-gray-600 flex items-center gap-2">
            <FileText size={16} />
            Showing {filteredExpenses.length} of {expenses.length} expenses
          </div>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-lg font-medium">No expenses found</p>
            <p className="text-gray-400 text-sm mt-1">Add your first expense or adjust filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Notes</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {expense.title}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {expense.notes || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                      {formatAmount(expense.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onEdit(expense)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan="4" className="px-4 py-3 text-sm font-bold text-gray-700 text-right">
                    Total:
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                    {formatAmount(filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
