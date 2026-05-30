// WhatsApp share utilities

const normalizePhone = (raw) => {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  // If user entered a 10-digit Indian number, prefix country code 91
  if (digits.length === 10) return `91${digits}`;
  // If already 12 digits and starts with 91, keep as is
  return digits;
};

export const openWhatsApp = ({ phone, message }) => {
  const num = normalizePhone(phone);
  const text = encodeURIComponent(message || '');
  const url = num
    ? `https://wa.me/${num}?text=${text}`
    : `https://wa.me/?text=${text}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

// Build an invoice share message
export const buildInvoiceWhatsAppMessage = ({ invoice, settings }) => {
  const lines = [];
  lines.push(`Hello ${invoice.customer?.name || 'Customer'},`);
  lines.push('');
  lines.push(`Thank you for your purchase from *${settings?.companyName || 'Raza Traders'}*.`);
  lines.push('');
  lines.push(`*Invoice:* ${invoice.invoiceNumber}`);
  lines.push(`*Date:* ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`);
  lines.push(`*Total:* ₹${(invoice.grandTotal || 0).toLocaleString('en-IN')}`);
  if (invoice.creditAmount > 0) {
    lines.push(`*Outstanding:* ₹${invoice.creditAmount.toLocaleString('en-IN')}`);
  } else {
    lines.push(`*Status:* Paid in full`);
  }
  lines.push('');
  lines.push('Please find the invoice attached.');
  if (settings?.companyPhone) {
    lines.push(`Contact: ${settings.companyPhone}`);
  }
  return lines.join('\n');
};

// Build a "your product is in stock" message for fulfilled requests
export const buildProductReadyMessage = ({ request, settings }) => {
  const lines = [];
  lines.push(`Hello ${request.customerName || 'Customer'},`);
  lines.push('');
  lines.push(`Good news! The product you asked for — *${request.productName}* — is now available at *${settings?.companyName || 'Raza Traders'}*.`);
  if (request.quantity) lines.push(`Quantity reserved: ${request.quantity}`);
  lines.push('');
  lines.push('Please visit the store at your convenience.');
  if (settings?.companyPhone) {
    lines.push(`Contact: ${settings.companyPhone}`);
  }
  return lines.join('\n');
};
