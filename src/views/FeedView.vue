<template>
  <div class="feed-container">
    <!-- Users and Groups section with tabs -->
    <div class="users-section">
      <div class="users-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="{ active: activeTab === tab.id }"
          class="tab-btn"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- User Suggestions Tab -->
      <div v-if="activeTab === 'suggestions'" class="users-list">
        <div v-for="user in nonFollowingUsers" :key="user.id" class="user-item">
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
          </div>
          <button
            @click="toggleFollow(user.id)"
            class="follow-btn"
          >
            Follow
          </button>
        </div>
      </div>

      <!-- Following Tab -->
      <div v-if="activeTab === 'following'" class="users-list">
        <div v-for="user in followingUsersList" :key="user.id" class="user-item">
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
          </div>
          <button
            @click="toggleFollow(user.id)"
            class="follow-btn following"
          >
            Unfollow
          </button>
        </div>
      </div>

      <!-- Followers Tab -->
      <div v-if="activeTab === 'followers'" class="users-list">
        <div v-for="user in followersList" :key="user.id" class="user-item">
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
          </div>
          <button
            @click="toggleFollow(user.id)"
            :class="{ 'following': isFollowing(user.id) }"
            class="follow-btn"
          >
            {{ isFollowing(user.id) ? 'Unfollow' : 'Follow' }}
          </button>
        </div>
      </div>

      <!-- Groups Tab -->
      <div v-if="activeTab === 'groups'" class="groups-section">
        <div class="create-group">
          <input
            v-model="newGroupName"
            type="text"
            placeholder="Enter group name"
            class="group-input"
          />
          <button
            @click="createGroup"
            class="create-group-btn"
            :disabled="!newGroupName"
          >
            Create Group
          </button>
        </div>

        <div class="groups-list">
          <div v-for="group in groups" :key="group.id" class="group-item">
            <div class="group-info">
              <span class="group-name">{{ group.name }}</span>
              <div class="group-details">
                <span class="group-admin">Admin: {{ group.admin?.name || 'Unknown' }}</span>
                <span class="group-members">Members: {{ group.members?.length || 0 }}</span>
              </div>
            </div>
            <div class="group-actions">
              <button
                v-if="isGroupMember(group)"
                @click="leaveGroup(group.id)"
                class="group-btn leave"
              >
                Leave
              </button>
              <button
                v-else
                @click="joinGroup(group.id)"
                class="group-btn join"
              >
                Join
              </button>
              <button
                v-if="isGroupAdmin(group)"
                @click="deleteGroup(group.id)"
                class="group-btn delete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feed section -->
    <div class="feed-section">
      <div class="feed-header">
        <h1>Feed</h1>
      </div>

      <ErrorModal
        :show="!!error"
        :message="error"
        @close="error = ''"
      />
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading posts...</p>
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
            <form @submit.prevent="submitComment(post.id)" class="comment-form">
              <div class="comment-input-container">
                <div class="camera-preview" v-if="capturedImages[post.id]">
                  <img :src="capturedImages[post.id]" alt="Captured image" />
                  <button type="button" class="remove-image-btn" @click="removeImage(post.id)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div v-else class="camera-button">
                  <video :ref="el => videoRefs[post.id] = el as HTMLVideoElement" class="camera-preview" autoplay playsinline></video>
                  <canvas :ref="el => canvasRefs[post.id] = el as HTMLCanvasElement" class="camera-canvas" style="display: none;"></canvas>
                  <div class="camera-controls">
                    <button
                      v-if="!isCameraActive[post.id] && !capturedImages[post.id]"
                      type="button"
                      class="camera-btn"
                      @click="setupCamera(post.id)"
                    >
                      <i class="fas fa-camera"></i>
                      <span class="camera-label">Open Camera</span>
                    </button>

                    <button
                      v-if="isCameraActive[post.id] && !capturedImages[post.id]"
                      type="button"
                      class="camera-btn"
                      @click="takePicture(post.id)"
                    >
                      <i class="fas fa-camera"></i>
                      <span class="camera-label">Capture</span>
                    </button>
                  </div>
                </div>
                <div class="reactions">
                  <button
                    v-for="reaction in reactions"
                    :key="reaction"
                    type="button"
                    class="reaction-btn"
                    :class="{ active: selectedReactions[post.id] === reaction }"
                    @click="selectReaction(reaction, post.id)"
                  >
                    {{ reaction }}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                class="comment-submit-btn"
                :disabled="!capturedImages[post.id] || !selectedReactions[post.id]"
              >
                Post
              </button>
            </form>
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

