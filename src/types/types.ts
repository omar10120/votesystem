export interface User {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  role: 'admin' | 'user';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

export interface VotingUser extends User {
  role: 'user';
  hasVoted: boolean;
  lastVoteAt?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  userName: string;
  password: string;
  [key: string]: unknown;
}

export interface UserLoginData {
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

export interface OTPVerification {
  identifier: string; // email or phone
  otp: string;
  [key: string]: unknown;
}

export interface MagicLinkData {
  email: string;
  [key: string]: unknown;
}

// Updated to match your API response structure
export interface AuthResponse {
  token: string;
  userName: string;
  role: string;
  fullName: string;
  phoneNumber: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  expiresAt: Date;
}

export interface Vote {
  id: string;
  userId: string;
  candidateId: string;
  timestamp: Date;
  sessionId: string;
}

export interface Candidate {
  id: string;
  name: string;
  position: string;
  party?: string;
  image?: string;
  bio?: string;
  votes?: number;
}

export interface VotingSession {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  candidates: Candidate[];
  totalVotes: number;
}

// Updated to match your API response structure
export interface ApiResponse<T> {
  isSuccess: boolean;
  isError: boolean;
  errors: any[];
  value: T;
  topError?: {
    code: string | null;
    description: string | null;
    type: number;
  };
}
