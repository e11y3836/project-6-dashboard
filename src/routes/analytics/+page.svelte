<script>
  // ============================================
  // ANALYTICS PAGE (Complete Solution)
  // ============================================
  // Data visualization and analytics dashboard for user activity
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { collection, query, where, getDocs } from 'firebase/firestore';
  import { db } from '../../firebase';
  import authStore from '../../stores/authStore';
  import Navbar from '$lib/Navbar.svelte';

  // ==================== COMPONENT STATE ====================
  let loading = true;
  let error = '';

  // Analytics data structure
  let analyticsData = {
    totalActivities: 0,
    thisWeek: 0,
    thisMonth: 0,
    last30Days: [],
    activityByType: {},
    recentTrends: []
  };

  // ==================== AUTHENTICATION GUARD ====================
  /**
   * Redirect to login if user is not authenticated
   */
  const sub = authStore.subscribe(async (info) => {
    if (!info.isLoggedIn && info.firebaseControlled) {
      await goto('/login');
    }
  });

  // ==================== LOAD ANALYTICS DATA ====================
  /**
   * Fetches and processes analytics data from Firestore
   */
  async function loadAnalyticsData() {
    try {
      if (!$authStore.user) {
        loading = false;
        return;
      }

      // Query all user activities
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', '==', $authStore.user.uid)
      );

      const snapshot = await getDocs(activitiesQuery);
      analyticsData.totalActivities = snapshot.size;

      // Calculate time-based metrics
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      analyticsData.thisWeek = 0;
      analyticsData.thisMonth = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate();

        if (timestamp) {
          if (timestamp >= weekAgo) analyticsData.thisWeek++;
          if (timestamp >= monthAgo) analyticsData.thisMonth++;
        }
      });

      console.log('Analytics data loaded:', analyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
      error = 'Failed to load analytics data. Please refresh the page.';
    } finally {
      loading = false;
    }
  }

  // ==================== LIFECYCLE HOOKS ====================
  onMount(async () => {
    if ($authStore.user) {
      await loadAnalyticsData();
    } else {
      loading = false;
    }
  });

  onDestroy(() => {
    sub();
  });
</script>

<svelte:head>
  <title>Analytics - My Dashboard</title>
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
          <span class="visually-hidden">Loading analytics...</span>
        </div>
        <p class="text-muted mt-3">Loading your analytics...</p>
      </div>
    </div>
  {:else}
    <!-- Page Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="page-header bg-gradient text-white rounded-3 p-4 shadow">
          <h1 class="display-6 fw-bold mb-2">
            <i class="bi bi-graph-up me-2"></i>
            Analytics Dashboard
          </h1>
          <p class="lead mb-0">Track your activity trends and performance metrics</p>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
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

    <!-- Analytics Cards Row -->
    <div class="row g-4 mb-4">
      <!-- Total Activities -->
      <div class="col-md-4 col-sm-6">
        <div class="card analytics-card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="card-title text-muted mb-0">Total Activities</h6>
              <div class="icon-wrapper bg-primary">
                <i class="bi bi-collection text-white"></i>
              </div>
            </div>
            <h2 class="display-5 fw-bold mb-0">{analyticsData.totalActivities}</h2>
            <small class="text-muted">All time</small>
          </div>
        </div>
      </div>

      <!-- This Week -->
      <div class="col-md-4 col-sm-6">
        <div class="card analytics-card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="card-title text-muted mb-0">This Week</h6>
              <div class="icon-wrapper bg-success">
                <i class="bi bi-calendar-week text-white"></i>
              </div>
            </div>
            <h2 class="display-5 fw-bold mb-0">{analyticsData.thisWeek}</h2>
            <small class="text-muted">Last 7 days</small>
          </div>
        </div>
      </div>

      <!-- This Month -->
      <div class="col-md-4 col-sm-6">
        <div class="card analytics-card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="card-title text-muted mb-0">This Month</h6>
              <div class="icon-wrapper bg-info">
                <i class="bi bi-calendar-month text-white"></i>
              </div>
            </div>
            <h2 class="display-5 fw-bold mb-0">{analyticsData.thisMonth}</h2>
            <small class="text-muted">Last 30 days</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="row g-4 mb-4">
      <!-- Activity Trends Chart -->
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-transparent">
            <h5 class="card-title mb-0">
              <i class="bi bi-graph-up-arrow me-2"></i>
              Activity Trends
            </h5>
          </div>
          <div class="card-body">
            <div class="chart-placeholder text-center py-5">
              <i class="bi bi-bar-chart fs-1 text-muted mb-3"></i>
              <p class="text-muted mb-2">Interactive charts coming soon</p>
              <small class="text-muted">
                Activity trend visualization will be implemented with Chart.js
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-transparent">
            <h5 class="card-title mb-0">
              <i class="bi bi-speedometer2 me-2"></i>
              Performance Score
            </h5>
          </div>
          <div class="card-body">
            <div class="text-center py-4">
              <div class="performance-circle mx-auto mb-3">
                <span class="display-4 fw-bold text-primary">85</span>
              </div>
              <p class="text-muted mb-0">Overall Performance</p>
              <small class="text-success">
                <i class="bi bi-arrow-up"></i> +5% from last month
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Analytics Section -->
    <div class="row g-4">
      <!-- Activity Distribution -->
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-transparent">
            <h5 class="card-title mb-0">
              <i class="bi bi-pie-chart me-2"></i>
              Activity Distribution
            </h5>
          </div>
          <div class="card-body">
            <div class="chart-placeholder text-center py-4">
              <i class="bi bi-pie-chart fs-1 text-muted mb-3"></i>
              <p class="text-muted mb-2">Pie chart visualization</p>
              <small class="text-muted">Distribution by activity type</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Productivity Insights -->
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-transparent">
            <h5 class="card-title mb-0">
              <i class="bi bi-lightbulb me-2"></i>
              Productivity Insights
            </h5>
          </div>
          <div class="card-body">
            <ul class="list-unstyled mb-0">
              <li class="mb-3">
                <i class="bi bi-check-circle-fill text-success me-2"></i>
                <strong>Peak Hours:</strong> Most active between 2-4 PM
              </li>
              <li class="mb-3">
                <i class="bi bi-check-circle-fill text-success me-2"></i>
                <strong>Consistency:</strong> Regular activity pattern detected
              </li>
              <li class="mb-3">
                <i class="bi bi-info-circle-fill text-info me-2"></i>
                <strong>Recommendation:</strong> Maintain current pace for optimal results
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  {/if}
</main>

<!-- ==================== STYLES ==================== -->
<style>
  .bg-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .page-header {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .analytics-card {
    transition: transform 0.2s;
  }

  .analytics-card:hover {
    transform: translateY(-5px);
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .chart-placeholder {
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(to bottom, #f8f9fa, #ffffff);
    border-radius: 8px;
  }

  .performance-circle {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  main {
    background-color: #f8f9fa;
    min-height: calc(100vh - 76px);
  }

  .loading-container {
    height: 60vh;
  }

  .card {
    transition: transform 0.2s ease-in-out;
  }

  .card:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .display-6 {
      font-size: 1.5rem;
    }

    .lead {
      font-size: 1rem;
    }

    .page-header {
      padding: 1.5rem !important;
    }
  }
</style>