import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import ErrorModal from '@/components/ErrorModal.vue'
import ActionModal from '@/components/ActionModal.vue'

interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  url: string | null
  createdAt: string
}

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

interface User {
  id: string
  name: string
  password: string
  roles: string
}

interface Group {
  id: string
  name: string
  admin: User
  members: User[]
}

const isCameraActive = ref<Record<string, boolean>>({})
const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref('')
const newComments = ref<Record<string, string>>({})
const reactions = ['😊', '😂', '😢', '😮', '👍']
const capturedImages = ref<Record<string, string>>({})
const selectedReactions = ref<Record<string, string>>({})
const users = ref<User[]>([])
const followingUsers = ref<Set<string>>(new Set())

const videoRefs = ref<Record<string, HTMLVideoElement | null>>({})
const canvasRefs = ref<Record<string, HTMLCanvasElement | null>>({})
const stream = ref<MediaStream | null>(null)

// Add new refs for tabs and user lists
const activeTab = ref('suggestions')
const tabs = [
  { id: 'suggestions', name: 'Suggestions' },
  { id: 'following', name: 'Following' },
  { id: 'followers', name: 'Followers' },
  { id: 'groups', name: 'Groups' }
]

const followingUsersList = ref<User[]>([])
const followersList = ref<User[]>([])

// Add new refs for groups
const newGroupName = ref('')
const groups = ref<Group[]>([])
const myGroups = ref<Set<string>>(new Set())

// Add new refs for modal
const modalMessage = ref('')
const isModalSuccess = ref(true)

// Add new ref for comments visibility
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
  // The URL from the backend is already complete, so return it as is
  return url
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const fetchComments = async (postId: string) => {
  try {
    console.log('Fetching comments for postId:', postId)
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await axios.get(`http://localhost:8090/api/v1/comments/post/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('Fetched comments:', response.data)

    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.comments = response.data
    }
  } catch (err) {
    console.error('Error fetching comments:', err)
  }
}

const handleImageCapture = (event: Event, postId: string) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        capturedImages.value[postId] = e.target.result as string
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}

const removeImage = (postId: string) => {
  delete capturedImages.value[postId]
}

const selectReaction = (reaction: string, postId: string) => {
  selectedReactions.value[postId] = reaction
}

const submitComment = async (postId: string) => {
  try {
    console.log('Submitting comment for postId:', postId)
    console.log('Current posts:', posts.value)

    const token = localStorage.getItem('token')
    if (!token) {
      console.log('No token found')
      showModal('Please log in to comment', false)
      return
    }

    if (!postId) {
      console.log('Invalid postId:', postId)
      showModal('Invalid post ID', false)
      return
    }

    console.log('Captured images:', capturedImages.value)
    console.log('Selected reactions:', selectedReactions.value)

    const imageContent = capturedImages.value[postId]?.split(',')[1]
    const content = selectedReactions.value[postId]

    console.log('Image content exists:', !!imageContent)
    console.log('Content exists:', !!content)

    if (!imageContent || !content) {
      console.log('Missing required data:', { imageContent: !!imageContent, content: !!content })
      showModal('Please capture an image and select a reaction', false)
      return
    }

    console.log('Sending comment request with data:', {
      postId,
      content,
      hasImage: !!imageContent
    })

    await axios.post(
      `http://localhost:8090/api/v1/comments`,
      {
        postId,
        content,
        imageContent
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    console.log('Comment posted successfully')
    await fetchComments(postId)
    isCameraActive.value[postId] = false
    showModal('Comment posted successfully!')

    // Clear the form
    delete capturedImages.value[postId]
    delete selectedReactions.value[postId]
  } catch (err) {
    console.error('Error posting comment:', err)
    showModal('Failed to post comment', false)
  }
}

const setupCamera = async (postId: string) => {
  try {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    })

    const video = videoRefs.value[postId]
    if (video) {
      video.srcObject = localStream
      video.play()
      stream.value = localStream
      isCameraActive.value[postId] = true
    }
  } catch {
    error.value = 'Could not access camera'
  }
}

const takePicture = async (postId: string) => {
  const video = videoRefs.value[postId]
  const canvas = canvasRefs.value[postId]
  if (!video || !canvas) return

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const context = canvas.getContext('2d')
  if (!context) return

  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  const imageData = canvas.toDataURL('image/jpeg')
  capturedImages.value[postId] = imageData

  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
}

