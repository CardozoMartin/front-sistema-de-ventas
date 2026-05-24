// src/types/auth.types.ts
export interface DecodedToken {
  id: string;
  email: string;
  exp: number;
  iat?: number;
  name?: string;
  nombre?: string;
  role?: string;
  roles?: Array<{ nombre: string }>;
}

export interface User {
  userId: string;
  email: string;
  name?: string;
  nombre?: string;
  role?: string;
  rol?: Array<{ nombre: string }>;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    userId: string;
    email: string;
  };
}

export interface ApiError {
  message: string;
  code?: string;
}