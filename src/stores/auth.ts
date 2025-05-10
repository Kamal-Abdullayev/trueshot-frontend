import { defineStore } from 'pinia';
import { authService } from '@/services/auth.service';
import type { SignupRequest, AuthState, LoginRequest } from '@/types/auth';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const token = localStorage.getItem('token');
    return {
      user: null,
      token: token,
      isAuthenticated: !!token
    };
  },

  getters: {
    getToken: (state) => {
      const token = state.token || localStorage.getItem('token');
      return token;
    }
  },

  actions: {
    async signup(data: SignupRequest) {
      try {
        const response = await authService.signup(data);
        this.user = response.user;
        this.token = response.token;
        this.isAuthenticated = true;

        // Store token in localStorage
        localStorage.setItem('token', response.token);

        return response;
      } catch (error) {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        throw error;
      }
    },

    async login(data: LoginRequest) {
      try {
        const response = await authService.login(data);

        if (!response.token) {
          throw new Error('No token received from login');
        }

        this.user = response.user;
        this.token = response.token;
        this.isAuthenticated = true;

        // Store token in localStorage
        localStorage.setItem('token', response.token);
        return response;
      } catch (error) {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        throw error;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
  }
});
