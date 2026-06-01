import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import {
  Search, Plus, Minus, Trash2, X, Receipt, Printer, MessageCircle,
  IndianRupee, User, ChevronDown, Package, Save, FileText,
} from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import PageHeader from '../common/PageHeader';
import EmptyState from '../common/EmptyState';
import { Card, CardHeader, CardBody, CardFooter } from '../common/Card';
import { generateInvoiceNumber, formatINR } from '../../utils/calculations';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { openWhatsApp, buildInvoiceWhatsAppMessage } from '../../utils/whatsapp';

// ---------- Quick add product modal ----------
const QuickAddProductModal = ({ isOpen, onClose, onAdded }) => {
  const { dispatch, success, error } = useAppContext();
  const [form, setForm] = useState({
    name: '',
    category: 'Furniture',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
    modelNumber: '',
  });

  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', category: 'Furniture', purchasePrice: '', sellingPrice: '', quantity: '', modelNumber: '' });
    }
  }, [isOpen]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.name || !form.sellingPrice || !form.quantity) {
      error('Please fill product name, selling price and quantity');
      return;
    }
    const payload = {
      name: form.name.trim(),
      category: form.category,
      purchasePrice: parseFloat(form.purchasePrice) || 0,
      sellingPrice: parseFloat(form.sellingPrice),
      quantity: parseInt(form.quantity, 10),
      modelNumber: form.modelNumber.trim(),
    };
    dispatch({ type: 'ADD_PRODUCT', payload });
    success('Product added');
    onAdded?.(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick add product"
      subtitle="Add a product to your inventory and bill it right away"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} icon={<Plus size={16} />}>Add product</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input label="Product name" name="name" required value={form.name} onChange={handleChange} placeholder="e.g. Samsung 43 inch LED TV" />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Category" name="category" value={form.category} onChange={handleChange}>
            <option>Furniture</option>
            <option>Electronics</option>
            <option>Home Appliances</option>
            <option>Lighting</option>
            <option>Decor</option>
            <option>Office Supplies</option>
            <option>Other</option>
          </Select>
          <Input label="Model / SKU" name="modelNumber" value={form.modelNumber} onChange={handleChange} placeholder="Optional" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Purchase ₹"
            name="purchasePrice"
            type="number"
            value={form.purchasePrice}
            onChange={handleChange}
            prefix="₹"
            placeholder="Optional"
            hint="Fill later"
          />
          <Input label="Selling ₹" name="sellingPrice" type="number" required value={form.sellingPrice} onChange={handleChange} prefix="₹" />
          <Input label="Quantity" name="quantity" type="number" required value={form.quantity} onChange={handleChange} />
        </div>
      </div>
    </Modal>
  );
};

