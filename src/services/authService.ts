import type { 
  LoginCredentials, 
  UserLoginData, 
  OTPVerification, 
  MagicLinkData, 
  AuthResponse, 
  OTPResponse,
  User 
} from '../types/types';
import apiClient from './apiClient';

class AuthService {
  // Admin login with email/password
  async adminLogin(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<AuthResponse>('/Auth/admin-login', credentials);
    if (response.isSuccess && response.value) {
      const { token, userName, role, fullName, phoneNumber } = response.value;
      
      // Create a user object that matches our frontend expectations
      const user: User = {
        id: '1', // You might want to get this from the API response
        name: fullName,
        email: userName.includes('@') ? userName : undefined,
        phone: phoneNumber || undefined,
        role: role.toLowerCase() as 'admin' | 'user',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      apiClient.setToken(token);
      return { user, token };
    }
    throw new Error(response.topError?.description || 'Login failed');
  }

  // User login - send OTP
  async userLogin(userData: UserLoginData): Promise<OTPResponse> {
    const response = await apiClient.post<OTPResponse>('/auth/user/login', userData);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to send OTP');
  }

  // Verify OTP and get user token
  async verifyOTP(otpData: OTPVerification): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<AuthResponse>('/auth/user/verify-otp', otpData);
    if (response.isSuccess && response.value) {
      const { token, userName, role, fullName, phoneNumber } = response.value;
      
      const user: User = {
        id: '1',
        name: fullName,
        email: userName.includes('@') ? userName : undefined,
        phone: phoneNumber || undefined,
        role: role.toLowerCase() as 'admin' | 'user',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      apiClient.setToken(token);
      return { user, token };
    }
    throw new Error(response.topError?.description || 'OTP verification failed');
  }

  // Send magic link
  async sendMagicLink(magicLinkData: MagicLinkData): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/magic-link', magicLinkData);
    if (response.isSuccess) {
      return { success: true, message: response.topError?.description || 'Magic link sent successfully' };
    }
    throw new Error(response.topError?.description || 'Failed to send magic link');
  }

  // Verify magic link token
  async verifyMagicLink(token: string): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<AuthResponse>('/auth/magic-link/verify', { token });
    if (response.isSuccess && response.value) {
      const { token: newToken, userName, role, fullName, phoneNumber } = response.value;
      
      const user: User = {
        id: '1',
        name: fullName,
        email: userName.includes('@') ? userName : undefined,
        phone: phoneNumber || undefined,
        role: role.toLowerCase() as 'admin' | 'user',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      apiClient.setToken(newToken);
      return { user, token: newToken };
    }
    throw new Error(response.topError?.description || 'Magic link verification failed');
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to get user profile');
  }

  // Refresh token
  async refreshToken(): Promise<{ user: User; token: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    if (response.isSuccess && response.value) {
      const { token, userName, role, fullName, phoneNumber } = response.value;
      
      const user: User = {
        id: '1',
        name: fullName,
        email: userName.includes('@') ? userName : undefined,
        phone: phoneNumber || undefined,
        role: role.toLowerCase() as 'admin' | 'user',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      apiClient.setToken(token);
      // Note: Your API doesn't return refreshToken, so we'll keep the existing one
      return { user, token };
    }
    throw new Error(response.topError?.description || 'Token refresh failed');
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.clearToken();
      localStorage.removeItem('refreshToken');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();
export default authService;
