<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useFeedStore } from '@/stores/feed';
import { onMounted } from 'vue';

const router = useRouter();
const authStore = useAuthStore();
const feedStore = useFeedStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await feedStore.fetchFeed();
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-sm">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between items-center">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">TrueShot</h1>
          </div>
          <div class="flex items-center gap-4">
            <span v-if="authStore.user" class="text-gray-700">
              Welcome, {{ authStore.user.name }}
            </span>
            <button
              v-if="authStore.isAuthenticated"
              @click="handleLogout"
              class="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="!authStore.isAuthenticated" class="text-center">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          Please log in to access TrueShot
        </h2>
        <router-link
          to="/login"
          class="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Go to Login
        </router-link>
      </div>
      <div v-else class="space-y-6">
        <!-- Feed Content -->
        <div v-if="feedStore.loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading your feed...</p>
        </div>

        <div v-else-if="feedStore.error" class="bg-red-50 p-4 rounded-md">
          <p class="text-red-700">{{ feedStore.error }}</p>
        </div>

        <div v-else-if="feedStore.posts.length === 0" class="text-center py-8">
          <p class="text-gray-600">No posts yet. Be the first to share!</p>
        </div>

        <div v-else class="grid gap-6">
          <div v-for="post in feedStore.posts" :key="post.id" class="bg-white shadow rounded-lg overflow-hidden">
            <!-- Post Image -->
            <div v-if="post.url" class="aspect-w-16 aspect-h-9">
              <img :src="post.url" :alt="post.title" class="object-cover w-full h-48" />
            </div>

            <!-- Post Content -->
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ post.title }}</h3>
              <p class="text-gray-600 mb-4">{{ post.content }}</p>

              <!-- Post Metadata -->
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>Posted by {{ post.userId }}</span>
                <span>{{ new Date(post.createdAt).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
