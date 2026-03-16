import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import NotificationModal from '../../components/NotificationModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { SystemSettings } from '../../types';

const AdminAnnouncements: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncementIndex, setSelectedAnnouncementIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'Normal' as 'Urgent' | 'Normal' | 'Low' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger' as 'danger' | 'warning' | 'info',
    isLoading: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (index?: number) => {
    setSelectedAnnouncementIndex(index || null);
    
    if (index !== undefined && settings?.announcements?.[index]) {
      const announcement = settings.announcements[index];
      setFormData({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority
      });
      setSelectedFile(null);
    } else {
      // Add mode
      setFormData({ title: '', content: '', priority: 'Normal' });
      setSelectedFile(null);
    }
    
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ title: '', content: '', priority: 'Normal' });
    setSelectedFile(null);
    setSelectedAnnouncementIndex(null);
    setError('');
    setSuccess('');
  };

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotificationModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const showConfirmation = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'danger') => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type,
      isLoading: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (selectedAnnouncementIndex !== null) {
        // Update existing announcement
        const updateFormData = new FormData();
        updateFormData.append('title', formData.title);
        updateFormData.append('content', formData.content);
        updateFormData.append('priority', formData.priority);
        if (selectedFile) {
          updateFormData.append('file', selectedFile);
        }
        
        await api.put(`/settings/announcements/${selectedAnnouncementIndex}`, updateFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification('Success', 'Announcement updated successfully!', 'success');
      } else {
        // Add new announcement
        const uploadFormData = new FormData();
        uploadFormData.append('title', formData.title);
        uploadFormData.append('content', formData.content);
        uploadFormData.append('priority', formData.priority);
        if (selectedFile) {
          uploadFormData.append('file', selectedFile);
        }
        
        await api.post('/settings/announcements', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification('Success', 'Announcement created successfully!', 'success');
      }
      
      await fetchSettings();
      closeModal();
    } catch (error: any) {
      showNotification('Error', error.response?.data?.message || 'Failed to save announcement', 'error');
    }
  };

  const deleteAnnouncement = async (index: number) => {
    showConfirmation(
      'Delete Announcement',
      'Are you sure you want to delete this announcement? This action cannot be undone.',
      async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          const updatedAnnouncements = [...(settings?.announcements || [])];
          updatedAnnouncements.splice(index, 1);
          await api.put('/settings', { announcements: updatedAnnouncements });
          showNotification('Success', 'Announcement deleted successfully!', 'success');
          await fetchSettings();
        } catch (error: any) {
          showNotification('Error', error.response?.data?.message || 'Failed to delete announcement', 'error');
        } finally {
          setConfirmationModal(prev => ({ ...prev, isLoading: false, isOpen: false }));
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl shadow-xl p-4 sm:p-6 border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Manage Announcements</h1>
            <p className="text-gray-300 text-sm sm:text-base">Create and manage public announcements</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm sm:text-base"
          >
            Add Announcement
          </button>
        </div>
      </div>

      
      {/* Announcements Table */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {settings?.announcements?.map((announcement, index) => (
                <tr key={index} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{announcement.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white max-w-xs truncate">{announcement.content}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      announcement.priority === 'Urgent' 
                        ? 'bg-red-900 text-red-200' 
                        : announcement.priority === 'Normal'
                        ? 'bg-blue-900 text-blue-200'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {announcement.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openModal(index)}
                      className="text-yellow-400 hover:text-yellow-300 font-medium mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(index)}
                      className="text-red-400 hover:text-red-300 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(!settings?.announcements || settings.announcements.length === 0) && (
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 p-12 text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No announcements yet</h3>
          <p className="text-gray-400">Create your first announcement to get started</p>
        </div>
      )}

      {/* Add/Edit Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              {selectedAnnouncementIndex !== null ? 'Edit Announcement' : 'Add Announcement'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">Announcement Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">Announcement Details</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows={4}
                  placeholder="Enter announcement details"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as 'Urgent' | 'Normal' | 'Low'})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">Announcement Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  {selectedAnnouncementIndex !== null ? 'Update Announcement' : 'Create Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={() => setNotificationModal(prev => ({ ...prev, isOpen: false }))}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        isLoading={confirmationModal.isLoading}
      />
    </div>
  );
};

export default AdminAnnouncements;
