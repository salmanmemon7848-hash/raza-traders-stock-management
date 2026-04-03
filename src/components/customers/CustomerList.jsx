import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import CustomerForm from './CustomerForm';
import CustomerHistory from './CustomerHistory';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Table from '../common/Table';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';

const CustomerList = () => {
  const { customers, dispatch, success, error } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewHistoryCustomer, setViewHistoryCustomer] = useState(null);

  const handleAddCustomer = (customerData) => {
    console.log('Adding customer:', customerData);
    try {
      if (!customerData || !customerData.name) {
        throw new Error('Invalid customer data');
      }
      dispatch({ type: 'ADD_CUSTOMER', payload: customerData });
      success('Customer added successfully!');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding customer:', err);
      error(err.message || 'Failed to add customer');
    }
  };

  const handleEditCustomer = (customerData) => {
    try {
      dispatch({ type: 'UPDATE_CUSTOMER', payload: customerData });
      success('Customer updated successfully!');
      setIsModalOpen(false);
      setEditingCustomer(null);
    } catch (err) {
      console.error('Error updating customer:', err);
      error('Failed to update customer');
    }
  };

  const handleDeleteCustomer = (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        dispatch({ type: 'DELETE_CUSTOMER', payload: customerId });
        success('Customer deleted successfully!');
      } catch (err) {
        error('Failed to delete customer');
      }
    }
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const columns = [
    { 
      header: 'Name', 
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold">{row.name}</span>
        </div>
      )
    },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Address', accessor: 'address' },
    { 
      header: 'Total Spent', 
      render: (row) => (
        <span className="font-bold text-green-600">
          Rs. {row.totalSpent.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => setViewHistoryCustomer(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="View History"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDeleteCustomer(row.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6">
      {/* Header Actions - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <Button onClick={() => setIsModalOpen(true)} variant="primary" className="w-full sm:w-auto">
          <Plus size={20} className="mr-2" />
          Add Customer
        </Button>

        <div className="relative w-full sm:w-64">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
          />
        </div>
      </div>

      {/* Customers Table with Card View */}
      <Table columns={columns} data={filteredCustomers} enableCardView={true} />

      {/* Add/Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="md"
      >
        <CustomerForm
          customer={editingCustomer}
          onSave={editingCustomer ? handleEditCustomer : handleAddCustomer}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingCustomer(null);
          }}
        />
      </Modal>

      {/* View History Modal */}
      {viewHistoryCustomer && (
        <CustomerHistory
          customer={viewHistoryCustomer}
          onClose={() => setViewHistoryCustomer(null)}
        />
      )}
    </div>
  );
};

export default CustomerList;
