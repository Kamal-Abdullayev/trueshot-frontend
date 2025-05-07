import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_URL = 'http://localhost:8090/api/v1';

export interface Group {
  id: string;
  name: string;
  adminUsername: string;
}

const getAuthHeader = () => {
  const authStore = useAuthStore();
  return {
    Authorization: `Bearer ${authStore.getToken}`
  };
};

export const groupService = {
  async createGroup(name: string): Promise<Group> {
    const response = await axios.post(
      `${API_URL}/groups/create?name=${encodeURIComponent(name)}`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  async getGroups(): Promise<Group[]> {
    const response = await axios.get(
      `${API_URL}/groups`,
      { headers: getAuthHeader() }
    );
    return response.data;
  }
}; 