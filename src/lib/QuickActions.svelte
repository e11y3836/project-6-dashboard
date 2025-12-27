<script>
  // ============================================
  // QUICK ACTIONS COMPONENT (Complete Solution)
  // ============================================
  // Provides quick access to common actions with modal for adding activities
  import { addDoc, collection } from 'firebase/firestore';
  import { db } from '../firebase';
  import authStore from '../stores/authStore';

  // ==================== COMPONENT STATE ====================
  let showModal = false;
  let actionTitle = '';
  let actionDescription = '';
  let loading = false;
  let error = '';

  // ==================== ADD ACTIVITY FUNCTION ====================
  /**
   * Adds a new activity to Firestore
   * - Validates input (title required)
   * - Creates new document in 'activities' collection
   * - Includes userId, timestamp, and activity data
   * - Resets form and closes modal on success
   */
  async function addQuickAction() {
    // Validate input
    if (!actionTitle.trim()) {
      error = 'Please enter a title';
      return;
    }

    loading = true;
    error = '';

    try {
      // Write to Firestore
      await addDoc(collection(db, 'activities'), {
        userId: $authStore.user.uid,
        title: actionTitle.trim(),
        description: actionDescription.trim(),
        timestamp: new Date(),
        type: 'quick_action'
      });

      console.log('Activity added successfully');

      // Reset form
      actionTitle = '';
      actionDescription = '';
      showModal = false;
    } catch (err) {
      console.error('Error adding activity:', err);
      error = 'Failed to add activity. Please try again.';
    } finally {
      loading = false;
    }
  }

  /**
   * Closes modal and resets form
   */
  function closeModal() {
    showModal = false;
    actionTitle = '';
    actionDescription = '';
    error = '';
  }
</script>

<!-- ==================== QUICK ACTIONS CARD ==================== -->
<div class="card h-100 shadow-sm border-0">
  <!-- Card header -->
  <div class="card-header bg-transparent">
    <h5 class="card-title mb-0">
      <i class="bi bi-lightning me-2"></i>
      Quick Actions
    </h5>
  </div>

  <!-- Action buttons -->
  <div class="card-body">
    <div class="d-grid gap-2">
      <button
        class="btn btn-outline-primary"
        on:click={() => showModal = true}
      >
        <i class="bi bi-plus-circle me-2"></i>
        Add Activity
      </button>
      <button class="btn btn-outline-success" disabled>
        <i class="bi bi-file-earmark-plus me-2"></i>
        Create Report
      </button>
      <button class="btn btn-outline-info" disabled>
        <i class="bi bi-gear me-2"></i>
        Settings
      </button>
    </div>
    <small class="text-muted d-block mt-2 text-center">
      More actions coming soon
    </small>
  </div>
</div>

<!-- ==================== ADD ACTIVITY MODAL ==================== -->
{#if showModal}
  <!-- Modal backdrop -->
  <div
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5);"
    on:click={closeModal}
    on:keydown={(e) => e.key === 'Escape' && closeModal()}
    role="button"
    aria-label="Close modal"
  >
    <!-- Modal dialog -->
    <div
      class="modal-dialog modal-dialog-centered"
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="document"
    >
      <div class="modal-content">
        <!-- Modal header -->
        <div class="modal-header">
          <h5 class="modal-title">Add New Activity</h5>
          <button
            type="button"
            class="btn-close"
            on:click={closeModal}
            aria-label="Close"
          ></button>
        </div>

        <!-- Modal body with form -->
        <div class="modal-body">
          {#if error}
            <div class="alert alert-danger" role="alert">
              {error}
            </div>
          {/if}

          <form on:submit|preventDefault={addQuickAction}>
            <!-- Title input -->
            <div class="mb-3">
              <label for="actionTitle" class="form-label">
                Title <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                class="form-control"
                id="actionTitle"
                placeholder="Enter activity title"
                bind:value={actionTitle}
                disabled={loading}
                required
              />
            </div>

            <!-- Description textarea -->
            <div class="mb-3">
              <label for="actionDescription" class="form-label">
                Description
              </label>
              <textarea
                class="form-control"
                id="actionDescription"
                rows="3"
                placeholder="Enter optional description"
                bind:value={actionDescription}
                disabled={loading}
              ></textarea>
            </div>
          </form>
        </div>

        <!-- Modal footer with action buttons -->
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            on:click={closeModal}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            on:click={addQuickAction}
            disabled={loading || !actionTitle.trim()}
          >
            {#if loading}
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Adding...
            {:else}
              <i class="bi bi-plus-circle me-2"></i>
              Add Activity
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal.show {
    display: block;
  }

  .btn:disabled {
    opacity: 0.6;
  }

  .card-body {
    padding: 1.5rem;
  }

  .card-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.075);
  }
</style>
