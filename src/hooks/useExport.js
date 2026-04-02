import { useAppContext } from '../contexts/AppContext';

export const useExport = () => {
  const { products, customers, invoices } = useAppContext();

  const exportToCSV = (data, filename) => {
    try {
      if (!data || data.length === 0) {
        return { success: false, error: 'No data to export' };
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => 
            JSON.stringify(row[header] || '')
          ).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();

      return { success: true };
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      return { success: false, error: error.message };
    }
  };

  const exportProductsCSV = () => {
    const formattedData = products.map(product => ({
      Name: product.name,
      Category: product.category,
      Price: product.price,
      Quantity: product.quantity,
      Model_Number: product.modelNumber || '',
      Created_At: new Date(product.createdAt).toLocaleDateString()
    }));
    return exportToCSV(formattedData, 'products');
  };

  const exportCustomersCSV = () => {
    const formattedData = customers.map(customer => ({
      Name: customer.name,
      Phone: customer.phone || '',
      Address: customer.address || '',
      Total_Spent: customer.totalSpent,
      Created_At: new Date(customer.createdAt).toLocaleDateString()
    }));
    return exportToCSV(formattedData, 'customers');
  };

  const exportInvoicesCSV = () => {
    const formattedData = invoices.map(invoice => ({
      Invoice_Number: invoice.invoiceNumber,
      Customer: invoice.customer?.name || '',
      Total_Amount: invoice.grandTotal,
      Date: new Date(invoice.createdAt).toLocaleDateString()
    }));
    return exportToCSV(formattedData, 'invoices');
  };

  return {
    exportToCSV,
    exportProductsCSV,
    exportCustomersCSV,
    exportInvoicesCSV
  };
};
