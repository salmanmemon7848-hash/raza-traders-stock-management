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
      {/* Header - Responsive */}
      <div className="mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Reports</h1>
        <p className="text-xs sm:text-sm text-gray-600">View and export business reports</p>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto scrollbar-hide pb-2">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap text-xs sm:text-sm ${
            activeTab === 'stock'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package size={18} className="sm:size-5" />
          <span className="hidden xs:inline">Stock Report</span>
          <span className="xs:hidden">Stock</span>
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap text-xs sm:text-sm ${
            activeTab === 'customers'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users size={18} className="sm:size-5" />
          <span className="hidden xs:inline">Customer Report</span>
          <span className="xs:hidden">Customers</span>
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap text-xs sm:text-sm ${
            activeTab === 'billing'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText size={18} className="sm:size-5" />
          <span className="hidden xs:inline">Billing History</span>
          <span className="xs:hidden">Billing</span>
        </button>
        <button
          onClick={() => setActiveTab('credit')}
          className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap text-xs sm:text-sm ${
            activeTab === 'credit'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <AlertTriangle size={18} className="sm:size-5" />
          <span className="hidden xs:inline">Credit / Udhaar ({pendingCount})</span>
          <span className="xs:hidden">Credit ({pendingCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('profit')}
          className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap text-xs sm:text-sm ${
            activeTab === 'profit'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp size={18} className="sm:size-5" />
          <span className="hidden xs:inline">Profit Report</span>
          <span className="xs:hidden">Profit</span>
        </button>
      </div>

      {/* Stock Report */}
      {activeTab === 'stock' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Stock Report</h2>
            <Button onClick={downloadStockReport} variant="primary" className="flex items-center gap-2 w-full sm:w-auto">
              <Download size={18} />
              <span>Download PDF</span>
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No products in stock</p>
            </div>
          ) : (
            <div className="overflow-x-auto table-responsive">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Product Name</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Category</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 whitespace-nowrap">Purchase Price</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 whitespace-nowrap">Selling Price</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 whitespace-nowrap">Stock Quantity</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Model Number</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-900 font-medium max-w-[150px] truncate">{product.name}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-700">
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
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right text-gray-700 whitespace-nowrap">₹{product.purchasePrice.toLocaleString()}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right text-gray-900 font-semibold whitespace-nowrap">₹{product.sellingPrice.toLocaleString()}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right whitespace-nowrap">
                        <span className={product.quantity <= 5 ? 'text-red-600 font-bold' : 'text-gray-700'}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-700 max-w-[100px] truncate">{product.modelNumber || '-'}</td>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Customer Report</h2>
            <Button onClick={downloadCustomerReport} variant="primary" className="flex items-center gap-2 w-full sm:w-auto">
              <Download size={18} />
              <span>Download PDF</span>
            </Button>
          </div>

          {customers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto table-responsive">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Customer Name</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Phone Number</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-900 font-medium max-w-[150px] truncate">{customer.name}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-700 whitespace-nowrap">{customer.phone || '-'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-700 max-w-[200px] truncate">{customer.address || '-'}</td>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Billing History Report</h2>
            <Button onClick={downloadBillingReport} variant="primary" className="flex items-center gap-2 w-full sm:w-auto">
              <Download size={18} />
              <span>Download PDF</span>
            </Button>
          </div>

          {invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No billing history available</p>
            </div>
          ) : (
            <div className="overflow-x-auto table-responsive">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Invoice No</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Date</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Customer</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 whitespace-nowrap">Items</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 whitespace-nowrap">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-900 font-medium max-w-[120px] truncate">{invoice.invoiceNumber}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-700 whitespace-nowrap">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-700 max-w-[150px] truncate">{invoice.customer?.name || 'Walk-in Customer'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right text-gray-700 whitespace-nowrap">{invoice.items.length}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-green-600 whitespace-nowrap">₹{invoice.grandTotal.toLocaleString()}</td>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">💸 Credit / Udhaar Report</h2>
            <p className="text-xs sm:text-sm text-gray-600">Track all pending payments and unpaid invoices</p>
          </div>

          {/* Summary Cards - Stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-red-50 border-2 border-red-200 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-red-700 font-semibold mb-1">Total Pending Amount</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-800 break-words">₹{totalCredit.toLocaleString()}</p>
            </div>
            <div className="bg-orange-50 border-2 border-orange-200 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-orange-700 font-semibold mb-1">Pending Invoices</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-800">{pendingCount}</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-700 font-semibold mb-1">Paid Invoices</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-800">{invoices.length - pendingCount}</p>
            </div>
          </div>

          {/* Customer-wise Credit Summary */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">👥 Customer-wise Pending Balance</h3>
            <div className="overflow-x-auto table-responsive">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-purple-50 border-b-2 border-purple-200">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-bold text-purple-800 whitespace-nowrap">Customer Name</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-bold text-purple-800 whitespace-nowrap">Phone</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-purple-800 whitespace-nowrap">Total Credit (Udhaar)</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => {
                    const customerCredit = getCustomerCredit(customer.id);
                    if (customerCredit === 0) return null;
                    
                    return (
                      <tr key={index} className="border-b border-purple-100">
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-purple-900 font-medium max-w-[150px] truncate">{customer.name}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-purple-700 whitespace-nowrap">{customer.phone || '-'}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-red-600 whitespace-nowrap">₹{customerCredit.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {customers.filter(c => getCustomerCredit(c.id) > 0).length === 0 && (
                <div className="text-center py-4 text-green-600 text-xs sm:text-sm">
                  ✅ No customers have pending credit
                </div>
              )}
            </div>
          </div>

          {/* Unpaid Invoices Table */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">📋 All Unpaid Invoices</h3>
            <div className="overflow-x-auto table-responsive">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-red-50 border-b-2 border-red-200">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-bold text-red-800 whitespace-nowrap">Invoice No</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-bold text-red-800 whitespace-nowrap">Date</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-bold text-red-800 whitespace-nowrap">Customer</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-red-800 whitespace-nowrap">Bill Amount</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-red-800 whitespace-nowrap">Credit (Udhaar)</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-red-800 whitespace-nowrap">Paid Amount</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-center font-bold text-red-800 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.filter(inv => inv.isCredit || (inv.paymentStatus && inv.paymentStatus !== 'paid')).map((invoice, index) => {
                    const isPartial = invoice.paymentStatus === 'partial_credit';
                    const creditAmt = isPartial ? (invoice.creditAmount || 0) : invoice.grandTotal;
                    const paidAmt = isPartial ? (invoice.grandTotal - creditAmt) : 0;
                    
                    return (
                      <tr key={index} className="border-b border-red-100">
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-red-900 font-semibold max-w-[120px] truncate">{invoice.invoiceNumber}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-red-700 whitespace-nowrap">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-red-700 max-w-[150px] truncate">{invoice.customer?.name || 'Walk-in Customer'}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-right text-gray-700 whitespace-nowrap">₹{invoice.grandTotal.toLocaleString()}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-red-600 whitespace-nowrap">₹{creditAmt.toLocaleString()}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-green-600 whitespace-nowrap">₹{paidAmt.toLocaleString()}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            isPartial 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isPartial ? '⚠️ Partial' : '💸 Full Credit'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {invoices.filter(inv => inv.isCredit || (inv.paymentStatus && inv.paymentStatus !== 'paid')).length === 0 && (
                <div className="text-center py-8 text-green-600 text-xs sm:text-sm">
                  ✅ No pending payments! All clear.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profit Report */}
      {activeTab === 'profit' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">📊 Profit Report</h2>
            <p className="text-xs sm:text-sm text-gray-600">Track your business profitability</p>
          </div>

          {/* Summary Cards - Stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-green-50 border-2 border-green-200 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-green-700 font-semibold mb-1">Today's Profit</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-800 break-words">₹{todayProfit.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-700 font-semibold mb-1">Total Profit</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-800 break-words">₹{totalProfit.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 border-2 border-purple-200 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-purple-700 font-semibold mb-1">Total Sales</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-800 break-words">₹{invoices.reduce((sum, inv) => sum + inv.grandTotal, 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Profit by Product */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Top Profit Products</h3>
          <div className="overflow-x-auto table-responsive">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-green-50 border-b-2 border-green-200">
                <tr>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-bold text-green-800 whitespace-nowrap">Product Name</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-green-800 whitespace-nowrap">Purchase Price</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-green-800 whitespace-nowrap">Selling Price</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-green-800 whitespace-nowrap">Profit/Unit</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-green-800 whitespace-nowrap">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const profitPerUnit = (product.sellingPrice || 0) - (product.purchasePrice || 0);
                  return (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-900 font-medium max-w-[150px] truncate">{product.name}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right text-gray-700 whitespace-nowrap">₹{product.purchasePrice?.toLocaleString()}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right text-gray-900 font-semibold whitespace-nowrap">₹{product.sellingPrice?.toLocaleString()}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-green-600 whitespace-nowrap">+₹{profitPerUnit.toLocaleString()}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right whitespace-nowrap">{product.quantity}</td>
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
