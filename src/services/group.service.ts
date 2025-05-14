import axios from 'axios';

const API_URL = 'http://localhost:8090/api/v1';

interface User {
  id: string;
  name: string;
  point: number;
  roles: string;
  groupAccessRole: string | null;
  challengeIds: string[];
}

export interface Group {
  id: string;
  name: string;
  challengeIds: string[];
  accessRoles: string[];
  admin: User;
  userList: User[];
}

export const groupService = {
  async createGroup(name: string) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${API_URL}/groups/create?name=${encodeURIComponent(name)}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  async getGroups(): Promise<Group[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/groups/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }
}; 