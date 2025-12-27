<script>
  // ============================================
  // ACTIVITY FEED COMPONENT (Complete Solution)
  // ============================================
  // Real-time activity feed using Firestore onSnapshot
  import { onMount } from 'svelte';
  import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
  import { db } from '../firebase';
  import authStore from '../stores/authStore';

  // ==================== COMPONENT STATE ====================
  let activities = [];
  let loading = true;
  let error = '';

  // ==================== REAL-TIME LISTENER ====================
  /**
   * Sets up Firestore real-time listener on component mount
   * - Queries activities collection
   * - Orders by timestamp (newest first)
   * - Limits to 10 most recent activities
   * - Auto-updates when data changes
   */
  onMount(() => {
    if (!$authStore.user) {
      loading = false;
      return;
    }

    // Build Firestore query
    const q = query(
      collection(db, 'activities'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Transform Firestore documents to JavaScript objects
        activities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp to JavaScript Date
          timestamp: doc.data().timestamp?.toDate()
        }));
        loading = false;
        console.log(`Loaded ${activities.length} activities`);
      },
      (err) => {
        console.error('Error listening to activities:', err);
        error = 'Failed to load activities. Please refresh the page.';
        loading = false;
      }
    );

    // Critical: Clean up listener when component unmounts
    return unsubscribe;
  });

  // ==================== HELPER FUNCTIONS ====================
  /**
   * Formats timestamp to relative time (e.g., "5m ago", "2h ago", "3d ago")
   * @param {Date} timestamp - JavaScript Date object
   * @returns {string} - Formatted relative time string
   */
  function formatTime(timestamp) {
    if (!timestamp) return '';

    const now = new Date();
    const diff = now - timestamp; // Difference in milliseconds

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
</script>

<!-- ==================== ACTIVITY FEED DISPLAY ==================== -->
<div class="card h-100 shadow-sm border-0">
  <!-- Card header -->
  <div class="card-header bg-transparent">
    <h5 class="card-title mb-0">
      <i class="bi bi-activity me-2"></i>
      Recent Activity
    </h5>
  </div>

  <!-- Card body with activity list -->
  <div class="card-body p-0">
    {#if loading}
      <!-- Loading state -->
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading activities...</span>
        </div>
      </div>
    {:else if error}
      <!-- Error state -->
      <div class="alert alert-danger m-3" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    {:else if activities.length > 0}
      <!-- Activity list -->
      <div class="list-group list-group-flush">
        {#each activities as activity (activity.id)}
          <div class="list-group-item border-0 activity-item">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h6 class="mb-1 activity-title">{activity.title}</h6>
                {#if activity.description}
                  <p class="mb-1 text-muted small">{activity.description}</p>
                {/if}
              </div>
              <small class="text-muted timestamp">{formatTime(activity.timestamp)}</small>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <!-- Empty state -->
      <div class="text-center py-5">
        <i class="bi bi-inbox fs-1 text-muted"></i>
        <p class="text-muted mt-2 mb-0">No recent activity</p>
        <small class="text-muted">Activities will appear here once you add them</small>
      </div>
    {/if}
  </div>
</div>

<style>
  .activity-item {
    transition: background-color 0.2s;
    padding: 1rem 1.25rem;
  }

  .activity-item:hover {
    background-color: #f8f9fa;
  }

  .activity-title {
    font-weight: 600;
    color: #333;
  }

  .timestamp {
    white-space: nowrap;
    margin-left: 1rem;
  }

  .card-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.075);
  }
</style>
