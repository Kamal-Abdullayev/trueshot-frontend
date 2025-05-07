import { defineStore } from 'pinia';
import { authService } from '@/services/auth.service';
import type { SignupRequest, AuthState, LoginRequest } from '@/types/auth';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const token = localStorage.getItem('token');
    console.log('Initializing auth store with token:', token);
    return {
      user: null,
      token: token,
      isAuthenticated: !!token
    };
  },

  getters: {
    getToken: (state) => {
      const token = state.token || localStorage.getItem('token');
      console.log('Getting token:', token);
      return token;
    },
    isAdmin: (state) => {
      console.log('Checking admin status. User:', state.user);
      console.log('User roles:', state.user?.roles);
      return state.user?.roles === 'ADMIN';
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
        console.log('Token stored after signup:', response.token);

        return response;
      } catch (error) {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem('token');
        throw error;
      }
    },

    async login(data: LoginRequest) {
      try {
        const response = await authService.login(data);
        console.log('Login response received:', response);
        console.log('User roles from response:', response.user.roles);

        if (!response.token) {
          throw new Error('No token received from login');
        }

        this.user = response.user;
        this.token = response.token;
        this.isAuthenticated = true;

        // Store token in localStorage
        localStorage.setItem('token', response.token);
        console.log('Token stored after login:', response.token);
        console.log('User stored after login:', this.user);

        return response;
      } catch (error) {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem('token');
        throw error;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
      console.log('Token removed after logout');
    }
  }
});
