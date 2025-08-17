import React, { useState, useEffect } from 'react';
import { voteService } from '../../services/voteService';
import type { Vote, VoteSession } from '../../types/types';

interface VoteSectionProps {
  voteSessions: VoteSession[];
}

const VoteSection: React.FC<VoteSectionProps> = ({ voteSessions }) => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [filteredVotes, setFilteredVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  useEffect(() => {
    fetchVotes();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      filterVotesBySession(selectedSessionId);
    } else {
      setFilteredVotes(votes);
    }
  }, [selectedSessionId, votes]);

  const fetchVotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await voteService.getVotes();
      setVotes(data);
      setFilteredVotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch votes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterVotesBySession = async (sessionId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await voteService.getVotesBySession(sessionId);
      setFilteredVotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch votes by session');
      // Fallback to client-side filtering
      const filtered = votes.filter(() => {
        // Since we don't have sessionId in the vote object, we'll need to get it from the question
        // For now, just show all votes if API filtering fails
        return true;
      });
      setFilteredVotes(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionChange = (sessionId: string) => {
    const id = parseInt(sessionId);
    setSelectedSessionId(id === 0 ? null : id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getVoteSessionTitle = (sessionId: number) => {
    const session = voteSessions.find(s => s.id === sessionId);
    return session ? session.topicTitle : `Session ${sessionId}`;
  };

  if (isLoading && votes.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Votes</h3>
        <div className="flex space-x-3">
          <select
            value={selectedSessionId || 0}
            onChange={(e) => handleSessionChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>All Sessions</option>
            {voteSessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.topicTitle}
              </option>
            ))}
          </select>
          <button
            onClick={fetchVotes}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </div>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              {selectedSessionId ? `Votes for ${getVoteSessionTitle(selectedSessionId)}` : 'All Votes'}
            </h4>
            <span className="text-sm text-gray-500">
              Total: {filteredVotes.length}
            </span>
          </div>
        </div>
        
        {filteredVotes.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">
              {selectedSessionId ? 'No votes found for this session.' : 'No votes found.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredVotes.map((vote) => (
              <li key={vote.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">Vote #{vote.id}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">User ID: {vote.userId}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">Option ID: {vote.voteQuestionOptionId}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      <span>Voted at: {formatDate(vote.votedAt)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">ID: {vote.id}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VoteSection;
