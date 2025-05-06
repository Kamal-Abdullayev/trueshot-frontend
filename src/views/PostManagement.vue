<template>
  <div class="feed-container">
    <div class="feed-header">
      <h1>My Posts</h1>
      <router-link to="/create-post" class="create-post-btn">
        <i class="fas fa-plus"></i>
      </router-link>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading your posts...</p>
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="!posts || posts.length === 0" class="no-posts">
      <p>You haven't created any posts yet.</p>
      <router-link to="/create-post" class="create-first-post-btn">
        Create Your First Post
      </router-link>
    </div>

    <div v-else class="posts">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <div class="post-info">
            <h3>{{ post.title }}</h3>
            <span class="post-date">{{ formatDate(post.createdAt) }}</span>
          </div>
          <div class="post-actions">
            <button @click="editPost(post)" class="action-button edit">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deletePost(post.id)" class="action-button delete">
              <i class="fas fa-trash"></i>
            </button>
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

    <!-- Edit Post Modal -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Edit Post</h2>
          <button @click="showEditModal = false" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="updatePost">
          <div class="form-group">
            <label for="edit-title">Title</label>
            <input
              type="text"
              id="edit-title"
              v-model="editingPost.title"
              required
            />
          </div>
          <div class="form-group">
            <label for="edit-content">Content</label>
            <textarea
              id="edit-content"
              v-model="editingPost.content"
              required
              rows="4"
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn save">Save Changes</button>
            <button type="button" @click="showEditModal = false" class="btn cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()
const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref('')
const showEditModal = ref(false)
const editingPost = ref<Post>({
  id: '',
  title: '',
  content: '',
  url: '',
  userId: ''
})

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
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `http://localhost:8090${url}`
}

const fetchPosts = async () => {
  try {
    loading.value = true
    error.value = ''

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
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
    error.value = 'Failed to load posts. Please try again.'
  } finally {
    loading.value = false
  }
}

const editPost = (post: Post) => {
  editingPost.value = { ...post }
  showEditModal.value = true
}

const updatePost = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    await axios.put(`http://localhost:8090/api/v1/post/${editingPost.value.id}`, {
      title: editingPost.value.title,
      content: editingPost.value.content
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    await fetchPosts()
    showEditModal.value = false
  } catch (err) {
    console.error('Error updating post:', err)
    error.value = 'Failed to update post. Please try again.'
  }
}

const deletePost = async (id: string) => {
  if (!confirm('Are you sure you want to delete this post?')) return

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    await axios.delete(`http://localhost:8090/api/v1/post/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    await fetchPosts()
  } catch (err) {
    console.error('Error deleting post:', err)
    error.value = 'Failed to delete post. Please try again.'
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.error('Error loading image:', img.src)
  const imageContainer = img.closest('.post-image') as HTMLElement
  if (imageContainer) {
    imageContainer.style.display = 'none'
  }
}

onMounted(() => {
  fetchPosts()
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
}

.create-post-btn {
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

.create-post-btn:hover {
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

.post-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
  color: #888;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button.edit:hover {
  background-color: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.action-button.delete:hover {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #111;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  color: #fff;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.modal-header h2 {
  color: #fff;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
  padding: 0.5rem;
}

.close-btn:hover {
  color: #fff;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #fff;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #333;
  border-radius: 8px;
  font-size: 1rem;
  background: #000;
  color: #fff;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2196F3;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
}

.save {
  background-color: #2196F3;
  color: white;
}

.save:hover {
  background-color: #1976D2;
}

.cancel {
  background-color: #333;
  color: white;
}

.cancel:hover {
  background-color: #444;
}
</style>
