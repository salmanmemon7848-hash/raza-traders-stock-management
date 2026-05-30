import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const CustomerForm = ({ customer, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
  });
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: 'Required' });
      return;
    }
    onSave({ ...(customer || {}), name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Name"
        name="name"
        required
        value={form.name}
        onChange={onChange}
        error={errors.name}
        placeholder="Customer's full name"
      />
      <Input
        label="Phone (WhatsApp)"
        name="phone"
        value={form.phone}
        onChange={onChange}
        prefix="+91"
        placeholder="10-digit mobile number"
      />
      <Input
        label="Address"
        name="address"
        value={form.address}
        onChange={onChange}
        placeholder="Street, City"
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">{customer ? 'Update' : 'Add customer'}</Button>
      </div>
    </form>
  );
};

export default CustomerForm;
