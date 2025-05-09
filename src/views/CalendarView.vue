<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <h1>My Posts Calendar</h1>
      <div class="calendar-nav">
        <button @click="previousMonth" class="nav-btn">
          <i class="fas fa-chevron-left"></i>
        </button>
        <h2>{{ currentMonthYear }}</h2>
        <button @click="nextMonth" class="nav-btn">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <div class="calendar-grid">
      <div class="weekdays">
        <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
      </div>
      <div class="days">
        <div
          v-for="day in calendarDays"
          :key="day.date.toISOString()"
          :class="[
            'day',
            { 'has-post': day.hasPost },
            { 'has-image': day.hasImage },
            { 'other-month': !day.isCurrentMonth },
            { 'today': day.isToday }
          ]"
          @click="day.hasPost && day.post && showPostDetails(day.post)"
        >
          <span class="day-number">{{ day.dayNumber }}</span>
          <div class="post-indicators">
            <div v-if="day.hasPost" class="post-indicator"></div>
            <div v-if="day.hasImage" class="image-indicator"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Post Details Modal -->
    <div v-if="selectedPost" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
        <div class="post-details">
          <h3>{{ selectedPost.title }}</h3>
          <span class="post-date">{{ formatDate(selectedPost.createdAt) }}</span>
          <div v-if="selectedPost.url" class="post-image">
            <img :src="selectedPost.url" alt="Post image" @error="handleImageError" />
          </div>
          <p class="post-text">{{ selectedPost.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

interface CalendarDay {
  date: Date
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  hasPost: boolean
  hasImage: boolean
  post?: Post
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const currentDate = ref(new Date())
const posts = ref<Post[]>([])
const selectedPost = ref<Post | null>(null)
const loading = ref(true)
const error = ref('')

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days: CalendarDay[] = []

  // Add days from previous month
  const firstDayOfWeek = firstDay.getDay()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push(createCalendarDay(date, false))
  }

  // Add days from current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push(createCalendarDay(date, true))
  }

  // Add days from next month
  const remainingDays = 42 - days.length // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push(createCalendarDay(date, false))
  }

  return days
})

const createCalendarDay = (date: Date, isCurrentMonth: boolean): CalendarDay => {
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()

  const post = posts.value.find(p => {
    if (!p.createdAt) return false
    const postDate = new Date(p.createdAt)
    const isMatch = postDate.toDateString() === date.toDateString()
    if (isMatch) {
    }
    return isMatch
  })

  return {
    date,
    dayNumber: date.getDate(),
    isCurrentMonth,
    isToday,
    hasPost: !!post,
    hasImage: !!post?.url,
    post
  }
}

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

const showPostDetails = (post: Post) => {
  selectedPost.value = post
}

const closeModal = () => {
  selectedPost.value = null
}

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

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '' // Clear the src to prevent showing broken image icon
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
    posts.value = response.data
  } catch (err) {
    error.value = 'Failed to load posts'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.calendar-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #000;
  min-height: 100vh;
  color: #fff;
}

.calendar-header {
  margin-bottom: 2rem;
}

.calendar-header h1 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #fff;
}

.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.calendar-nav h2 {
  font-size: 1.4rem;
  font-weight: 500;
  color: #fff;
}

.nav-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.calendar-grid {
  background: #111;
  border-radius: 12px;
  padding: 1rem;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-weight: 500;
  color: #888;
  padding: 0.5rem;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day {
  aspect-ratio: 1;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.day:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.day.has-post {
  cursor: pointer;
}

.day.has-post:hover {
  background-color: rgba(33, 150, 243, 0.1);
}

.day.other-month {
  opacity: 0.5;
}

.day.today {
  border: 2px solid #2196F3;
}

.day-number {
  font-size: 1.1rem;
  font-weight: 500;
}

.post-indicators {
  display: flex;
  gap: 4px;
  margin-top: 0.25rem;
}

.post-indicator {
  width: 6px;
  height: 6px;
  background-color: #2196F3;
  border-radius: 50%;
}

.image-indicator {
  width: 6px;
  height: 6px;
  background-color: #fff;
  border-radius: 50%;
}

.day.has-image {
  cursor: pointer;
}

.day.has-image:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #111;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.post-details {
  color: #fff;
}

.post-details h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.post-date {
  color: #888;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 1rem;
}

.post-image {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: #000;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-text {
  line-height: 1.6;
  color: #fff;
  white-space: pre-wrap;
}
</style>
