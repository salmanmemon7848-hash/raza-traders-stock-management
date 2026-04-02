import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { AlertTriangle } from 'lucide-react';

const LowStockAlert = () => {
  const { products, settings } = useAppContext();
  const threshold = settings.lowStockThreshold || 5;
  
  const lowStockProducts = products.filter(product => product.quantity <= threshold);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <AlertTriangle size={20} className="mr-2 text-red-500" />
          Low Stock Alerts
        </h3>
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
          {lowStockProducts.length} Items
        </span>
      </div>
      
      {lowStockProducts.length === 0 ? (
        <p className="text-green-600 text-center py-4">All products are well stocked!</p>
      ) : (
        <div className="space-y-3">
          {lowStockProducts.map((product) => (
            <div 
              key={product.id}
              className={`p-3 rounded-lg border-l-4 ${
                product.quantity === 0 
                  ? 'bg-red-50 border-red-500' 
                  : 'bg-yellow-50 border-yellow-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">Category: {product.category}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    product.quantity === 0 
                      ? 'text-red-600' 
                      : 'text-yellow-600'
                  }`}>
                    {product.quantity} left
                  </p>
                  {product.quantity === 0 && (
                    <p className="text-xs text-red-600 font-semibold">Out of Stock</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowStockAlert;
