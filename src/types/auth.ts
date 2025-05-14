export interface SignupRequest {
  name: string;
  password: string;
  roles: string;
  following: string[];
  followers: string[];
}

export interface LoginRequest {
  name: string;
  password: string;
}

export interface User {
  userId: string;
  name: string;
  roles: string[];
  isAdmin: boolean;
  following: string[];
  followers: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
