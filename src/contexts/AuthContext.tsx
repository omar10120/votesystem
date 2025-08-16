import React, { useReducer, useEffect } from 'react';
import { authReducer, initialState } from './authReducer';
import { createAuthContextValue } from './authContextValue';
import { AuthContext } from './authContextInstance';
import authService from '../services/authService';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.getCurrentUser();
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } catch {
          dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
        }
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    checkAuth();
  }, []);

  const contextValue = createAuthContextValue(state, dispatch);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
