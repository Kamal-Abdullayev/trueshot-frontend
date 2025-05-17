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
        <!-- User's Joined Groups -->
        <div v-if="userJoinedGroups.length > 0" class="groups-section-header">
          <h3>My Groups</h3>
        </div>
        <div class="groups-list">
          <div v-for="group in userJoinedGroups" :key="group.id" class="group-item">
            <div class="group-info">
              <span class="group-name">{{ group.name }}</span>
              <div class="group-details">
                <span class="group-admin">Admin: {{ group.admin?.name || 'Unknown' }}</span>
                <span class="group-members">Members: {{ group.userList?.length || 0 }}</span>
                <span class="group-exclusive" v-if="group.exclusive">Exclusive Group</span>

              </div>
            </div>
            <div class="group-actions">
              <button
                @click="viewGroupDetails(group.id)"
                class="group-btn details"
              >
                Details
              </button>
              <button
                @click="leaveGroup(group.id)"
                class="group-btn leave"
              >
                Leave
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

        <!-- Exclusive Groups Section -->
        <div v-if="exclusiveGroups.length > 0" class="groups-section-header">
          <h3>Exclusive Groups</h3>
        </div>
        <div class="groups-list">
          <div v-for="group in exclusiveGroups" :key="group.id" class="group-item">
            <div class="group-info">
              <span class="group-name">{{ group.name }}</span>
              <div class="group-details">
                <span class="group-admin">Admin: {{ group.admin?.name || 'Unknown' }}</span>
                <span class="group-members">Members: {{ group.userList?.length || 0 }}</span>
                <span class="group-exclusive">Exclusive Group</span>
              </div>
            </div>
            <div class="group-actions">
              <button
                @click="joinGroup(group.id)"
                class="group-btn join"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <!-- Other Groups -->
        <div class="groups-section-header">
          <h3>Other Groups ({{ otherGroups.length }})</h3>
        </div>
        <div class="groups-list">
          <div v-if="!otherGroups || otherGroups.length === 0" class="no-groups">
            <p>No other groups available</p>
          </div>
          <div v-else v-for="group in otherGroups" :key="group.id" class="group-item">
            <div class="group-info">
              <span class="group-name">{{ group.name }}</span>
              <div class="group-details">
                <span class="group-admin">Admin: {{ group.admin?.name || 'Unknown' }}</span>
                <span class="group-members">Members: {{ group.userList?.length || 0 }}</span>
              </div>
            </div>
            <div class="group-actions">
              <button
                @click="joinGroup(group.id)"
                class="group-btn join"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <!-- No Groups Message -->
        <div v-if="userJoinedGroups.length === 0 && (!otherGroups || otherGroups.length === 0)" class="no-groups">
          <p>No groups available</p>
        </div>
      </div>
    </div>

    <!-- Feed section -->
    <div class="feed-section">
      <div class="feed-header">
        <div class="feed-title">
          <h1>{{ isViewingGroupPosts ? currentGroupName + ' Posts' : 'Feed' }}</h1>
          <button
            v-if="isViewingGroupPosts"
            @click="returnToNormalFeed"
            class="return-feed-btn"
          >
            <i class="fas fa-arrow-left"></i>
            Return to Feed
          </button>
        </div>
      </div>

      <!-- Challenge Section -->
      <div v-if="isViewingGroupPosts" class="challenge-section">
        <div v-if="currentChallenge" class="current-challenge">
          <div class="challenge-header">
            <div class="challenge-title-section">
              <h3>Current Challenge</h3>
              <span class="challenge-badge">{{ currentChallenge.challengeRewardTag }}</span>
            </div>
            <div class="challenge-points">
              <i class="fas fa-star"></i>
              <span>{{ currentChallenge.point }} points</span>
            </div>
          </div>
          <div class="challenge-content">
            <h4 class="challenge-title">{{ currentChallenge.title }}</h4>
            <p class="challenge-description">{{ currentChallenge.content }}</p>
            <div class="challenge-meta">
              <div class="meta-item creator">
                <i class="fas fa-user"></i>
                <div class="meta-content">
                  <span class="meta-label">Created by</span>
                  <span class="meta-value">{{ currentChallenge.createdBy }}</span>
                </div>
              </div>
              <div class="meta-item deadline">
                <i class="fas fa-clock"></i>
                <div class="meta-content">
                  <span class="meta-label">Ends in</span>
                  <span class="meta-value">{{ formatDate(currentChallenge.endTime) }}</span>
                </div>
              </div>
            </div>
          </div>
          <router-link
            :to="{ path: '/create-post', query: { groupId: currentGroupId } }"
            class="create-post-btn"
          >
            <i class="fas fa-camera"></i>
            Create Post for Challenge
          </router-link>
        </div>
        <div v-else class="no-challenge">
          <div class="no-challenge-content">
            <i class="fas fa-trophy"></i>
            <p>No active challenge for this group</p>
            <span class="no-challenge-subtext">Check back later for new challenges!</span>
          </div>
        </div>
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
        <p>{{ isViewingGroupPosts ? 'No posts in this group yet.' : 'No posts available yet.' }}</p>
        <router-link v-if="!isViewingGroupPosts" to="/create-post" class="create-first-post-btn">
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
          <!-- Voting arrows: only show in group view under a challenge -->
          <div
            v-if="isViewingGroupPosts && currentChallenge"
            class="post-voting"
          >
            <button
              @click="upvotePost(post)"
              class="vote-btn upvote"
              :class="{ active: getUserVoteState(post) === 'up' }"
              title="Upvote"
            >
              ▲
              <span class="vote-count upvote-count">{{ post.vote?.upVotes || 0 }}</span>
            </button>
            <button
              @click="downvotePost(post)"
              class="vote-btn downvote"
              :class="{ active: getUserVoteState(post) === 'down' }"
              title="Downvote"
            >
              ▼
              <span class="vote-count downvote-count">{{ post.vote?.downVotes || 0 }}</span>
            </button>
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

    <!-- Add Post Modal -->
    <div v-if="showPostModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Create New Post</h3>
          <button @click="showPostModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="post-title">Title</label>
            <input
              id="post-title"
              v-model="newPostTitle"
              type="text"
              placeholder="Enter post title"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="post-content">Content</label>
            <textarea
              id="post-content"
              v-model="newPostContent"
              placeholder="Enter post content"
              class="form-textarea"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="post-image">Image</label>
            <div class="image-upload">
              <input
                id="post-image"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="file-input"
              />
              <div v-if="newPostImage" class="image-preview">
                <img :src="newPostImage" alt="Preview" />
                <button @click="newPostImage = null" class="remove-image">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
          <div v-if="currentChallenge" class="form-group challenge-toggle">
            <label class="toggle-label">
              <input
                type="checkbox"
                v-model="addToChallenge"
                class="toggle-input"
              />
              <span class="toggle-text">Add to current challenge</span>
              <div class="challenge-info" v-if="addToChallenge">
                <p class="challenge-name">{{ currentChallenge.title }}</p>
                <p class="challenge-points">{{ currentChallenge.point }} points</p>
              </div>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showPostModal = false" class="cancel-btn">Cancel</button>
          <button
            @click="createPost"
            :disabled="isUploading || !newPostTitle || !newPostContent || !newPostImage"
            class="submit-btn"
          >
            <span v-if="isUploading">Creating...</span>
            <span v-else>Create Post</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import ErrorModal from '@/components/ErrorModal.vue'
