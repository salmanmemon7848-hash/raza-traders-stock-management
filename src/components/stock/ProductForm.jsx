import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Table from '../common/Table';
import Alert from '../common/Alert';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || '',
    purchasePrice: product?.purchasePrice?.toString() || '',
    sellingPrice: product?.sellingPrice?.toString() || '',
    quantity: product?.quantity?.toString() || '',
    modelNumber: product?.modelNumber || ''
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = [];
    if (!formData.name || formData.name.trim() === '') {
      errors.push('Product name is required');
    }
    if (!formData.category) {
      errors.push('Category is required');
    }
    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
      errors.push('Purchase Price must be greater than 0');
    }
    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      errors.push('Selling Price must be greater than 0');
    }
    if (formData.quantity === undefined || parseInt(formData.quantity) < 0) {
      errors.push('Quantity must be 0 or greater');
    }

    if (errors.length > 0) {
      setErrors({ general: errors.join(', ') });
      return;
    }

    try {
      onSave({
        ...product,
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        quantity: parseInt(formData.quantity)
      });
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ general: 'Failed to save product. Please try again.' });
    }
  };

  const handleClear = () => {
    setFormData({
      name: '',
      category: '',
      purchasePrice: '',
      sellingPrice: '',
      quantity: '',
      modelNumber: ''
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Product Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        placeholder="Enter product name"
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        >
          <option value="">Select Category</option>
          <option value="Furniture">Furniture</option>
          <option value="Electronics">Electronics</option>
          <option value="Home Appliances">Home Appliances</option>
          <option value="Office Supplies">Office Supplies</option>
          <option value="Lighting">Lighting</option>
          <option value="Decor">Decor</option>
          <option value="Other">Other</option>
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Purchase Price (Rs.)"
          name="purchasePrice"
          type="number"
          value={formData.purchasePrice}
          onChange={handleChange}
          error={errors.purchasePrice}
          required
          placeholder="0.00"
          min="0"
          step="0.01"
        />

        <Input
          label="Selling Price (Rs.)"
          name="sellingPrice"
          type="number"
          value={formData.sellingPrice}
          onChange={handleChange}
          error={errors.sellingPrice}
          required
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          error={errors.quantity}
          required
          placeholder="0"
          min="0"
        />

        <Input
          label="Model Number (Optional)"
          name="modelNumber"
          value={formData.modelNumber}
          onChange={handleChange}
          placeholder="Enter model number"
        />
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {errors.general}
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          {product ? 'Update Product' : 'Add Product'}
        </Button>
        <Button type="button" variant="secondary" onClick={handleClear}>
          <X size={18} />
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
