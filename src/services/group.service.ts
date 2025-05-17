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
  async createGroup(data: { 
    name: string, 
    exclusive: boolean, 
    allowedUsernames: string[] 
  }) {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No authentication token found')

    const params = new URLSearchParams()
    params.append('name', data.name)
    params.append('exclusive', data.exclusive.toString())
    
    // Add each username as a separate parameter
    data.allowedUsernames.forEach(username => {
      params.append('allowedUsernames', username)
    })

    const response = await axios.post(
      `http://localhost:8090/api/v1/groups/create?${params.toString()}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
    return response.data
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