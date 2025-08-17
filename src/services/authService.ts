import type { 
  LoginCredentials, 
  UserLoginData, 
  OTPVerification, 
  // MagicLinkData, 
  AuthResponse, 
  OTPResponse,
  User 
} from '../types/types';
import apiClient from './apiClient';
import { jwtDecode } from 'jwt-decode';

// Interface for JWT payload
interface JWTPayload {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
  PhoneNumber: string;
  Email: string;
  exp: number;
  iss: string;
  aud: string;
}

class AuthService {
  // Admin login with email/password
  async adminLogin(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<AuthResponse>('/Auth/admin-login', credentials);
    if (response.isSuccess && response.value) {
      const { token, userName, fullName, phoneNumber } = response.value;
      
      // Create a user object that matches our frontend expectations
      const user: User = {
        id: 1, // You might want to get this from the API response
        fullName: fullName,
        phoneNumber: phoneNumber || '',
        email: userName.includes('@') ? userName : '',
        role: 'admin', // Admin login
        isActive: true,
        createdAt: new Date().toISOString(),
        createdByAdminId: 1,
      };
      
      apiClient.setToken(token);
      return { user, token };
    }
    
    // Handle error response format
    if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
      const firstError = response.errors[0];
      throw new Error(firstError.description || firstError.code || 'Login failed');
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
      const { token, userName, fullName, phoneNumber } = response.value;
      
      const user: User = {
        id: 1,
        fullName: fullName,
        phoneNumber: phoneNumber || '',
        email: userName.includes('@') ? userName : '',
        role: 'user', // User login
        isActive: true,
        createdAt: new Date().toISOString(),
        createdByAdminId: 1,
      };
      
      apiClient.setToken(token);
      return { user, token };
    }
    throw new Error(response.topError?.description || 'OTP verification failed');
  }

 
  // Verify magic link token
  async verifyMagicLink(token: string): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<string>('/Auth/user-login-magic-link', { token });
    if (response.isSuccess && response.value) {
      // The API returns a JWT token string, decode it to get user info
      const jwtToken = response.value;
      
      try {
        const decoded = jwtDecode<JWTPayload>(jwtToken);
        
        const user: User = {
          id: parseInt(decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
          fullName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          phoneNumber: decoded.PhoneNumber,
          email: decoded.Email,
          role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'].toLowerCase(),
          isActive: true,
          createdAt: new Date().toISOString(),
          createdByAdminId: 1,
        };
        
        apiClient.setToken(jwtToken);
        return { user, token: jwtToken };
      } catch (decodeError) {
        console.error('Failed to decode magic link JWT:', decodeError);
        throw new Error('Invalid magic link token');
      }
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
      const { token, userName, fullName, phoneNumber } = response.value;
      
      const user: User = {
        id: 1,
        fullName: fullName,
        phoneNumber: phoneNumber || '',
        email: userName.includes('@') ? userName : '',
        role: 'user', // Refresh token login
        isActive: true,
        createdAt: new Date().toISOString(),
        createdByAdminId: 1,
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

  // Request email OTP for attendance user
  async requestEmailOTP(email: string): Promise<void> {
    const response = await apiClient.post('/Auth/request-email-otp', { email });
    if (!response.isSuccess) {
      // Handle error response format
      if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
        const firstError = response.errors[0];
        throw new Error(firstError.description || firstError.code || 'Failed to request email OTP');
      }
      throw new Error(response.topError?.description || 'Failed to request email OTP');
    }
  }

  // User login with email and OTP
  async userLoginWithEmail(email: string, otp: string): Promise<User> {
    const response = await apiClient.post<string>('/Auth/user-login-Email', { email, otp });
    if (response.isSuccess && response.value) {
      // The API returns a JWT token string, not a User object
      const token = response.value;
      
      try {
        // Decode the JWT token to extract user information
        const decoded = jwtDecode<JWTPayload>(token);
        console.log('Decoded JWT payload:', decoded);
        
        // Validate that required fields exist in the JWT payload
        if (!decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
            !decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
            !decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
            !decoded.PhoneNumber ||
            !decoded.Email) {
          console.error('Missing required fields in JWT:', {
            nameidentifier: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
            role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
            name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
            phoneNumber: decoded.PhoneNumber,
            email: decoded.Email
          });
          throw new Error('JWT token missing required user information');
        }
        
        // Create a User object from the JWT payload
        const user: User = {
          id: parseInt(decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
          fullName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          phoneNumber: decoded.PhoneNumber,
          email: decoded.Email,
          role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'].toLowerCase(),
          isActive: true,
          createdAt: new Date().toISOString(),
          createdByAdminId: 1, // Default value since it's not in the JWT
        };
        
        // Set the token in the API client
        apiClient.setToken(token);
        
        return user;
      } catch (decodeError) {
        console.error('Failed to decode JWT token:', decodeError);
        if (decodeError instanceof Error) {
          throw new Error(`Token decode error: ${decodeError.message}`);
        }
        throw new Error('Invalid response format from server');
      }
    }
    
    // Handle error response format
    if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
      const firstError = response.errors[0];
      throw new Error(firstError.description || firstError.code || 'Failed to login user');
    }
    
    throw new Error(response.topError?.description || 'Failed to login user');
  }
}

export const authService = new AuthService();
export default authService;
