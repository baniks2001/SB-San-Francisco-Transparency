import React, { useState, useEffect } from 'react';
import { Ordinance } from '../types';
import api from '../services/api';

const Ordinances: React.FC = () => {
  const [ordinances, setOrdinances] = useState<Ordinance[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrdinances = async () => {
      try {
        const response = await api.get('/ordinances');
        setOrdinances(response.data);
      } catch (error) {
        console.error('Failed to fetch ordinances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdinances();
  }, []);

  const filteredOrdinances = ordinances.filter((ordinance) => {
    const matchesStatus = statusFilter === 'all' || ordinance.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      ordinance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordinance.ordinanceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordinance.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-600 text-white border-green-700';
      case 'Pending': return 'bg-yellow-600 text-white border-yellow-700';
      case 'Draft': return 'bg-gray-600 text-white border-gray-700';
      default: return 'bg-gray-600 text-white border-gray-700';
    }
  };

  const handleViewOrdinance = (ordinance: Ordinance) => {
    if (ordinance.scannedCopy) {
      window.open(`http://localhost:5000/uploads/${ordinance.scannedCopy}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-black">Loading ordinances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Ordinances</h1>
        <p className="text-black">
          View and download municipal ordinances
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Search Ordinances</label>
            <input
              type="text"
              placeholder="Search by title, number, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Ordinances</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {filteredOrdinances.length === 0 ? (
        <div className="bg-white shadow rounded-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-black mb-2">No ordinances found</h3>
          <p className="text-black">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Ordinance No.
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
                {filteredOrdinances.map((ordinance) => (
                  <tr key={ordinance._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {ordinance.ordinanceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      <div className="max-w-xs truncate" title={ordinance.title}>
                        {ordinance.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {ordinance.series}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {ordinance.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ordinance.status)}`}>
                        {ordinance.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewOrdinance(ordinance)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          View
                        </button>
                        {ordinance.scannedCopy && (
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
    </div>
  );
};

export default Ordinances;
