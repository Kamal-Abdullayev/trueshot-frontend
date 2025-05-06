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

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    roles: string;
    following: string[];
    followers: string[];
  };
}

export interface AuthState {
  user: AuthResponse['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
}
