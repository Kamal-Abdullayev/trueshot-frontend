<template>
  <div class="text-white bg-black min-h-screen">   
    <!-- Hero Section -->
    <div class="relative min-h-screen flex items-center justify-center text-center px-6">
      <div
        class="absolute inset-0 bg-cover bg-center opacity-20"
        style="background-image: url('https://source.unsplash.com/1600x900/?friends,photo')"
      ></div>
      <div class="relative z-10 max-w-3xl">
        <h1 class="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
          Share Life’s Moments with <span class="text-indigo-500">TrueShot</span>
        </h1>
        <p class="text-lg sm:text-xl text-gray-300 mb-10">
          TrueShot meets creativity – post authentic photos at the moment it matters most.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/login"
            class="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-xl shadow"
          >
            Sign In
          </router-link>
          <router-link
            to="/signup"
            class="bg-white hover:bg-gray-100 text-black font-semibold py-3 px-8 rounded-xl shadow"
          >
            Register
          </router-link>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <section class="py-20 bg-gray-900 px-6">
      <div class="max-w-6xl mx-auto text-center">
        <h2 class="text-3xl sm:text-4xl font-bold mb-12">Why Choose TrueShot?</h2>
        <div class="grid gap-10 sm:grid-cols-3 text-left">
          <div>
            <h3 class="text-xl font-semibold mb-2 text-indigo-400">Real-Time Posting</h3>
            <p class="text-gray-300">Capture and share instantly – no filters, no edits.</p>
          </div>
          <div>
            <h3 class="text-xl font-semibold mb-2 text-indigo-400">Authentic Community</h3>
            <p class="text-gray-300">Join people who value real over perfect.</p>
          </div>
          <div>
            <h3 class="text-xl font-semibold mb-2 text-indigo-400">Privacy First</h3>
            <p class="text-gray-300">Your data stays yours. We prioritize your privacy.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-20 bg-black px-6">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl sm:text-4xl font-bold mb-12">What Users Say</h2>
        <div class="grid gap-10 sm:grid-cols-2 text-left">
          <div class="bg-gray-800 p-6 rounded-xl shadow">
            <p class="text-gray-300 italic">“TrueShot helps me stay in touch with my real self and real friends.”</p>
            <div class="mt-4 font-semibold text-indigo-400">– Emily R.</div>
          </div>
          <div class="bg-gray-800 p-6 rounded-xl shadow">
            <p class="text-gray-300 italic">“Finally a social app that doesn’t feel fake or overwhelming.”</p>
            <div class="mt-4 font-semibold text-indigo-400">– Jason K.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-indigo-600 px-6 text-center">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-3xl sm:text-4xl font-bold mb-6">Join TrueShot Today</h2>
        <p class="text-lg text-white mb-8">Be real, be seen. Start capturing your life with honesty.</p>
        <router-link
          to="/signup"
          class="bg-white text-indigo-600 font-semibold py-3 px-8 rounded-xl hover:bg-gray-100 transition"
        >
          Get Started
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-6 bg-gray-900 text-center text-sm text-gray-400">
      © 2025 TrueShot. All rights reserved.
    </footer>
  </div>
</template>

<script setup lang="ts">
// No script logic needed
</script>
