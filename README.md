# 🏪 Raza Traders Business Management App

A complete, production-ready business management solution built with React + Vite + Tailwind CSS.

**🌐 Live Demo:** [Deploy on Vercel](https://vercel.com)

---

## ✨ Features

### 📊 Core Business Features

- **Dashboard Analytics** - Real-time business insights with visual charts
- **Stock Management** - Add, edit, delete products with dual pricing (Purchase + Selling Price)
- **Advanced Billing System** - Generate invoices with 3 payment options:
  - ✅ Paid (Full Payment)
  - 💸 Full Credit/Udhaar (Unpaid)
  - 💸 Partial Credit/Udhaar (Split Payment)
- **Customer Management** - Track customer details and purchase history
- **Smart Reports** - 5 report types with PDF export:
  - Stock Report
  - Customer Report
  - Billing History Report
  - Credit/Udhaar Report (NEW!)
  - Profit Report (NEW!)
- **Settings** - Configure GST, shop information

### 🔥 Advanced Features

#### 💰 Credit/Udhaar System
- Track pending payments per customer
- Customer-wise credit breakdown
- Auto-calculation of paid vs credit amounts
- Visual alerts for pending payments

#### 📈 Profit Tracking
- Real-time profit calculation (Selling Price - Purchase Price)
- Daily profit metrics
- Total profit analytics
- Product-wise profitability analysis

#### 🔔 Smart Alerts
- ⚠️ Low stock warnings
- 💸 Pending payment alerts
- 📉 Dead stock identification

#### 📱 Fully Responsive Design
- Mobile-first approach
- Tablet optimized
- Desktop friendly
- Touch-friendly buttons

---

## 🛠️ Tech Stack

- **Frontend:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Context API + useReducer
- **PDF Generation:** jsPDF + jspdf-autotable
- **Icons:** Lucide React
- **Deployment:** Vercel

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/salmanmemon7848-hash/raza-traders-stock-management.git

# Navigate to project
cd raza-traders-stock-management

# Install dependencies
npm install

# Start development server
npm run dev
```

App will be available at `http://localhost:3000`

---

## 📦 Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

Output will be in `dist/` folder

---

## 🌐 Deploy to Vercel

### Method 1: GitHub Integration (Easiest)

1. Push code to GitHub (already done!)
2. Visit https://vercel.com
3. Login with GitHub
4. Import your repository
5. Click "Deploy"
6. Done! Your app is live

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Detailed deployment guide:** See `DEPLOYMENT_GUIDE.md`

---

## 📁 Project Structure

```
src/
├── components/
│   ├── billing/          # BillingSystem.jsx (Credit system)
│   ├── dashboard/        # Dashboard components
│   ├── reports/          # Reports.jsx (5 report types)
│   ├── stock/            # Product management
│   ├── customers/        # Customer management
│   ├── layout/           # Sidebar, Header
│   └── common/           # Reusable UI components
├── contexts/             # AppContext + reducer
├── hooks/                # Custom hooks
├── utils/                # Calculations, PDF generator
├── data/                 # Initial data
└── main.jsx              # App entry point
```

---

## 🎯 Key Features Explained

### Partial Credit Payment Example

**Scenario:** Customer buys goods worth ₹10,000 but wants to pay ₹6,000 now and ₹4,000 later.

1. Select **"Partial Credit (Udhaar)"** option
2. Enter Credit Amount: `4000`
3. System auto-calculates:
   ```
   Total Bill:     ₹10,000
   Credit Amount:  ₹4,000
   ──────────────────────
   Paid Amount:    ₹6,000 ✅
   ```
4. Generate invoice
5. Track remaining ₹4,000 in Credit Report

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint code |

---

## 📊 Data Storage

- **Current:** LocalStorage (browser-based)
- **Data persists** across sessions
- **Per-device** storage (not synced)
- **No backend** required

### Future Enhancement Ideas:
- Add Firebase/Supabase backend
- User authentication
- Cloud sync across devices
- Multi-user support

---

## 🎨 Customization

### Change Shop Name
Edit `src/components/layout/Header.jsx`:
```jsx
<h1>Your Shop Name</h1>
```

### Change Theme Colors
Edit `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color',
      }
    }
  }
}
```

### Add More Categories
Edit `src/components/stock/ProductForm.jsx`:
```jsx
const categories = ['Your Category 1', 'Your Category 2', ...];
```

---

## 🐛 Known Limitations

- ❌ No user authentication (single user)
- ❌ Data stored locally (not backed up)
- ❌ No multi-device sync
- ❌ No inventory forecasting

These can be added with backend integration!

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📞 Support

- **GitHub Issues:** For bug reports and feature requests
- **Email:** salmanmemon7848-hash (GitHub username)
- **Documentation:** See `DEPLOYMENT_GUIDE.md`

---

## 🙏 Acknowledgments

Built with modern web technologies for small business owners.

Made with ❤️ for Raza Traders

---

## 📈 Recent Updates

### Version 1.0.0 (Latest) - April 2026

**New Features:**
- ✅ Advanced Credit/Udhaar System with Partial Credit
- ✅ Profit Tracking with daily/total metrics
- ✅ Customer-wise credit breakdown
- ✅ Enhanced Credit Report
- ✅ Profit Report with product analytics
- ✅ Smart alerts (low stock, pending payments)
- ✅ Full mobile responsive design
- ✅ PDF export for all reports

**Improvements:**
- Better validation and error handling
- Cleaner UI with visual feedback
- Optimized performance
- Production-ready code

---

**Last Updated:** April 1, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
