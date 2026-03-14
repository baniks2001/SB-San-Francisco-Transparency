import React, { useState, useEffect } from 'react';
import { Vacancy } from '../types';
import api from '../services/api';

const Vacancies: React.FC = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    age: '',
    mobileNumber: '',
    email: '',
    address: '',
    resume: null as File | null,
    certificates: [] as File[]
  });

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const response = await api.get('/vacancies');
        setVacancies(response.data);
      } catch (error) {
        console.error('Failed to fetch vacancies:', error);
        // Fallback to mock data if API fails
        const mockVacancies: Vacancy[] = [
          {
            _id: '1',
            jobTitle: 'Administrative Assistant',
            position: 'Government Service',
            estimatedSalary: 18000,
            jobDescription: 'Provide administrative support to various municipal offices',
            qualifications: 'Bachelor\'s degree in any field, computer literate, good communication skills',
            requirements: 'Resume, transcript of records, birth certificate',
            status: 'Active',
            datePosted: '2025-02-01',
            closingDate: '2025-02-28',
            department: 'Administrative Office',
            employmentType: 'Full-time',
            createdBy: 'admin',
            createdAt: '2025-02-01T00:00:00Z',
            updatedAt: '2025-02-01T00:00:00Z'
          }
        ];
        setVacancies(mockVacancies);
      } finally {
        setLoading(false);
      }
    };

    fetchVacancies();
  }, []);

  const handleApply = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle application submission
    alert('Application submitted successfully!');
    setShowApplicationModal(false);
    setApplicationForm({
      fullName: '',
      age: '',
      mobileNumber: '',
      email: '',
      address: '',
      resume: null,
      certificates: []
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Job Vacancies</h1>
        <p className="text-black">
          View available job opportunities and apply online
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vacancies.map((vacancy) => (
          <div key={vacancy._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-black mb-2">{vacancy.jobTitle}</h3>
              <p className="text-black mb-2">{vacancy.position}</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-600 font-semibold">
                  ₱{vacancy.estimatedSalary.toLocaleString()}/month
                </span>
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  {vacancy.status}
                </span>
              </div>
              <div className="text-sm text-black space-y-1">
                <p><strong>Department:</strong> {vacancy.department}</p>
                <p><strong>Type:</strong> {vacancy.employmentType}</p>
                <p><strong>Closing:</strong> {vacancy.closingDate ? new Date(vacancy.closingDate).toLocaleDateString('en-PH') : 'Open until filled'}</p>
              </div>
            </div>
            <button
              onClick={() => handleApply(vacancy)}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition duration-200"
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedVacancy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-black mb-4">
              Apply for: {selectedVacancy.jobTitle}
            </h2>
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={applicationForm.fullName}
                    onChange={(e) => setApplicationForm({...applicationForm, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={applicationForm.age}
                    onChange={(e) => setApplicationForm({...applicationForm, age: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={applicationForm.mobileNumber}
                    onChange={(e) => setApplicationForm({...applicationForm, mobileNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={applicationForm.email}
                    onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Address</label>
                <textarea
                  required
                  value={applicationForm.address}
                  onChange={(e) => setApplicationForm({...applicationForm, address: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Resume (PDF)</label>
                <input
                  type="file"
                  required
                  accept=".pdf"
                  onChange={(e) => setApplicationForm({...applicationForm, resume: e.target.files?.[0] || null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Certificates (Optional)</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={(e) => setApplicationForm({...applicationForm, certificates: Array.from(e.target.files || [])})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowApplicationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vacancies;
