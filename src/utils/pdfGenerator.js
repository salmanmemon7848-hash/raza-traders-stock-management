import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (invoice, companySettings) => {
  try {
    const doc = new jsPDF();
    
    // Company Header
    doc.setFontSize(20);
    doc.setTextColor(14, 116, 144);
    doc.text(companySettings.companyName || 'Raza Traders', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(companySettings.companyAddress || '', 14, 26);
    doc.text(`Phone: ${companySettings.companyPhone || ''}`, 14, 31);
    doc.text(`Email: ${companySettings.companyEmail || ''}`, 14, 35);
    if (companySettings.gstNumber) {
      doc.text(`GST: ${companySettings.gstNumber}`, 14, 39);
    }
    
    // Invoice Title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('TAX INVOICE', 140, 20);
    
    // Invoice Details
    doc.setFontSize(10);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 140, 30);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 140, 35);
    
    // Customer Details
    doc.setFontSize(12);
    doc.setTextColor(14, 116, 144);
    doc.text('Bill To:', 14, 50);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(invoice.customer?.name || '', 14, 56);
    doc.text(invoice.customer?.phone || '', 14, 61);
    doc.text(invoice.customer?.address || '', 14, 66);
    
    // Products Table
    const tableData = invoice.items.map((item, index) => [
      index + 1,
      item.name,
      item.quantity,
      `Rs. ${item.price.toLocaleString()}`,
      `Rs. ${item.total.toLocaleString()}`
    ]);
    
    autoTable(doc, {
      startY: 75,
      head: [['#', 'Description', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [14, 116, 144] },
      columnStyles: {
        4: { halign: 'right' }
      }
    });
    
    // Totals
    let finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Subtotal
    doc.text('Subtotal:', 140, finalY, { align: 'right' });
    doc.text(`Rs. ${invoice.subtotal.toLocaleString()}`, 190, finalY, { align: 'right' });
    
    finalY += 7;
    
    // Discount
    if (invoice.discount > 0) {
      doc.text(`Discount:`, 140, finalY, { align: 'right' });
      doc.text(`- Rs. ${invoice.discount.toLocaleString()}`, 190, finalY, { align: 'right' });
      finalY += 7;
    }
    
    // Tax
    if (invoice.taxRate > 0) {
      doc.text(`Tax (${invoice.taxRate}%):`, 140, finalY, { align: 'right' });
      doc.text(`Rs. ${invoice.taxAmount.toLocaleString()}`, 190, finalY, { align: 'right' });
      finalY += 7;
    }
    
    // Grand Total
    finalY += 3;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Grand Total:', 140, finalY, { align: 'right' });
    doc.text(`Rs. ${invoice.grandTotal.toLocaleString()}`, 190, finalY, { align: 'right' });
    
    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business!', 14, 280);
    doc.text('Terms & Conditions Apply', 190, 280, { align: 'right' });
    
    // Save the PDF
    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
    
    return { success: true };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};

export const printInvoice = (invoice, companySettings) => {
  const printWindow = window.open('', '_blank');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { margin-bottom: 20px; }
        .company-name { font-size: 24px; color: #0e7490; font-weight: bold; }
        .invoice-title { font-size: 20px; text-align: right; margin-top: 10px; }
        .details { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #0e7490; color: white; }
        .totals { margin-top: 20px; text-align: right; }
        .grand-total { font-size: 18px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${companySettings.companyName || 'Raza Traders'}</div>
        <div>${companySettings.companyAddress || ''}</div>
        <div>Phone: ${companySettings.companyPhone || ''}</div>
        <div>Email: ${companySettings.companyEmail || ''}</div>
        ${companySettings.gstNumber ? `<div>GST: ${companySettings.gstNumber}</div>` : ''}
        <div class="invoice-title"><strong>TAX INVOICE</strong></div>
        <div style="text-align: right;">Invoice No: ${invoice.invoiceNumber}</div>
        <div style="text-align: right;">Date: ${new Date(invoice.createdAt).toLocaleDateString()}</div>
      </div>
      
      <div class="details">
        <strong>Bill To:</strong><br/>
        ${invoice.customer?.name || ''}<br/>
        ${invoice.customer?.phone || ''}<br/>
        ${invoice.customer?.address || ''}
      </div>
      
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>Rs. ${item.price.toLocaleString()}</td>
              <td>Rs. ${item.total.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <div>Subtotal: Rs. ${invoice.subtotal.toLocaleString()}</div>
        ${invoice.discount > 0 ? `<div>Discount: - Rs. ${invoice.discount.toLocaleString()}</div>` : ''}
        ${invoice.taxRate > 0 ? `<div>Tax (${invoice.taxRate}%): Rs. ${invoice.taxAmount.toLocaleString()}</div>` : ''}
        <div class="grand-total">Grand Total: Rs. ${invoice.grandTotal.toLocaleString()}</div>
      </div>
      
      <div style="margin-top: 40px; text-align: center; color: #999;">
        Thank you for your business!<br/>
        Terms & Conditions Apply
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const exportExpensesCSV = (expenses) => {
  try {
    const headers = ['Date', 'Title', 'Category', 'Amount', 'Notes'];
    const rows = expenses.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.title,
      expense.category,
      expense.amount.toString(),
      expense.notes || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  } catch (error) {
    console.error('Error exporting expenses CSV:', error);
    throw error;
  }
};

export const exportExpensesPDF = (expenses) => {
  try {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(14, 116, 144);
    doc.text('Expense Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 27);
    
    // Summary
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Expenses: Rs. ${totalExpenses.toLocaleString()}`, 14, 35);
    doc.text(`Total Entries: ${expenses.length}`, 140, 35);
    
    // Table
    const tableData = expenses.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.title,
      expense.category,
      `Rs. ${expense.amount.toLocaleString()}`,
      expense.notes || '-'
    ]);
    
    autoTable(doc, {
      startY: 45,
      head: [['Date', 'Title', 'Category', 'Amount', 'Notes']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [14, 116, 144] },
      footStyles: { fillColor: [14, 116, 144] },
      footer: [['', '', 'Total', `Rs. ${totalExpenses.toLocaleString()}`, '']],
    });
    
    doc.save(`expenses-report-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error exporting expenses PDF:', error);
    throw error;
  }
};
