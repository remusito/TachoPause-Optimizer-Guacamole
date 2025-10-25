import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Función para inicializar Firebase solo en cliente
export function getFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    throw new Error('Firebase solo debe inicializarse en el cliente');
  }
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  
  setPersistence(auth, browserLocalPersistence).catch(console.error);
  
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  const app = getFirebaseApp();
  return getFirestore(app);
}

// Exports para compatibilidad (solo funcionan en cliente)
export const app = typeof window !== 'undefined' ? getFirebaseApp() : null as any;
export const auth = typeof window !== 'undefined' ? getFirebaseAuth() : null as any;
export const db = typeof window !== 'undefined' ? getFirebaseFirestore() : null as any;