// ============================================
// FIREBASE CONFIGURATION (Complete Solution)
// ============================================
// FOR TEACHERS: Configure Firebase using .env file
// Copy .env.example to .env and add your project credentials

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// ==================== FIREBASE CONFIG ====================
// Using environment variables for secure configuration
// See .env.example for setup instructions

/**
 * Firebase configuration object
 * All values are loaded from environment variables (VITE_FIREBASE_*)
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// ==================== INITIALIZATION ====================

/**
 * Initialize Firebase with graceful degradation
 * If credentials are missing, export null to allow app to run in demo mode
 */
let app = null;
let auth = null;
let db = null;
let analytics = null;

try {
  // Check if Firebase is configured
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
    console.warn(
      '⚠️ Firebase not configured! The app will run in demo mode.\n' +
      'To enable Firebase:\n' +
      '1. Copy .env.example to .env\n' +
      '2. Add your Firebase credentials from console.firebase.google.com\n' +
      '3. Restart the dev server'
    );
  } else {
    // Initialize Firebase App
    app = initializeApp(firebaseConfig);

    // Initialize Firebase Authentication
    auth = getAuth(app);

    // Initialize Cloud Firestore Database
    db = getFirestore(app);

    // Initialize Analytics if supported (browser environments)
    isSupported().then(supported => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('✅ Firebase Analytics initialized');
      }
    });

    console.log('✅ Firebase initialized successfully');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.warn('App will continue in demo mode without Firebase');
}

// Export services (will be null if Firebase not configured)
export { auth, db, analytics };

// ==================== USAGE EXAMPLES ====================
//
// Authentication:
// import { auth } from './firebase';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// await signInWithEmailAndPassword(auth, email, password);
//
// Firestore:
// import { db } from './firebase';
// import { collection, addDoc } from 'firebase/firestore';
// await addDoc(collection(db, 'activities'), { title: 'New Activity', timestamp: new Date() });
