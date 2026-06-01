// Supabase Configuration
// Uses env vars if available (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
// Falls back to the hardcoded project credentials for local dev

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://dqbbeuwrajnhyjrfmfzi.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxYmJldXdyYWpuaHlqcmZtZnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzE0NTIsImV4cCI6MjA5MDcwNzQ1Mn0._TXGsGIAYETSaKqLlFcMr8E6YPvsn-oHJ95ORFp5kSY';
