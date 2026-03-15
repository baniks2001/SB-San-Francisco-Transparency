import React, { useState, useEffect } from 'react';
import { Resolution } from '../types';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const Resolutions: React.FC = () => {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResolution, setSelectedResolution] = useState<Resolution | null>(null);

  useEffect(() => {
    const fetchResolutions = async () => {
      try {
        const response = await api.get('/resolutions');
        setResolutions(response.data);
      } catch (error) {
        console.error('Failed to fetch resolutions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResolutions();
  }, []);

  const filteredResolutions = resolutions.filter((resolution) => {
    const matchesStatus = statusFilter === 'all' || resolution.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      resolution.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resolution.resolutionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resolution.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-600 text-white border-green-700';
      case 'Pending': return 'bg-yellow-600 text-white border-yellow-700';
      case 'Rejected': return 'bg-red-600 text-white border-red-700';
      default: return 'bg-gray-600 text-white border-gray-700';
    }
  };

  const handleViewResolution = (resolution: Resolution) => {
    setSelectedResolution(resolution);
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-black">Loading resolutions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Resolutions</h1>
        <p className="text-black">
          View and download municipal resolutions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Search Resolutions</label>
            <input
              type="text"
              placeholder="Search by title, number, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Resolutions</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {filteredResolutions.length === 0 ? (
        <div className="bg-white shadow rounded-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No resolutions found</h3>
          <p className="text-white">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Resolution No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Series
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResolutions.map((resolution) => (
                  <tr key={resolution._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {resolution.resolutionNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      <div className="max-w-xs truncate" title={resolution.title}>
                        {resolution.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {resolution.series}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {resolution.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resolution.status)}`}>
                        {resolution.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewResolution(resolution)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          View
                        </button>
                        {resolution.scannedCopy && (
                          <button className="text-green-600 hover:text-green-900">Download</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Document Modal */}
      {selectedResolution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedResolution.title}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span><strong>Resolution No:</strong> {selectedResolution.resolutionNumber}</span>
                    <span><strong>Series:</strong> {selectedResolution.series}</span>
                    <span><strong>Author:</strong> {selectedResolution.author}</span>
                    <span><strong>Status:</strong> {selectedResolution.status}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedResolution(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Content</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedResolution.content}</p>
                </div>
              </div>
              
              {selectedResolution.scannedCopy && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Scanned Document</h3>
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={getImageUrl(selectedResolution.scannedCopy)}
                      alt="Scanned Resolution"
                      className="w-full h-auto max-h-[600px] object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0Y1OUUwQiIvPgo8cGF0aCBkPSJNOCAxNkgxNlY4SDhWMTZaTTE2IDE2SDI0VjhIMTZWMTZaTTggMjRIMTZWMTZIOFYyNFpNMTYgMjRIMjRWMTZIMTZWMjRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedResolution(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedResolution.scannedCopy && (
                  <a
                    href={getImageUrl(selectedResolution.scannedCopy)}
                    download
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Download
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resolutions;
