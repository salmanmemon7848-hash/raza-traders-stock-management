// Supabase Configuration
// IMPORTANT: Replace these with your actual Supabase credentials!
// 
// HOW TO GET YOUR CREDENTIALS:
// 1. Go to https://supabase.com/
// 2. Sign up / Login
// 3. Create new project (name it "raza-traders")
// 4. Go to Settings → API
// 5. Copy your Project URL and anon/public key
// 6. Paste them below

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.");
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };

// QUICK SETUP GUIDE:
// After getting your credentials:
// 1. Run: npm install @supabase/supabase-js
// 2. Create database tables (see DATABASE_SETUP.md)
// 3. Deploy: git push origin main
// 4. Your data will sync across all devices automatically!
