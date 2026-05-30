import React from 'react';
import ProductList from './ProductList';
import PageHeader from '../common/PageHeader';

const StockManagement = () => (
  <div className="page-shell">
    <PageHeader
      title="Stock"
      subtitle="Manage products, prices, and quantities."
    />
    <ProductList />
  </div>
);

export default StockManagement;
