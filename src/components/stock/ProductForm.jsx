import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const CATEGORIES = [
  'Furniture',
  'Electronics',
  'Home Appliances',
  'Office Supplies',
  'Lighting',
  'Decor',
  'Other',
];

const ProductForm = ({ product, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'Furniture',
    purchasePrice: product?.purchasePrice?.toString() || '',
    sellingPrice: product?.sellingPrice?.toString() || '',
    quantity: product?.quantity?.toString() || '',
    modelNumber: product?.modelNumber || '',
  });
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.sellingPrice || parseFloat(form.sellingPrice) <= 0) errs.sellingPrice = 'Must be > 0';
    if (form.quantity === '' || parseInt(form.quantity, 10) < 0) errs.quantity = '0 or more';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onSave({
      ...(product || {}),
      name: form.name.trim(),
      category: form.category,
      purchasePrice: parseFloat(form.purchasePrice) || 0,
      sellingPrice: parseFloat(form.sellingPrice),
      quantity: parseInt(form.quantity, 10),
      modelNumber: form.modelNumber.trim(),
    });
  };

  const margin = (() => {
    const sp = parseFloat(form.sellingPrice);
    const pp = parseFloat(form.purchasePrice);
    if (!sp || !pp) return null;
    return ((sp - pp) / sp) * 100;
  })();

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Product name"
        name="name"
        required
        value={form.name}
        onChange={onChange}
        error={errors.name}
        placeholder="e.g. Sofa Set 3+2"
      />

      <div className="grid grid-cols-2 gap-3">
        <Select label="Category" name="category" value={form.category} onChange={onChange}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </Select>
        <Input
          label="Model / SKU"
          name="modelNumber"
          value={form.modelNumber}
          onChange={onChange}
          placeholder="Optional"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Purchase price (optional)"
          name="purchasePrice"
          type="number"
          value={form.purchasePrice}
          onChange={onChange}
          prefix="₹"
          placeholder="Leave blank to fill later"
          hint="Your buying cost — you can add this later"
        />
        <Input
          label="Selling price"
          name="sellingPrice"
          type="number"
          required
          value={form.sellingPrice}
          onChange={onChange}
          error={errors.sellingPrice}
          prefix="₹"
          placeholder="0"
        />
      </div>

      <Input
        label="Stock quantity"
        name="quantity"
        type="number"
        required
        value={form.quantity}
        onChange={onChange}
        error={errors.quantity}
        placeholder="0"
        hint={margin !== null ? `Margin: ${margin.toFixed(1)}%` : 'Quantity in stock right now'}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">{product ? 'Update' : 'Add product'}</Button>
      </div>
    </form>
  );
};

export default ProductForm;
