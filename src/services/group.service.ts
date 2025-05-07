import axios from 'axios';
import { API_URL } from '@/config/api';

interface User {
  id: string;
  name: string;
  roles: string;
}

interface Group {
  id: string;
  name: string;
  admin: User;
  members: User[];
}

class GroupService {
  async getAllGroups() {
    try {
      const response = await axios.get<Group[]>(`${API_URL}/api/v1/groups/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  // Alias for backward compatibility
  async getGroups() {
    return this.getAllGroups();
  }

  async getGroupById(id: string) {
    try {
      const response = await axios.get<Group>(`${API_URL}/api/v1/groups/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching group:', error);
      throw error;
    }
  }

  async createGroup(name: string) {
    try {
      const response = await axios.post<Group>(`${API_URL}/api/v1/groups`, { name }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async addMemberToGroup(groupId: string, userId: string) {
    try {
      const response = await axios.post(`${API_URL}/api/v1/groups/${groupId}/members`, { userId }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding member to group:', error);
      throw error;
    }
  }

  async removeMemberFromGroup(groupId: string, userId: string) {
    try {
      const response = await axios.delete(`${API_URL}/api/v1/groups/${groupId}/members/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing member from group:', error);
      throw error;
    }
  }
}

export const groupService = new GroupService(); 