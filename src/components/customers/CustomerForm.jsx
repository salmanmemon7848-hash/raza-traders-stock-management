import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Table from '../common/Table';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { validateCustomer } from '../../utils/calculations';

const CustomerForm = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    address: customer?.address || ''
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateCustomer(formData);
    if (!validation.isValid) {
      setErrors(validation.errors.reduce((acc, error) => ({ ...acc, [error.split(' ')[0]]: error }), {}));
      return;
    }

    onSave({
      ...customer,
      ...formData
    });
  };

  const handleClear = () => {
    setFormData({ name: '', phone: '', address: '' });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Customer Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        placeholder="Enter customer name"
      />

      <Input
        label="Phone Number"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Enter phone number"
      />

      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Enter address"
      />

      <div className="flex space-x-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          {customer ? 'Update Customer' : 'Add Customer'}
        </Button>
        <Button type="button" variant="secondary" onClick={handleClear}>
          Clear
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
