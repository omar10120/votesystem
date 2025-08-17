import React, { useState, useEffect } from 'react';
import voteService from '../../services/voteService';
import type { VoteSession } from '../../types/types';

interface EditVoteSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  session: VoteSession | null;
}

const EditVoteSessionModal: React.FC<EditVoteSessionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  session,
}) => {
  const [formData, setFormData] = useState({
    topicTitle: '',
    description: '',
    startedAt: '',
    endedAt: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when session changes
  useEffect(() => {
    if (session && isOpen) {
      setFormData({
        topicTitle: session.topicTitle,
        description: session.description,
        startedAt: session.startedAt.slice(0, 16), // Convert to datetime-local format
        endedAt: session.endedAt.slice(0, 16),
      });
    }
  }, [session, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.topicTitle.trim() || !formData.description.trim() || !formData.startedAt || !formData.endedAt) {
        setError('All fields are required');
        setIsLoading(false);
        return;
      }

      // Validate dates
      const startDate = new Date(formData.startedAt);
      const endDate = new Date(formData.endedAt);
      
      if (startDate >= endDate) {
        setError('End date must be after start date');
        setIsLoading(false);
        return;
      }

      await voteService.updateVoteSession({
        id: session.id,
        topicTitle: formData.topicTitle.trim(),
        description: formData.description.trim(),
        startedAt: startDate.toISOString(),
        endedAt: endDate.toISOString(),
      });

      // Show success message briefly before closing
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update vote session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen || !session) return null;

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
              Edit Voting Session
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
            {/* Topic Title */}
            <div>
              <label htmlFor="edit-topicTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Topic Title *
              </label>
              <input
                type="text"
                id="edit-topicTitle"
                name="topicTitle"
                required
                value={formData.topicTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter topic title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="edit-description"
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Enter session description"
              />
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="edit-startedAt" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                id="edit-startedAt"
                name="startedAt"
                required
                value={formData.startedAt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="edit-endedAt" className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                id="edit-endedAt"
                name="endedAt"
                required
                value={formData.endedAt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                  'Update Session'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditVoteSessionModal;