import ActionModal from '@/components/ActionModal.vue'
import { useRouter } from 'vue-router'

interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  url: string | null
  createdAt: string
}

interface Vote {
  id: string
  upVotes: number
  downVotes: number
  userIdsUpVoted: string[]
  userIdsDownVoted: string[]
}

interface Post {
  id: string
  title: string
  content: string
  url?: string
  userId: string
  challengeId?: string
  vote?: Vote | null
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
  challengeIds: string[]
  accessRoles: string[]
  admin: User
  userList: User[]
}

interface UserGroup {
  id: string
  name: string
  challengeIds: string[]
  accessRoles: string[]
  admin: User
  userList: User[]
}

interface Challenge {
  id: string
  title: string
  content: string
  groupId: string
  createdBy: string
  point: number
  challengeRewardTag: string
  endTime: string
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
const userJoinedGroups = ref<Group[]>([])
const otherGroups = ref<Group[]>([])
const exclusiveGroups = ref<Group[]>([])

// Add new refs for modal
const modalMessage = ref('')
const isModalSuccess = ref(true)

// Add new ref for comments visibility
const isCommentsVisible = ref<Record<string, boolean>>({})

// Add new refs after other refs
const isViewingGroupPosts = ref(false)
const currentGroupId = ref('')
const currentGroupName = ref('')

// Add new ref for current challenge
const currentChallenge = ref<Challenge | null>(null)

// Add new refs for post creation
const showPostModal = ref(false)
const newPostTitle = ref('')
const newPostContent = ref('')
const newPostImage = ref<string | null>(null)
const isUploading = ref(false)

// Add new ref for challenge toggle
const addToChallenge = ref(false)

const router = useRouter()

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

