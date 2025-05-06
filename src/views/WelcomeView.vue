<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Hero Section -->
    <div class="relative isolate px-6 pt-14 lg:px-8">
      <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div class="text-center">
          <h1 class="text-4xl font-bold tracking-tight sm:text-6xl mb-8">
            Welcome to TrueShot
          </h1>
          <p class="text-lg leading-8 text-gray-300 mb-12">
            Capture and share your moments in real-time, just like BeReal.
            Join our community and start sharing your authentic moments today.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/login"
              class="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign In
            </router-link>
            <router-link
              to="/signup"
              class="rounded-md bg-white px-6 py-3 text-lg font-semibold text-black shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Register
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional logic needed for the welcome page
</script>
