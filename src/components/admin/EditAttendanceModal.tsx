import React, { useState, useEffect } from 'react';
import voteService from '../../services/voteService';
import type { User, VoteSession, AttendanceRecord } from '../../types/types';

interface EditAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  attendance: AttendanceRecord | null;
}

const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  attendance,
}) => {
  const [formData, setFormData] = useState({
    userId: 0,
    voteSessionId: 0,
    otpCodeID: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [voteSessions, setVoteSessions] = useState<VoteSession[]>([]);

  // Fetch users and vote sessions when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchVoteSessions();
    }
  }, [isOpen]);

  // Update form data when attendance changes
  useEffect(() => {
    if (attendance && isOpen) {
      setFormData({
        userId: attendance.userId,
        voteSessionId: attendance.voteSessionId,
        otpCodeID: attendance.otpCodeID || 0,
      });
    }
  }, [attendance, isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendance) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.voteSessionId || !formData.userId) {
        setError('Please select both a vote session and a user');
        setIsLoading(false);
        return;
      }

      await voteService.updateAttendance({
        id: attendance.id,
        userId: formData.userId,
        voteSessionId: formData.voteSessionId,
        otpCodeID: formData.otpCodeID || null,
      });

      // Show success message briefly before closing
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update attendance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'otpCodeID' ? (value ? parseInt(value) : 0) : parseInt(value)
    }));
  };

  if (!isOpen || !attendance) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Attendance Record
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vote Session */}
            <div>
              <label htmlFor="edit-voteSessionId" className="block text-sm font-medium text-gray-700 mb-2">
                Vote Session *
              </label>
              <select
                id="edit-voteSessionId"
                name="voteSessionId"
                required
                value={formData.voteSessionId || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Select a vote session</option>
                {voteSessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.topicTitle} (ID: {session.id})
                  </option>
                ))}
              </select>
            </div>

            {/* User */}
            <div>
              <label htmlFor="edit-userId" className="block text-sm font-medium text-gray-700 mb-2">
                User *
              </label>
              <select
                id="edit-userId"
                name="userId"
                required
                value={formData.userId || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} - {user.email} (ID: {user.id})
                  </option>
                ))}
              </select>
            </div>

            {/* OTP Code ID */}
            <div>
              <label htmlFor="edit-otpCodeID" className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code ID (Optional)
              </label>
              <input
                type="number"
                id="edit-otpCodeID"
                name="otpCodeID"
                value={formData.otpCodeID || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter OTP Code ID or leave empty"
                min="0"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Attendance'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAttendanceModal;
