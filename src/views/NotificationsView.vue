<template>
  <div class="notifications-container">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Notifications</h1>
      <button
        v-if="notificationsStore.notifications.length > 0"
        @click="markAllAsRead"
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
      >
        Mark all as read
      </button>
    </div>
    
    <div v-if="notificationsStore.loading" class="loading">
      Loading notifications...
    </div>
    
    <div v-else-if="notificationsStore.error" class="error">
      {{ notificationsStore.error }}
    </div>
    
    <div v-else-if="notificationsStore.notifications.length === 0" class="no-notifications">
      No notifications yet
    </div>
    
    <div v-else class="notifications-list">
      <div
        v-for="notification in notificationsStore.notifications"
        :key="notification.id"
        class="notification-item"
        :class="{ 'unread': !notification.read }"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-content">
          <p class="message">{{ notification.message }}</p>
          <p class="timestamp">{{ formatDate(notification.timestamp) }}</p>
        </div>
        <div class="notification-actions">
          <button
            v-if="!notification.read"
            class="mark-read-btn"
            @click.stop="markAsRead(notification.id)"
          >
            Mark as Read
          </button>
          <button
            class="delete-btn"
            @click.stop="deleteNotification(notification.id)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Notification Details Modal -->
    <div v-if="selectedNotification" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" @click="closeModal">
      <div class="bg-white rounded-lg p-6 max-w-lg w-full" @click.stop>
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold">Notification Details</h2>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <p class="text-gray-800 mb-4">{{ selectedNotification.message }}</p>
        <p class="text-sm text-gray-500">{{ formatDate(selectedNotification.timestamp) }}</p>
        <div class="mt-6 flex justify-end gap-4">
          <button
            v-if="!selectedNotification.read"
            @click="markAsRead(selectedNotification.id)"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Mark as read
          </button>
          <button
            @click="deleteNotification(selectedNotification.id)"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { useNotificationsStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'

const notificationsStore = useNotificationsStore()
const authStore = useAuthStore()
const selectedNotification = ref(null)

const formatDate = (date: string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

const handleNotificationClick = (notification) => {
  selectedNotification.value = notification
  if (!notification.read) {
    markAsRead(notification.id)
  }
}

const markAsRead = async (id: number) => {
  try {
    await notificationsStore.markAsRead(id)
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

const deleteNotification = async (id: number) => {
  try {
    await notificationsStore.deleteNotification(id)
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
  closeModal()
}

const closeModal = () => {
  selectedNotification.value = null
}

const markAllAsRead = async () => {
  try {
    await notificationsStore.markAllAsRead()
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

onMounted(async () => {
  console.log('NotificationsView mounted')
  console.log('Current user:', authStore.user)
  await notificationsStore.fetchNotifications()
})
</script>

<style scoped>
.notifications-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.notification-item.unread {
  border-left: 4px solid #4CAF50;
  background-color: #f8fff8;
}

.notification-content {
  flex: 1;
}

.message {
  margin: 0;
  font-size: 1.1em;
  color: #333;
}

.timestamp {
  margin: 4px 0 0;
  font-size: 0.9em;
  color: #666;
}

.notification-actions {
  display: flex;
  gap: 8px;
}

button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s;
}

.mark-read-btn {
  background-color: #4CAF50;
  color: white;
}

.mark-read-btn:hover {
  background-color: #45a049;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #da190b;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  text-align: center;
  padding: 20px;
  color: #f44336;
}

.no-notifications {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style> 