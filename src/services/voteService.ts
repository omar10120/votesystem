import type { 
  VoteSession, 
  User,
  AttendanceRecord,
  CreateAttendanceRequest,
  VoteQuestion,
  CreateVoteQuestionRequest,
  UpdateVoteQuestionRequest,
  Vote
} from '../types/types';
import apiClient from './apiClient';

// VoteService class for managing voting sessions, users, attendance, and vote questions
class VoteService {
  // Get vote sessions from your API
  async getVoteSessions(): Promise<VoteSession[]> {
    const response = await apiClient.get<VoteSession[]>('/VoteSession');
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to fetch vote sessions');
  }

  // Create new vote session
  async createVoteSession(data: { topicTitle: string; description: string; startedAt: string; endedAt: string }): Promise<VoteSession> {
    const response = await apiClient.post<VoteSession>('/VoteSession', data);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to create vote session');
  }

  // Update vote session
  async updateVoteSession(id: number, data: { topicTitle: string; description: string; startedAt: string; endedAt: string }): Promise<VoteSession> {
    const response = await apiClient.put<VoteSession>('/VoteSession', { id, ...data });
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to update vote session');
  }

  // Delete vote session
  async deleteVoteSession(id: number): Promise<void> {
    const response = await apiClient.delete(`/VoteSession/${id}`);
    if (!response.isSuccess) {
      throw new Error(response.topError?.description || 'Failed to delete vote session');
    }
  }

  // Get all users
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/User');
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to fetch users');
  }

  // Create new user
  async createUser(data: { fullName: string; phoneNumber: string; email: string }): Promise<User> {
    const response = await apiClient.post<User>('/User', data);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to create user');
  }

  // Update user
  async updateUser(id: number, data: { fullName: string; phoneNumber: string; email: string; isActive: boolean }): Promise<User> {
    const response = await apiClient.put<User>('/User', { id, ...data });
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to update user');
  }

  // Delete user
  async deleteUser(id: number): Promise<void> {
    const response = await apiClient.delete(`/User/${id}`);
    if (!response.isSuccess) {
      throw new Error(response.topError?.description || 'Failed to delete user');
    }
  }

  // Get all attendance records
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    const response = await apiClient.get<AttendanceRecord[]>('/Attendance');
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to fetch attendance records');
  }

  // Create new attendance record
  async createAttendance(data: CreateAttendanceRequest): Promise<AttendanceRecord> {
    const response = await apiClient.post<AttendanceRecord>('/Attendance', data);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to create attendance record');
  }

  // Update attendance record
  async updateAttendance(data: { id: number; userId: number; voteSessionId: number; otpCodeID: number | null }): Promise<AttendanceRecord> {
    const response = await apiClient.put<AttendanceRecord>('/Attendance', data);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to update attendance record');
  }

  // Delete attendance record
  async deleteAttendance(id: number): Promise<void> {
    const response = await apiClient.delete(`/Attendance/${id}`);
    if (!response.isSuccess) {
      throw new Error(response.topError?.description || 'Failed to delete attendance');
    }
  }

  // VoteQuestion methods
  async getVoteQuestions(): Promise<VoteQuestion[]> {
    const response = await apiClient.get<VoteQuestion[]>('/VoteQuestion');
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to fetch vote questions');
  }

  async createVoteQuestion(data: CreateVoteQuestionRequest): Promise<VoteQuestion> {
    const response = await apiClient.post<VoteQuestion>('/VoteQuestion', data);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to create vote question');
  }

  async updateVoteQuestion(data: UpdateVoteQuestionRequest): Promise<VoteQuestion> {
    const response = await apiClient.put<VoteQuestion>('/VoteQuestion', data);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to update vote question');
  }

  async deleteVoteQuestion(id: number): Promise<void> {
    try {
      const response = await apiClient.delete(`/VoteQuestion/${id}`);
      if (!response.isSuccess) {
        // Handle error response format
        if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
          const firstError = response.errors[0] as { description?: string; code?: string };
          throw new Error(firstError.description || firstError.code || 'Failed to delete vote question');
        }
        throw new Error(response.topError?.description || 'Failed to delete vote question');
      }
    } catch (error) {
      console.error('Delete vote question error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete vote question');
    }
  }

  // Vote methods
  async getVotes(): Promise<Vote[]> {
    const response = await apiClient.get<Vote[]>('/Vote/get-all-vote');
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to fetch votes');
  }

  async getVotesBySession(sessionId: number): Promise<Vote[]> {
    const response = await apiClient.get<Vote[]>(`/Vote/get-all-votes-for-session?sessionId=${sessionId}`);
    if (response.isSuccess && response.value) {
      return response.value;
    }
    throw new Error(response.topError?.description || 'Failed to fetch votes by session');
  }
}

export const voteService = new VoteService();
export default voteService;
