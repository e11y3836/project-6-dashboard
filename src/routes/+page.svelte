<script>
  // ============================================
  // MAIN DASHBOARD PAGE (Complete Solution)
  // ============================================
  // Central hub displaying user stats, activities, and quick actions
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { collection, query, where, getDocs } from 'firebase/firestore';
  import { db } from '../firebase';
  import authStore from '../stores/authStore';

  // Import dashboard components
  import Navbar from '$lib/Navbar.svelte';
  import DashboardCard from '$lib/DashboardCard.svelte';
  import ActivityFeed from '$lib/ActivityFeed.svelte';
  import QuickActions from '$lib/QuickActions.svelte';

  // ==================== COMPONENT STATE ====================
  /**
   * Dashboard statistics object
   * - totalActivities: Count of all user activities
   * - thisMonth: Activities created this month
   * - completedTasks: Completed tasks (calculated from activities)
   * - activeProjects: Active project count (mock data for now)
   */
  let stats = {
    totalActivities: 0,
    thisMonth: 0,
    completedTasks: 0,
    activeProjects: 3
  };

  let loading = true;
  let error = '';

  // ==================== AUTHENTICATION GUARD ====================
  /**
   * Redirect to login if user is not authenticated
   * This subscription watches authStore for changes
   */
  const sub = authStore.subscribe(async (info) => {
    if (!info.isLoggedIn && info.firebaseControlled) {
      await goto('/login');
    }
  });

  // ==================== LOAD DASHBOARD DATA ====================
  /**
   * Fetches dashboard statistics from Firestore
   * - Queries all activities for current user
   * - Calculates monthly activity count
   * - Computes completed tasks percentage
   */
  async function loadDashboardData() {
    try {
      // Query all user activities
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', '==', $authStore.user.uid)
      );

      const activitiesSnapshot = await getDocs(activitiesQuery);

      // Update total count
      stats.totalActivities = activitiesSnapshot.size;

      // Calculate this month's activities
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      stats.thisMonth = activitiesSnapshot.docs.filter(doc => {
        const timestamp = doc.data().timestamp?.toDate();
        return timestamp && timestamp >= thisMonth;
      }).length;

      // Mock completed tasks calculation (70% of total)
      stats.completedTasks = Math.floor(stats.totalActivities * 0.7);

      console.log('Dashboard data loaded:', stats);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      error = 'Failed to load dashboard data. Please refresh the page.';
    }
  }

  // ==================== LIFECYCLE HOOKS ====================
  /**
   * Load data when component mounts
   * Only if user is authenticated
   */
  onMount(async () => {
    if ($authStore.user) {
      await loadDashboardData();
    }
    loading = false;
  });

  /**
   * Clean up subscription when component unmounts
   * Prevents memory leaks
   */
  onDestroy(() => {
    sub();
  });
</script>

<!-- ==================== HEAD SECTION ==================== -->
<svelte:head>
  <title>My Dashboard</title>
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
    rel="stylesheet"
  />
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css"
    rel="stylesheet"
  />
</svelte:head>

<!-- ==================== NAVBAR ==================== -->
<Navbar />

<!-- ==================== MAIN CONTENT ==================== -->
<main class="container-fluid py-4">
  {#if loading}
    <!-- Loading state -->
    <div class="d-flex justify-content-center align-items-center loading-container">
      <div class="text-center">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading dashboard...</span>
        </div>
        <p class="text-muted mt-3">Loading your dashboard...</p>
      </div>
    </div>
  {:else}
    <!-- Welcome Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="welcome-card bg-gradient text-white rounded-3 p-4 shadow">
          <h1 class="display-6 fw-bold mb-2">
            Welcome back, {$authStore.user?.email?.split('@')[0] || 'User'}! 👋
          </h1>
          <p class="lead mb-0">Here's what's happening with your projects today.</p>
        </div>
      </div>
    </div>

    <!-- Error Alert (if any) -->
    {#if error}
      <div class="row mb-4">
        <div class="col-12">
          <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {error}
            <button type="button" class="btn-close" on:click={() => error = ''}></button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stats Cards Row -->
    <div class="row g-4 mb-4">
      <!-- Total Activities Card -->
      <div class="col-md-3 col-sm-6">
        <DashboardCard
          title="Total Activities"
          value={stats.totalActivities.toString()}
          icon="activity"
          color="primary"
          trend={{ direction: 'up', percentage: 12 }}
        />
      </div>

      <!-- This Month Card -->
      <div class="col-md-3 col-sm-6">
        <DashboardCard
          title="This Month"
          value={stats.thisMonth.toString()}
          icon="calendar-month"
          color="success"
          trend={{ direction: 'up', percentage: 8 }}
        />
      </div>

      <!-- Completed Tasks Card -->
      <div class="col-md-3 col-sm-6">
        <DashboardCard
          title="Completed Tasks"
          value={stats.completedTasks.toString()}
          icon="check-circle"
          color="info"
          trend={{ direction: 'down', percentage: 3 }}
        />
      </div>

      <!-- Active Projects Card -->
      <div class="col-md-3 col-sm-6">
        <DashboardCard
          title="Active Projects"
          value={stats.activeProjects.toString()}
          icon="folder"
          color="warning"
        />
      </div>
    </div>

    <!-- Main Content Row: Activity Feed + Quick Actions -->
    <div class="row g-4 mb-4">
      <!-- Activity Feed (2/3 width on large screens) -->
      <div class="col-lg-8 col-md-7">
        <ActivityFeed />
      </div>

      <!-- Quick Actions (1/3 width on large screens) -->
      <div class="col-lg-4 col-md-5">
        <QuickActions />
      </div>
    </div>

    <!-- Additional Charts Section (Future Enhancement) -->
    <div class="row g-4">
      <div class="col-12">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-transparent">
            <h5 class="card-title mb-0">
              <i class="bi bi-graph-up me-2"></i>
              Performance Overview
            </h5>
          </div>
          <div class="card-body">
            <div class="text-center py-5 placeholder-section">
              <i class="bi bi-bar-chart fs-1 text-muted"></i>
              <p class="text-muted mt-3 mb-1">Charts and analytics coming soon...</p>
              <small class="text-muted">We're working on advanced visualizations for you</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</main>

<!-- ==================== STYLES ==================== -->
<style>
  /* Background gradient for welcome card */
  .bg-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  /* Welcome card styling */
  .welcome-card {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
  }

  .welcome-card:hover {
    transform: translateY(-2px);
  }

  /* Card hover effect */
  .card {
    transition: transform 0.2s ease-in-out;
  }

  .card:hover {
    transform: translateY(-2px);
  }

  /* Main container styling */
  main {
    background-color: #f8f9fa;
    min-height: calc(100vh - 76px);
  }

  /* Loading container */
  .loading-container {
    height: 60vh;
  }

  /* Placeholder section */
  .placeholder-section {
    padding: 3rem 2rem;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .display-6 {
      font-size: 1.5rem;
    }

    .lead {
      font-size: 1rem;
    }

    .welcome-card {
      padding: 1.5rem !important;
    }
  }
</style>
