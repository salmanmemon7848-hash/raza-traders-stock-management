// closingReportPdf.js
// Renders a hidden styled HTML element, captures it with html2canvas,
// and converts it to a PDF via jsPDF. Result = pixel-perfect branded report.

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BRAND = '#4f46e5';
const BRAND_DARK = '#3730a3';
const SUCCESS = '#059669';
const DANGER = '#dc2626';
const WARNING = '#d97706';
const INFO = '#2563eb';
const SLATE = '#64748b';
const SLATE_DARK = '#1e293b';
const SLATE_LIGHT = '#f1f5f9';

const formatINR = (n) =>
  `Rs. ${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const buildReportHTML = (data, settings) => {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const shop = settings?.companyName || 'Raza Traders';
  const phone = settings?.companyPhone || '';
  const address = settings?.companyAddress || '';
  const gst = settings?.gstNumber || '';

  const targetBar =
    data.target > 0
      ? `
    <div style="margin-bottom:20px;background:#eef2ff;border-radius:12px;padding:16px;border:1px solid #c7d2fe;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-size:13px;font-weight:600;color:${BRAND};">🎯 Today's Target: ${formatINR(data.target)}</span>
        <span style="font-size:13px;font-weight:700;color:${data.revenue >= data.target ? SUCCESS : BRAND};">${data.targetPercent.toFixed(0)}% achieved</span>
      </div>
      <div style="height:10px;background:#e0e7ff;border-radius:999px;overflow:hidden;">
        <div style="height:100%;width:${Math.min(100, data.targetPercent)}%;background:linear-gradient(90deg,${BRAND},#818cf8);border-radius:999px;"></div>
      </div>
      ${data.revenue >= data.target ? `<p style="margin:6px 0 0;font-size:12px;color:${SUCCESS};font-weight:600;">🎉 Target achieved! Great work today!</p>` : ''}
    </div>`
      : '';

  const statCard = (icon, label, value, color, sublabel = '') => `
    <div style="background:white;border-radius:12px;padding:14px 16px;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
        <div style="width:32px;height:32px;border-radius:8px;background:${color}18;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${icon}</div>
        <span style="font-size:12px;color:${SLATE};font-weight:500;">${label}</span>
      </div>
      <p style="margin:4px 0 0 42px;font-size:18px;font-weight:700;color:${SLATE_DARK};">${value}</p>
      ${sublabel ? `<p style="margin:2px 0 0 42px;font-size:11px;color:${SLATE};">${sublabel}</p>` : ''}
    </div>`;

  const row = (label, value, color = SLATE_DARK, sublabel = '') => `
    <tr>
      <td style="padding:10px 12px;font-size:13px;color:${SLATE};border-bottom:1px solid #f1f5f9;">${label}${sublabel ? `<br/><span style="font-size:11px;color:#94a3b8;">${sublabel}</span>` : ''}</td>
      <td style="padding:10px 12px;font-size:13px;font-weight:600;color:${color};text-align:right;border-bottom:1px solid #f1f5f9;">${value}</td>
    </tr>`;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;color:${SLATE_DARK};}
</style>
</head>
<body>
<div id="report" style="width:700px;background:#f8fafc;padding:32px;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,${BRAND} 0%,${BRAND_DARK} 100%);border-radius:16px;padding:28px 32px;margin-bottom:24px;color:white;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.08);"></div>
    <div style="position:absolute;bottom:-20px;right:60px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.05);"></div>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;">
      <div>
        <p style="font-size:11px;font-weight:600;letter-spacing:2px;opacity:0.8;text-transform:uppercase;margin-bottom:6px;">Daily Closing Report</p>
        <h1 style="font-size:26px;font-weight:800;margin-bottom:4px;">${shop}</h1>
        ${address ? `<p style="font-size:12px;opacity:0.75;margin-top:2px;">📍 ${address}</p>` : ''}
        ${phone ? `<p style="font-size:12px;opacity:0.75;margin-top:2px;">📞 ${phone}</p>` : ''}
        ${gst ? `<p style="font-size:12px;opacity:0.75;margin-top:2px;">GST: ${gst}</p>` : ''}
      </div>
      <div style="text-align:right;">
        <div style="background:rgba(255,255,255,0.15);border-radius:10px;padding:10px 16px;display:inline-block;">
          <p style="font-size:11px;opacity:0.8;margin-bottom:2px;">Date</p>
          <p style="font-size:13px;font-weight:700;">${today}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Net Profit Hero -->
  <div style="background:white;border-radius:16px;padding:24px 28px;margin-bottom:20px;border:2px solid ${data.netProfit >= 0 ? '#d1fae5' : '#fee2e2'};box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <p style="font-size:12px;color:${SLATE};font-weight:500;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:4px;">Net Profit Today</p>
        <p style="font-size:38px;font-weight:800;color:${data.netProfit >= 0 ? SUCCESS : DANGER};line-height:1;">${formatINR(data.netProfit)}</p>
        <p style="font-size:12px;color:${SLATE};margin-top:6px;">${data.billsCount} ${data.billsCount === 1 ? 'bill' : 'bills'} · Revenue ${formatINR(data.revenue)}</p>
      </div>
      <div style="font-size:56px;">${data.netProfit >= 0 ? '📈' : '📉'}</div>
    </div>
  </div>

  <!-- Target Progress (if any) -->
  ${targetBar}

  <!-- 4 Stat Cards -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
    ${statCard('🧾', 'Total Bills', String(data.billsCount), BRAND)}
    ${statCard('💰', 'Revenue (Sales)', formatINR(data.revenue), SUCCESS)}
    ${statCard('📈', 'Gross Profit', formatINR(data.grossProfit), data.grossProfit >= 0 ? SUCCESS : DANGER, 'Sales − cost')}
    ${statCard('💵', 'Payments Received', formatINR(data.received), INFO, 'From customer dues')}
  </div>

  <!-- Detail Table -->
  <div style="background:white;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,0.04);margin-bottom:20px;">
    <div style="background:${SLATE_LIGHT};padding:12px 16px;border-bottom:1px solid #e2e8f0;">
      <h3 style="font-size:13px;font-weight:700;color:${SLATE_DARK};letter-spacing:0.5px;text-transform:uppercase;">Full Breakdown</h3>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      <tbody>
        ${row('Total Bills', String(data.billsCount))}
        ${row('Revenue (Sales)', formatINR(data.revenue), SUCCESS)}
        ${row('Gross Profit', formatINR(data.grossProfit), data.grossProfit >= 0 ? SUCCESS : DANGER, 'Sales − purchase cost')}
        ${row('Operating Expenses', formatINR(data.expenseTotal), WARNING)}
        ${row('Net Profit', formatINR(data.netProfit), data.netProfit >= 0 ? SUCCESS : DANGER)}
        ${row('Payments Received', formatINR(data.received), INFO, 'From customer dues')}
        ${data.creditGiven > 0 ? row('Credit Given Today (Udhaar)', formatINR(data.creditGiven), DANGER) : ''}
        ${data.topProduct ? row(`⭐ Top Product: ${data.topProduct.name}`, `${data.topProduct.quantity} sold · ${formatINR(data.topProduct.revenue)}`, BRAND) : ''}
      </tbody>
    </table>
  </div>

  <!-- Footer -->
  <div style="border-top:2px solid #e2e8f0;padding-top:16px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <p style="font-size:12px;color:${SLATE};font-weight:500;">${shop} · Daily Closing Report</p>
      <p style="font-size:11px;color:#94a3b8;margin-top:2px;">Generated on ${new Date().toLocaleString('en-IN')}</p>
    </div>
    <div style="background:${BRAND};color:white;border-radius:8px;padding:6px 14px;font-size:11px;font-weight:600;">
      CONFIDENTIAL
    </div>
  </div>

</div>
</body>
</html>`;
};

