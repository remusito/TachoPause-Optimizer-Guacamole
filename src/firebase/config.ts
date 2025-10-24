import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVaDyb6BSQTGl1-WYn1nTRzwNk2YvNpPo",
  authDomain: "tachopause-optimizer.firebaseapp.com",
  projectId: "tachopause-optimizer",
  storageBucket: "tachopause-optimizer.firebasestorage.app",
  messagingSenderId: "603408014533",
  appId: "1:603408014533:web:16e27711d27dcbda0d64ac",
  measurementId: "G-SD46WRPTQP"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch(console.error);

export { app, auth, db };