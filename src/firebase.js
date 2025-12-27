// ============================================
// FIREBASE CONFIGURATION (Complete Solution)
// ============================================
// FOR TEACHERS: Configure Firebase using .env file
// Copy .env.example to .env and add your project credentials

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ==================== FIREBASE CONFIG ====================
// Using environment variables for secure configuration
// See .env.example for setup instructions

/**
 * Firebase configuration object
 * All values are loaded from environment variables (VITE_FIREBASE_*)
 *
 * SETUP INSTRUCTIONS:
 * 1. Copy .env.example to .env in the project root
 * 2. Get your Firebase config from: https://console.firebase.google.com/
 *    - Go to Project Settings → General → Your apps
 *    - Copy each value to your .env file
 * 3. The app will automatically use your environment variables
 *
 * Why use .env?
 * - Keeps credentials secure (never commit .env to git)
 * - Easy to switch between projects
 * - Professional best practice
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// ==================== INITIALIZATION ====================

/**
 * Initialize Firebase with graceful degradation
 * If credentials are missing, export null to allow app to run in demo mode
 * This is important for template solutions and development
 */
let app = null;
let auth = null;
let db = null;

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

    console.log('✅ Firebase initialized successfully');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.warn('App will continue in demo mode without Firebase');
}

// Export services (will be null if Firebase not configured)
export { auth, db };

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
