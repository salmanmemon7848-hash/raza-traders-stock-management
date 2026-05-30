import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Search, Edit, Trash2, Receipt } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Badge from '../common/Badge';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import ConfirmDialog from '../common/ConfirmDialog';
import { Card, CardBody } from '../common/Card';
import { formatINR } from '../../utils/calculations';
import { formatDate } from '../../utils/dates';

const ExpenseList = ({ onEdit }) => {
  const { expenses, dispatch, success } = useAppContext();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [deleting, setDeleting] = useState(null);

  const categories = useMemo(
    () => Array.from(new Set(expenses.map(e => e.category))),
    [expenses]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses
      .filter(e => {
        const matchSearch =
          !q ||
          e.title.toLowerCase().includes(q) ||
          (e.notes || '').toLowerCase().includes(q);
        const matchCat = !category || e.category === category;
        return matchSearch && matchCat;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, search, category]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const remove = () => {
    if (!deleting) return;
    dispatch({ type: 'DELETE_EXPENSE', payload: deleting.id });
    success('Expense removed');
    setDeleting(null);
  };

  return (
    <Card>
      <CardBody>
        <div className="toolbar mb-4">
          <div className="flex flex-1 flex-col sm:flex-row gap-2">
            <Input
              icon={<Search size={16} />}
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-xs"
            />
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="sm:max-w-[180px]"
            >
              <option value="">All categories</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </Select>
          </div>
          <div className="text-sm text-slate-500">
            {filtered.length} of {expenses.length} · <span className="font-semibold text-slate-900">{formatINR(total)}</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={expenses.length === 0 ? 'No expenses yet' : 'No matches'}
            description={expenses.length === 0 ? 'Track rent, salaries, electricity etc. so you can see real profit.' : 'Try clearing filters.'}
          />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Title</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Category</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Notes</th>
                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 text-sm text-slate-700 whitespace-nowrap">{formatDate(e.date)}</td>
                      <td className="px-3 py-3 text-sm font-medium text-slate-900">{e.title}</td>
                      <td className="px-3 py-3"><Badge variant="info">{e.category}</Badge></td>
                      <td className="px-3 py-3 text-sm text-slate-500 max-w-xs truncate">{e.notes || '—'}</td>
                      <td className="px-3 py-3 text-right text-sm font-semibold text-slate-900 num-display">{formatINR(e.amount)}</td>
                      <td className="px-3 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => onEdit(e)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-brand-700 hover:bg-brand-50"
                            aria-label="Edit"
                          ><Edit size={15} /></button>
                          <button
                            onClick={() => setDeleting(e)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-danger-600 hover:bg-danger-50"
                            aria-label="Delete"
                          ><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200">
                    <td colSpan={4} className="px-3 py-2.5 text-sm text-right text-slate-500 font-medium">Total</td>
                    <td className="px-3 py-2.5 text-right text-sm font-bold text-slate-900 num-display">{formatINR(total)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-2">
              {filtered.map(e => (
                <div key={e.id} className="border border-slate-200 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{e.title}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <Badge variant="info">{e.category}</Badge>
                        <span className="text-xs text-slate-500">{formatDate(e.date)}</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 num-display">{formatINR(e.amount)}</p>
                  </div>
                  {e.notes && <p className="text-xs text-slate-500 mt-2">{e.notes}</p>}
                  <div className="flex justify-end gap-1 mt-2 pt-2 border-t border-slate-100">
                    <Button size="xs" variant="ghost" icon={<Edit size={14} />} onClick={() => onEdit(e)}>Edit</Button>
                    <Button size="xs" variant="ghost" icon={<Trash2 size={14} />} onClick={() => setDeleting(e)} className="text-danger-600">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <ConfirmDialog
          isOpen={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={remove}
          title="Delete this expense?"
          confirmLabel="Delete"
        />
      </CardBody>
    </Card>
  );
};

export default ExpenseList;
