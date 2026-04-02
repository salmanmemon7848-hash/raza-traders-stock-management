import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { getTopSellingProducts } from '../../utils/calculations';

const TopProducts = () => {
  const { products, invoices } = useAppContext();
  const topProducts = getTopSellingProducts(products, invoices, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h3>
      
      {topProducts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No sales data available</p>
      ) : (
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-700">{index + 1}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">Sold: {product.quantitySold} units</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">Rs. {product.revenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopProducts;
