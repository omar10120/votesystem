import type { LoginCredentials, UserLoginData, OTPVerification, MagicLinkData } from '../types/types';
import type { AuthState } from './authReducer';
import authService from '../services/authService';

export interface AuthContextType extends AuthState {
  adminLogin: (credentials: LoginCredentials) => Promise<void>;
  userLogin: (userData: UserLoginData) => Promise<void>;
  verifyOTP: (otpData: OTPVerification) => Promise<void>;
  sendMagicLink: (data: MagicLinkData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const createAuthContextValue = (
  state: AuthState,
  dispatch: React.Dispatch<any>
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
      await authService.sendMagicLink(data);
      // Don't set user yet, wait for magic link verification
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Failed to send magic link' });
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
