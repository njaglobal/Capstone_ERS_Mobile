import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDZ68h01QeJszY9kCy0QrxK-dSa6Xs2FC4",
  authDomain: "ers-mobile-11c00.firebaseapp.com",
  projectId: "ers-mobile-11c00",
  storageBucket: "ers-mobile-11c00.firebasestorage.app",
  messagingSenderId: "437421585309",
  appId: "1:437421585309:web:0ed292bc9e757e9be6b574",
  measurementId: "G-MCJKXSNXNF"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
