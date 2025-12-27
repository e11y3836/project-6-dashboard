<script>
  import { signInWithEmailAndPassword } from 'firebase/auth';
  import { auth } from '../../firebase';
  import { goto } from '$app/navigation';
  import authStore from '../../stores/authStore';

  // ==================== FORM STATE ====================
  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  // ==================== LOGIN FUNCTION ====================
  /**
   * Handles user login with Firebase Authentication
   * - Validates input fields
   * - Calls Firebase signInWithEmailAndPassword
   * - Handles errors with user-friendly messages
   * - Redirects to dashboard on success
   */
  async function login() {
    // Clear any previous errors
    error = '';

    // Validate that both fields are filled
    if (!email.trim() || !password) {
      error = 'Please enter your email and password';
      return;
    }

    loading = true;

    try {
      // Attempt to sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      console.log('User logged in successfully:', userCredential.user.email);

      // Redirect to dashboard on success
      await goto('/');
    } catch (err) {
      console.error('Login error:', err);

      // Provide user-friendly error messages
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          error = 'Invalid email or password. Please try again.';
          break;
        case 'auth/invalid-email':
          error = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          error = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          error = 'Too many failed login attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          error = 'Network error. Please check your internet connection.';
          break;
        default:
          error = 'Failed to login. Please try again.';
      }
    } finally {
      loading = false;
    }
  }

  // ==================== AUTO-REDIRECT ====================
  /**
   * If user is already logged in, redirect to dashboard
   * This prevents logged-in users from seeing the login page
   */
  $: if ($authStore.isLoggedIn && !loading) {
    goto('/');
  }
</script>

<svelte:head>
  <title>Login - My Dashboard</title>
  <link
    rel="stylesheet"
    href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
  />
</svelte:head>

<div class="login-container">
  <div class="login-card">
    <div class="card">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">Sign in to My Dashboard</h2>

        <!-- Error Message Display -->
        {#if error}
          <div class="alert alert-danger" role="alert">
            <strong>Error:</strong> {error}
          </div>
        {/if}

        <!-- Login Form -->
        <form on:submit|preventDefault={login}>
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
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              class="form-control"
              id="password"
              placeholder="Enter your password"
              bind:value={password}
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
              Signing in...
            {:else}
              Sign In
            {/if}
          </button>
        </form>

        <!-- Sign Up Link -->
        <div class="text-center mt-3">
          <p class="mb-0">
            Don't have an account?
            <a href="/signup" class="signup-link">Sign up here</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
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

  .signup-link {
    color: #667eea;
    font-weight: 600;
    text-decoration: none;
  }

  .signup-link:hover {
    color: #764ba2;
    text-decoration: underline;
  }

  .alert {
    border-radius: 8px;
    margin-bottom: 1rem;
  }
</style>
