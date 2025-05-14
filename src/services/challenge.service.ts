import axios from 'axios';

const API_URL = 'http://localhost:8090/api/v1';

export interface CreateChallengeRequest {
  title: string;
  content: string;
  groupId: string;
  point: number;
  challengeRewardTag: string;
  endTime: string;
}

export const challengeService = {
  async createChallenge(data: CreateChallengeRequest) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Creating challenge with data:', data);
      const response = await axios.post(
        `${API_URL}/challenge`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Challenge creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating challenge:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
}; 