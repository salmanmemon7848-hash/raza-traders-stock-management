// Date helpers — all formatting uses en-IN locale

export const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

export const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

export const formatRelative = (d) => {
  if (!d) return '';
  const then = new Date(d).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
};

export const isToday = (d) => new Date(d).toDateString() === new Date().toDateString();

export const isThisMonth = (d) => {
  const dt = new Date(d);
  const now = new Date();
  return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
};

export const daysBetween = (start, end = new Date()) => {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

// e.g., amount in words for invoices (basic Indian number system)
export const numberToWords = (num) => {
  if (num === null || num === undefined) return '';
  const n = Math.floor(Math.abs(Number(num) || 0));
  if (n === 0) return 'Zero';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const inWords = (val) => {
    if (val < 20) return a[val];
    if (val < 100) return b[Math.floor(val / 10)] + (val % 10 ? ' ' + a[val % 10] : '');
    if (val < 1000) return a[Math.floor(val / 100)] + ' Hundred' + (val % 100 ? ' ' + inWords(val % 100) : '');
    return '';
  };
  let result = '';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  if (crore) result += inWords(crore) + ' Crore ';
  if (lakh) result += inWords(lakh) + ' Lakh ';
  if (thousand) result += inWords(thousand) + ' Thousand ';
  if (rest) result += inWords(rest);
  return result.trim();
};
