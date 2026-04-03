// Supabase Service for Real-time Data Sync
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DATA_TABLE = 'app_data';
const USER_ID = 'single_user'; // For single user setup

// Save data to Supabase
export const saveDataToCloud = async (data) => {
  try {
    // Check if data exists for this user
    const { data: existingData } = await supabase
      .from(DATA_TABLE)
      .select('id')
      .eq('user_id', USER_ID)
      .single();

    if (existingData) {
      // Update existing data
      const { error } = await supabase
        .from(DATA_TABLE)
        .update({
          data: data,
          lastUpdated: new Date().toISOString()
        })
        .eq('user_id', USER_ID);
      
      if (error) throw error;
    } else {
      // Insert new data
      const { error } = await supabase
        .from(DATA_TABLE)
        .insert([{
          user_id: USER_ID,
          data: data,
          lastUpdated: new Date().toISOString()
        }]);
      
      if (error) throw error;
    }
    
    console.log('Data saved to Supabase successfully');
  } catch (error) {
    console.error('Error saving data to Supabase:', error);
    throw error;
  }
};

// Get data from Supabase
export const getDataFromCloud = async () => {
  try {
    const { data, error } = await supabase
      .from(DATA_TABLE)
      .select('data')
      .eq('user_id', USER_ID)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data.data;
  } catch (error) {
    console.error('Error getting data from Supabase:', error);
    throw error;
  }
};

// Subscribe to real-time updates
export const subscribeToDataChanges = (callback) => {
  const channel = supabase
    .channel('raza-traders-data-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: DATA_TABLE,
        filter: `user_id=eq.${USER_ID}`
      },
      (payload) => {
        console.log('Real-time update from Supabase:', payload);
        if (payload.new && payload.new.data) {
          callback(payload.new.data);
        }
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
};

// Update specific field in cloud
export const updateDataInCloud = async (field, value) => {
  try {
    const currentData = await getDataFromCloud();
    const updatedData = {
      ...currentData,
      [field]: value,
      lastUpdated: new Date().toISOString()
    };
    
    await saveDataToCloud(updatedData);
    console.log(`Field ${field} updated in Supabase`);
  } catch (error) {
    console.error('Error updating data in Supabase:', error);
    throw error;
  }
};

export default supabase;
