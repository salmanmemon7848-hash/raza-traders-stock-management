import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Plus, Edit, Trash2, Search, Package, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import ConfirmDialog from '../common/ConfirmDialog';
import { Card, CardBody } from '../common/Card';
import { formatINR } from '../../utils/calculations';
import ProductForm from './ProductForm';

const CATEGORY_TONES = {
  Furniture: 'info',
  Electronics: 'brand',
  'Home Appliances': 'success',
  'Office Supplies': 'warning',
  Lighting: 'warning',
  Decor: 'neutral',
  Other: 'neutral',
};

const ProductList = () => {
  const { products, dispatch, settings, success, error } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return products.filter(p => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.modelNumber || '').toLowerCase().includes(q);
      const matchCategory = !category || p.category === category;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, category]);

  const totalValue = useMemo(
    () => products.reduce((sum, p) => sum + (p.sellingPrice || 0) * (p.quantity || 0), 0),
    [products]
  );
  const lowStockCount = products.filter(p => (p.quantity || 0) <= (settings.lowStockThreshold || 5)).length;

  const save = (data) => {
    if (editing) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: data });
      success('Product updated');
    } else {
      dispatch({ type: 'ADD_PRODUCT', payload: data });
      success('Product added');
    }
    setIsModalOpen(false);
    setEditing(null);
  };

  const remove = () => {
    if (!deleting) return;
    dispatch({ type: 'DELETE_PRODUCT', payload: deleting.id });
    success(`${deleting.name} removed`);
    setDeleting(null);
  };

  const lowThreshold = settings.lowStockThreshold || 5;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Total Products</p>
            <p className="text-2xl font-bold text-slate-900 num-display">{products.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Inventory Value</p>
            <p className="text-2xl font-bold text-brand-700 num-display">{formatINR(totalValue)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Low Stock</p>
            <p className="text-2xl font-bold text-warning-700 num-display">{lowStockCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Categories</p>
            <p className="text-2xl font-bold text-slate-900 num-display">
              {new Set(products.map(p => p.category)).size}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Toolbar */}
      <Card>
        <CardBody>
          <div className="toolbar">
            <div className="flex flex-1 flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
              <Input
                icon={<Search size={16} />}
                placeholder="Search by name or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sm:max-w-xs"
              />
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="sm:max-w-[180px]"
              >
                <option value="">All categories</option>
                {Object.keys(CATEGORY_TONES).map(c => <option key={c}>{c}</option>)}
              </Select>
            </div>
            <Button icon={<Plus size={16} />} onClick={() => { setEditing(null); setIsModalOpen(true); }}>
              Add product
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* List */}
      <Card>
        <CardBody>
          {filtered.length === 0 ? (
            <EmptyState
              icon={Package}
              title={products.length === 0 ? 'No products yet' : 'No matching products'}
              description={products.length === 0 ? 'Add your first product to start tracking stock.' : 'Try a different search or category.'}
              action={products.length === 0 && (
                <Button icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>Add product</Button>
              )}
            />
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Product</th>
                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Category</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Purchase</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Selling</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Margin</th>
                        <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map(p => {
                        const margin = p.purchasePrice ? ((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100 : null;
                        const lowStock = (p.quantity || 0) <= lowThreshold;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="px-3 py-3">
                              <p className="text-sm font-medium text-slate-900">{p.name}</p>
                              {p.modelNumber && <p className="text-xs text-slate-500">{p.modelNumber}</p>}
                            </td>
                            <td className="px-3 py-3">
                              <Badge variant={CATEGORY_TONES[p.category] || 'neutral'}>{p.category}</Badge>
                            </td>
                            <td className="px-3 py-3 text-right text-sm text-slate-700 num-display">{formatINR(p.purchasePrice)}</td>
                            <td className="px-3 py-3 text-right text-sm font-semibold text-slate-900 num-display">{formatINR(p.sellingPrice)}</td>
                            <td className="px-3 py-3 text-right text-sm text-success-700">{margin !== null ? `${margin.toFixed(0)}%` : '—'}</td>
                            <td className="px-3 py-3 text-center">
                              {lowStock ? (
                                <Badge variant={p.quantity === 0 ? 'danger' : 'warning'}>
                                  {p.quantity === 0 ? 'Out' : `${p.quantity} left`}
                                </Badge>
                              ) : (
                                <span className="text-sm text-slate-700">{p.quantity}</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="inline-flex gap-1">
                                <button
                                  onClick={() => { setEditing(p); setIsModalOpen(true); }}
                                  className="p-1.5 rounded-md text-slate-500 hover:text-brand-700 hover:bg-brand-50"
                                  aria-label="Edit"
                                ><Edit size={15} /></button>
                                <button
                                  onClick={() => setDeleting(p)}
                                  className="p-1.5 rounded-md text-slate-500 hover:text-danger-600 hover:bg-danger-50"
                                  aria-label="Delete"
                                ><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile */}
              <div className="md:hidden space-y-2.5">
                {filtered.map(p => {
                  const lowStock = (p.quantity || 0) <= lowThreshold;
                  return (
                    <div key={p.id} className="border border-slate-200 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <Badge variant={CATEGORY_TONES[p.category] || 'neutral'}>{p.category}</Badge>
                            {lowStock && (
                              <Badge variant={p.quantity === 0 ? 'danger' : 'warning'} icon={<AlertTriangle size={10} />}>
                                {p.quantity === 0 ? 'Out' : `${p.quantity} left`}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900 num-display">{formatINR(p.sellingPrice)}</p>
                          <p className="text-xs text-slate-500">Stock: {p.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500">Cost: {formatINR(p.purchasePrice)}</p>
                        <div className="inline-flex gap-1">
                          <Button size="xs" variant="ghost" icon={<Edit size={14} />} onClick={() => { setEditing(p); setIsModalOpen(true); }}>Edit</Button>
                          <Button size="xs" variant="ghost" icon={<Trash2 size={14} />} onClick={() => setDeleting(p)}>Delete</Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditing(null); }}
        title={editing ? 'Edit product' : 'Add product'}
        size="md"
      >
        <ProductForm
          product={editing}
          onSave={save}
          onCancel={() => { setIsModalOpen(false); setEditing(null); }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title={`Delete "${deleting?.name}"?`}
        message="This will permanently remove the product from your stock. Existing invoices will keep their record."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ProductList;
