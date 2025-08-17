import type { Vote, Candidate, VotingSession, VoteSession, User, AttendanceRecord, CreateAttendanceRequest } from '../types/types';
import apiClient from './apiClient';

// VoteService class for managing voting sessions and users
class VoteService {
  // Get all voting sessions
  async getVotingSessions(): Promise<VotingSession[]> {
    const response = await apiClient.get<VotingSession[]>('/voting/sessions');
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to fetch voting sessions');
  }

  // Get vote sessions from your API
  async getVoteSessions(): Promise<VoteSession[]> {
    const response = await apiClient.get<VoteSession[]>('/VoteSession');
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to fetch vote sessions');
  }

  // Get active voting session
  async getActiveSession(): Promise<VotingSession | null> {
    try {
      const response = await apiClient.get<VotingSession>('/voting/sessions/active');
      if (response.isSuccess && response.value) {
        return response.value;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch active session:', error);
      return null;
    }
  }

  // Get session by ID
  async getSessionById(sessionId: string): Promise<VotingSession> {
    const response = await apiClient.get<VotingSession>(`/voting/sessions/${sessionId}`);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to fetch voting session');
  }

  // Cast a vote
  async castVote(voteData: Omit<Vote, 'id' | 'timestamp'>): Promise<Vote> {
    const response = await apiClient.post<Vote>('/voting/vote', voteData);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to cast vote');
  }

  // Get user's voting history
  async getUserVotes(userId: string): Promise<Vote[]> {
    const response = await apiClient.get<Vote[]>(`/voting/users/${userId}/votes`);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to fetch user votes');
  }

  // Check if user has voted in a session
  async hasUserVoted(userId: string, sessionId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ hasVoted: boolean }>(`/voting/sessions/${sessionId}/users/${userId}/voted`);
      if (response.isSuccess && response.value) {
        return response.value.hasVoted;
      }
      return false;
    } catch (error) {
      console.error('Failed to check voting status:', error);
      return false;
    }
  }

  // Get session results
  async getSessionResults(sessionId: string): Promise<{ candidates: Candidate[]; totalVotes: number }> {
    const response = await apiClient.get<{ candidates: Candidate[]; totalVotes: number }>(`/voting/sessions/${sessionId}/results`);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to fetch session results');
  }

  // Create new voting session (admin only)
  async createSession(sessionData: Omit<VotingSession, 'id' | 'totalVotes'>): Promise<VotingSession> {
    const response = await apiClient.post<VotingSession>('/voting/sessions', sessionData);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to create voting session');
  }

  // Create new vote session via your API
  async createVoteSession(sessionData: {
    description: string;
    topicTitle: string;
    startedAt: string;
    endedAt: string;
  }): Promise<VoteSession> {
    const response = await apiClient.post<VoteSession>('/VoteSession', sessionData);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to create vote session');
  }

  // Update vote session via your API
  async updateVoteSession(sessionData: {
    id: number;
    description: string;
    topicTitle: string;
    startedAt: string;
    endedAt: string;
  }): Promise<VoteSession> {
    const response = await apiClient.put<VoteSession>('/VoteSession', sessionData);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to update vote session');
  }

  // Delete vote session via your API
  async deleteVoteSession(sessionId: number): Promise<void> {
    const response = await apiClient.delete(`/VoteSession/${sessionId}`);
    if (!response.isSuccess) {
      throw new Error(response.topError?.description || 'Failed to delete vote session');
    }
  }

  // Update voting session (admin only)
  async updateSession(sessionId: string, sessionData: Partial<VotingSession>): Promise<VotingSession> {
    const response = await apiClient.put<VotingSession>(`/voting/sessions/${sessionId}`, sessionData);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to update voting session');
  }

  // Delete voting session (admin only)
  async deleteSession(sessionId: string): Promise<void> {
    const response = await apiClient.delete(`/voting/sessions/${sessionId}`);
    if (!response.isSuccess) {
      throw new Error(response.topError?.description || 'Failed to delete voting session');
    }
  }

  // Add candidate to session (admin only)
  async addCandidate(sessionId: string, candidateData: Omit<Candidate, 'id'>): Promise<Candidate> {
    const response = await apiClient.post<Candidate>(`/voting/sessions/${sessionId}/candidates`, candidateData);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to add candidate');
  }

  // Remove candidate from session (admin only)
  async removeCandidate(sessionId: string, candidateId: string): Promise<void> {
    const response = await apiClient.delete(`/voting/sessions/${sessionId}/candidates/${candidateId}`);
    if (!response.isSuccess) {
      throw new Error(response.topError?.description || 'Failed to remove candidate');
    }
  }

  // Start voting session (admin only)
  async startSession(sessionId: string): Promise<void> {
    const response = await apiClient.post(`/voting/sessions/${sessionId}/start`);
    if (!response.isSuccess) {
      throw new Error(response.topError?.description || 'Failed to start voting session');
    }
  }

  // End voting session (admin only)
  async endSession(sessionId: string): Promise<void> {
    const response = await apiClient.post(`/voting/sessions/${sessionId}/end`);
    if (!response.isSuccess) {
      throw new Error(response.topError?.description || 'Failed to end voting session');
    }
  }

  // Get all users from your API
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/User');
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to fetch users');
  }

  // Create new user via your API
  async createUser(userData: {
    fullName: string;
    phoneNumber: string;
    email: string;
    isActive: boolean;
  }): Promise<User> {
    const response = await apiClient.post<User>('/User', userData);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to create user');
  }

  // Update user via your API
  async updateUser(userData: {
    id: number;
    fullName: string;
    phoneNumber: string;
    email: string;
    isActive: boolean;
  }): Promise<User> {
    const response = await apiClient.put<User>('/User', userData);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to update user');
  }

  // Delete user via your API
  async deleteUser(userId: number): Promise<void> {
    const response = await apiClient.delete(`/User/${userId}`);
    if (!response.isSuccess) {
      throw new Error(response.topError?.description || 'Failed to delete user');
    }
  }

  // Get all attendance records from your API
  async getAttendance(): Promise<AttendanceRecord[]> {
    const response = await apiClient.get<AttendanceRecord[]>('/Attendance');
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to fetch attendance');
  }

  // Create new attendance record via your API
  async createAttendance(attendanceData: CreateAttendanceRequest): Promise<AttendanceRecord> {
    const response = await apiClient.post<AttendanceRecord>('/Attendance', attendanceData);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to create attendance');
  }

  // Update attendance record via your API
  async updateAttendance(attendanceData: {
    id: number;
    userId: number;
    voteSessionId: number;
    otpCodeID: number | null;
  }): Promise<AttendanceRecord> {
    const response = await apiClient.put<AttendanceRecord>('/Attendance', attendanceData);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to update attendance');
  }

  // Request email OTP for attendance user
  async requestEmailOTP(email: string): Promise<void> {
    const response = await apiClient.post('/Auth/request-email-otp', { email });
    if (!response.isSuccess) {
      throw new Error(response.topError?.description || 'Failed to request email OTP');
    }
  }

  // Delete attendance record via your API
  async deleteAttendance(attendanceId: number): Promise<void> {
    const response = await apiClient.delete(`/Attendance/${attendanceId}`);
    if (!response.isSuccess) {
      throw new Error(response.topError?.description || 'Failed to delete attendance');
    }
  }
}

export const voteService = new VoteService();
export default voteService;
