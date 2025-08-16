import type { Vote, Candidate, VotingSession } from '../types/types';
import apiClient from './apiClient';

class VoteService {
  // Get all voting sessions
  async getVotingSessions(): Promise<VotingSession[]> {
    const response = await apiClient.get<VotingSession[]>('/voting/sessions');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch voting sessions');
  }

  // Get active voting session
  async getActiveSession(): Promise<VotingSession | null> {
    try {
      const response = await apiClient.get<VotingSession>('/voting/sessions/active');
      if (response.success && response.data) {
        return response.data;
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
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch voting session');
  }

  // Cast a vote
  async castVote(voteData: Omit<Vote, 'id' | 'timestamp'>): Promise<Vote> {
    const response = await apiClient.post<Vote>('/voting/vote', voteData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to cast vote');
  }

  // Get user's voting history
  async getUserVotes(userId: string): Promise<Vote[]> {
    const response = await apiClient.get<Vote[]>(`/voting/users/${userId}/votes`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch user votes');
  }

  // Check if user has voted in a session
  async hasUserVoted(userId: string, sessionId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ hasVoted: boolean }>(`/voting/sessions/${sessionId}/users/${userId}/voted`);
      if (response.success && response.data) {
        return response.data.hasVoted;
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
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch session results');
  }

  // Create new voting session (admin only)
  async createSession(sessionData: Omit<VotingSession, 'id' | 'totalVotes'>): Promise<VotingSession> {
    const response = await apiClient.post<VotingSession>('/voting/sessions', sessionData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create voting session');
  }

  // Update voting session (admin only)
  async updateSession(sessionId: string, sessionData: Partial<VotingSession>): Promise<VotingSession> {
    const response = await apiClient.put<VotingSession>(`/voting/sessions/${sessionId}`, sessionData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update voting session');
  }

  // Delete voting session (admin only)
  async deleteSession(sessionId: string): Promise<void> {
    const response = await apiClient.delete(`/voting/sessions/${sessionId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete voting session');
    }
  }

  // Add candidate to session (admin only)
  async addCandidate(sessionId: string, candidateData: Omit<Candidate, 'id'>): Promise<Candidate> {
    const response = await apiClient.post<Candidate>(`/voting/sessions/${sessionId}/candidates`, candidateData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to add candidate');
  }

  // Remove candidate from session (admin only)
  async removeCandidate(sessionId: string, candidateId: string): Promise<void> {
    const response = await apiClient.delete(`/voting/sessions/${sessionId}/candidates/${candidateId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to remove candidate');
    }
  }

  // Start voting session (admin only)
  async startSession(sessionId: string): Promise<void> {
    const response = await apiClient.post(`/voting/sessions/${sessionId}/start`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to start voting session');
    }
  }

  // End voting session (admin only)
  async endSession(sessionId: string): Promise<void> {
    const response = await apiClient.post(`/voting/sessions/${sessionId}/end`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to end voting session');
    }
  }
}

export const voteService = new VoteService();
export default voteService;
