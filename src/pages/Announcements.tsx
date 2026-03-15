import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../types';
import api from '../services/api';

const Announcements: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
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

    fetchSettings();
  }, []);

  const announcements = settings?.announcements || [];

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesPriority = priorityFilter === 'all' || announcement.priority === priorityFilter;
    const matchesSearch = searchTerm === '' || 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-600 text-white border-red-700';
      case 'Normal': return 'bg-blue-600 text-white border-blue-700';
      case 'Low': return 'bg-gray-600 text-white border-gray-700';
      default: return 'bg-gray-600 text-white border-gray-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Urgent': return '🔴';
      case 'Normal': return '🔵';
      case 'Low': return '⚪';
      default: return '⚪';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-PH', options);
  };

  const openViewModal = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setSelectedAnnouncement(null);
    setIsViewModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-black">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Announcements</h1>
              <p className="text-black mt-1">Stay updated with the latest news and notices</p>
            </div>
            <div className="mt-4 sm:mt-0 text-sm text-black">
              {announcements.length} announcement{announcements.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Search Announcements</label>
              <input
                type="text"
                placeholder="Search by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Filter by Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-black mb-2">No announcements found</h3>
            <p className="text-black">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAnnouncements.map((announcement, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{getPriorityIcon(announcement.priority)}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2">{announcement.title}</h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{announcement.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatDate(announcement.createdAt)}
                    </span>
                    <button
                      onClick={() => openViewModal(announcement)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors duration-200"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Announcement Modal */}
      {isViewModalOpen && selectedAnnouncement && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-black">{selectedAnnouncement.title}</h3>
              <button
                onClick={closeViewModal}
                className="text-black hover:text-black"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getPriorityIcon(selectedAnnouncement.priority)}</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getPriorityColor(selectedAnnouncement.priority)}`}>
                  {selectedAnnouncement.priority}
                </span>
                <span className="text-sm text-gray-500">
                  Posted: {formatDate(selectedAnnouncement.createdAt)}
                </span>
              </div>

              {selectedAnnouncement.image && (
                <div className="w-full">
                  <img
                    src={`http://localhost:5000/uploads/${selectedAnnouncement.image}`}
                    alt={selectedAnnouncement.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="prose max-w-none">
                <p className="text-black leading-relaxed whitespace-pre-wrap">{selectedAnnouncement.content}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeViewModal}
                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
