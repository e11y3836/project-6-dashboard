<script>
  // ============================================
  // PROFILE PAGE (Complete Solution)
  // ============================================
  // User profile management and account settings
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { updatePassword, updateEmail, sendEmailVerification } from 'firebase/auth';
  import { auth } from '../../firebase';
  import authStore from '../../stores/authStore';
  import Navbar from '$lib/Navbar.svelte';

  // ==================== COMPONENT STATE ====================
  let loading = false;
  let error = '';
  let successMessage = '';

  // Profile data
  let userEmail = '';
  let userCreatedDate = '';
  let emailVerified = false;

  // Edit mode state
  let isEditingEmail = false;
  let newEmail = '';

  // Password change state
  let isChangingPassword = false;
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';

  // ==================== AUTHENTICATION GUARD ====================
  /**
   * Redirect to login if user is not authenticated
   */
  const sub = authStore.subscribe(async (info) => {
    if (!info.isLoggedIn && info.firebaseControlled) {
      await goto('/login');
    } else if (info.user) {
      // Update profile data when user is available
      userEmail = info.user.email || '';
      emailVerified = info.user.emailVerified || false;
      userCreatedDate = info.user.metadata?.creationTime || 'Unknown';
    }
  });

  // ==================== EMAIL VERIFICATION ====================
  /**
   * Send email verification to user's email
   */
  async function sendVerificationEmail() {
    loading = true;
    error = '';
    successMessage = '';

    try {
      await sendEmailVerification(auth.currentUser);
      successMessage = 'Verification email sent! Please check your inbox.';
    } catch (err) {
      console.error('Email verification error:', err);
      error = 'Failed to send verification email. Please try again.';
    } finally {
      loading = false;
    }
  }

  // ==================== PASSWORD UPDATE ====================
  /**
   * Update user's password
   */
  async function handlePasswordChange() {
    // Validate inputs
    if (!newPassword || !confirmPassword) {
      error = 'Please fill in all password fields.';
      return;
    }

    if (newPassword !== confirmPassword) {
      error = 'New passwords do not match.';
      return;
    }

    if (newPassword.length < 6) {
      error = 'Password must be at least 6 characters long.';
      return;
    }

    loading = true;
    error = '';
    successMessage = '';

    try {
      await updatePassword(auth.currentUser, newPassword);
      successMessage = 'Password updated successfully!';

      // Reset form
      newPassword = '';
      confirmPassword = '';
      currentPassword = '';
      isChangingPassword = false;
    } catch (err) {
      console.error('Password update error:', err);

      if (err.code === 'auth/requires-recent-login') {
        error = 'For security, please log out and log back in before changing your password.';
      } else {
        error = 'Failed to update password. Please try again.';
      }
    } finally {
      loading = false;
    }
  }

  // ==================== LIFECYCLE HOOKS ====================
  onMount(() => {
    if ($authStore.user) {
      userEmail = $authStore.user.email || '';
      emailVerified = $authStore.user.emailVerified || false;
      userCreatedDate = $authStore.user.metadata?.creationTime || 'Unknown';
    }
  });

  onDestroy(() => {
    sub();
  });
</script>

