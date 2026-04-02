-- ============================================
-- 🗄️ SUPABASE DATABASE SETUP SCRIPT
-- Raza Traders App - Complete Database Schema
-- ============================================
-- 
-- HOW TO RUN THIS:
-- 1. Go to your Supabase project dashboard
-- 2. Click "SQL Editor" in left sidebar
-- 3. Click "New query"
-- 4. Copy-paste this entire script
-- 5. Click "Run" button
-- 6. Done! All tables created! ✅
-- 
-- ============================================

-- ============================================
-- 1️⃣ PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  model_number VARCHAR(100),
  price NUMERIC(10, 2) NOT NULL,
  purchase_price NUMERIC(10, 2),
  quantity INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100),
  description TEXT,
  min_stock_level INTEGER DEFAULT 5,
  gst_rate NUMERIC(5, 2) DEFAULT 18,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- ============================================
-- 2️⃣ CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  gst_number VARCHAR(50),
  total_spent NUMERIC(12, 2) DEFAULT 0,
  credit_limit NUMERIC(12, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for customer lookups
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- ============================================
-- 3️⃣ BILLS/INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_address TEXT,
  items JSONB NOT NULL, -- Array of items with product details
  subtotal NUMERIC(12, 2) NOT NULL,
  gst_amount NUMERIC(12, 2) DEFAULT 0,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  grand_total NUMERIC(12, 2) NOT NULL,
  payment_mode VARCHAR(50) DEFAULT 'Cash',
  payment_status VARCHAR(50) DEFAULT 'Paid',
  amount_paid NUMERIC(12, 2),
  balance_due NUMERIC(12, 2) DEFAULT 0,
  notes TEXT,
  terms_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for bills
CREATE INDEX IF NOT EXISTS idx_bills_invoice_number ON bills(invoice_number);
CREATE INDEX IF NOT EXISTS idx_bills_customer_id ON bills(customer_id);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at DESC);

-- ============================================
-- 4️⃣ EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  payment_mode VARCHAR(50) DEFAULT 'Cash',
  bill_attached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for expenses
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);

-- ============================================
-- 5️⃣ CREDIT (UDHAAR) TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'given' or 'taken'
  description TEXT,
  date DATE NOT NULL,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, partial
  reference_type VARCHAR(50), -- 'invoice', 'direct', etc.
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for credit tracking
CREATE INDEX IF NOT EXISTS idx_credit_customer_id ON credit(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_status ON credit(status);
CREATE INDEX IF NOT EXISTS idx_credit_date ON credit(date DESC);

-- ============================================
-- 6️⃣ SETTINGS TABLE (Single row)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) DEFAULT 'Raza Traders',
  company_address TEXT,
  company_phone VARCHAR(20),
  company_email VARCHAR(255),
  gst_number VARCHAR(50),
  logo_url TEXT,
  invoice_prefix VARCHAR(10) DEFAULT 'INV-',
  currency_symbol VARCHAR(5) DEFAULT '₹',
  tax_label VARCHAR(20) DEFAULT 'GST',
  low_stock_threshold INTEGER DEFAULT 5,
  default_gst_rate NUMERIC(5, 2) DEFAULT 18,
  expense_categories JSONB DEFAULT '["Rent", "Electricity Bill", "Staff Salary", "Transport / Delivery", "Maintenance / Repair"]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (
  company_name, 
  company_address, 
  company_phone, 
  company_email, 
  gst_number,
  invoice_prefix,
  currency_symbol,
  tax_label,
  low_stock_threshold,
  default_gst_rate,
  expense_categories
) VALUES (
  'Raza Traders',
  '',
  '',
  '',
  '',
  'INV-',
  '₹',
  'GST',
  5,
  18,
  '["Rent", "Electricity Bill", "Staff Salary", "Transport / Delivery", "Maintenance / Repair"]'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7️⃣ TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_updated_at BEFORE UPDATE ON credit
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8️⃣ COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE products IS 'Product inventory for Raza Traders';
COMMENT ON TABLE customers IS 'Customer database with contact info and purchase history';
COMMENT ON TABLE bills IS 'Sales invoices and billing records';
COMMENT ON TABLE expenses IS 'Business expense tracking';
COMMENT ON TABLE credit IS 'Credit/Udhaar management system';
COMMENT ON TABLE settings IS 'Application configuration and company settings';

-- ============================================
-- ✅ SETUP COMPLETE!
-- ============================================
-- 
-- NEXT STEPS:
-- 1. ✅ Tables created successfully
-- 2. ✅ Indexes added for performance
-- 3. ✅ Triggers set up for auto-updates
-- 4. ⏳ Get your Supabase credentials
-- 5. ⏳ Update src/config/supabase.js
-- 6. ⏳ Run: npm install @supabase/supabase-js
-- 7. ⏳ Deploy to Vercel
-- 
-- YOUR DATA WILL NOW SYNC ACROSS ALL DEVICES! 🎉
-- ============================================
