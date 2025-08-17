import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
// import type { Candidate, VotingSession } from '../types/types';
import type {  VotingSession } from '../types/types';

const VotingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [votingSession, setVotingSession] = useState<VotingSession | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState(false);

  // Mock data - replace with API calls
  useEffect(() => {
    const mockSession: VotingSession = {
      id: '1',
      title: 'Presidential Election 2024',
      description: 'Vote for your preferred presidential candidate',
      startTime: new Date('2024-01-01T00:00:00Z'),
      endTime: new Date('2024-12-31T23:59:59Z'),
      isActive: true,
      totalVotes: 1234,
      candidates: [
        {
          id: '1',
          name: 'John Smith',
          position: 'President',
          party: 'Democratic Party',
          image: 'https://via.placeholder.com/150',
          bio: 'Experienced leader with 20 years in public service.',
        },
        {
          id: '2',
          name: 'Jane Doe',
          position: 'President',
          party: 'Republican Party',
          image: 'https://via.placeholder.com/150',
          bio: 'Business leader and community advocate.',
        },
        {
          id: '3',
          name: 'Mike Johnson',
          position: 'President',
          party: 'Independent',
          image: 'https://via.placeholder.com/150',
          bio: 'Fresh perspective on modern challenges.',
        },
      ],
    };

    setVotingSession(mockSession);
    
    // Check if user has already voted
    if (user?.role === 'user') {
      setHasVoted((user as any).hasVoted || false);
    }
  }, [user]);

  // Countdown timer
  useEffect(() => {
    if (!votingSession) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(votingSession.endTime).getTime();
      const remaining = Math.max(0, end - now);
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [votingSession]);

  const formatTime = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const handleVote = async () => {
    if (!selectedCandidate || !votingSession) return;

    setIsVoting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setHasVoted(true);
      setVotingSession(prev => prev ? { ...prev, totalVotes: prev.totalVotes + 1 } : null);
      
      // Show success message
      alert('Your vote has been recorded successfully!');
    } catch (error) {
      console.error('Vote error:', error);
      alert('Failed to record your vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user || user.role !== 'user') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">This page is only for voting users.</p>
        </div>
      </div>
    );
  }

  if (!votingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading voting session...</p>
        </div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Thank You for Voting!</h2>
            <p className="mt-2 text-lg text-gray-600">
              Your vote has been recorded successfully. You cannot vote again in this session.
            </p>
            <div className="mt-8">
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{votingSession.title}</h1>
              <p className="text-gray-600">Welcome, {user.fullName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Time Remaining</p>
                <p className="text-lg font-semibold text-red-600">{formatTime(timeLeft)}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Session Info */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Voting Session Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="mt-1 text-sm text-gray-900">{votingSession.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Votes Cast</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">{votingSession.totalVotes}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  votingSession.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {votingSession.isActive ? 'Active' : 'Ended'}
                </span>
              </div>
            </div>
          </div>

          {/* Candidates */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Your Candidate</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {votingSession.candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    selectedCandidate === candidate.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCandidate(candidate.id)}
                >
                  <div className="text-center">
                    <img
                      src={candidate.image}
                      alt={candidate.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{candidate.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{candidate.position}</p>
                    <p className="text-sm font-medium text-blue-600 mb-3">{candidate.party}</p>
                    <p className="text-sm text-gray-500">{candidate.bio}</p>
                  </div>
                  
                  {selectedCandidate === candidate.id && (
                    <div className="mt-4 text-center">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Selected
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Vote Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleVote}
                disabled={!selectedCandidate || isVoting}
                className={`px-8 py-3 rounded-md text-lg font-medium ${
                  selectedCandidate && !isVoting
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                {isVoting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Recording Vote...
                  </div>
                ) : (
                  'Cast Your Vote'
                )}
              </button>
              
              {!selectedCandidate && (
                <p className="mt-2 text-sm text-gray-500">Please select a candidate to vote</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VotingPage;
