import React, { useState, useEffect } from 'react';
import voteService from '../../services/voteService';
import type { AttendanceRecord, User, VoteSession } from '../../types/types';
import CreateAttendanceModal from './CreateAttendanceModal';
import EditAttendanceModal from './EditAttendanceModal';
import ConfirmDialog from '../shared/ConfirmDialog';
import authService from '../../services/authService';

const Attendance: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [voteSessions, setVoteSessions] = useState<VoteSession[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<AttendanceRecord | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingAttendance, setDeletingAttendance] = useState<AttendanceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [requestingOTPFor, setRequestingOTPFor] = useState<number | null>(null);

  useEffect(() => {
    fetchAttendance();
    fetchUsers();
    fetchVoteSessions();
  }, []);

  const fetchAttendance = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedAttendance = await voteService.getAttendanceRecords();
      setAttendance(fetchedAttendance);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch attendance');
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await voteService.getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchVoteSessions = async () => {
    try {
      const fetchedSessions = await voteService.getVoteSessions();
      setVoteSessions(fetchedSessions);
    } catch (error) {
      console.error('Error fetching vote sessions:', error);
    }
  };

  const handleCreateSuccess = () => {
    fetchAttendance();
    setShowSuccessMessage(true);
    setSuccessMessage('Attendance record created successfully!');
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleEditAttendance = (attendance: AttendanceRecord) => {
    setEditingAttendance(attendance);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchAttendance();
    setShowSuccessMessage(true);
    setSuccessMessage('Attendance record updated successfully!');
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleRequestEmailOTP = async (email: string, userName: string, userId: number) => {
    setRequestingOTPFor(userId);
    try {
      await authService.requestEmailOTP(email);
      setShowSuccessMessage(true);
      setSuccessMessage(`Email OTP requested successfully for ${userName}!`);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to request email OTP');
      setTimeout(() => setError(null), 5000);
    } finally {
      setRequestingOTPFor(null);
    }
  };

  const handleDeleteAttendance = (attendance: AttendanceRecord) => {
    setDeletingAttendance(attendance);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAttendance) return;
    
    setIsDeleting(true);
    try {
      await voteService.deleteAttendance(deletingAttendance.id);
      setAttendance(prev => prev.filter(a => a.id !== deletingAttendance.id));
      setShowSuccessMessage(true);
      setSuccessMessage('Attendance record deleted successfully!');
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete attendance');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingAttendance(null);
      setIsDeleting(false);
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.fullName : `User ID: ${userId}`;
  };

  const getUserEmail = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.email : 'N/A';
  };

  const getSessionTitle = (sessionId: number) => {
    const session = voteSessions.find(s => s.id === sessionId);
    return session ? session.topicTitle : `Session ID: ${sessionId}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading attendance records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
        <button
          onClick={fetchAttendance}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6">
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

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Attendance Management</h3>
        <div className="flex space-x-3">
          <button
            onClick={fetchAttendance}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </div>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Attendance
            </div>
          </button>
        </div>
      </div>

      {attendance.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No attendance records found.</p>
          <button
            onClick={fetchAttendance}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {attendance.map((record) => (
              <li key={record.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Attendance Record #{record.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">User:</span> {getUserName(record.userId)} ({getUserEmail(record.userId)})
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Session:</span> {getSessionTitle(record.voteSessionId)}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">User ID: {record.userId}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">Session ID: {record.voteSessionId}</span>
                        {record.otpCodeID && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">OTP Code ID: {record.otpCodeID}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Created by Admin ID:</span> {record.createdByAdminId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRequestEmailOTP(getUserEmail(record.userId), getUserName(record.userId), record.userId)}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          requestingOTPFor === record.userId
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                        title="Request Email OTP for this user"
                        disabled={requestingOTPFor === record.userId}
                      >
                        {requestingOTPFor === record.userId ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-600 mr-1"></div>
                            Requesting...
                          </div>
                        ) : (
                          'Request OTP'
                        )}
                      </button>
                      <button
                        onClick={() => handleEditAttendance(record)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Edit attendance record"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAttendance(record)}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          isDeleting && deletingAttendance?.id === record.id
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        title="Delete attendance record"
                        disabled={isDeleting && deletingAttendance?.id === record.id}
                      >
                        {isDeleting && deletingAttendance?.id === record.id ? (
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

      {/* Create Attendance Modal */}
      <CreateAttendanceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Attendance Modal */}
      <EditAttendanceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAttendance(null);
        }}
        onSuccess={handleEditSuccess}
        attendance={editingAttendance}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingAttendance(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Delete Attendance Record: ${deletingAttendance?.id || ''}`}
        message={`Are you sure you want to delete the attendance record for user "${deletingAttendance ? getUserName(deletingAttendance.userId) : ''}" (${deletingAttendance ? getUserEmail(deletingAttendance.userId) : ''})? This action cannot be undone.`}
        confirmText="Delete Attendance"
      />
    </div>
  );
};

export default Attendance;
