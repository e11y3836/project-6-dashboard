<script>
  import { createUserWithEmailAndPassword } from 'firebase/auth';
  import { auth } from '../../firebase';
  import { goto } from '$app/navigation';
  import authStore from '../../stores/authStore';

  // ==================== FORM STATE ====================
  let email = '';
  let password = '';
  let confirmPassword = '';
  let error = '';
  let loading = false;

  // ==================== VALIDATION FUNCTIONS ====================
  /**
   * Validates email format using regex
   * @param {string} email - Email to validate
   * @returns {boolean} - True if email format is valid
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates entire registration form
   * @returns {string|null} - Error message if invalid, null if valid
   */
  function validateForm() {
    // Check if all fields are filled
    if (!email.trim() || !password || !confirmPassword) {
      return 'Please fill in all fields';
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return 'Please enter a valid email address';
    }

    // Check password length (Firebase minimum is 6 characters)
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    return null; // No errors
  }

  // ==================== REGISTRATION FUNCTION ====================
  /**
   * Handles user registration with Firebase Authentication
   * - Validates form inputs
   * - Creates new user account
   * - Handles errors with user-friendly messages
   * - Redirects to dashboard on success
   */
  async function register() {
    // Clear any previous errors
    error = '';

    // Validate the form
    const validationError = validateForm();
    if (validationError) {
      error = validationError;
      return;
    }

    loading = true;

    try {
      // Create user account with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      console.log(
        'User registered successfully:',
        userCredential.user.email
      );

      // Redirect to dashboard
      await goto('/');
    } catch (err) {
      console.error('Registration error:', err);

      // Provide user-friendly error messages
      switch (err.code) {
        case 'auth/email-already-in-use':
          error =
            'This email is already registered. Please login instead.';
          break;
        case 'auth/invalid-email':
          error = 'Please enter a valid email address.';
          break;
        case 'auth/operation-not-allowed':
          error =
            'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/weak-password':
          error =
            'Password is too weak. Please use a stronger password.';
          break;
        case 'auth/network-request-failed':
          error =
            'Network error. Please check your internet connection.';
          break;
        default:
          error = 'Failed to create account. Please try again.';
      }
    } finally {
      loading = false;
    }
  }

  // ==================== AUTO-REDIRECT ====================
  /**
   * If user is already logged in, redirect to dashboard
   * This prevents logged-in users from seeing the signup page
   */
  $: if ($authStore.isLoggedIn && !loading) {
    goto('/');
  }
</script>

<svelte:head>
  <title>Sign Up - My Dashboard</title>
  <link
    rel="stylesheet"
    href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
  />
</svelte:head>

<div class="signup-container">
  <div class="signup-card">
    <div class="card">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">
          Create Your Dashboard Account
        </h2>
        <p class="text-center text-muted mb-4">
          Join us to start managing your personal dashboard
        </p>

        <!-- Error Message Display -->
        {#if error}
          <div class="alert alert-danger" role="alert">
            <strong>Error:</strong> {error}
          </div>
        {/if}

        <!-- Registration Form -->
        <form on:submit|preventDefault={register}>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              class="form-control"
              id="email"
              placeholder="Enter your email"
              bind:value={email}
              disabled={loading}
              required
            />
            <small class="form-text text-muted">
              We'll never share your email with anyone else.
            </small>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              class="form-control"
              id="password"
              placeholder="Create a password"
              bind:value={password}
              disabled={loading}
              required
            />
            <small class="form-text text-muted">
              Must be at least 6 characters long.
            </small>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              class="form-control"
              id="confirmPassword"
              placeholder="Confirm your password"
              bind:value={confirmPassword}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            disabled={loading}
          >
            {#if loading}
              <span
                class="spinner-border spinner-border-sm mr-2"
                role="status"
                aria-hidden="true"
              ></span>
              Creating account...
            {:else}
              Create Account
            {/if}
          </button>
        </form>

        <!-- Login Link -->
        <div class="text-center mt-3">
          <p class="mb-0">
            Already have an account?
            <a href="/login" class="login-link">Sign in here</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .signup-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
  }

  .signup-card {
    width: 100%;
    max-width: 450px;
  }

  .card {
    border: none;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  }

  .card-body {
    padding: 2rem;
  }

  .card-title {
    color: #333;
    font-weight: 600;
    font-size: 1.5rem;
  }

  .form-group label {
    font-weight: 500;
    color: #555;
    margin-bottom: 0.5rem;
  }

  .form-control {
    border-radius: 8px;
    padding: 0.75rem;
    border: 1px solid #ddd;
  }

  .form-control:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    padding: 0.75rem;
    font-weight: 600;
    transition: transform 0.2s;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .login-link {
    color: #667eea;
    font-weight: 600;
    text-decoration: none;
  }

  .login-link:hover {
    color: #764ba2;
    text-decoration: underline;
  }

  .alert {
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .form-text {
    font-size: 0.875rem;
  }
</style>
