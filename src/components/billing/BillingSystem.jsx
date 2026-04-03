import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { generateInvoiceNumber } from '../../utils/calculations';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { Plus, Trash2, Printer, Download, RefreshCw, Save, Package } from 'lucide-react';

const BillingSystem = () => {
  const { products, customers, invoices, settings, dispatch, success, error } = useAppContext();
  
  // State management
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [billItems, setBillItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' or 'percentage'
  const [showGST, setShowGST] = useState(false);
  const [gstRate, setGstRate] = useState(18);
  const [paymentStatus, setPaymentStatus] = useState('paid'); // 'paid', 'full_credit', or 'partial_credit'
  const [creditAmount, setCreditAmount] = useState(''); // For partial credit
  
  // Add Product Modal State
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Other',
    purchasePrice: '',
    sellingPrice: '',
    quantity: ''
  });

  // Get available products (with stock > 0)
  const availableProducts = products.filter(p => p.quantity > 0);

  // Find selected product details
  const getProductDetails = () => {
    return products.find(p => p.id === selectedProduct);
  };

  // Add product to bill
  const handleAddToBill = () => {
    if (!selectedProduct) {
      error('Please select a product');
      return;
    }

    if (quantity <= 0) {
      error('Quantity must be greater than 0');
      return;
    }

    const product = getProductDetails();
    
    // Check if enough stock is available
    const existingItem = billItems.find(item => item.productId === selectedProduct);
    const totalQtyNeeded = quantity + (existingItem ? existingItem.quantity : 0);
    
    if (totalQtyNeeded > product.quantity) {
      error(`Only ${product.quantity} items available in stock`);
      return;
    }

    if (existingItem) {
      // Update existing item
      setBillItems(billItems.map(item => 
        item.productId === selectedProduct
          ? {
              ...item,
              quantity: item.quantity + quantity,
              total: (item.quantity + quantity) * item.price
            }
          : item
      ));
    } else {
      // Add new item
      setBillItems([...billItems, {
        productId: product.id,
        name: product.name,
        price: product.sellingPrice,
        quantity: quantity,
        total: product.sellingPrice * quantity
      }]);
    }

    // Reset selection
    setSelectedProduct('');
    setQuantity(1);
    success('Product added to bill');
  };

  // Remove item from bill
  const handleRemoveItem = (index) => {
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return billItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discount === 0) return 0;
    return discountType === 'percentage' 
      ? (subtotal * discount) / 100 
      : discount;
  };

  const calculateGST = () => {
    if (!showGST) return 0;
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    return ((subtotal - discountAmount) * gstRate) / 100;
  };

  const calculateFinalTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    const gstAmount = calculateGST();
    return subtotal - discountAmount + gstAmount;
  };

  // Reset bill
  const handleResetBill = () => {
    if (window.confirm('Clear current bill?')) {
      setBillItems([]);
      setSelectedProduct('');
      setQuantity(1);
      setCustomerName('');
      setCustomerPhone('');
      setDiscount(0);
      setShowGST(false);
      success('Bill cleared');
    }
  };

  // Generate Invoice
  const handleGenerateInvoice = () => {
    if (billItems.length === 0) {
      error('Please add at least one product to the bill');
      return;
    }

    // Validate partial credit
    if (paymentStatus === 'partial_credit') {
      const finalTotal = calculateFinalTotal();
      const creditValue = parseFloat(creditAmount);
      
      if (!creditAmount || creditValue <= 0) {
        error('Please enter a valid credit amount');
        return;
      }
      
      if (creditValue > finalTotal) {
        error('Credit amount cannot exceed total bill amount');
        return;
      }
    }

    try {
      const subtotal = calculateSubtotal();
      const discountAmount = calculateDiscount();
      const gstAmount = calculateGST();
      const finalTotal = calculateFinalTotal();

      const invoiceData = {
        invoiceNumber: generateInvoiceNumber(invoices),
        customer: {
          name: customerName || 'Walk-in Customer',
          phone: customerPhone || ''
        },
        items: billItems,
        subtotal: subtotal,
        discount: discountAmount,
        taxRate: showGST ? gstRate : 0,
        taxAmount: gstAmount,
        grandTotal: finalTotal,
        paymentStatus: paymentStatus, // 'paid', 'full_credit', or 'partial_credit'
        isCredit: paymentStatus !== 'paid',
        creditAmount: paymentStatus === 'partial_credit' ? parseFloat(creditAmount) : 0,
        createdAt: new Date().toISOString()
      };

      // Save invoice to store
      dispatch({ 
        type: 'ADD_INVOICE', 
        payload: { invoiceData, updateCustomer: false } 
      });

      // Reduce stock for each product
      billItems.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          dispatch({
            type: 'UPDATE_PRODUCT',
            payload: {
              ...product,
              quantity: product.quantity - item.quantity
            }
          });
        }
      });

      success('Invoice generated successfully!');

      // Generate PDF
      if (window.confirm('Invoice saved! Download PDF?')) {
        generateInvoicePDF(invoiceData, settings);
      }

      // Reset form
      handleResetBill();

    } catch (err) {
      console.error('Invoice generation error:', err);
      error('Failed to generate invoice');
    }
  };

  // Print invoice
  const handlePrintInvoice = () => {
    if (billItems.length === 0) {
      error('Nothing to print');
      return;
    }
    
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    const gstAmount = calculateGST();
    const finalTotal = calculateFinalTotal();

    const invoiceData = {
      invoiceNumber: 'DRAFT',
      customer: {
        name: customerName || 'Walk-in Customer',
        phone: customerPhone || ''
      },
      items: billItems,
      subtotal: subtotal,
      discount: discountAmount,
      taxRate: showGST ? gstRate : 0,
      taxAmount: gstAmount,
      grandTotal: finalTotal
    };

    generateInvoicePDF(invoiceData, settings, true);
  };

  // Handle Add New Product
  const handleAddNewProduct = () => {
    if (!newProduct.name || !newProduct.sellingPrice || !newProduct.purchasePrice || !newProduct.quantity) {
      error('Please fill all required fields');
      return;
    }

    try {
      const productData = {
        name: newProduct.name,
        category: newProduct.category,
        purchasePrice: parseFloat(newProduct.purchasePrice),
        sellingPrice: parseFloat(newProduct.sellingPrice),
        quantity: parseInt(newProduct.quantity),
        modelNumber: ''
      };

      dispatch({ type: 'ADD_PRODUCT', payload: productData });
      success('Product added successfully!');
      
      // Close modal and reset form
      setAddProductModalOpen(false);
      setNewProduct({
        name: '',
        category: 'Other',
        purchasePrice: '',
        sellingPrice: '',
        quantity: ''
      });
      
      // Auto-select the newly added product in dropdown after a short delay
      setTimeout(() => {
        setSelectedProduct(productData.name);
      }, 100);
      
    } catch (err) {
      console.error('Error adding product:', err);
      error('Failed to add product');
    }
  };

  const handleChangeNewProduct = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header - Responsive padding */}
      <div className="mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Billing System</h1>
        <p className="text-xs sm:text-sm text-gray-600">Create invoices and manage sales</p>
      </div>

      {/* Two-column layout that stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column - Product Selection */}
        <div className="space-y-3 sm:space-y-4">
          {/* Select Product */}
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Select Product</h3>
              <Button 
                onClick={() => setAddProductModalOpen(true)}
                variant="primary"
                size="sm"
                className="flex items-center gap-1 w-full sm:w-auto justify-center"
              >
                <Package size={16} />
                <span className="hidden sm:inline">Add New Product</span>
                <span className="sm:hidden">Add Product</span>
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                >
                  <option value="">Choose a product...</option>
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ₹{product.sellingPrice.toLocaleString()} (Stock: {product.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={quantity.toString()}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  placeholder="Enter quantity"
                />
              </div>

              <Button
                onClick={handleAddToBill}
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add to Bill
              </Button>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Customer Details (Optional)</h3>
            
            <div className="space-y-3">
              <Input
                label="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
              
              <Input
                label="Phone Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter phone number"
              />
              
              {/* Payment Status */}
              <div className="border-t pt-3 mt-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                  Payment Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <button
                    onClick={() => setPaymentStatus('paid')}
                    className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-all border-2 text-xs sm:text-sm ${
                      paymentStatus === 'paid'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    ✅ Paid
                  </button>
                  <button
                    onClick={() => setPaymentStatus('full_credit')}
                    className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-all border-2 text-xs sm:text-sm ${
                      paymentStatus === 'full_credit'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    💸 Full Credit (Udhaar)
                  </button>
                  <button
                    onClick={() => setPaymentStatus('partial_credit')}
                    className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-all border-2 text-xs sm:text-sm ${
                      paymentStatus === 'partial_credit'
                        ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    💸 Partial Credit (Udhaar)
                  </button>
                </div>
                {paymentStatus === 'full_credit' && (
                  <div className="mt-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                    ⚠️ This will be marked as full credit (udhaar). Amount will be tracked in pending payments.
                  </div>
                )}
                {paymentStatus === 'partial_credit' && (
                  <div className="mt-3 space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                      ⚠️ Enter the credit amount. Remaining will be auto-calculated as paid.
                    </div>
                    
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <Input
                        label="Credit Amount (₹)"
                        type="number"
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(e.target.value)}
                        placeholder="Enter credit amount"
                        min="1"
                      />
                      
                      {/* Auto Calculation Display */}
                      {billItems.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Total Bill Amount:</span>
                            <span className="font-bold text-gray-900">₹{calculateFinalTotal().toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Credit Amount (Udhaar):</span>
                            <span className="font-bold text-red-600">₹{(parseFloat(creditAmount) || 0).toLocaleString()}</span>
                          </div>
                          <div className="border-t border-gray-200 pt-2 flex justify-between text-base">
                            <span className="font-bold text-gray-900">Paid Amount:</span>
                            <span className="font-bold text-green-600">₹{Math.max(0, calculateFinalTotal() - (parseFloat(creditAmount) || 0)).toLocaleString()}</span>
                          </div>
                          
                          {/* Validation Errors */}
                          {parseFloat(creditAmount) > calculateFinalTotal() && (
                            <div className="mt-2 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-xs">
                              ❌ Credit amount cannot exceed total bill amount
                            </div>
                          )}
                          {parseFloat(creditAmount) <= 0 && creditAmount !== '' && (
                            <div className="mt-2 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-xs">
                              ❌ Credit amount must be greater than 0
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Discount & GST */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Discount & Tax</h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  >
                    <option value="fixed">Fixed (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <Input
                  label={`Discount ${discountType === 'fixed' ? '(₹)' : '(%)'}`}
                  type="number"
                  value={discount.toString()}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">
                  Apply GST
                </label>
                <button
                  onClick={() => setShowGST(!showGST)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showGST ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showGST ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {showGST && (
                <Input
                  label="GST Rate (%)"
                  type="number"
                  value={gstRate.toString()}
                  onChange={(e) => setGstRate(parseFloat(e.target.value) || 18)}
                  min="0"
                  max="100"
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Bill Summary */}
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Bill Summary</h3>
              {billItems.length > 0 && (
                <Button onClick={handleResetBill} variant="outline" size="sm" className="w-full sm:w-auto">
                  <RefreshCw size={16} className="mr-1" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              )}
            </div>

            {billItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No items in bill</p>
                <p className="text-xs mt-1">Add products from left panel</p>
              </div>
            ) : (
              <>
                {/* Bill Items Table - Responsive */}
                <div className="overflow-x-auto mb-3 sm:mb-4 table-responsive">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-2 sm:px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Item</th>
                        <th className="px-2 sm:px-3 py-2 text-right font-semibold text-gray-700 whitespace-nowrap">Price</th>
                        <th className="px-2 sm:px-3 py-2 text-right font-semibold text-gray-700 whitespace-nowrap">Qty</th>
                        <th className="px-2 sm:px-3 py-2 text-right font-semibold text-gray-700 whitespace-nowrap">Total</th>
                        <th className="px-2 sm:px-3 py-2 text-center font-semibold text-gray-700 whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billItems.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-gray-900 max-w-[120px] truncate">{item.name}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-right text-gray-700">₹{item.price.toLocaleString()}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-right text-gray-700">{item.quantity}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-right font-semibold text-gray-900">₹{item.total.toLocaleString()}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-center">
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculations */}
                <div className="border-t pt-3 sm:pt-4 space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{calculateSubtotal().toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm text-red-600">
                      <span>Discount ({discountType === 'percentage' ? `${discount}%` : '₹'}):</span>
                      <span>- ₹{calculateDiscount().toLocaleString()}</span>
                    </div>
                  )}

                  {showGST && (
                    <div className="flex justify-between text-xs sm:text-sm text-gray-700">
                      <span>GST ({gstRate}%):</span>
                      <span className="font-semibold">+ ₹{calculateGST().toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base sm:text-lg font-bold text-green-600 border-t pt-2">
                    <span>Final Total:</span>
                    <span>₹{calculateFinalTotal().toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons - Stack on mobile */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <Button
                    onClick={handleGenerateInvoice}
                    variant="success"
                    className="flex-1 flex items-center justify-center gap-2 w-full"
                  >
                    <Save size={18} />
                    Generate Invoice
                  </Button>
                  
                  <Button
                    onClick={handlePrintInvoice}
                    variant="primary"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Printer size={18} />
                    <span className="hidden sm:inline">Print</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add New Product Modal */}
      <Modal
        isOpen={addProductModalOpen}
        onClose={() => setAddProductModalOpen(false)}
        title="Add New Product"
      >
        <div className="space-y-4">
          <Input
            label="Product Name"
            name="name"
            value={newProduct.name}
            onChange={handleChangeNewProduct}
            placeholder="Enter product name"
            required
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={newProduct.category}
              onChange={handleChangeNewProduct}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
            >
              <option value="Furniture">Furniture</option>
              <option value="Electronics">Electronics</option>
              <option value="Home Appliances">Home Appliances</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Lighting">Lighting</option>
              <option value="Decor">Decor</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Purchase Price (Rs.)"
              name="purchasePrice"
              type="number"
              value={newProduct.purchasePrice}
              onChange={handleChangeNewProduct}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />

            <Input
              label="Selling Price (Rs.)"
              name="sellingPrice"
              type="number"
              value={newProduct.sellingPrice}
              onChange={handleChangeNewProduct}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <Input
            label="Quantity"
            name="quantity"
            type="number"
            value={newProduct.quantity}
            onChange={handleChangeNewProduct}
            placeholder="0"
            min="0"
            required
          />

          <div className="flex gap-3 pt-4">
            <Button onClick={handleAddNewProduct} variant="success" className="flex-1">
              Add Product
            </Button>
            <Button onClick={() => setAddProductModalOpen(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BillingSystem;