    // Ensure each post has a properly structured vote object
    posts.value = response.data.map((post: Post) => ({
      ...post,
      vote: post.vote ? {
        id: post.vote.id,
        upVotes: post.vote.upVotes,
        downVotes: post.vote.downVotes,
        userIdsUpVoted: post.vote.userIdsUpVoted || [],
        userIdsDownVoted: post.vote.userIdsDownVoted || []
      } : null
    }))

    // Fetch comments for each post
    for (const post of posts.value) {
      await fetchComments(post.id)
    }
  } catch (err) {
    console.error('Error fetching posts:', err)
    error.value = 'Failed to load posts'
  } finally {
    loading.value = false
  }
}

const refreshVotes = async (postId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await axios.get(`http://localhost:8090/api/v1/post/${postId}/votes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('Vote response for post', postId, ':', response.data)

    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.vote = {
        id: response.data.id,
        upVotes: response.data.upVotes,
        downVotes: response.data.downVotes,
        userIdsUpVoted: response.data.userIdsUpVoted || [],
        userIdsDownVoted: response.data.userIdsDownVoted || []
      }
      console.log('Updated post vote data:', post.vote)
    }
  } catch (err) {
    console.error('Error refreshing votes:', err)
  }
}

// Helper function to get vote count
const voteCount = (post: Post, type: 'up' | 'down') => {
  if (!post.vote) {
    console.log('No vote data for post:', post.id)
    return 0
  }
  const count = type === 'up' ? post.vote.upVotes : post.vote.downVotes
  console.log(`Vote count for post ${post.id} (${type}):`, count)
  return count || 0
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
    const token = localStorage.getItem('token')
    if (!token) return

    // Fetch user's joined groups
    const userGroupsResponse = await axios.get('http://localhost:8090/api/v1/auth/user-groups', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    userJoinedGroups.value = userGroupsResponse.data.groupIds || []

    // Fetch all other groups
    const allGroupsResponse = await axios.get('http://localhost:8090/api/v1/groups', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('Other groups response:', allGroupsResponse.data)

    // Filter exclusive groups
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').userId
    exclusiveGroups.value = allGroupsResponse.data.filter((group: Group) =>
      group.exclusive &&
      group.allowedUsers?.some(user => user.id === currentUserId)
    )

    // Filter out exclusive groups from otherGroups
    otherGroups.value = allGroupsResponse.data.filter((group: Group) =>
      !group.exclusive &&
      !group.allowedUsers?.some(user => user.id === currentUserId)
    )

    console.log('Other groups after assignment:', otherGroups.value)
  } catch (err) {
    console.error('Error fetching groups:', err)
    error.value = 'Failed to load groups'
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

// Add the viewGroupDetails function
const viewGroupDetails = async (groupId: string) => {
  try {
    console.log('Viewing group details for:', groupId)
    const group = userJoinedGroups.value.find(g => g.id === groupId) ||
                  otherGroups.value.find(g => g.id === groupId)

    if (group) {
      console.log('Found group:', group)
      currentGroupId.value = groupId
      currentGroupName.value = group.name
      isViewingGroupPosts.value = true

      // First fetch the challenge
      await fetchGroupChallenge(groupId)
      console.log('Challenge fetch completed')

      // Then fetch the posts
      await fetchGroupPosts(groupId)
      console.log('Posts fetch completed')
    } else {
      console.error('Group not found:', groupId)
    }
  } catch (err) {
    console.error('Error in viewGroupDetails:', err)
  }
}

// Add function to return to normal feed
const returnToNormalFeed = async () => {
  isViewingGroupPosts.value = false
  currentGroupId.value = ''
  currentGroupName.value = ''
  currentChallenge.value = null
  await fetchPosts()
}

// Add new function to fetch group posts
const fetchGroupPosts = async (groupId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    console.log('Fetching group posts for group:', groupId)
    const response = await axios.get(`http://localhost:8090/api/v1/groups/posts/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('Raw group posts response:', JSON.stringify(response.data, null, 2))

    // Map the response data directly since it already has the correct structure
    posts.value = response.data.map((post: Post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      url: post.url,
      userId: post.userId,
      challengeId: post.challengeId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      vote: post.vote ? {
        id: post.vote.id,
        upVotes: post.vote.upVotes,
        downVotes: post.vote.downVotes,
        userIdsUpVoted: post.vote.userIdsUpVoted || [],
        userIdsDownVoted: post.vote.userIdsDownVoted || []
      } : null
    }))

    console.log('Processed posts with votes:', JSON.stringify(posts.value, null, 2))

    // Fetch comments for each post
    for (const post of posts.value) {
      await fetchComments(post.id)
    }
  } catch (err) {
    console.error('Error fetching group posts:', err)
    error.value = 'Failed to load group posts'
  }
}

