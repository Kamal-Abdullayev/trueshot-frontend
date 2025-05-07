import axios from 'axios';
import { API_URL } from '@/config/api';

class NotificationService {
  async getNotifications() {
    try {
      const response = await axios.get(`${API_URL}/api/v1/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async createNotification(notification: { userId: string; message: string }) {
    try {
      const response = await axios.post(`${API_URL}/api/v1/notifications`, notification, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async triggerDailyChallenge() {
    try {
      const response = await axios.get(`${API_URL}/api/v1/notifications/test-daily-challenge`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error triggering daily challenge:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService(); 