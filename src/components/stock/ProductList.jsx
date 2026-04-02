import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import ProductForm from './ProductForm';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Table from '../common/Table';
import Alert from '../common/Alert';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

const ProductList = () => {
  const { products, dispatch, success, error } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleAddProduct = (productData) => {
    console.log('Adding product:', productData);
    try {
      if (!productData || !productData.name) {
        throw new Error('Invalid product data');
      }
      dispatch({ type: 'ADD_PRODUCT', payload: productData });
      success('Product added successfully!');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding product:', err);
      error(err.message || 'Failed to add product');
    }
  };

  const handleEditProduct = (productData) => {
    try {
      dispatch({ type: 'UPDATE_PRODUCT', payload: productData });
      success('Product updated successfully!');
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Error updating product:', err);
      error('Failed to update product');
    }
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        dispatch({ type: 'DELETE_PRODUCT', payload: productId });
        success('Product deleted successfully!');
      } catch (err) {
        error('Failed to delete product');
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.modelNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const columns = [
    { header: 'Product Name', accessor: 'name' },
    { 
      header: 'Category', 
      accessor: 'category',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          row.category === 'Furniture' 
            ? 'bg-blue-100 text-blue-700' 
            : row.category === 'Electronics'
            ? 'bg-purple-100 text-purple-700'
            : row.category === 'Home Appliances'
            ? 'bg-green-100 text-green-700'
            : row.category === 'Office Supplies'
            ? 'bg-yellow-100 text-yellow-700'
            : row.category === 'Lighting'
            ? 'bg-pink-100 text-pink-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {row.category}
        </span>
      )
    },
    { 
      header: 'Purchase Price', 
      render: (row) => `Rs. ${row.purchasePrice?.toLocaleString()}` 
    },
    { 
      header: 'Selling Price', 
      render: (row) => <span className="font-bold text-green-600">Rs. ${row.sellingPrice?.toLocaleString()}</span>
    },
    { 
      header: 'Quantity', 
      render: (row) => (
        <span className={row.quantity <= 5 ? 'text-red-600 font-bold' : ''}>
          {row.quantity}
        </span>
      )
    },
    { header: 'Model No.', accessor: 'modelNumber' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openEditModal(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDeleteProduct(row.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus size={20} className="mr-2" />
          Add Product
        </Button>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            <option value="Furniture">Furniture</option>
            <option value="Electronics">Electronics</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <Table columns={columns} data={filteredProducts} />

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="md"
      >
        <ProductForm
          product={editingProduct}
          onSave={editingProduct ? handleEditProduct : handleAddProduct}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default ProductList;
