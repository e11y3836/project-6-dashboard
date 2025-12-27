<script>
  // ============================================
  // NAVIGATION BAR COMPONENT (Complete Solution)
  // ============================================
  // Provides site-wide navigation with user authentication status
  import { signOut } from 'firebase/auth';
  import { auth } from '../firebase';
  import authStore from '../stores/authStore';
  import { goto } from '$app/navigation';

  // ==================== LOGOUT FUNCTION ====================
  /**
   * Handles user logout
   * - Calls Firebase signOut
   * - Resets auth store state
   * - Redirects to login page
   */
  async function logout() {
    try {
      await signOut(auth);

      // Reset auth store (Firebase listener will also update this)
      $authStore.isLoggedIn = false;
      $authStore.firebaseControlled = false;
      $authStore.user = null;

      // Redirect to login
      await goto('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
</script>

<!-- ==================== NAVIGATION BAR ==================== -->
<!-- Bootstrap 5 responsive navbar with brand, links, and user menu -->
<nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
  <div class="container">
    <!-- Brand / Logo -->
    <a class="navbar-brand fw-bold" href="/">
      <i class="bi bi-speedometer2 me-2"></i>
      My Dashboard
    </a>

    <!-- Mobile menu toggle button -->
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Collapsible navbar content -->
    <div class="collapse navbar-collapse" id="navbarNav">
      <!-- Main navigation links -->
      <ul class="navbar-nav me-auto">
        <li class="nav-item">
          <a class="nav-link active" href="/">
            <i class="bi bi-house me-1"></i>
            Dashboard
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/analytics">
            <i class="bi bi-graph-up me-1"></i>
            Analytics
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/profile">
            <i class="bi bi-person me-1"></i>
            Profile
          </a>
        </li>
      </ul>

      <!-- User menu dropdown -->
      <div class="navbar-nav">
        <div class="nav-item dropdown">
          <button
            class="nav-link dropdown-toggle bg-transparent border-0"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="bi bi-person-circle me-1"></i>
            {$authStore.user?.email || 'User'}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a class="dropdown-item" href="/profile">
                <i class="bi bi-person me-2"></i>
                Profile Settings
              </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <button class="dropdown-item text-danger" on:click={logout}>
                <i class="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</nav>

<style>
  .navbar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  }

  .nav-link {
    transition: opacity 0.2s;
  }

  .nav-link:hover {
    opacity: 0.8;
  }

  .dropdown-item {
    cursor: pointer;
  }
</style>
