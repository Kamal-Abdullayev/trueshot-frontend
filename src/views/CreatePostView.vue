<template>
  <div class="create-post">
    <div class="header">
      <h1>Create New Post</h1>
      <router-link to="/posts" class="back-btn">
        <i class="fas fa-arrow-left"></i>
      </router-link>
    </div>

    <form @submit.prevent="createPost" class="post-form">
      <div v-if="currentChallenge" class="challenge-info">
        <h3>Current Challenge</h3>
        <p class="challenge-title">{{ currentChallenge.title }}</p>
        <p class="challenge-points">{{ currentChallenge.point }} points</p>
        <p class="challenge-description">{{ currentChallenge.content }}</p>
      </div>

      <div class="camera-container">
        <video ref="videoRef" class="camera-preview" autoplay playsinline></video>
        <canvas ref="canvasRef" class="camera-canvas" style="display: none;"></canvas>
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Preview" @load="handleImageLoad" @error="handleImageError" />
        </div>
        <div v-if="!isCameraReady && !imagePreview" class="camera-error">
          <p>Camera not available</p>
          <button type="button" @click="retryCamera" class="retry-btn">
            <i class="fas fa-sync"></i> Retry Camera
          </button>
        </div>
      </div>

      <div class="camera-controls">
        <button
          v-if="!imagePreview"
          type="button"
          @click="takePicture"
          class="camera-btn"
          :disabled="!isCameraReady"
        >
          <i class="fas fa-camera"></i>
        </button>
        <button
          v-if="imagePreview"
          type="button"
          @click="retakePicture"
          class="camera-btn retake"
        >
          <i class="fas fa-redo"></i>
        </button>
      </div>

      <div class="form-group">
        <label for="content">Content (Optional)</label>
        <textarea
          id="content"
          v-model="post.content"
          placeholder="Write something about your picture..."
          rows="4"
        ></textarea>
      </div>

      <button type="submit" class="submit-btn" :disabled="!imagePreview">
        Create Post
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const imagePreview = ref('')
const isCameraReady = ref(false)
const stream = ref<MediaStream | null>(null)

const post = ref({
  title: 'New Post', // Default title since we're focusing on image and content
  content: '',
  imageContent: '',
  challengeId: '' // Add challengeId field
})

// Add new ref for challenge info
const currentChallenge = ref<Challenge | null>(null)

// Add Challenge interface
interface Challenge {
  id: string
  title: string
  content: string
  groupId: string
  createdBy: string
  point: number
  challengeRewardTag: string
  endTime: string
  challengeId: string
}

const startCamera = async () => {
  try {
    // First check if we have permission
    const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName })

    if (permissions.state === 'denied') {
      alert('Camera access is denied. Please enable camera access in your browser settings.')
      return
    }

    // Try to get the camera stream
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    })

    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
      // Wait for video to be ready
      await new Promise((resolve) => {
        if (videoRef.value) {
          videoRef.value.onloadedmetadata = () => {
            resolve(true)
          }
        }
      })
      isCameraReady.value = true
    }
  } catch (err) {
    if (err instanceof DOMException) {
      if (err.name === 'NotAllowedError') {
        alert('Camera access was denied. Please allow camera access and try again.')
      } else if (err.name === 'NotFoundError') {
        alert('No camera found. Please make sure you have a camera connected.')
      } else {
        alert(`Camera error: ${err.message}`)
      }
    } else {
      alert('Unable to access camera. Please make sure you have granted camera permissions.')
    }
  }
}

const takePicture = () => {
  if (!videoRef.value || !canvasRef.value) {
    console.error('Video or canvas reference is missing')
    return
  }

  const video = videoRef.value
  const canvas = canvasRef.value
  const context = canvas.getContext('2d')

  if (!context) {
    console.error('Could not get canvas context')
    return
  }

  console.log('Video dimensions:', {
    width: video.videoWidth,
    height: video.videoHeight
  })

  // Set canvas dimensions to match video
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // Draw the current video frame on the canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height)

  // Convert canvas to base64 image
  const base64Image = canvas.toDataURL('image/jpeg')
  console.log('Image captured, length:', base64Image.length)
  console.log('Image preview data:', base64Image.substring(0, 50) + '...') // Log first 50 chars of base64

  imagePreview.value = base64Image
  post.value.imageContent = base64Image.split(',')[1] // Remove data URL prefix

  // Verify image preview was set
  console.log('Image preview set:', !!imagePreview.value)
  console.log('Image preview length:', imagePreview.value.length)

  // Stop the camera stream
  stopCamera()
}

