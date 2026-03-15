import React, { useState, useEffect } from 'react';
import { Resolution } from '../types';
import api from '../services/api';

const Resolutions: React.FC = () => {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
    if (resolution.scannedCopy) {
      window.open(`http://localhost:5000/uploads/${resolution.scannedCopy}`, '_blank');
    }
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
    <div className="flex-1 bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Resolutions</h1>
              <p className="text-black mt-1">View and download municipal resolutions</p>
            </div>
            <div className="mt-4 sm:mt-0 text-sm text-black">
              {resolutions.length} resolution{resolutions.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Search Resolutions</label>
              <input
                type="text"
                placeholder="Search by title, number, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="all">All Resolutions</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredResolutions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-black mb-2">No resolutions found</h3>
            <p className="text-black">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredResolutions.map((resolution) => (
              <div key={resolution._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-black">{resolution.resolutionNumber}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(resolution.status)}`}>
                          {resolution.status}
                        </span>
                      </div>
                      <p className="text-sm text-black mb-3">Series {resolution.series}</p>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-black mb-2 line-clamp-2">{resolution.title}</h4>
                  <p className="text-black text-sm mb-4 line-clamp-3">{resolution.content}</p>
                  
                  <div className="text-sm text-black mb-4 space-y-1">
                    <p><span className="font-medium">Author:</span> {resolution.author}</p>
                    <p><span className="font-medium">Date Approved:</span> {resolution.dateApproved || 'Pending'}</p>
                    <p><span className="font-medium">Signatories:</span> {resolution.signatories?.length || 0}</p>
                  </div>
                  
                  <button
                    onClick={() => handleViewResolution(resolution)}
                    className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-200 font-medium"
                  >
                    View Document
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resolutions;