const fetchPosts = async () => {
  try {
    console.log('Fetching posts...')
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('No token found for fetching posts')
      error.value = 'Please log in to view posts'
      return
    }

    const response = await axios.get('http://localhost:8090/api/v1/feed', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('Fetched posts:', response.data)
    posts.value = response.data

    // Fetch comments for each post
    for (const post of posts.value) {
      console.log('Fetching comments for post:', post.id)
      await fetchComments(post.id)
    }
  } catch (err) {
    console.error('Error fetching posts:', err)
    error.value = 'Failed to load posts'
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await axios.get('http://localhost:8090/api/v1/auth/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    users.value = response.data
  } catch (err) {
    error.value = 'Failed to load users'
  }
}

const fetchFollowingUsers = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await axios.get('http://localhost:8090/api/v1/follow/following', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    followingUsers.value.clear()
    followingUsersList.value = []

    if (Array.isArray(response.data)) {
      // Assuming the response includes user details
      followingUsersList.value = response.data
      response.data.forEach((user: User) => {
        followingUsers.value.add(user.id)
      })
    }
  } catch (err) {
    error.value = 'Failed to load following users'
  }
}

const fetchFollowers = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await axios.get('http://localhost:8090/api/v1/follow/followers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (Array.isArray(response.data)) {
      followersList.value = response.data
    }
  } catch (err) {
    error.value = 'Failed to load followers'
  }
}

const isFollowing = (userId: string): boolean => {
  return followingUsers.value.has(userId)
}

const toggleFollow = async (userId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      showModal('Please log in to follow users', false)
      return
    }

    const isCurrentlyFollowing = isFollowing(userId)
    const endpoint = isCurrentlyFollowing ? 'unfollow' : 'follow'

    await axios.post(
      `http://localhost:8090/api/v1/follow/${endpoint}/${userId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (isCurrentlyFollowing) {
      followingUsers.value.delete(userId)
      followingUsersList.value = followingUsersList.value.filter(user => user.id !== userId)
      showModal('Successfully unfollowed user!')
    } else {
      const userToAdd = users.value.find(user => user.id === userId)
      if (userToAdd) {
        followingUsers.value.add(userId)
        followingUsersList.value.push(userToAdd)
        showModal('Successfully followed user!')
      }
    }

    await Promise.all([
      fetchUsers(),
      fetchFollowingUsers(),
      fetchFollowers()
    ])
  } catch (err) {
    showModal('Failed to update follow status', false)
  }
}

// Add computed property for non-following users
const nonFollowingUsers = computed(() => {
  return users.value.filter(user => !isFollowing(user.id))
})

// Add group-related functions
const fetchGroups = async () => {
  try {
    console.log('Fetching groups...')
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('No token found for fetching groups')
      return
    }

    const response = await axios.get('http://localhost:8090/api/v1/groups/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('Fetched groups:', response.data)
    groups.value = response.data.map((group: any) => ({
      ...group,
      members: group.members || [],
      admin: group.admin || { name: 'Unknown' }
    }))
  } catch (err) {
    console.error('Error fetching groups:', err)
    error.value = 'Failed to load groups'
  }
}

const createGroup = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token || !newGroupName.value) return

    await axios.post(`http://localhost:8090/api/v1/groups/create?name=${encodeURIComponent(newGroupName.value)}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    newGroupName.value = ''
    await fetchGroups()
    showModal('Group created successfully!')
  } catch (err) {
    showModal('Failed to create group', false)
  }
}

const joinGroup = async (groupId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    await axios.post(`http://localhost:8090/api/v1/groups/${groupId}/join`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    await fetchGroups()
    showModal('Successfully joined the group!')
  } catch (err) {
    showModal('Failed to join group', false)
  }
}

const leaveGroup = async (groupId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    await axios.post(`http://localhost:8090/api/v1/groups/${groupId}/leave`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    await fetchGroups()
    showModal('Successfully left the group!')
  } catch (err) {
    showModal('Failed to leave group', false)
  }
}

