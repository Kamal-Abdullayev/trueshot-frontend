import axios from 'axios';
import type { SignupRequest, LoginRequest, AuthResponse } from '@/types/auth';

const API_URL = 'http://localhost:8090/api/v1';

// Helper function to decode JWT token
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

export const authService = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/signup`, data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Get the token
      const response = await axios.post(`${API_URL}/auth/authenticate`, data);
      const token = response.data;
      console.log('Received token:', token);

      // Decode the token to get user information
      const decodedToken = parseJwt(token);
      console.log('Decoded token:', decodedToken);

      if (!decodedToken) {
        throw new Error('Failed to decode token');
      }

      // Return the token and user object with the userId from the token
      return {
        token,
        user: {
          userId: decodedToken.userId,
          name: decodedToken.sub,
          roles: 'USER',
          following: [],
          followers: []
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
};
