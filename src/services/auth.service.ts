import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import type { SignupRequest, LoginRequest, AuthResponse } from '@/types/auth';

const API_URL = 'http://localhost:8090/api/v1';

interface JwtPayload {
  sub: string;  // username
  iat: number;  // issued at
  exp: number;  // expiration
}

export const authService = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      console.log('Attempting signup with data:', data);
      const response = await axios.post(`${API_URL}/auth/signup`, data);
      console.log('Signup response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('Attempting login with data:', data);
      const authResponse = await axios.post(`${API_URL}/auth/authenticate`, data);
      console.log('Authentication response:', authResponse.data);
      const token = authResponse.data;

      // Decode the JWT token to get user information
      const decoded = jwtDecode<JwtPayload>(token);
      console.log('Decoded token:', decoded);

      // Create user object from token data
      const user = {
        id: decoded.sub, // Using username as ID for now
        name: decoded.sub,
        roles: 'ADMIN', // Since this is an admin user
        following: [],
        followers: []
      };

      console.log('Created user object:', user);

      return {
        token,
        user
      };
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        console.error('Response headers:', error.response?.headers);
      }
      throw error;
    }
  }
};