// Add function to fetch group challenge
const fetchGroupChallenge = async (groupId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No token found')
      return
    }

    console.log('Fetching challenge for group:', groupId)
    const url = `http://localhost:8090/api/v1/groups/last-challenge/${groupId}`
    console.log('Request URL:', url)

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('Challenge response status:', response.status)
    console.log('Challenge response data:', response.data)

    if (response.data) {
      currentChallenge.value = response.data
      console.log('Challenge set to:', currentChallenge.value)
    } else {
      console.log('No challenge data in response')
      currentChallenge.value = null
    }
  } catch (err: any) {
    console.error('Error fetching group challenge:', err)
    if (err.response) {
      console.error('Error response:', {
        status: err.response.status,
        data: err.response.data
      })
    }
    currentChallenge.value = null
  }
}

// Update createPost function
const createPost = async () => {
  try {
    if (!newPostTitle.value || !newPostContent.value || !newPostImage.value) {
      showModal('Please fill in all fields and add an image', false)
      return
    }

    isUploading.value = true
    const token = localStorage.getItem('token')
    if (!token) {
      showModal('Please log in to create a post', false)
      return
    }

    // Check if user wants to add to challenge but there's no active challenge
    if (addToChallenge.value && !currentChallenge.value?.id) {
      showModal('No active challenge found', false)
      return
    }

    const postData: {
      title: string;
      content: string;
      imageContent: string;
      challengeId?: string;
    } = {
      title: newPostTitle.value,
      content: newPostContent.value,
      imageContent: newPostImage.value.split(',')[1] // Remove the data:image/jpeg;base64, prefix
    }

    // Add challengeId only if user wants to add to challenge
    if (addToChallenge.value && currentChallenge.value?.id) {
      postData.challengeId = currentChallenge.value.id
    }

    const response = await axios.post(
      'http://localhost:8090/api/v1/post',
      postData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    showModal('Post created successfully!')
    showPostModal.value = false
    resetPostForm()
    await fetchGroupPosts(currentGroupId.value)
  } catch (err) {
    console.error('Error creating post:', err)
    showModal('Failed to create post', false)
  } finally {
    isUploading.value = false
  }
}

// Update resetPostForm to include resetting challenge toggle
const resetPostForm = () => {
  newPostTitle.value = ''
  newPostContent.value = ''
  newPostImage.value = null
  addToChallenge.value = false
}

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        newPostImage.value = e.target.result as string
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}

