import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';
import { FileText, Package, Users, Download, AlertTriangle, TrendingUp } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const { products, customers, invoices } = useAppContext();
  
  // Calculate credit/udhaar totals
  const totalCredit = invoices
    .filter(inv => inv.isCredit || (inv.paymentStatus && inv.paymentStatus !== 'paid'))
    .reduce((sum, inv) => sum + (inv.creditAmount || inv.grandTotal), 0);
  
  const pendingCount = invoices.filter(inv => inv.isCredit || (inv.paymentStatus && inv.paymentStatus !== 'paid')).length;
  
  // Calculate customer-wise credit
  const getCustomerCredit = (customerId) => {
    return invoices
      .filter(inv => inv.customer?.id === customerId && (inv.isCredit || (inv.paymentStatus && inv.paymentStatus !== 'paid')))
      .reduce((sum, inv) => sum + (inv.creditAmount || inv.grandTotal), 0);
  };
  
  // Calculate profit metrics
  const calculateProfit = (invoice) => {
    let totalProfit = 0;
    invoice.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const profitPerItem = (product.sellingPrice || 0) - (product.purchasePrice || 0);
        totalProfit += profitPerItem * item.quantity;
      }
    });
    return totalProfit;
  };
  
  const totalProfit = invoices.reduce((sum, inv) => sum + calculateProfit(inv), 0);
  const todayProfit = invoices
    .filter(inv => new Date(inv.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, inv) => sum + calculateProfit(inv), 0);

  // Generate Stock Report PDF
  const downloadStockReport = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.setTextColor(14, 116, 144);
      doc.text('STOCK REPORT', 105, 20, null, null, 'center');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 27, null, null, 'center');
      
      // Table
      const tableData = products.map(product => [
        product.name,
        product.category,
        `₹${product.purchasePrice.toLocaleString()}`,
        `₹${product.sellingPrice.toLocaleString()}`,
        product.quantity.toString(),
        product.modelNumber || '-'
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Product Name', 'Category', 'Purchase Price', 'Selling Price', 'Stock Qty', 'Model No']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [14, 116, 144] },
        margin: { top: 35 }
      });

      doc.save(`Stock-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Stock report error:', error);
    }
  };

  // Generate Customer Report PDF
  const downloadCustomerReport = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.setTextColor(14, 116, 144);
      doc.text('CUSTOMER REPORT', 105, 20, null, null, 'center');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 27, null, null, 'center');
      
      // Table
      const tableData = customers.map(customer => [
        customer.name,
        customer.phone || '-',
        customer.address || '-'
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Customer Name', 'Phone', 'Address']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [14, 116, 144] },
        margin: { top: 35 }
      });

      doc.save(`Customer-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Customer report error:', error);
    }
  };

  // Generate Billing History Report PDF
  const downloadBillingReport = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.setTextColor(14, 116, 144);
      doc.text('BILLING HISTORY REPORT', 105, 20, null, null, 'center');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 27, null, null, 'center');
      
      // Table
      const tableData = invoices.map(invoice => [
        invoice.invoiceNumber,
        new Date(invoice.createdAt).toLocaleDateString(),
        invoice.customer?.name || 'Walk-in Customer',
        invoice.items.length.toString(),
        `₹${invoice.grandTotal.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Invoice No', 'Date', 'Customer', 'Items', 'Total Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [14, 116, 144] },
        margin: { top: 35 }
      });

      doc.save(`Billing-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Billing report error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">View and export business reports</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'stock'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package size={20} />
          Stock Report
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'customers'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users size={20} />
          Customer Report
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'billing'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText size={20} />
          Billing History
        </button>
        <button
          onClick={() => setActiveTab('credit')}
          className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'credit'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <AlertTriangle size={20} />
          Credit / Udhaar ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('profit')}
          className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profit'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp size={20} />
          Profit Report
        </button>
      </div>

      {/* Stock Report */}
      {activeTab === 'stock' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Stock Report</h2>
            <Button onClick={downloadStockReport} variant="primary" className="flex items-center gap-2">
              <Download size={18} />
              Download PDF
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No products in stock</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Product Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Purchase Price</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Selling Price</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Stock Quantity</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Model Number</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-gray-900 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-gray-700">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          product.category === 'Furniture' 
                            ? 'bg-blue-100 text-blue-700'
                            : product.category === 'Electronics'
                            ? 'bg-purple-100 text-purple-700'
                            : product.category === 'Home Appliances'
                            ? 'bg-green-100 text-green-700'
                            : product.category === 'Office Supplies'
                            ? 'bg-yellow-100 text-yellow-700'
                            : product.category === 'Lighting'
                            ? 'bg-pink-100 text-pink-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">₹{product.purchasePrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-900 font-semibold">₹{product.sellingPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={product.quantity <= 5 ? 'text-red-600 font-bold' : 'text-gray-700'}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{product.modelNumber || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Customer Report */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Customer Report</h2>
            <Button onClick={downloadCustomerReport} variant="primary" className="flex items-center gap-2">
              <Download size={18} />
              Download PDF
            </Button>
          </div>

          {customers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone Number</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-gray-900 font-medium">{customer.name}</td>
                      <td className="px-4 py-3 text-gray-700">{customer.phone || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{customer.address || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Billing History Report */}
      {activeTab === 'billing' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Billing History Report</h2>
            <Button onClick={downloadBillingReport} variant="primary" className="flex items-center gap-2">
              <Download size={18} />
              Download PDF
            </Button>
          </div>

          {invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No billing history available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Invoice No</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Items</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-gray-900 font-medium">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-700">{invoice.customer?.name || 'Walk-in Customer'}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{invoice.items.length}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">₹{invoice.grandTotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Credit / Udhaar Report */}
      {activeTab === 'credit' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">💸 Credit / Udhaar Report</h2>
            <p className="text-gray-600">Track all pending payments and unpaid invoices</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
              <p className="text-sm text-red-700 font-semibold mb-1">Total Pending Amount</p>
              <p className="text-3xl font-bold text-red-800">₹{totalCredit.toLocaleString()}</p>
            </div>
            <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-lg">
              <p className="text-sm text-orange-700 font-semibold mb-1">Pending Invoices</p>
              <p className="text-3xl font-bold text-orange-800">{pendingCount}</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-700 font-semibold mb-1">Paid Invoices</p>
              <p className="text-3xl font-bold text-blue-800">{invoices.length - pendingCount}</p>
            </div>
          </div>

          {/* Customer-wise Credit Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">👥 Customer-wise Pending Balance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-purple-50 border-b-2 border-purple-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-purple-800">Customer Name</th>
                    <th className="px-4 py-3 text-left font-bold text-purple-800">Phone</th>
                    <th className="px-4 py-3 text-right font-bold text-purple-800">Total Credit (Udhaar)</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => {
                    const customerCredit = getCustomerCredit(customer.id);
                    if (customerCredit === 0) return null; // Only show customers with pending credit
                    
                    return (
                      <tr key={index} className="border-b border-purple-100">
                        <td className="px-4 py-3 text-purple-900 font-medium">{customer.name}</td>
                        <td className="px-4 py-3 text-purple-700">{customer.phone || '-'}</td>
                        <td className="px-4 py-3 text-right font-bold text-red-600">₹{customerCredit.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {customers.filter(c => getCustomerCredit(c.id) > 0).length === 0 && (
                <div className="text-center py-4 text-green-600">
                  ✅ No customers have pending credit
                </div>
              )}
            </div>
          </div>

          {/* Unpaid Invoices Table */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">📋 All Unpaid Invoices</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-red-50 border-b-2 border-red-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-red-800">Invoice No</th>
                    <th className="px-4 py-3 text-left font-bold text-red-800">Date</th>
                    <th className="px-4 py-3 text-left font-bold text-red-800">Customer</th>
                    <th className="px-4 py-3 text-right font-bold text-red-800">Bill Amount</th>
                    <th className="px-4 py-3 text-right font-bold text-red-800">Credit (Udhaar)</th>
                    <th className="px-4 py-3 text-right font-bold text-red-800">Paid Amount</th>
                    <th className="px-4 py-3 text-center font-bold text-red-800">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.filter(inv => inv.isCredit || (inv.paymentStatus && inv.paymentStatus !== 'paid')).map((invoice, index) => {
                    const isPartial = invoice.paymentStatus === 'partial_credit';
                    const creditAmt = isPartial ? (invoice.creditAmount || 0) : invoice.grandTotal;
                    const paidAmt = isPartial ? (invoice.grandTotal - creditAmt) : 0;
                    
                    return (
                      <tr key={index} className="border-b border-red-100">
                        <td className="px-4 py-3 text-red-900 font-semibold">{invoice.invoiceNumber}</td>
                        <td className="px-4 py-3 text-red-700">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-red-700">{invoice.customer?.name || 'Walk-in Customer'}</td>
                        <td className="px-4 py-3 text-right text-gray-700">₹{invoice.grandTotal.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-red-600">₹{creditAmt.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">₹{paidAmt.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isPartial 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isPartial ? '⚠️ Partial Credit' : '💸 FULL CREDIT'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {invoices.filter(inv => inv.isCredit || (inv.paymentStatus && inv.paymentStatus !== 'paid')).length === 0 && (
                <div className="text-center py-8 text-green-600">
                  ✅ No pending payments! All clear.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profit Report */}
      {activeTab === 'profit' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">📊 Profit Report</h2>
            <p className="text-gray-600">Track your business profitability</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
              <p className="text-sm text-green-700 font-semibold mb-1">Today's Profit</p>
              <p className="text-3xl font-bold text-green-800">₹{todayProfit.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-700 font-semibold mb-1">Total Profit</p>
              <p className="text-3xl font-bold text-blue-800">₹{totalProfit.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg">
              <p className="text-sm text-purple-700 font-semibold mb-1">Total Sales</p>
              <p className="text-3xl font-bold text-purple-800">₹{invoices.reduce((sum, inv) => sum + inv.grandTotal, 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Profit by Product */}
          <h3 className="text-lg font-bold text-gray-900 mb-3">Top Profit Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-50 border-b-2 border-green-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-green-800">Product Name</th>
                  <th className="px-4 py-3 text-right font-bold text-green-800">Purchase Price</th>
                  <th className="px-4 py-3 text-right font-bold text-green-800">Selling Price</th>
                  <th className="px-4 py-3 text-right font-bold text-green-800">Profit/Unit</th>
                  <th className="px-4 py-3 text-right font-bold text-green-800">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const profitPerUnit = (product.sellingPrice || 0) - (product.purchasePrice || 0);
                  return (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-gray-900 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-right text-gray-700">₹{product.purchasePrice?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-900 font-semibold">₹{product.sellingPrice?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">+₹{profitPerUnit.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{product.quantity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
