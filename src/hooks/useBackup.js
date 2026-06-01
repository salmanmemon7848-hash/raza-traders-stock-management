import { useAppContext } from '../contexts/AppContext';
import { saveDataToCloud, clearCloudData } from '../services/firebaseService';

export const useBackup = () => {
  const { dispatch, success, error,
    products, customers, invoices, expenses, payments, productRequests, settings,
  } = useAppContext();

  const exportBackup = () => {
    try {
      const backup = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        data: { products, customers, invoices, expenses, payments, productRequests, settings },
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `raza-traders-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      success('Backup downloaded');
    } catch (err) {
      console.error(err);
      error('Failed to export backup');
    }
  };

  const importBackup = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          const data = parsed.data || parsed;
          dispatch({ type: 'LOAD_DATA', payload: data });
          await saveDataToCloud(data);
          success('Backup restored');
          resolve(true);
        } catch (err) {
          console.error(err);
          error('Invalid backup file');
          resolve(false);
        }
      };
      reader.readAsText(file);
    });

  const clearAllData = async () => {
    try {
      await clearCloudData();
      dispatch({ type: 'RESET_DATA' });
      localStorage.removeItem('razaTradersData');
      success('All data cleared');
    } catch (err) {
      console.error(err);
      error('Failed to clear data');
    }
  };

  return { exportBackup, importBackup, clearAllData };
};
