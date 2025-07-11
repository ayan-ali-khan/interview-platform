import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTZWVCQvG9xSzVhuw-wKBp6Aaf0_WLJMk",
  authDomain: "prepwise-interwiev-platform.firebaseapp.com",
  projectId: "prepwise-interwiev-platform",
  storageBucket: "prepwise-interwiev-platform.firebasestorage.app",
  messagingSenderId: "150716196363",
  appId: "1:150716196363:web:220c86fc3cb22a7c50090e",
  measurementId: "G-Y83RQVG8ME"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);