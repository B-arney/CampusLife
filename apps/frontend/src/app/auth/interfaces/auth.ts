export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: any;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  major?: string;
  interests?: string[];
  profilePicture?: string;
}