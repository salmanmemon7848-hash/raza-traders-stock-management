import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Plus, Search, Edit, Trash2, History, MessageCircle, Phone } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import ConfirmDialog from '../common/ConfirmDialog';
import { Card, CardBody, CardHeader } from '../common/Card';
import CustomerForm from './CustomerForm';
import CustomerHistory from './CustomerHistory';
import { formatINR, getInvoiceOutstanding } from '../../utils/calculations';
import { openWhatsApp } from '../../utils/whatsapp';

const CustomerList = () => {
  const { customers, invoices, dispatch, success } = useAppContext();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [historyFor, setHistoryFor] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Customer outstanding map
  const outstandingMap = useMemo(() => {
    const m = new Map();
    invoices.forEach(inv => {
      const o = getInvoiceOutstanding(inv);
      if (o > 0 && inv.customer?.id) {
        m.set(inv.customer.id, (m.get(inv.customer.id) || 0) + o);
      }
    });
    return m;
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = customers.map(c => ({ ...c, outstanding: outstandingMap.get(c.id) || 0 }));
    if (!q) return list;
    return list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.address || '').toLowerCase().includes(q)
    );
  }, [customers, search, outstandingMap]);

  const save = (data) => {
    if (editing) {
      dispatch({ type: 'UPDATE_CUSTOMER', payload: data });
      success('Customer updated');
    } else {
      dispatch({ type: 'ADD_CUSTOMER', payload: data });
      success('Customer added');
    }
    setModalOpen(false);
    setEditing(null);
  };

  const remove = () => {
    if (!deleting) return;
    dispatch({ type: 'DELETE_CUSTOMER', payload: deleting.id });
    success(`${deleting.name} removed`);
    setDeleting(null);
  };

  return (
    <Card>
      <CardHeader
        title="Customers"
        subtitle={`${customers.length} ${customers.length === 1 ? 'customer' : 'customers'}`}
        actions={
          <div className="flex items-center gap-2">
            <Input
              icon={<Search size={16} />}
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 sm:w-56"
            />
            <Button icon={<Plus size={16} />} onClick={() => { setEditing(null); setModalOpen(true); }}>
              Add
            </Button>
          </div>
        }
      />
      <CardBody>
        {filtered.length === 0 ? (
          <EmptyState
            title={customers.length === 0 ? 'No customers yet' : 'No customers match your search'}
            description={customers.length === 0 ? 'Add your first customer to start tracking purchases and dues.' : ''}
            action={customers.length === 0 && (
              <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Add customer</Button>
            )}
          />
        ) : (
          <ul className="space-y-2">
            {filtered.map(c => (
              <li key={c.id} className="border border-slate-200 rounded-xl p-3 sm:p-4 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        {c.phone && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Phone size={11} />
                            {c.phone}
                          </span>
                        )}
                        {c.address && <span className="text-xs text-slate-500 truncate">{c.address}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900 num-display">{formatINR(c.totalSpent || 0)}</p>
                    {c.outstanding > 0 ? (
                      <Badge variant="danger">{formatINR(c.outstanding)} due</Badge>
                    ) : (
                      <span className="text-xs text-slate-400">No dues</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-100">
                  <Button size="xs" variant="ghost" icon={<History size={14} />} onClick={() => setHistoryFor(c)}>
                    History
                  </Button>
                  <Button size="xs" variant="ghost" icon={<Edit size={14} />} onClick={() => { setEditing(c); setModalOpen(true); }}>
                    Edit
                  </Button>
                  {c.phone && (
                    <Button
                      size="xs"
                      variant="ghost"
                      icon={<MessageCircle size={14} />}
                      onClick={() => openWhatsApp({ phone: c.phone, message: `Hello ${c.name},` })}
                    >
                      WhatsApp
                    </Button>
                  )}
                  <Button size="xs" variant="ghost" icon={<Trash2 size={14} />} onClick={() => setDeleting(c)} className="ml-auto text-danger-600">
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Modal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          title={editing ? 'Edit customer' : 'Add customer'}
          size="md"
        >
          <CustomerForm
            customer={editing}
            onSave={save}
            onCancel={() => { setModalOpen(false); setEditing(null); }}
          />
        </Modal>

        {historyFor && (
          <CustomerHistory customer={historyFor} onClose={() => setHistoryFor(null)} />
        )}

        <ConfirmDialog
          isOpen={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={remove}
          title={`Delete "${deleting?.name}"?`}
          message="This removes the customer record. Past invoices keep their snapshot of customer info."
          confirmLabel="Delete"
        />
      </CardBody>
    </Card>
  );
};

export default CustomerList;
