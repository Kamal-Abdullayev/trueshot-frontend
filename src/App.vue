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
          <template v-if="authStore.user?.isAdmin">
            <router-link
              to="/admin"
              class="nav-link"
            >
              Admin Dashboard
            </router-link>
            <a href="#" @click.prevent="logout" class="nav-link logout">Logout</a>
          </template>
          <template v-else>
            <router-link
              to="/feed"
              class="nav-link"
            >
              Feed
            </router-link>

            <router-link
              to="/create-post"
              class="nav-link"
            >
              Add Post
            </router-link>

            <router-link
              to="/posts"
              class="nav-link"
            >
              My Posts
            </router-link>

            <router-link
              to="/calendar"
              class="nav-link"
            >
              Calendar
            </router-link>

            <router-link
              to="/notifications"
              class="nav-link"
            >
              Notifications
            </router-link>

            <router-link
              to="/rewards"
              class="nav-link"
            >
              Rewards
            </router-link>

            <a href="#" @click.prevent="logout" class="nav-link logout">Logout</a>
          </template>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link auth-link">Login</router-link>
          <router-link to="/signup" class="nav-link auth-link">Sign Up</router-link>
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
  align-items: center;
}

.nav-link {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: #f3f4f6;
}

.auth-link {
  color: #4b5563;
}

.auth-link:hover {
  color: #1f2937;
}

.logout {
  color: #dc2626;
}

.logout:hover {
  background-color: #fee2e2;
  color: #b91c1c;
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

.create-post-btn {
  background-color: #42b983;
  color: white !important;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.create-post-btn:hover {
  background-color: #3aa876;
  color: white !important;
}
</style>
