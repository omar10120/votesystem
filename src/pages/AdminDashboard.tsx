import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import voteService from '../services/voteService';
import type { VoteSession } from '../types/types';
import CreateVoteSessionModal from '../components/admin/CreateVoteSessionModal';
import EditVoteSessionModal from '../components/admin/EditVoteSessionModal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import Users from '../components/admin/Users';
import Attendance from '../components/admin/Attendance';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [voteSessions, setVoteSessions] = useState<VoteSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<VoteSession | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingSession, setDeletingSession] = useState<VoteSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleCreateSuccess = () => {
    fetchVoteSessions();
    setShowSuccessMessage(true);
    setSuccessMessage('Voting session created successfully!');
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleEditSuccess = () => {
    fetchVoteSessions();
    setShowSuccessMessage(true);
    setSuccessMessage('Voting session updated successfully!');
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleDeleteSession = async (session: VoteSession) => {
    setDeletingSession(session);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSession) return;
    
    setIsDeleting(true);
    try {
      await voteService.deleteVoteSession(deletingSession.id);
      setVoteSessions(prev => prev.filter(s => s.id !== deletingSession.id));
      setShowSuccessMessage(true);
      setSuccessMessage('Voting session deleted successfully!');
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      setSessionsError(error instanceof Error ? error.message : 'Failed to delete voting session');
      console.error('Error deleting voting session:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingSession(null);
      setIsDeleting(false);
    }
  };

  // Fetch vote sessions when the voting-sessions tab is selected
  useEffect(() => {
    if (activeTab === 'voting-sessions') {
      fetchVoteSessions();
    }
  }, [activeTab]);

  // Fetch vote sessions on component mount to populate overview stats
  useEffect(() => {
    fetchVoteSessions();
  }, []);

  const fetchVoteSessions = async () => {
    setIsLoadingSessions(true);
    setSessionsError(null);
    
    try {
      const sessions = await voteService.getVoteSessions();
      setVoteSessions(sessions);
    } catch (error) {
      setSessionsError(error instanceof Error ? error.message : 'Failed to fetch vote sessions');
      console.error('Error fetching vote sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Draft';
      case 1: return 'Active';
      case 2: return 'Ended';
      case 3: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-gray-100 text-gray-800';
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Invalid Date';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.fullName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{user.email}</span>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'voting-sessions', label: 'Voting Sessions' },
              { id: 'candidates', label: 'Candidates' },
              { id: 'users', label: 'Users' },
              { id: 'attendance', label: 'Attendance' },
              { id: 'results', label: 'Results' },
              { id: 'settings', label: 'Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 px-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Stats Cards */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Sessions</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {voteSessions.filter(s => s.voteSessionStatus === 1).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
                        <dd className="text-lg font-medium text-gray-900">{voteSessions.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Draft Sessions</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {voteSessions.filter(s => s.voteSessionStatus === 0).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Ended Sessions</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {voteSessions.filter(s => s.voteSessionStatus === 2).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  <li className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">New voting session created</div>
                          <div className="text-sm text-gray-500">Presidential Election 2024</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">2 hours ago</div>
                    </div>
                  </li>
                  <li className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">New user registered</div>
                          <div className="text-sm text-gray-500">john.doe@example.com</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">4 hours ago</div>
                    </div>
                  </li>
                  <li className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Voting session ended</div>
                          <div className="text-sm text-gray-500">Local Council Election</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">1 day ago</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Voting Sessions Tab */}
        {activeTab === 'voting-sessions' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Voting Sessions</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Session
                  </div>
                </button>
                <button
                  onClick={fetchVoteSessions}
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
            
            {isLoadingSessions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading voting sessions...</p>
              </div>
            ) : sessionsError ? (
              <div className="text-center py-8 text-red-600">
                <p>{sessionsError}</p>
                <button
                  onClick={fetchVoteSessions}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            ) : voteSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No voting sessions found.</p>
                <button
                  onClick={fetchVoteSessions}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {voteSessions.map((session) => (
                    <li key={session.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(session.voteSessionStatus)}`}>
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{session.topicTitle}</div>
                            <div className="text-sm text-gray-500">{session.description}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.voteSessionStatus)}`}>
                                {getStatusText(session.voteSessionStatus)}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">ID: {session.id}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Start:</span> {formatDate(session.startedAt)}
                            </div>
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">End:</span> {formatDate(session.endedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">ID: {session.id}</div>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => {
                                setEditingSession(session);
                                setIsEditModalOpen(true);
                              }}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSession(session)}
                              className={`px-3 py-1 text-xs rounded transition-colors ${
                                isDeleting && deletingSession?.id === session.id
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                              title="Delete this voting session"
                              disabled={isDeleting && deletingSession?.id === session.id}
                            >
                              {isDeleting && deletingSession?.id === session.id ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600 mr-1"></div>
                                  Deleting...
                                </div>
                              ) : (
                                'Delete'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && <Users />}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && <Attendance />}

        {/* Other tabs placeholder */}
        {activeTab !== 'overview' && activeTab !== 'voting-sessions' && activeTab !== 'users' && activeTab !== 'attendance' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
              </h3>
              <p className="text-gray-500">This section is under development.</p>
            </div>
          </div>
        )}
      </main>

      {/* Create Vote Session Modal */}
      <CreateVoteSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Vote Session Modal */}
      <EditVoteSessionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        session={editingSession}
        onSuccess={handleEditSuccess}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingSession(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Delete Voting Session: ${deletingSession?.topicTitle || ''}`}
        message={`Are you sure you want to delete the voting session "${deletingSession?.topicTitle || ''}" (ID: ${deletingSession?.id || ''})? This action cannot be undone.`}
      />
    </div>
  );
};

export default AdminDashboard;
