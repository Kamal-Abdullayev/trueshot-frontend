import { defineStore } from 'pinia';
import { authService } from '@/services/auth.service';
import type { SignupRequest, AuthState, LoginRequest } from '@/types/auth';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    return {
      user: userStr ? JSON.parse(userStr) : null,
      token: token,
      isAuthenticated: !!token
    };
  },

  getters: {
    getToken: (state) => {
      return state.token || localStorage.getItem('token');
    }
  },

  actions: {
    async signup(data: SignupRequest) {
      try {
        const response = await authService.signup(data);
        this.setAuthState(response);
        return response;
      } catch (error) {
        this.clearAuthState();
        throw error;
      }
    },

    async login(data: LoginRequest) {
      try {
        const response = await authService.login(data);
        this.setAuthState(response);
        return response;
      } catch (error) {
        this.clearAuthState();
        throw error;
      }
    },

    logout() {
      this.clearAuthState();
    },

    setAuthState(response: { token: string; user: any }) {
      this.user = response.user;
      this.token = response.token;
      this.isAuthenticated = true;
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    },

    clearAuthState() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});