const retakePicture = () => {
  imagePreview.value = ''
  post.value.imageContent = ''
  startCamera()
}

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
  isCameraReady.value = false
}

const retryCamera = () => {
  stopCamera()
  startCamera()
}

// Add function to fetch challenge
const fetchChallenge = async (groupId: string) => {
  try {
    console.log('Fetching challenge for group:', groupId)
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No token found')
      return
    }

    const response = await axios.get(`http://localhost:8090/api/v1/groups/last-challenge/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('Challenge response:', response.data)

    if (response.data) {
      currentChallenge.value = response.data
      console.log('Challenge set with ID:', response.data.challengeId)
    } else {
      console.log('No challenge data in response')
      currentChallenge.value = null
    }
  } catch (err) {
    console.error('Error fetching challenge:', err)
    if (axios.isAxiosError(err)) {
      console.error('Response data:', err.response?.data)
      console.error('Response status:', err.response?.status)
    }
    currentChallenge.value = null
  }
}

// Update onMounted to ensure challenge is fetched
onMounted(async () => {
  const groupId = route.query.groupId as string
  console.log('Initial groupId:', groupId)

  if (groupId) {
    console.log('Fetching initial challenge for group:', groupId)
    await fetchChallenge(groupId)
  }

  startCamera()
})

const createPost = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Ensure we have the challenge ID from the route query
    const groupId = route.query.groupId as string
    console.log('Group ID from route:', groupId)

    // Always try to fetch the challenge if we have a groupId
    if (groupId) {
      console.log('Fetching challenge for group:', groupId)
      await fetchChallenge(groupId)
    }

    console.log('Current challenge before creating post:', currentChallenge.value)

    // Extract challenge ID from the response
    const challengeId = currentChallenge.value?.challengeId
    console.log('Extracted challenge ID:', challengeId)

    const postData = {
      title: post.value.title,
      content: post.value.content,
      imageContent: post.value.imageContent,
      challengeId: challengeId || null
    }

    console.log('Final post data being sent:', {
      ...postData,
      imageContent: postData.imageContent ? '[BASE64_IMAGE]' : null
    })

    const response = await axios.post('http://localhost:8090/api/v1/post', postData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.status === 201) {
      router.push('/feed')
    }
  } catch (error) {
    console.error('Error creating post:', error)
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data)
      console.error('Response status:', error.response?.status)
    }
    alert('Failed to create post. Please try again.')
  }
}

onMounted(() => {
  startCamera()
})

onBeforeUnmount(() => {
  stopCamera()
})

const handleImageLoad = (event: Event) => {
  console.log('Image loaded successfully')
  const img = event.target as HTMLImageElement
  console.log('Image natural dimensions:', {
    width: img.naturalWidth,
    height: img.naturalHeight
  })
}

const handleImageError = (event: Event) => {
  console.error('Error loading image')
  const img = event.target as HTMLImageElement
  console.error('Image failed to load')
}
</script>

<style scoped>
.create-post {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #000;
  min-height: 100vh;
  color: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem 0;
  border-bottom: 1px solid #333;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.back-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.post-form {
  background: #111;
  padding: 1.5rem;
  border-radius: 12px;
}

.camera-container {
  margin-bottom: 1.5rem;
  text-align: center;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 4/3;
  margin: 0 auto 1.5rem;
  position: relative;
}

.camera-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.camera-canvas {
  display: none;
}

.image-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.camera-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.camera-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background-color: #fff;
  color: #000;
  font-size: 0.8rem;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-btn:disabled {
  background-color: #333;
  color: #666;
  cursor: not-allowed;
}

.camera-btn:not(:disabled):hover {
  transform: scale(1.1);
}

.camera-btn.retake {
  background-color: #2196F3;
  color: white;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #fff;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #333;
  border-radius: 8px;
  font-size: 1rem;
  background: #000;
  color: #fff;
  resize: vertical;
}

textarea:focus {
  outline: none;
  border-color: #2196F3;
}

.submit-btn {
  background-color: #2196F3;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
}

.submit-btn:disabled {
  background-color: #333;
  color: #666;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  background-color: #1976D2;
}

.camera-error {
  padding: 2rem;
  text-align: center;
  color: #ff4444;
}

.retry-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background-color: #1976D2;
}

.retry-btn i {
  font-size: 1.1em;
}

.challenge-info {
  background: linear-gradient(145deg, #1a1a1a, #222);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #333;
}

.challenge-info h3 {
  color: #fff;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.challenge-title {
  color: #fff;
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
}

.challenge-points {
  color: #f6e05e;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.challenge-description {
  color: #bbb;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}
</style>
