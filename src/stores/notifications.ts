import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

interface Notification {
  id: number
  userId: string
  message: string
  timestamp: string
  read: boolean
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  const getAuthHeader = () => {
    const token = authStore.token
    console.log('Current token:', token)
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchNotifications = async () => {
    const currentUser = authStore.user
    console.log('Current user in fetchNotifications:', currentUser)
    console.log('Current user ID:', currentUser?.userId)
    console.log('Current user name:', currentUser?.name)
    console.log('Full auth store state:', authStore.$state)

    if (!currentUser?.userId) {
      console.error('No user ID available')
      error.value = 'User not authenticated'
      return
    }

    loading.value = true
    error.value = null

    try {
      const userId = currentUser.userId
      const url = `http://localhost:8090/api/v1/notifications/user/${userId}`
      const headers = getAuthHeader()
      console.log('Making request to:', url)
      console.log('With headers:', headers)
      
      const response = await axios.get(url, { headers })
      console.log('Notifications API response:', response.data)
      notifications.value = response.data
    } catch (error: any) {
      console.error('Error fetching notifications:', error)
      error.value = error.response?.data?.message || 'Failed to fetch notifications'
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      const url = `http://localhost:8090/api/v1/notifications/${notificationId}/read`
      const headers = getAuthHeader()
      console.log('Making request to:', url)
      console.log('With headers:', headers)
      
      await axios.put(url, {}, { headers })
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }
    } catch (error: any) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  const markAllAsRead = async () => {
    const currentUser = authStore.user
    if (!currentUser?.userId) {
      console.error('No user ID available')
      return
    }

    try {
      const url = `http://localhost:8090/api/v1/notifications/user/${currentUser.userId}/read`
      const headers = getAuthHeader()
      console.log('Making request to:', url)
      console.log('With headers:', headers)
      
      await axios.put(url, {}, { headers })
      // Update all notifications to read
      notifications.value.forEach(notification => {
        notification.read = true
      })
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      const url = `http://localhost:8090/api/v1/notifications/${notificationId}`
      const headers = getAuthHeader()
      console.log('Making request to:', url)
      console.log('With headers:', headers)
      
      await axios.delete(url, { headers })
      notifications.value = notifications.value.filter(n => n.id !== notificationId)
    } catch (error: any) {
      console.error('Error deleting notification:', error)
      throw error
    }
  }

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }
}) 