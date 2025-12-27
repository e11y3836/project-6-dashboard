<script>
  // ============================================
  // ROOT LAYOUT WITH AUTH GUARD (Complete Solution)
  // ============================================
  // Central layout that manages authentication state and route protection
  import { onMount } from 'svelte';
  import { auth } from '../firebase';
  import authStore from '../stores/authStore';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  // ==================== CURRENT PATH TRACKING ====================
  /**
   * Subscribe to page store to track current route
   * Used for conditional redirects based on route
   */
  let currentPath = '/';

  // Only subscribe to page changes in browser
  if (browser) {
    page.subscribe((p) => {
      currentPath = p.url.pathname;
    });
  }

  // ==================== AUTH GUARD ====================
  /**
   * Watch auth store and handle redirects
   * The authStore in authStore.js already has the Firebase listener
   * We just react to changes and handle navigation
   */
  $: if (browser && !$authStore.loading) {
    // Only run redirects in browser after auth state is determined
    if ($authStore.isLoggedIn) {
      // User is logged in - redirect away from auth pages
      if (currentPath === '/login' || currentPath === '/signup') {
        console.log('✅ Redirecting to dashboard (already authenticated)');
        goto('/');
      }
    } else {
      // User is NOT logged in - protect routes
      if (currentPath === '/' || currentPath === '/profile' || currentPath === '/analytics') {
        console.log('🔒 Redirecting to login (not authenticated)');
        goto('/login');
      }
    }
  }
</script>

<!-- ==================== LAYOUT SLOT ==================== -->
<!-- All page content will be rendered here -->
<main>
  <slot />
</main>

<!-- ==================== GLOBAL STYLES ==================== -->
<style>
  /* Reset default margins and padding */
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  /* Main layout container */
  main {
    width: 100%;
    min-height: 100vh;
  }

  /* Smooth transitions for route changes */
  :global(main) {
    transition: opacity 0.2s ease-in-out;
  }
</style>
