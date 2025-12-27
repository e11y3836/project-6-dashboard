// ============================================
// AUTHENTICATION STORE (Complete Solution)
// ============================================
// Global state management for user authentication
// This store tracks the current user's login status across the entire app

import { writable } from 'svelte/store';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// ==================== CREATE AUTH STORE ====================
/**
 * Creates a custom Svelte store for authentication state
 *
 * Store structure:
 * - user: Firebase user object (null if not logged in)
 * - loading: Boolean indicating if auth state is being determined
 * - isLoggedIn: Convenience boolean for quick auth checks
 */
function createAuthStore() {
  const { subscribe, set, update } = writable({
    user: null,
    loading: true,  // Start with loading=true until we know auth state
    isLoggedIn: false
  });

  return {
    subscribe,

    /**
     * Updates store when user logs in
     * @param {Object} user - Firebase user object
     */
    setUser: (user) => {
      set({
        user: user,
        loading: false,
        isLoggedIn: !!user  // Convert user to boolean (null -> false, object -> true)
      });
    },

    /**
     * Clears store when user logs out
     */
    clearUser: () => {
      set({
        user: null,
        loading: false,
        isLoggedIn: false
      });
    }
  };
}

// Create the store instance
const authStore = createAuthStore();

// ==================== FIREBASE AUTH LISTENER ====================
/**
 * Firebase automatically monitors authentication state changes
 * This listener will trigger whenever:
 * - User logs in
 * - User logs out
 * - Page refreshes (Firebase checks if session is still valid)
 * - User's session expires
 *
 * Only set up listener if Firebase is configured
 */
if (auth) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      console.log('User authenticated:', user.email);
      authStore.setUser(user);
    } else {
      // User is signed out
      console.log('User signed out');
      authStore.clearUser();
    }
  });
} else {
  // Firebase not configured - set demo mode
  console.warn('🔒 Auth store running in demo mode (Firebase not configured)');
  authStore.clearUser();
}

// ==================== EXPORT ====================
export default authStore;

// ==================== USAGE EXAMPLES ====================
//
// In any Svelte component:
//
// 1. Import the store:
//    import authStore from '../stores/authStore';
//
// 2. Access the store value using $ prefix:
//    {#if $authStore.isLoggedIn}
//      <p>Welcome, {$authStore.user.email}!</p>
//    {:else}
//      <p>Please log in</p>
//    {/if}
//
// 3. Show loading state while checking auth:
//    {#if $authStore.loading}
//      <p>Checking authentication...</p>
//    {:else if $authStore.isLoggedIn}
//      <p>You are logged in</p>
//    {:else}
//      <p>You are not logged in</p>
//    {/if}