<svelte:head>
  <title>Profile - My Dashboard</title>
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
<main class="container py-4">
  <!-- Page Header -->
  <div class="row mb-4">
    <div class="col-12">
      <div class="page-header bg-gradient text-white rounded-3 p-4 shadow">
        <h1 class="display-6 fw-bold mb-2">
          <i class="bi bi-person-circle me-2"></i>
          User Profile
        </h1>
        <p class="lead mb-0">Manage your account settings and preferences</p>
      </div>
    </div>
  </div>

  <!-- Success Message -->
  {#if successMessage}
    <div class="row mb-4">
      <div class="col-12">
        <div class="alert alert-success alert-dismissible fade show" role="alert">
          <i class="bi bi-check-circle me-2"></i>
          {successMessage}
          <button type="button" class="btn-close" on:click={() => successMessage = ''}></button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Error Message -->
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

  <div class="row g-4">
    <!-- Profile Information Card -->
    <div class="col-lg-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-transparent">
          <h5 class="card-title mb-0">
            <i class="bi bi-person-badge me-2"></i>
            Profile Information
          </h5>
        </div>
        <div class="card-body">
          <!-- Profile Avatar -->
          <div class="text-center mb-4">
            <div class="profile-avatar mx-auto mb-3">
              <i class="bi bi-person-fill fs-1 text-white"></i>
            </div>
            <h5 class="mb-1">{userEmail.split('@')[0] || 'User'}</h5>
            <p class="text-muted small">{userEmail}</p>
          </div>

          <!-- Account Details -->
          <div class="profile-details">
            <div class="detail-row">
              <span class="detail-label">
                <i class="bi bi-envelope me-2"></i>
                Email
              </span>
              <span class="detail-value">{userEmail}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">
                <i class="bi bi-shield-check me-2"></i>
                Email Verified
              </span>
              <span class="detail-value">
                {#if emailVerified}
                  <span class="badge bg-success">
                    <i class="bi bi-check-circle me-1"></i>
                    Verified
                  </span>
                {:else}
                  <span class="badge bg-warning text-dark">
                    <i class="bi bi-exclamation-circle me-1"></i>
                    Not Verified
                  </span>
                {/if}
              </span>
            </div>

            <div class="detail-row">
              <span class="detail-label">
                <i class="bi bi-calendar-check me-2"></i>
                Member Since
              </span>
              <span class="detail-value">
                {new Date(userCreatedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          <!-- Email Verification Button -->
          {#if !emailVerified}
            <div class="mt-4">
              <button
                class="btn btn-outline-primary w-100"
                on:click={sendVerificationEmail}
                disabled={loading}
              >
                <i class="bi bi-envelope-check me-2"></i>
                {loading ? 'Sending...' : 'Verify Email Address'}
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Security Settings Card -->
    <div class="col-lg-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-transparent">
          <h5 class="card-title mb-0">
            <i class="bi bi-shield-lock me-2"></i>
            Security Settings
          </h5>
        </div>
        <div class="card-body">
          {#if !isChangingPassword}
            <!-- Password Change Button -->
            <div class="mb-4">
              <h6 class="mb-3">Password</h6>
              <p class="text-muted small mb-3">
                Last changed: Recently
              </p>
              <button
                class="btn btn-outline-secondary w-100"
                on:click={() => isChangingPassword = true}
              >
                <i class="bi bi-key me-2"></i>
                Change Password
              </button>
            </div>
          {:else}
            <!-- Password Change Form -->
            <form on:submit|preventDefault={handlePasswordChange}>
              <h6 class="mb-3">Change Password</h6>

              <div class="mb-3">
                <label for="newPassword" class="form-label">New Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="newPassword"
                  bind:value={newPassword}
                  placeholder="Enter new password"
                  minlength="6"
                  required
                />
                <small class="form-text text-muted">
                  Must be at least 6 characters
                </small>
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm New Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="confirmPassword"
                  bind:value={confirmPassword}
                  placeholder="Confirm new password"
                  minlength="6"
                  required
                />
              </div>

              <div class="d-flex gap-2">
                <button
                  type="submit"
                  class="btn btn-primary flex-fill"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary flex-fill"
                  on:click={() => {
                    isChangingPassword = false;
                    newPassword = '';
                    confirmPassword = '';
                    error = '';
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          {/if}

          <!-- Security Tips -->
          <div class="mt-4 p-3 bg-light rounded">
            <h6 class="mb-2">
              <i class="bi bi-lightbulb text-warning me-2"></i>
              Security Tips
            </h6>
            <ul class="small mb-0 ps-3">
              <li>Use a strong, unique password</li>
              <li>Enable email verification</li>
              <li>Keep your email address up to date</li>
              <li>Log out from shared devices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Account Actions -->
  <div class="row mt-4">
    <div class="col-12">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-transparent">
          <h5 class="card-title mb-0">
            <i class="bi bi-gear me-2"></i>
            Account Actions
          </h5>
        </div>
        <div class="card-body">
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-outline-primary">
              <i class="bi bi-download me-2"></i>
              Export Data
            </button>
            <button class="btn btn-outline-secondary">
              <i class="bi bi-bell me-2"></i>
              Notification Settings
            </button>
            <button class="btn btn-outline-info">
              <i class="bi bi-palette me-2"></i>
              Theme Preferences
            </button>
          </div>
          <hr class="my-3" />
          <small class="text-muted">
            <i class="bi bi-info-circle me-1"></i>
            More account management features coming soon
          </small>
        </div>
      </div>
    </div>
  </div>
</main>

<!-- ==================== STYLES ==================== -->
<style>
  .bg-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .page-header {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .profile-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .profile-details {
    border-top: 1px solid #e9ecef;
    padding-top: 1rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f8f9fa;
  }

  .detail-row:last-child {
    border-bottom: none;
  }

  .detail-label {
    font-weight: 500;
    color: #6c757d;
  }

  .detail-value {
    color: #212529;
  }

  main {
    background-color: #f8f9fa;
    min-height: calc(100vh - 76px);
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

    .profile-avatar {
      width: 100px;
      height: 100px;
    }
  }
</style>
