// API Configuration and Client
const API_BASE_URL = 'http://localhost:8000/api';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthData {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    phone_number?: string;
    is_active: boolean;
  };
  token: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Try to load token from localStorage
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { includeAuth?: boolean } = {}
  ): Promise<T> {
    const { includeAuth = true, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...fetchOptions,
      headers: this.getHeaders(includeAuth),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(
    email: string,
    password: string,
    fullName: string,
    role: string,
    phoneNumber?: string
  ): Promise<AuthData> {
    const response = await this.request<ApiResponse<AuthData>>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          password_confirmation: password, // Laravel expects this for "confirmed" validation
          full_name: fullName,
          role,
          phone_number: phoneNumber,
        }),
        includeAuth: false,
      }
    );

    if (response.data) {
      this.setToken(response.data.token);
      return response.data;
    }

    throw new Error('Registration failed');
  }

  async login(email: string, password: string): Promise<AuthData> {
    const response = await this.request<ApiResponse<AuthData>>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        includeAuth: false,
      }
    );

    if (response.data) {
      this.setToken(response.data.token);
      return response.data;
    }

    throw new Error('Login failed');
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  async getMe(): Promise<AuthData['user']> {
    const response = await this.request<ApiResponse<AuthData['user']>>(
      '/auth/me'
    );

    if (response.data) {
      return response.data;
    }

    throw new Error('Failed to fetch user data');
  }
}

export const api = new ApiClient(API_BASE_URL);