const currentUserId = localStorage.getItem('userId') || ''

function getUserVoteState(post: Post): 'up' | 'down' | null {
  if (!post.vote) return null
  const currentUserId = localStorage.getItem('userId')
  if (!currentUserId) return null

  if (post.vote.userIdsUpVoted?.includes(currentUserId)) return 'up'
  if (post.vote.userIdsDownVoted?.includes(currentUserId)) return 'down'
  return null
}

const upvotePost = async (post: Post) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await axios.post(`http://localhost:8090/api/v1/post/${post.id}/upvote`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    // Update the vote count directly from the response
    if (post.vote) {
      post.vote.upVotes = response.data
    } else {
      post.vote = {
        id: '',
        upVotes: response.data,
        downVotes: 0,
        userIdsUpVoted: [],
        userIdsDownVoted: []
      }
    }

    // Refresh the full vote state to get updated userIdsUpVoted and userIdsDownVoted
    await refreshVotes(post.id)
  } catch (err) {
    console.error('Error upvoting post:', err)
    showModal('Failed to upvote post', false)
  }
}

const downvotePost = async (post: Post) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await axios.post(`http://localhost:8090/api/v1/post/${post.id}/downvote`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    // Update the vote count directly from the response
    if (post.vote) {
      post.vote.downVotes = response.data
    } else {
      post.vote = {
        id: '',
        upVotes: 0,
        downVotes: response.data,
        userIdsUpVoted: [],
        userIdsDownVoted: []
      }
    }

    // Refresh the full vote state to get updated userIdsUpVoted and userIdsDownVoted
    await refreshVotes(post.id)
  } catch (err) {
    console.error('Error downvoting post:', err)
    showModal('Failed to downvote post', false)
  }
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
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 50%;
  transform: scaleX(-1); /* Mirror the preview for selfie */
  margin: 0 auto;
  overflow: hidden; /* Add this to ensure the image stays within the circular boundary */
}

.camera-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transform: scaleX(-1); /* Mirror the image for selfie */
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
  width: 200px;
  height: 200px;
  background: #111;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 0 auto;
}

.camera-button .camera-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transform: scaleX(-1);
}

.camera-button .camera-canvas {
  display: none;
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
  width: 30px;
  height: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  gap: 0.3rem;
  padding: 0;
  background: #444;
  transform: translateY(-2px);
}

.camera-label {
  position: absolute;
  bottom: -1rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.5rem;
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
  width: 200px;
  height: 200px;
  margin: 0.5rem auto;
  border-radius: 50%;
  overflow: hidden;
  background: #000;
}

.comment-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transform: scaleX(-1); /* Mirror the image for selfie */
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

.group-btn.details {
  background: #2c5282;
  color: #fff;
}

