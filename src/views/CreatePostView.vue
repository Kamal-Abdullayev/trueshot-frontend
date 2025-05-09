<template>
  <div class="create-post">
    <div class="header">
      <h1>Create New Post</h1>
      <router-link to="/posts" class="back-btn">
        <i class="fas fa-arrow-left"></i>
      </router-link>
    </div>

    <form @submit.prevent="createPost" class="post-form">
      <div class="camera-container">
        <video ref="videoRef" class="camera-preview" autoplay playsinline></video>
        <canvas ref="canvasRef" class="camera-canvas" style="display: none;"></canvas>
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Preview" />
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
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const imagePreview = ref('')
const isCameraReady = ref(false)
const stream = ref<MediaStream | null>(null)

const post = ref({
  title: 'New Post', // Default title since we're focusing on image and content
  content: '',
  imageContent: ''
})

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
  if (!videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  const context = canvas.getContext('2d')

  if (!context) return

  // Set canvas dimensions to match video
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // Draw the current video frame on the canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height)

  // Convert canvas to base64 image
  const base64Image = canvas.toDataURL('image/jpeg')
  imagePreview.value = base64Image
  post.value.imageContent = base64Image.split(',')[1] // Remove data URL prefix

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

const createPost = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await axios.post('http://localhost:8090/api/v1/post', {
      title: post.value.title,
      content: post.value.content,
      imageContent: post.value.imageContent
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.status === 201) {
      router.push('/feed')
    }
  } catch (error) {
    alert('Failed to create post. Please try again.')
  }
}

onMounted(() => {
  startCamera()
})

onBeforeUnmount(() => {
  stopCamera()
})
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
}

.camera-preview {
  width: 100%;
  max-width: 100%;
  height: auto;
  aspect-ratio: 4/3;
  background-color: #000;
}

.camera-canvas {
  display: none;
}

.image-preview {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.camera-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background-color: #fff;
  color: #000;
  font-size: 1.5rem;
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
</style>