const deleteGroup = async (groupId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    await axios.delete(`http://localhost:8090/api/v1/groups/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    await fetchGroups()
    showModal('Group deleted successfully!')
  } catch (err) {
    showModal('Failed to delete group', false)
  }
}

const isGroupMember = (group: Group): boolean => {
  const currentUsername = getCurrentUsername()
  return group.members?.some(member => member.name === currentUsername) || false
}

const isGroupAdmin = (group: Group): boolean => {
  const currentUsername = getCurrentUsername()
  return group.admin?.name === currentUsername
}

const getCurrentUsername = (): string => {
  // You'll need to implement this based on how you store the current user's ID in your application
  return localStorage.getItem('username') || ''
}

// Helper function to show modal
const showModal = (message: string, success: boolean = true) => {
  modalMessage.value = message
  isModalSuccess.value = success
}

// Add toggle function
const toggleComments = (postId: string) => {
  isCommentsVisible.value[postId] = !isCommentsVisible.value[postId]
}

onMounted(async () => {
  await Promise.all([
    fetchUsers(),
    fetchFollowingUsers(),
    fetchFollowers(),
    fetchGroups()
  ])
  await fetchPosts()
})

onUnmounted(() => {
  // Clean up camera stream when component is unmounted
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
  }
})
</script>

<style scoped>
.feed-container {
  max-width: 1200px; /* Increased to accommodate the new layout */
  margin: 0 auto;
  padding: 20px;
  background-color: #000;
  min-height: 100vh;
  color: #fff;
  display: grid;
  grid-template-columns: 450px 1fr; /* Sidebar + main content */
  gap: 2rem;
}

.users-section {
  background: #111;
  border-radius: 12px;
  padding: 1rem;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.users-section h2 {
  margin: 0 0 0 0;
  font-size: 1.2rem;
  color: #fff;
  padding-bottom: 0rem;
  border-bottom: 1px solid #333;
}

.users-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #333;
  padding-bottom: 0.5rem;
}

.tab-btn {
  background: none;
  border: none;
  color: #666;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
  font-size: 0.9rem;
}

.tab-btn:hover {
  color: #fff;
  background: #222;
}

.tab-btn.active {
  color: #fff;
  background: #333;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  background: #1a1a1a;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-item:hover {
  background: #222;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.user-name {
  font-weight: 500;
  color: #fff;
}

.user-id {
  font-size: 0.7rem;
  color: #666;
}

.follow-btn {
  background: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  min-width: 80px;
}

.follow-btn:hover {
  background: #444;
  transform: translateY(-1px);
}

.follow-btn.following {
  background: #2c5282;
}

.follow-btn.following:hover {
  background: #2b6cb0;
}

.feed-section {
  min-width: 0; /* Prevents grid item from overflowing */
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
  transition: all 0.3s ease;
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

.comment-author {
  font-weight: 500;
  color: #fff;
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

.comment-input-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.camera-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  transform: scaleX(-1); /* Mirror the preview for selfie */
}

.camera-canvas {
  display: none;
}

.remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-image-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.camera-button {
  position: relative;
  width: 100%;
  height: 200px;
  background: #111;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.camera-controls {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.5);
  padding: 0.5rem;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.camera-btn {
  background: #333;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  gap: 0.3rem;
  padding: 0;
  background: #444;
  transform: translateY(-2px);
}

.camera-label {
  position: absolute;
  bottom: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  white-space: nowrap;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.reactions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  padding: 0.5rem;
  background: #111;
  border-radius: 8px;
}

.reaction-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.reaction-btn:hover {
  background: #222;
}

.reaction-btn.active {
  background: #333;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.comment-submit-btn {
  background: #fff;
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.comment-submit-btn:disabled {
  background: #333;
  color: #666;
  cursor: not-allowed;
}

.comment-submit-btn:not(:disabled):hover {
  background: #ddd;
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

.groups-section {
  margin-top: 1rem;
}

.create-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.group-input {
  flex: 1;
  background: #222;
  border: 1px solid #333;
  color: #fff;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.group-input:focus {
  outline: none;
  border-color: #444;
}

.create-group-btn {
  background: #2c5282;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.create-group-btn:hover:not(:disabled) {
  background: #2b6cb0;
}

.create-group-btn:disabled {
  background: #333;
  cursor: not-allowed;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  background: #1a1a1a;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.group-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.group-name {
  font-weight: 500;
  color: #fff;
}

.group-id {
  font-size: 0.7rem;
  color: #666;
}

.group-actions {
  display: flex;
  gap: 0.5rem;
}

.group-btn {
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
}

.group-btn.join {
  background: #2c5282;
  color: #fff;
}

.group-btn.join:hover {
  background: #2b6cb0;
}

.group-btn.leave {
  background: #666;
  color: #fff;
}

.group-btn.leave:hover {
  background: #777;
}

.group-btn.delete {
  background: #822c2c;
  color: #fff;
}

.group-btn.delete:hover {
  background: #b02b2b;
}

.group-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 0.3rem;
}

.group-admin,
.group-members {
  font-size: 0.8rem;
  color: #666;
}

.group-admin {
  color: #2c5282;
}
</style>