.group-btn.details:hover {
  background: #2b6cb0;
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

.groups-section-header {
  margin: 1.5rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #333;
}

.groups-section-header h3 {
  color: #fff;
  font-size: 1.1rem;
  margin: 0;
}

.no-groups {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: #1a1a1a;
  border-radius: 8px;
  margin-top: 1rem;
}

.feed-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.return-feed-btn {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: #2c5282;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
  margin-top: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.return-feed-btn:hover {
  background: #2b6cb0;
  transform: translateX(-4px);
}

.return-feed-btn i {
  font-size: 1rem;
}

.challenge-section {
  margin: 0;
  max-width: 100%;
}

.current-challenge {
  background: linear-gradient(145deg, #1a1a1a, #222);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid #333;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.current-challenge:hover {
  transform: translateY(-2px);
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.challenge-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.challenge-header h3 {
  color: #fff;
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.challenge-badge {
  background: linear-gradient(135deg, #2c5282, #2b6cb0);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.challenge-points {
  background: rgba(44, 82, 130, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
  font-weight: 500;
}

.challenge-points i {
  color: #f6e05e;
}

.challenge-content {
  color: #ddd;
}

.challenge-title {
  color: #fff;
  margin: 0 0 1rem 0;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.challenge-description {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  color: #bbb;
  line-height: 1.6;
  letter-spacing: 0.2px;
}

.challenge-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #888;
}

.meta-item i {
  color: #2c5282;
  font-size: 1.2rem;
  background: rgba(44, 82, 130, 0.2);
  padding: 0.8rem;
  border-radius: 12px;
}

.meta-content {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.meta-label {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 1rem;
  color: #fff;
  font-weight: 500;
}

.no-challenge {
  background: linear-gradient(145deg, #1a1a1a, #222);
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  color: #666;
  border: 1px solid #333;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.no-challenge-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-challenge i {
  font-size: 3rem;
  color: #2c5282;
  margin-bottom: 0.5rem;
  opacity: 0.8;
}

.no-challenge p {
  margin: 0;
  font-size: 1.2rem;
  color: #fff;
  font-weight: 500;
}

.no-challenge-subtext {
  font-size: 0.9rem;
  color: #666;
}

.add-post-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #2c5282;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1.5rem;
  text-decoration: none;
  width: 100%;
}

.add-post-btn:hover {
  background: #2b6cb0;
  transform: translateY(-2px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a1a;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #333;
}

.modal-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #fff;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #fff;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.8rem;
  background: #222;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.image-upload {
  border: 2px dashed #333;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
}

.file-input {
  display: none;
}

.image-preview {
  position: relative;
  margin-top: 1rem;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
}

.remove-image {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: #fff;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #333;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-btn,
.submit-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #333;
  color: #fff;
  border: none;
}

.cancel-btn:hover {
  background: #444;
}

.submit-btn {
  background: #2c5282;
  color: #fff;
  border: none;
}

.submit-btn:hover:not(:disabled) {
  background: #2b6cb0;
}

.submit-btn:disabled {
  background: #1a365d;
  cursor: not-allowed;
  opacity: 0.7;
}

.challenge-toggle {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(44, 82, 130, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(44, 82, 130, 0.2);
}

.toggle-label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
}

.toggle-input {
  margin-right: 0.5rem;
}

.toggle-text {
  font-weight: 500;
  color: #fff;
}

.challenge-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(44, 82, 130, 0.2);
  border-radius: 4px;
}

.challenge-name {
  margin: 0;
  color: #fff;
  font-weight: 500;
}

.challenge-points {
  margin: 0.2rem 0 0 0;
  color: #f6e05e;
  font-size: 0.9rem;
}

.create-post-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  background: #2c5282;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1.5rem;
  text-decoration: none;
  width: 100%;
}

.create-post-btn:hover {
  background: #2b6cb0;
  transform: translateY(-2px);
}

.create-post-btn i {
  font-size: 1.2rem;
}

.post-voting {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.vote-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #bbb;
  transition: color 0.2s, background 0.2s;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.vote-btn.upvote.active {
  color: #2c5282;
  background: rgba(44, 82, 130, 0.1);
}

.vote-btn.downvote.active {
  color: #b02b2b;
  background: rgba(176, 43, 43, 0.1);
}

.vote-count {
  font-size: 1.1rem;
  font-weight: 600;
  margin-left: 0.3rem;
}

.upvote-count {
  color: #2c5282;
}

.downvote-count {
  color: #b02b2b;
}

.group-exclusive {
  font-size: 0.8rem;
  color: #f6e05e;
  background: rgba(246, 224, 94, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-top: 0.3rem;
  display: inline-block;
}
</style>
