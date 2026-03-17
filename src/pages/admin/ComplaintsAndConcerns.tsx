import React, { useState, useEffect } from 'react';
import { apiWithRetry } from '../../services/api';

interface Complaint {
  _id: string;
  complainantName: string;
  contactNumber: string;
  address: string;
  email: string;
  incidentDate: string;
  incidentTime: string;
  incidentLocation: string;
  partiesInvolved: string;
  description: string;
  evidence?: string;
  desiredOutcome: string;
  concernType: string;
  status: 'pending' | 'in_progress' | 'solved';
  createdAt: string;
  updatedAt: string;
  reportFile?: string;
}

const ComplaintsAndConcerns: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'solved'>('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await apiWithRetry.get('/complaints');
      setComplaints(response.data || []);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId: string, status: 'pending' | 'in_progress' | 'solved') => {
    try {
      await apiWithRetry.put(`/complaints/${complaintId}`, { status });
      setComplaints(prev => 
        prev.map(complaint => 
          complaint._id === complaintId ? { ...complaint, status } : complaint
        )
      );
    } catch (error) {
      console.error('Failed to update complaint status:', error);
      alert('Failed to update status');
    }
  };

  const uploadReport = async (complaintId: string) => {
    if (!reportFile) {
      alert('Please select a report file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('reportFile', reportFile);
      formData.append('status', 'solved');

      const response = await apiWithRetry.post(`/complaints/${complaintId}/report`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert('Report uploaded successfully');
        setShowReportModal(false);
        setReportFile(null);
        fetchComplaints();
      } else {
        alert('Failed to upload report');
      }
    } catch (error) {
      console.error('Error uploading report:', error);
      alert('Error uploading report');
    }
  };

  const openDetailsModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailsModal(true);
  };

  const openReportModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowReportModal(true);
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'all') return true;
    return complaint.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'solved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConcernTypeLabel = (type: string) => {
    switch (type) {
      case 'general':
        return 'General Complaint';
      case 'misconduct':
        return 'Staff Misconduct';
      case 'safety':
        return 'Safety Incident';
      case 'child_protection':
        return 'Child Protection';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchComplaints}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complaints & Concerns</h1>
        <p className="text-gray-600">Manage and respond to citizen complaints and concerns</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {(['all', 'pending', 'in_progress', 'solved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === status
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {status === 'all' && 'All'}
              {status === 'pending' && 'Pending'}
              {status === 'in_progress' && 'In Progress'}
              {status === 'solved' && 'Solved'}
              <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                {status === 'all' 
                  ? complaints.length 
                  : complaints.filter(c => c.status === status).length
                }
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Complaints Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complainant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {complaint._id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {complaint.complainantName || 'Anonymous'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {complaint.email || complaint.contactNumber || 'No contact'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getConcernTypeLabel(complaint.concernType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openDetailsModal(complaint)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    {complaint.status === 'pending' && (
                      <button
                        onClick={() => updateComplaintStatus(complaint._id, 'in_progress')}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                      >
                        Start
                      </button>
                    )}
                    {complaint.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => openReportModal(complaint)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Solve
                        </button>
                        <button
                          onClick={() => updateComplaintStatus(complaint._id, 'pending')}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Hold
                        </button>
                      </>
                    )}
                    {complaint.reportFile && (
                      <a
                        href={`http://localhost:5000/${complaint.reportFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-900 ml-3"
                      >
                        Report
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredComplaints.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No complaints found</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Complaint Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Complainant Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Complainant Information</h3>
                  <div className="space-y-2">
                    <div><strong>Name:</strong> {selectedComplaint.complainantName || 'Anonymous'}</div>
                    <div><strong>Contact:</strong> {selectedComplaint.contactNumber || 'Not provided'}</div>
                    <div><strong>Email:</strong> {selectedComplaint.email || 'Not provided'}</div>
                    <div><strong>Address:</strong> {selectedComplaint.address || 'Not provided'}</div>
                  </div>
                </div>

                {/* Incident Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Incident Information</h3>
                  <div className="space-y-2">
                    <div><strong>Type:</strong> {getConcernTypeLabel(selectedComplaint.concernType)}</div>
                    <div><strong>Date:</strong> {selectedComplaint.incidentDate}</div>
                    <div><strong>Time:</strong> {selectedComplaint.incidentTime}</div>
                    <div><strong>Location:</strong> {selectedComplaint.incidentLocation}</div>
                    <div><strong>Parties Involved:</strong> {selectedComplaint.partiesInvolved}</div>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* Desired Outcome */}
                {selectedComplaint.desiredOutcome && (
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-gray-900 mb-2">Desired Outcome</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {selectedComplaint.desiredOutcome}
                    </p>
                  </div>
                )}

                {/* Evidence */}
                {selectedComplaint.evidence && (
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-gray-900 mb-2">Evidence</h3>
                    <a
                      href={`http://localhost:5000/${selectedComplaint.evidence}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Evidence File
                    </a>
                  </div>
                )}

                {/* Report File */}
                {selectedComplaint.reportFile && (
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-gray-900 mb-2">Resolution Report</h3>
                    <a
                      href={`http://localhost:5000/${selectedComplaint.reportFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 underline"
                    >
                      View Resolution Report
                    </a>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                {selectedComplaint.status === 'pending' && (
                  <button
                    onClick={() => {
                      updateComplaintStatus(selectedComplaint._id, 'in_progress');
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Mark as In Progress
                  </button>
                )}
                {selectedComplaint.status === 'in_progress' && (
                  <button
                    onClick={() => {
                      openReportModal(selectedComplaint);
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Upload Resolution Report
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Upload Modal */}
      {showReportModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Upload Resolution Report</h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600">
                  Upload a resolution report for complaint from {selectedComplaint.complainantName || 'Anonymous'}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report File (PDF, DOC, DOCX)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => uploadReport(selectedComplaint._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Upload & Mark as Solved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsAndConcerns;
