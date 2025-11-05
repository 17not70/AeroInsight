// app/firebase.config.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace this with your own config object from Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB24S1ZWP6QtH7033eEYGHGLPQMbWsMJOE",
    authDomain: "studio-9203015576-3fe67.firebaseapp.com",
    projectId: "studio-9203015576-3fe67",
    storageBucket: "studio-9203015576-3fe67.firebasestorage.app",
    messagingSenderId: "731555012217",
    appId: "1:731555012217:web:fafb41849eb639c391fea8"
  };
// Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Get Firebase services
const firestore = getFirestore(app);
const auth = getAuth(app);

// Export services
export { app, auth, firestore };