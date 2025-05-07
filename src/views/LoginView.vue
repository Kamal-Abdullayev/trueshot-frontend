<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Login</h1>
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            placeholder="Enter your username"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Enter your password"
          />
        </div>
        <div v-if="error" class="error">{{ error }}</div>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <div class="signup-link">
        Don't have an account? <router-link to="/signup">Sign up</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const login = async () => {
  try {
    loading.value = true
    error.value = ''

    // Validate input lengths
    if (username.value.length < 4) {
      error.value = 'Username must be at least 5 characters long'
      return
    }
    if (password.value.length < 4) {
      error.value = 'Password must be at least 5 characters long'
      return
    }

    const response = await authStore.login({
      name: username.value,
      password: password.value
    });

    console.log('Login successful, user:', response.user);
    console.log('User role:', response.user.roles);

    // Redirect based on role
    if (response.user.roles === 'ADMIN') {
      await router.push('/admin');
    } else {
      await router.push('/feed');
    }
  } catch (err: any) {
    console.error('Login error:', err)
    if (err.response?.status === 401) {
      error.value = 'Invalid username or password'
    } else if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else {
      error.value = 'Failed to login. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #000;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.login-card {
  background: #111;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #fff;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: #fff;
}

input {
  padding: 0.75rem;
  border: 1px solid #333;
  border-radius: 8px;
  font-size: 1rem;
  background: #000;
  color: #fff;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #2196F3;
}

input::placeholder {
  color: #666;
}

.error {
  color: #ff4444;
  text-align: center;
  padding: 0.75rem;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 8px;
  font-size: 0.9rem;
}

.submit-btn {
  background-color: #2196F3;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.submit-btn:disabled {
  background-color: #333;
  color: #666;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  background-color: #1976D2;
}

.signup-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #888;
}

.signup-link a {
  color: #2196F3;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>