// ---------- Main billing component ----------
const BillingSystem = () => {
  const { products, customers, invoices, settings, dispatch, success, error } = useAppContext();

  // Cart
  const [cart, setCart] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Customer
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [linkedCustomerId, setLinkedCustomerId] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);

  // Discount / Tax
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('fixed');
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstRate, setGstRate] = useState(settings.defaultGstRate || 18);

  // Payment
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [creditAmount, setCreditAmount] = useState('');

  // Success modal (after save)
  const [savedInvoice, setSavedInvoice] = useState(null);

  // Filtered products for search
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    const base = products.filter(p => (p.quantity || 0) > 0);
    if (!q) return base.slice(0, 8);
    return base
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.modelNumber || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [products, productSearch]);

  // Add product to cart
  const addToCart = (product) => {
    const existing = cart.find(it => it.productId === product.id);
    if (existing) {
      if (existing.quantity + 1 > product.quantity) {
        error(`Only ${product.quantity} in stock`);
        return;
      }
      setCart(cart.map(it =>
        it.productId === product.id
          ? { ...it, quantity: it.quantity + 1, total: (it.quantity + 1) * it.price }
          : it
      ));
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.sellingPrice,
          quantity: 1,
          total: product.sellingPrice,
          stockLeft: product.quantity,
        },
      ]);
    }
    setProductSearch('');
  };

  const updateQty = (productId, qty) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const q = Math.max(1, parseInt(qty, 10) || 1);
    if (q > product.quantity) {
      error(`Only ${product.quantity} in stock`);
      return;
    }
    setCart(cart.map(it =>
      it.productId === productId ? { ...it, quantity: q, total: q * it.price } : it
    ));
  };

  const updatePrice = (productId, price) => {
    const p = Math.max(0, parseFloat(price) || 0);
    setCart(cart.map(it =>
      it.productId === productId ? { ...it, price: p, total: it.quantity * p } : it
    ));
  };

  const removeItem = (productId) => {
    setCart(cart.filter(it => it.productId !== productId));
  };

  // Calculations
  const subtotal = cart.reduce((s, it) => s + it.total, 0);
  const discountAmount = discountType === 'percentage' ? (subtotal * (parseFloat(discount) || 0)) / 100 : (parseFloat(discount) || 0);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const gstAmount = gstEnabled ? (afterDiscount * (parseFloat(gstRate) || 0)) / 100 : 0;
  const grandTotal = afterDiscount + gstAmount;

  // Filter customers for picker
  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.phone || '').includes(q)
    ).slice(0, 10);
  }, [customers, customerSearch]);

  const pickCustomer = (c) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone || '');
    setCustomerAddress(c.address || '');
    setLinkedCustomerId(c.id);
    setShowCustomerPicker(false);
    setCustomerSearch('');
  };

  const clearCustomer = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setLinkedCustomerId(null);
  };

  const resetBill = () => {
    setCart([]);
    setProductSearch('');
    clearCustomer();
    setDiscount(0);
    setDiscountType('fixed');
    setGstEnabled(false);
    setPaymentStatus('paid');
    setCreditAmount('');
  };

  // Generate invoice
  const generate = () => {
    if (cart.length === 0) {
      error('Add at least one product to the bill');
      return;
    }
    if (paymentStatus === 'partial_credit') {
      const c = parseFloat(creditAmount);
      if (!c || c <= 0) { error('Enter a valid credit amount'); return; }
      if (c > grandTotal) { error('Credit cannot exceed bill total'); return; }
    }

    const creditAmt =
      paymentStatus === 'paid' ? 0 :
      paymentStatus === 'full_credit' ? grandTotal :
      parseFloat(creditAmount);

    const invoiceData = {
      invoiceNumber: generateInvoiceNumber(invoices),
      customer: {
        id: linkedCustomerId || undefined,
        name: customerName || 'Walk-in Customer',
        phone: customerPhone || '',
        address: customerAddress || '',
      },
      items: cart.map(({ stockLeft, ...rest }) => rest),
      subtotal,
      discount: discountAmount,
      taxRate: gstEnabled ? parseFloat(gstRate) : 0,
      taxAmount: gstAmount,
      grandTotal,
      paymentStatus,
      isCredit: paymentStatus !== 'paid',
      creditAmount: creditAmt,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_INVOICE', payload: { invoiceData, updateCustomer: !!linkedCustomerId } });
    setSavedInvoice(invoiceData);
    success(`Invoice ${invoiceData.invoiceNumber} created`);
  };

  const handlePrintPreview = () => {
    if (cart.length === 0) { error('Nothing to print'); return; }
    const previewData = {
      invoiceNumber: 'DRAFT',
      customer: { name: customerName || 'Walk-in Customer', phone: customerPhone, address: customerAddress },
      items: cart,
      subtotal,
      discount: discountAmount,
      taxRate: gstEnabled ? parseFloat(gstRate) : 0,
      taxAmount: gstAmount,
      grandTotal,
      createdAt: new Date().toISOString(),
    };
    generateInvoicePDF(previewData, settings);
  };

  const handleAfterSaveShare = () => {
    if (!savedInvoice) return;
    openWhatsApp({
      phone: savedInvoice.customer.phone,
      message: buildInvoiceWhatsAppMessage({ invoice: savedInvoice, settings }),
    });
  };

  const handleAfterSavePDF = () => {
    if (!savedInvoice) return;
    generateInvoicePDF(savedInvoice, settings);
  };

  const handleAfterSaveClose = () => {
    setSavedInvoice(null);
    resetBill();
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Create Bill"
        subtitle="Add products, choose customer and payment, then save the invoice."
        actions={
          <Button variant="outline" icon={<Package size={16} />} onClick={() => setShowQuickAdd(true)}>
            Quick add product
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* LEFT: Product picker + cart */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Product search */}
          <Card>
            <CardBody>
              <Input
                placeholder="Search product by name, model, or category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                icon={<Search size={16} />}
              />
              {productSearch && (
                <div className="mt-2 rounded-lg border border-slate-200 max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      No matching products in stock.
                    </div>
                  ) : (
                    filteredProducts.map(p => (
                      <button
                        key={p.id}
                        onClick={() => addToCart(p)}
                        className="w-full px-3 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 text-left"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {p.category} {p.modelNumber ? `· ${p.modelNumber}` : ''} · Stock {p.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 num-display">{formatINR(p.sellingPrice)}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Cart */}
          <Card>
            <CardHeader
              title={`Cart (${cart.length})`}
              subtitle={cart.length === 0 ? 'No items yet — search above to add' : undefined}
              icon={<Receipt size={18} />}
              actions={cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={resetBill} icon={<X size={14} />}>Clear</Button>
              )}
            />
            <CardBody>
              {cart.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="Cart is empty"
                  description="Find products using the search box above, then they'll show here."
                />
              ) : (
                <ul className="space-y-2">
                  {cart.map(it => (
                    <li key={it.productId} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">{it.name}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {/* Qty stepper */}
                            <div className="inline-flex items-center bg-white border border-slate-300 rounded-md">
                              <button
                                onClick={() => updateQty(it.productId, it.quantity - 1)}
                                disabled={it.quantity <= 1}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                                aria-label="Decrease"
                              >
                                <Minus size={14} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={it.quantity}
                                onChange={(e) => updateQty(it.productId, e.target.value)}
                                className="w-12 text-center text-sm py-1 bg-transparent focus:outline-none"
                              />
                              <button
                                onClick={() => updateQty(it.productId, it.quantity + 1)}
                                className="p-1.5 text-slate-600 hover:bg-slate-100"
                                aria-label="Increase"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            {/* Price */}
                            <div className="inline-flex items-center bg-white border border-slate-300 rounded-md px-2">
                              <span className="text-xs text-slate-500">₹</span>
                              <input
                                type="number"
                                min="0"
                                value={it.price}
                                onChange={(e) => updatePrice(it.productId, e.target.value)}
                                className="w-20 text-sm py-1 px-1 bg-transparent focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900 num-display">{formatINR(it.total)}</p>
                          <button
                            onClick={() => removeItem(it.productId)}
                            className="mt-1 p-1 text-danger-500 hover:bg-danger-50 rounded"
                            aria-label="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader title="Customer" subtitle="Optional — link this bill to an existing or new customer" icon={<User size={18} />} />
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Input
                    label="Name"
                    value={customerName}
                    onChange={(e) => { setCustomerName(e.target.value); setLinkedCustomerId(null); }}
                    placeholder="Walk-in Customer"
                    rightAddon={
                      <button
                        type="button"
                        onClick={() => setShowCustomerPicker(true)}
                        className="text-brand-600 hover:text-brand-700"
                        aria-label="Pick existing customer"
                      >
                        <Search size={14} />
                      </button>
                    }
                  />
                </div>
                <Input
                  label="Phone (WhatsApp)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  prefix="+91"
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Street, City"
                  />
                </div>
              </div>
              {linkedCustomerId && (
                <div className="mt-3 flex items-center justify-between bg-brand-50 border border-brand-100 px-3 py-2 rounded-lg">
                  <p className="text-xs text-brand-700">
                    Linked to existing customer profile · this sale will appear in their history
                  </p>
                  <button onClick={clearCustomer} className="text-brand-700 hover:text-brand-900">
                    <X size={14} />
                  </button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* RIGHT: Summary + payment */}
        <div className="space-y-4 sm:space-y-5 lg:sticky lg:top-20 self-start">
          <Card>
            <CardHeader title="Bill Summary" />
            <CardBody>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span className="num-display">{formatINR(subtotal)}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 items-end pt-1">
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 font-medium">Discount</label>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="pretty-input mt-1"
                    />
                  </div>
                  <Select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="mt-1"
                  >
                    <option value="fixed">₹</option>
                    <option value="percentage">%</option>
                  </Select>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-danger-600">
                    <span>Discount</span>
                    <span className="num-display">− {formatINR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <label className="text-xs text-slate-500 font-medium">Apply GST</label>
                  <button
                    onClick={() => setGstEnabled(!gstEnabled)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${gstEnabled ? 'bg-brand-600' : 'bg-slate-300'}`}
                    aria-label="Toggle GST"
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${gstEnabled ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                {gstEnabled && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={gstRate}
                      onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                      className="pretty-input flex-1"
                    />
                    <span className="text-sm text-slate-500">% GST</span>
                  </div>
                )}

                {gstEnabled && gstAmount > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>GST ({gstRate}%)</span>
                    <span className="num-display">+ {formatINR(gstAmount)}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 my-2" />
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-slate-900 num-display">{formatINR(grandTotal)}</span>
                </div>
              </div>
            </CardBody>
            <CardFooter>
              {/* Payment status */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Payment</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'paid', label: 'Paid', tone: 'success' },
                    { id: 'partial_credit', label: 'Partial', tone: 'warning' },
                    { id: 'full_credit', label: 'Credit', tone: 'danger' },
                  ].map(opt => {
                    const active = paymentStatus === opt.id;
                    const colorMap = {
                      success: active ? 'bg-success-50 border-success-500 text-success-700' : '',
                      warning: active ? 'bg-warning-50 border-warning-500 text-warning-700' : '',
                      danger:  active ? 'bg-danger-50 border-danger-500 text-danger-700' : '',
                    };
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setPaymentStatus(opt.id)}
                        className={`py-2 px-2 rounded-lg text-xs font-semibold border-2 transition-colors
                          ${colorMap[opt.tone] || ''}
                          ${!active ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300' : ''}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {paymentStatus === 'partial_credit' && (
                  <div className="mt-3">
                    <Input
                      label="Credit (Udhaar) amount"
                      type="number"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      prefix="₹"
                      hint={creditAmount ? `Customer paid: ${formatINR(Math.max(0, grandTotal - (parseFloat(creditAmount) || 0)))}` : ''}
                    />
                  </div>
                )}

                <div className="mt-3 flex flex-col gap-2">
                  <Button onClick={generate} variant="primary" icon={<Save size={16} />} fullWidth>
                    Save Invoice
                  </Button>
                  <Button onClick={handlePrintPreview} variant="outline" icon={<FileText size={16} />} fullWidth>
                    Preview PDF
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <QuickAddProductModal isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />

      {/* Customer picker modal */}
      <Modal
        isOpen={showCustomerPicker}
        onClose={() => setShowCustomerPicker(false)}
        title="Pick a customer"
        size="md"
      >
        <Input
          icon={<Search size={16} />}
          placeholder="Search by name or phone..."
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          autoFocus
        />
        <div className="mt-3 max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
          {filteredCustomers.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No customers found.</div>
          ) : (
            filteredCustomers.map(c => (
              <button
                key={c.id}
                onClick={() => pickCustomer(c)}
                className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 text-left"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500 truncate">{c.phone || 'No phone'}</p>
                </div>
                <Badge variant="neutral">{formatINR(c.totalSpent || 0)} spent</Badge>
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* Saved invoice success modal */}
      <Modal
        isOpen={!!savedInvoice}
        onClose={handleAfterSaveClose}
        title="Invoice saved"
        subtitle={savedInvoice?.invoiceNumber}
        size="md"
      >
        {savedInvoice && (
          <div className="space-y-4">
            <div className="bg-success-50 border border-success-100 rounded-xl p-4">
              <p className="text-sm text-success-700">
                <strong>{savedInvoice.invoiceNumber}</strong> for {savedInvoice.customer.name}
              </p>
              <p className="text-2xl font-bold text-success-800 num-display mt-1">{formatINR(savedInvoice.grandTotal)}</p>
              {savedInvoice.creditAmount > 0 && (
                <p className="text-xs text-warning-700 mt-1">
                  Outstanding (Udhaar): {formatINR(savedInvoice.creditAmount)}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button onClick={handleAfterSavePDF} variant="outline" icon={<Printer size={16} />} fullWidth>
                PDF
              </Button>
              <Button
                onClick={handleAfterSaveShare}
                variant="success"
                icon={<MessageCircle size={16} />}
                disabled={!savedInvoice.customer.phone}
                fullWidth
              >
                WhatsApp
              </Button>
              <Button onClick={handleAfterSaveClose} variant="primary" icon={<Plus size={16} />} fullWidth>
                New bill
              </Button>
            </div>
            {!savedInvoice.customer.phone && (
              <p className="text-xs text-slate-500 text-center">
                Add a phone number to enable WhatsApp sharing.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BillingSystem;
