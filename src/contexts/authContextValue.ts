import type { LoginCredentials, UserLoginData, OTPVerification, MagicLinkData } from '../types/types';
import type { AuthState, AuthAction } from './authReducer';
import authService from '../services/authService';

export interface AuthContextType extends AuthState {
  adminLogin: (credentials: LoginCredentials) => Promise<void>;
  userLogin: (userData: UserLoginData) => Promise<void>;
  userLoginWithEmail: (email: string, otp: string) => Promise<void>;
  requestEmailOTP: (email: string) => Promise<void>;
  verifyOTP: (otpData: OTPVerification) => Promise<void>;
  sendMagicLink: (data: MagicLinkData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const createAuthContextValue = (
  state: AuthState,
  dispatch: React.Dispatch<AuthAction>
): AuthContextType => ({
  ...state,
  adminLogin: async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.adminLogin(credentials);
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Login failed' });
    }
  },

  userLogin: async (userData: UserLoginData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authService.userLogin(userData);
      // Don't set user yet, wait for OTP verification
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Failed to send OTP' });
    }
  },

  userLoginWithEmail: async (email: string, otp: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const user = await authService.userLoginWithEmail(email, otp);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Login failed' });
    }
  },

  requestEmailOTP: async (email: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authService.requestEmailOTP(email);
      // Don't set user, just show success message
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Failed to request OTP' });
    }
  },

  verifyOTP: async (otpData: OTPVerification) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.verifyOTP(otpData);
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'OTP verification failed' });
    }
  },

  sendMagicLink: async (data: MagicLinkData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      // Use the magic link login endpoint with the token
      const { user } = await authService.verifyMagicLink(data.email);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Failed to verify magic link' });
    }
  },

  logout: async () => {
    await authService.logout();
    dispatch({ type: 'AUTH_LOGOUT' });
  },

  clearError: () => {
    dispatch({ type: 'CLEAR_ERROR' });
  },
});
