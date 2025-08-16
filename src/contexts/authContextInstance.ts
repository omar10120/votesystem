import { createContext } from 'react';
import type { AuthContextType } from './authContextValue';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
