import React from 'react';
import ProductList from './ProductList';

const StockManagement = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Management</h1>
        <p className="text-gray-600">Manage your products inventory, prices and stock levels</p>
      </div>
      <ProductList />
    </div>
  );
};

export default StockManagement;
