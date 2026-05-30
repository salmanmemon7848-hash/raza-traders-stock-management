// Supabase Cloud Sync Service
// (File is named "firebaseService.js" for historical reasons — implementation is Supabase.)
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DATA_TABLE = 'app_data';
const USER_ID = 'single_user';

const EMPTY_DATASET = {
  products: [],
  customers: [],
  invoices: [],
  expenses: [],
  payments: [],
  productRequests: [],
  settings: {},
};

export const saveDataToCloud = async (data) => {
  const { data: existing } = await supabase
    .from(DATA_TABLE)
    .select('id')
    .eq('user_id', USER_ID)
    .maybeSingle();

  const payload = { data, lastUpdated: new Date().toISOString() };

  if (existing) {
    const { error } = await supabase
      .from(DATA_TABLE)
      .update(payload)
      .eq('user_id', USER_ID);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from(DATA_TABLE)
      .insert([{ user_id: USER_ID, ...payload }]);
    if (error) throw error;
  }
};

export const getDataFromCloud = async () => {
  const { data, error } = await supabase
    .from(DATA_TABLE)
    .select('data')
    .eq('user_id', USER_ID)
    .maybeSingle();

  if (error || !data) return null;
  return data.data;
};

export const subscribeToDataChanges = (callback) => {
  const channel = supabase
    .channel('raza-traders-data-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: DATA_TABLE,
        filter: `user_id=eq.${USER_ID}`,
      },
      (payload) => {
        if (payload.new && payload.new.data) callback(payload.new.data);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};

// Wipe all cloud data (used by Settings → Danger Zone)
export const clearCloudData = async () => {
  await saveDataToCloud(EMPTY_DATASET);
};

export default supabase;
