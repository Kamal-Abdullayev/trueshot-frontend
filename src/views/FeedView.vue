<template>
  <div class="feed-container">
    <div class="feed-header">
      <h1>Feed</h1>
      <div class="header-actions">
        <router-link to="/create-post" class="create-post-btn">
          <i class="fas fa-plus"></i>
        </router-link>
        <router-link to="/posts" class="my-posts-btn">
          <i class="fas fa-user"></i>
        </router-link>
        <router-link to="/calendar" class="calendar-btn">
          <i class="fas fa-calendar"></i>
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading posts...</p>
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="!posts || posts.length === 0" class="no-posts">
      <p>No posts available yet.</p>
      <router-link to="/create-post" class="create-first-post-btn">
        Create First Post
      </router-link>
    </div>

    <div v-else class="posts">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <div class="post-info">
            <h3>{{ post.title }}</h3>
            <span class="post-date">{{ formatDate(post.createdAt) }}</span>
          </div>
        </div>
        <div class="post-content">
          <div v-if="post.url" class="post-image">
            <img :src="getImageUrl(post.url)" alt="Post image" @error="handleImageError" />
          </div>
          <p class="post-text">{{ post.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Post {
  id: string
  title: string
  content: string
  url?: string
  userId: string
  createdAt?: string
  updatedAt?: string
}

const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref('')

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getImageUrl = (url?: string) => {
  if (!url) return ''
  // The URL from the backend is already complete, so return it as is
  return url
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.error('Error loading image:', img.src)
  img.style.display = 'none'
}

const fetchPosts = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      error.value = 'Please log in to view posts'
      return
    }

    const response = await axios.get('http://localhost:8090/api/v1/post/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('Posts response:', response.data)
    posts.value = response.data
  } catch (err) {
    console.error('Error fetching posts:', err)
    error.value = 'Failed to load posts'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchPosts()
})
</script>

<style scoped>
.feed-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #000;
  min-height: 100vh;
  color: #fff;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem 0;
  border-bottom: 1px solid #333;
}

.feed-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.create-post-btn,
.my-posts-btn,
.calendar-btn {
  background-color: #fff;
  color: #000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 1.2rem;
  transition: transform 0.2s;
}

.create-post-btn:hover,
.my-posts-btn:hover,
.calendar-btn:hover {
  transform: scale(1.1);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #fff;
}

.loading-spinner {
  border: 3px solid #333;
  border-top: 3px solid #fff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: #ff4444;
  text-align: center;
  padding: 1rem;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 4px;
  margin: 1rem 0;
}

.no-posts {
  text-align: center;
  padding: 3rem;
  background: #111;
  border-radius: 8px;
  margin: 2rem 0;
}

.create-first-post-btn {
  display: inline-block;
  margin-top: 1rem;
  background-color: #fff;
  color: #000;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}

.create-first-post-btn:hover {
  background-color: #ddd;
}

.post-card {
  background: #111;
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: #000;
}

.post-info {
  flex: 1;
}

.post-info h3 {
  margin: 0;
  font-size: 1.1em;
  color: #fff;
}

.post-date {
  color: #888;
  font-size: 0.8em;
  display: block;
  margin-top: 0.3rem;
}

.post-content {
  padding: 0;
}

.post-text {
  margin: 0;
  padding: 1rem;
  line-height: 1.6;
  color: #fff;
}

.post-image {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: #000;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
