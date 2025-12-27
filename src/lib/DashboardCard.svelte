<script>
  // ============================================
  // DASHBOARD CARD COMPONENT (Complete Solution)
  // ============================================
  // Reusable card component for displaying metrics and stats

  // ==================== COMPONENT PROPS ====================
  /**
   * @prop {string} title - Card title (e.g., "Total Activities")
   * @prop {string} value - Main metric value to display
   * @prop {string} icon - Bootstrap icon name (without "bi-" prefix)
   * @prop {string} color - Bootstrap color class (primary, success, info, warning, danger)
   * @prop {Object} trend - Optional trend data: { direction: 'up'|'down', percentage: number }
   */
  export let title = "";
  export let value = "";
  export let icon = "";
  export let color = "primary";
  export let trend = null;
</script>

<!-- ==================== CARD DISPLAY ==================== -->
<div class="card h-100 shadow-sm border-0 hover-card">
  <div class="card-body">
    <div class="d-flex justify-content-between align-items-start">
      <!-- Left side: Title, value, and optional trend -->
      <div>
        <h6 class="card-subtitle mb-2 text-muted">{title}</h6>
        <h2 class="card-title mb-0 text-{color}">{value}</h2>

        <!-- Optional trend indicator -->
        {#if trend}
          <small class="text-{trend.direction === 'up' ? 'success' : 'danger'}">
            <i class="bi bi-arrow-{trend.direction} me-1"></i>
            {trend.percentage}% from last month
          </small>
        {/if}
      </div>

      <!-- Right side: Icon -->
      {#if icon}
        <div class="text-{color} opacity-75">
          <i class="bi bi-{icon} fs-1"></i>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .hover-card {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }

  .hover-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
  }

  .card-body {
    padding: 1.5rem;
  }

  .card-title {
    font-size: 2rem;
    font-weight: 600;
  }

  .card-subtitle {
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
</style>
