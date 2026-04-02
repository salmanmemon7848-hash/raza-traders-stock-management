// Supabase Client Service
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// 📦 PRODUCTS - CRUD Operations
// ========================================

export const fetchProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const saveProduct = async (product) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
};

export const updateProduct = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// ========================================
// 👥 CUSTOMERS - CRUD Operations
// ========================================

export const fetchCustomers = async () => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const saveCustomer = async (customer) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error saving customer:', error);
    throw error;
  }
};

export const updateCustomer = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// ========================================
// 📄 BILLS/INVOICES - CRUD Operations
// ========================================

export const fetchBills = async () => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching bills:', error);
    throw error;
  }
};

export const saveBill = async (bill) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .insert([bill])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error saving bill:', error);
    throw error;
  }
};

export const updateBill = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating bill:', error);
    throw error;
  }
};

export const deleteBill = async (id) => {
  try {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting bill:', error);
    throw error;
  }
};

// ========================================
// 💰 EXPENSES - CRUD Operations
// ========================================

export const fetchExpenses = async () => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const saveExpense = async (expense) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error saving expense:', error);
    throw error;
  }
};

export const updateExpense = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id) => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// ========================================
// 💳 CREDIT (UDHAAR) - CRUD Operations
// ========================================

export const fetchCreditRecords = async () => {
  try {
    const { data, error } = await supabase
      .from('credit')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching credit records:', error);
    throw error;
  }
};

export const saveCreditRecord = async (record) => {
  try {
    const { data, error } = await supabase
      .from('credit')
      .insert([record])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error saving credit record:', error);
    throw error;
  }
};

export const updateCreditRecord = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('credit')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating credit record:', error);
    throw error;
  }
};

export const deleteCreditRecord = async (id) => {
  try {
    const { error } = await supabase
      .from('credit')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting credit record:', error);
    throw error;
  }
};

// ========================================
// ⚙️ SETTINGS - CRUD Operations
// ========================================

export const fetchSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
};

export const saveSettings = async (settings) => {
  try {
    // Check if settings exist
    const existing = await fetchSettings();
    
    if (existing) {
      const { data, error } = await supabase
        .from('settings')
        .update(settings)
        .eq('id', existing.id)
        .select();
      
      if (error) throw error;
      return data[0];
    } else {
      const { data, error } = await supabase
        .from('settings')
        .insert([settings])
        .select();
      
      if (error) throw error;
      return data[0];
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export default supabase;
