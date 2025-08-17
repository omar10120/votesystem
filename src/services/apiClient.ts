import type { ApiResponse } from '../types/types';

class ApiClient {
  private baseURL = 'https://votesystemrami.tryasp.net/api';
  private token: string | null;


  constructor() {
    this.baseURL =  'http://votesystemrami.tryasp.net/api';
    this.token = localStorage.getItem('authToken');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      console.log('🚀 ApiClient.request called:');
      console.log('  URL:', url);
      console.log('  Method:', options.method || 'GET');
      console.log('  Headers:', this.getHeaders());
      console.log('  Body:', options.body);
      
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(),
      });

      console.log('📡 ApiClient received response:');
      console.log('  Status:', response.status);
      console.log('  Status Text:', response.statusText);
      console.log('  Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        
        const data = await response.json().catch(() => ({}));
        this.handleErrorResponse(response, data);
      }

      const data = await response.json();
      console.log('✅ ApiClient success response:', data);
      return data;
    } catch (error) {
      console.error('💥 ApiClient.request error:');
      console.error('  Error:', error);
      console.error('  URL:', url);
      console.error('  Options:', options);
      throw error;
    }
  }

  private handleErrorResponse(response: Response, data: any): never {
    console.error('❌ ApiClient error response:', data);
    
    // Handle the specific error format from the API
    if (data && Array.isArray(data) && data.length > 0) {
      // API returns array of error objects: [{ code, description, type }]
      const firstError = data[0];
      if (firstError.description) {
        throw new Error(firstError.description);
      } else if (firstError.code) {
        throw new Error(firstError.code);
      }
    }
    
    // Handle the standard error format
    if (data && data.topError && data.topError.description) {
      throw new Error(data.topError.description);
    }
    
    // Fallback error messages based on status code
    const statusMessages: Record<number, string> = {
      400: 'Bad Request - Invalid input data',
      401: 'Unauthorized - Invalid credentials',
      403: 'Forbidden - Access denied',
      404: 'Not Found - Resource not found',
      500: 'Internal Server Error - Server error occurred',
    };
    
    const message = statusMessages[response.status] || `HTTP ${response.status}`;
    throw new Error(message);
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
