<template>
  <div class="group-details-container">
    <div class="group-header">
      <h1>{{ group?.name }}</h1>
      <div class="group-info">
        <span class="admin">Admin: {{ group?.admin?.name }}</span>
        <span class="members">Members: {{ group?.members?.length || 0 }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading group posts...</p>
    </div>

    <div v-else-if="!posts || posts.length === 0" class="no-posts">
      <p>No posts in this group yet.</p>
      <button @click="createPost" class="create-post-btn">
        Create First Post
      </button>
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
        <div class="post-comments">
          <button
            class="toggle-comments-btn"
            @click="toggleComments(post.id)"
          >
            {{ isCommentsVisible[post.id] ? 'Hide Comments' : 'Show Comments' }}
            <span class="comment-count" v-if="post.comments && post.comments.length > 0">
              ({{ post.comments.length }})
            </span>
          </button>

          <div v-if="isCommentsVisible[post.id]" class="comments-section">
            <div v-if="post.comments && post.comments.length > 0" class="comments-list">
              <div v-for="comment in post.comments" :key="comment.id" class="comment">
                <div class="comment-header">
                  <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <div v-if="comment.url" class="comment-image">
                  <img :src="comment.url" alt="Comment image" @error="handleImageError" />
                </div>
                <p class="comment-text">{{ comment.content }}</p>
              </div>
            </div>
            <div v-else class="no-comments">
              <p>No comments yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ActionModal
      :show="!!modalMessage"
      :message="modalMessage"
      :is-success="isModalSuccess"
      @close="modalMessage = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import ActionModal from '@/components/ActionModal.vue'

interface Post {
  id: string
  title: string
  content: string
  url?: string
  userId: string
  createdAt?: string
  updatedAt?: string
  comments?: Comment[]
}

interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  url: string | null
  createdAt: string
}

interface Group {
  id: string
  name: string
  admin: { name: string }
  members: Array<{ name: string }>
}

const route = useRoute()
const router = useRouter()
const group = ref<Group | null>(null)
const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref('')
const modalMessage = ref('')
const isModalSuccess = ref(true)
const isCommentsVisible = ref<Record<string, boolean>>({})

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
  return url
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const showModal = (message: string, success: boolean = true) => {
  modalMessage.value = message
  isModalSuccess.value = success
}

const toggleComments = (postId: string) => {
  isCommentsVisible.value[postId] = !isCommentsVisible.value[postId]
}

const fetchGroupDetails = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      showModal('Please log in to view group details', false)
      router.push('/login')
      return
    }

    const groupId = route.params.id
    const response = await axios.get(`http://localhost:8090/api/v1/groups/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    group.value = response.data

    // Check if user is a member
    const currentUsername = localStorage.getItem('username')
    const isMember = group.value.members.some(member => member.name === currentUsername)
    const isAdmin = group.value.admin.name === currentUsername

    if (!isMember && !isAdmin) {
      showModal('You must be a member to view this group', false)
      router.push('/feed')
      return
    }
  } catch (err) {
    showModal('Failed to load group details', false)
    router.push('/feed')
  }
}

const fetchGroupPosts = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const groupId = route.params.id
    const response = await axios.get(`http://localhost:8090/api/v1/groups/${groupId}/posts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    posts.value = response.data
  } catch (err) {
    showModal('Failed to load group posts', false)
  } finally {
    loading.value = false
  }
}

const createPost = () => {
  router.push(`/create-post?groupId=${route.params.id}`)
}

onMounted(async () => {
  await fetchGroupDetails()
  await fetchGroupPosts()
})
</script>

<style scoped>
.group-details-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #000;
  min-height: 100vh;
  color: #fff;
}

.group-header {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #111;
  border-radius: 12px;
}

.group-header h1 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: #fff;
}

.group-info {
  display: flex;
  gap: 1rem;
  color: #888;
  font-size: 0.9rem;
}

.admin {
  color: #2c5282;
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

.no-posts {
  text-align: center;
  padding: 3rem;
  background: #111;
  border-radius: 8px;
  margin: 2rem 0;
}

.create-post-btn {
  display: inline-block;
  margin-top: 1rem;
  background-color: #fff;
  color: #000;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
  border: none;
  cursor: pointer;
}

.create-post-btn:hover {
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

.post-comments {
  padding: 1rem;
  background: #000;
  border-top: 1px solid #333;
}

.toggle-comments-btn {
  background: none;
  border: none;
  color: #666;
  padding: 0.5rem 0;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
}

.toggle-comments-btn:hover {
  color: #fff;
}

.comment-count {
  color: #666;
  font-size: 0.8rem;
}

.comments-section {
  margin-top: 1rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment {
  background: #111;
  padding: 0.8rem;
  border-radius: 8px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.comment-date {
  color: #888;
  font-size: 0.8em;
}

.comment-text {
  color: #ddd;
  margin: 0;
  line-height: 1.4;
}

.no-comments {
  color: #888;
  text-align: center;
  padding: 1rem;
}

.comment-image {
  width: 100%;
  max-height: 200px;
  margin: 0.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.comment-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
