import axios from 'axios';
import type { FeedResponse } from '@/types/post';

const API_URL = 'http://localhost:8090/api/v1';

export const feedService = {
  async getFeed(token: string): Promise<FeedResponse> {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }


      const response = await axios.get<FeedResponse>(`${API_URL}/feed`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch feed');
      }
      throw error;
    }
  }
};
