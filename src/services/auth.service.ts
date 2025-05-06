import axios from 'axios';
import type { SignupRequest, LoginRequest, AuthResponse } from '@/types/auth';

const API_URL = 'http://localhost:8090/api/v1';

export const authService = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/signup`, data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/authenticate`, data);
    // If the response is just the token string, wrap it in an object
    if (typeof response.data === 'string') {
      return {
        token: response.data,
        user: {
          id: 'temp', // We'll get the real ID later
          name: data.name,
          roles: 'USER',
          following: [],
          followers: []
        }
      };
    }
    return response.data;
  }
};
