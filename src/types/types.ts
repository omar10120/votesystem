export interface User {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  createdByAdminId: number;
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
  otp?: string;
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

// New interface to match your API response
export interface VoteSession {
  id: number;
  topicTitle: string;
  description: string;
  startedAt: string;
  endedAt: string;
  voteSessionStatus: number;
}

// Updated to match your API response structure
export interface ApiResponse<T> {
  isSuccess: boolean;
  isError: boolean;
  errors: unknown[];
  value: T;
  topError?: {
    code: string | null;
    description: string | null;
    type: number;
  };
}

// Attendance interface to match your API response
export interface AttendanceRecord {
  id: number;
  userId: number;
  voteSessionId: number;
  otpCodeID: number | null;
  createdByAdminId: number;
}

// Create attendance request interface
export interface CreateAttendanceRequest {
  voteSessionId: number;
  userId: number;
  [key: string]: unknown;
}

// VoteQuestion interfaces
export interface VoteQuestionOption {
  id?: number;
  title: string;
  [key: string]: unknown;
}

export interface VoteQuestion {
  id: number;
  title: string;
  description: string;
  startedAt: string;
  endedAt: string;
  voteSessionId: number;
  options: VoteQuestionOption[];
  [key: string]: unknown;
}

export interface CreateVoteQuestionRequest {
  title: string;
  description: string;
  startedAt: string;
  endedAt: string;
  voteSessionId: number;
  options: VoteQuestionOption[];
  [key: string]: unknown;
}

export interface UpdateVoteQuestionRequest extends CreateVoteQuestionRequest {
  id: number;
}

// Vote interfaces
export interface Vote {
  id: number;
  votedAt: string;
  userId: number;
  voteQuestionOptionId: number;
  [key: string]: unknown;
}

export interface VoteWithDetails extends Vote {
  userName?: string;
  userEmail?: string;
  questionTitle?: string;
  optionTitle?: string;
  sessionTitle?: string;
}
