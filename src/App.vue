<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <router-link to="/">TrueShot</router-link>
      </div>
      <div class="nav-links">
        <template v-if="authStore.isAuthenticated">
          <router-link to="/feed">Feed</router-link>
          <a href="#" @click.prevent="logout">Logout</a>
        </template>
        <template v-else>
          <router-link to="/login">Login</router-link>
          <router-link to="/signup">Sign Up</router-link>
        </template>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
#app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background-color: #ffffff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
}

.nav-links a:hover {
  color: #42b983;
}

.main-content {
  flex: 1;
  background-color: #f5f5f5;
}

/* Reset some default styles */
body {
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}
</style>