export const generateClosingReportPDF = async (data, settings) => {
  // 1. Create hidden iframe container
  const container = document.createElement('div');
  container.style.cssText = [
    'position:fixed',
    'top:-9999px',
    'left:-9999px',
    'width:700px',
    'background:#f8fafc',
    'z-index:-1',
  ].join(';');
  container.innerHTML = buildReportHTML(data, settings);
  document.body.appendChild(container);

  const reportEl = container.querySelector('#report');

  try {
    const canvas = await html2canvas(reportEl, {
      scale: 2,           // retina quality
      useCORS: true,
      logging: false,
      backgroundColor: '#f8fafc',
      allowTaint: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.97);
    const imgW = canvas.width / 2;   // actual CSS px width
    const imgH = canvas.height / 2;

    // A4: 210 × 297 mm. jsPDF default unit = mm.
    const pdfW = 210;
    const pdfH = (imgH * pdfW) / imgW;   // keep aspect ratio

    const pdf = new jsPDF({
      orientation: pdfH > pdfW ? 'portrait' : 'landscape',
      unit: 'mm',
      format: [pdfW, pdfH],
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);

    // Trigger download
    const shop = (settings?.companyName || 'Raza-Traders').replace(/\s+/g, '-');
    const dateStr = new Date().toISOString().slice(0, 10);
    pdf.save(`${shop}-Closing-Report-${dateStr}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
};
