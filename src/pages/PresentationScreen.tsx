import React, { useState, useEffect } from 'react';
import type { VotingSession } from '../types/types';

const PresentationScreen: React.FC = () => {
  const [votingSession, setVotingSession] = useState<VotingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with API calls
  useEffect(() => {
    const mockSession: VotingSession = {
      id: '1',
      title: 'Presidential Election 2024',
      description: 'Live Results Presentation',
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

    // Simulate loading
    setTimeout(() => {
      setVotingSession(mockSession);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!votingSession) return;

    const interval = setInterval(() => {
      setVotingSession(prev => {
        if (!prev) return prev;
        
        // Randomly update vote counts
        const updatedCandidates = prev.candidates.map(candidate => ({
          ...candidate,
          votes: Math.floor(Math.random() * 500) + 100, // Mock vote count
        }));

        return {
          ...prev,
          candidates: updatedCandidates,
          totalVotes: updatedCandidates.reduce((sum, c) => sum + (c.votes || 0), 0),
        };
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [votingSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
          <h1 className="mt-6 text-2xl font-bold">Loading Results...</h1>
        </div>
      </div>
    );
  }

  if (!votingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold">No voting session available</h1>
        </div>
      </div>
    );
  }

  // Calculate percentages and sort candidates by votes
  const candidatesWithVotes = votingSession.candidates
    .map(candidate => ({
      ...candidate,
      votes: candidate.votes || Math.floor(Math.random() * 500) + 100,
    }))
    .sort((a, b) => (b.votes || 0) - (a.votes || 0));

  const totalVotes = candidatesWithVotes.reduce((sum, c) => sum + (c.votes || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      {/* Header */}
      <header className="text-center py-8">
        <h1 className="text-5xl font-bold mb-4">{votingSession.title}</h1>
        <p className="text-xl text-blue-200">{votingSession.description}</p>
        <div className="mt-4 text-2xl font-semibold text-yellow-300">
          Total Votes: {totalVotes.toLocaleString()}
        </div>
      </header>

      {/* Live Indicator */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 bg-red-600 rounded-full">
          <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm font-semibold">LIVE</span>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {candidatesWithVotes.map((candidate, index) => {
            const percentage = totalVotes > 0 ? ((candidate.votes || 0) / totalVotes) * 100 : 0;
            const isLeading = index === 0;
            
            return (
              <div
                key={candidate.id}
                className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 ${
                  isLeading ? 'border-yellow-400 bg-yellow-400/20' : 'border-white/20'
                }`}
              >
                {/* Position Badge */}
                {isLeading && (
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                )}

                {/* Candidate Info */}
                <div className="text-center mb-6">
                  <img
                    src={candidate.image}
                    alt={candidate.name}
                    className={`w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 ${
                      isLeading ? 'border-yellow-400' : 'border-white/30'
                    }`}
                  />
                  <h3 className="text-2xl font-bold mb-2">{candidate.name}</h3>
                  <p className="text-lg text-blue-200 mb-1">{candidate.position}</p>
                  <p className="text-sm text-blue-300">{candidate.party}</p>
                </div>

                {/* Vote Count and Percentage */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-yellow-300 mb-2">
                    {(candidate.votes || 0).toLocaleString()}
                  </div>
                  <div className="text-2xl font-semibold text-blue-200">
                    {percentage.toFixed(1)}%
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/20 rounded-full h-4 mb-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-1000 ${
                      isLeading ? 'bg-yellow-400' : 'bg-blue-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                {/* Rank */}
                <div className="text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isLeading 
                      ? 'bg-yellow-400 text-yellow-900' 
                      : 'bg-white/20 text-white'
                  }`}>
                    #{index + 1} Place
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Stats */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-yellow-300">
                {candidatesWithVotes[0]?.votes?.toLocaleString() || 0}
              </div>
              <div className="text-blue-200">Leading Candidate Votes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-green-300">
                {votingSession.isActive ? 'Active' : 'Ended'}
              </div>
              <div className="text-blue-200">Session Status</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-purple-300">
                {new Date().toLocaleTimeString()}
              </div>
              <div className="text-blue-200">Last Updated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 mt-16">
        <p className="text-blue-200">
          Results update automatically every 5 seconds
        </p>
      </footer>
    </div>
  );
};

export default PresentationScreen;
