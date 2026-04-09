import { useAppContext } from '../contexts/AppContext';
import { saveDataToCloud } from '../services/firebaseService';
import { initialState } from '../contexts/appReducer';

export const useBackup = () => {
  const { dispatch, success, error } = useAppContext();

  const exportBackup = () => {
    try {
      const data = localStorage.getItem('razaTradersData');
      if (!data) {
        return { success: false, error: 'No data to backup' };
      }

      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: JSON.parse(data)
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      success('Backup exported successfully');
      return { success: true };
    } catch (err) {
      console.error('Error exporting backup:', err);
      error('Failed to export backup');
      return { success: false, error: err.message };
    }
  };

  const importBackup = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const backup = JSON.parse(event.target.result);
          
          if (!backup.data || !backup.data.products || !backup.data.customers) {
            throw new Error('Invalid backup file format');
          }

          // Validate and restore data
          localStorage.setItem('razaTradersData', JSON.stringify(backup.data));
          
          // Reload the page to apply changes
          setTimeout(() => {
            window.location.reload();
          }, 1000);

          success('Backup restored successfully!');
          resolve({ success: true });
        } catch (err) {
          console.error('Error importing backup:', err);
          error('Invalid backup file');
          resolve({ success: false, error: err.message });
        }
      };
      
      reader.onerror = () => {
        error('Failed to read backup file');
        resolve({ success: false, error: 'Failed to read file' });
      };

      reader.readAsText(file);
    });
  };

  const clearAllData = async () => {
    if (window.confirm('⚠️ Are you sure you want to delete ALL data? This CANNOT be undone!\n\nThis will delete:\n- All products\n- All customers\n- All invoices\n- All expenses\n- All settings')) {
      if (window.confirm('⚠️ FINAL WARNING: This action is PERMANENT! Click OK to confirm deletion.')) {
        try {
          // Clear localStorage immediately
          localStorage.removeItem('razaTradersData');
          localStorage.setItem('dataCleared', 'true');
          
          // Clear cloud data to prevent sync from restoring old data
          await saveDataToCloud({
            products: [],
            customers: [],
            invoices: [],
            expenses: [],
            settings: initialState.settings
          });
          
          success('✅ All data cleared successfully!');
          
          // Reload page after delay to show clean state
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          
          return { success: true };
        } catch (err) {
          console.error('Error clearing data:', err);
          error('Failed to clear data');
          return { success: false, error: err.message };
        }
      }
    }
    return { success: false, error: 'Operation cancelled' };
  };

  return {
    exportBackup,
    importBackup,
    clearAllData
  };
};
