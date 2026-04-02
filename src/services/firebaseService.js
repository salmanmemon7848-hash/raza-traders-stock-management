// Firebase Service for Real-time Data Sync
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import firebaseConfig from '../config/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DATA_COLLECTION = 'razaTradersData';
const USER_ID = 'single_user'; // For now, using single user

// Save data to Firestore
export const saveDataToCloud = async (data) => {
  try {
    await setDoc(doc(db, DATA_COLLECTION, USER_ID), {
      ...data,
      lastUpdated: new Date().toISOString()
    });
    console.log('Data saved to cloud successfully');
  } catch (error) {
    console.error('Error saving data to cloud:', error);
    throw error;
  }
};

// Get data from Firestore
export const getDataFromCloud = async () => {
  try {
    const docRef = doc(db, DATA_COLLECTION, USER_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting data from cloud:', error);
    throw error;
  }
};

// Subscribe to real-time updates
export const subscribeToDataChanges = (callback) => {
  const unsubscribe = onSnapshot(
    doc(db, DATA_COLLECTION, USER_ID),
    (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    },
    (error) => {
      console.error('Error listening to data changes:', error);
    }
  );
  
  return unsubscribe;
};

// Update specific field in cloud
export const updateDataInCloud = async (field, value) => {
  try {
    const docRef = doc(db, DATA_COLLECTION, USER_ID);
    await updateDoc(docRef, {
      [field]: value,
      lastUpdated: new Date().toISOString()
    });
    console.log(`Field ${field} updated in cloud`);
  } catch (error) {
    console.error('Error updating data in cloud:', error);
    throw error;
  }
};

export default db;
