import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    resolutions: 0,
    ordinances: 0,
    procurements: 0,
    budgets: 0,
    vacancies: 0,
    applications: 0,
    announcements: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/settings/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-300 text-sm sm:text-base">
          Welcome to the Sangguniang Bayan Transparency Portal Admin Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-gray-900 rounded-lg shadow-lg p-3 sm:p-4 border border-gray-800">
          <div className="text-center">
            <span className="text-xl sm:text-2xl mb-2 block">📄</span>
            <div className="text-xl sm:text-2xl font-bold text-yellow-400">{stats.resolutions}</div>
            <div className="text-xs text-gray-400 mt-1">Resolutions</div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg shadow-lg p-3 sm:p-4 border border-gray-800">
          <div className="text-center">
            <span className="text-xl sm:text-2xl mb-2 block">📋</span>
            <div className="text-xl sm:text-2xl font-bold text-blue-400">{stats.ordinances}</div>
            <div className="text-xs text-gray-400 mt-1">Ordinances</div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg shadow-lg p-3 sm:p-4 border border-gray-800">
          <div className="text-center">
            <span className="text-xl sm:text-2xl mb-2 block">💰</span>
            <div className="text-xl sm:text-2xl font-bold text-green-400">{stats.procurements}</div>
            <div className="text-xs text-gray-400 mt-1">Procurements</div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg shadow-lg p-3 sm:p-4 border border-gray-800">
          <div className="text-center">
            <span className="text-xl sm:text-2xl mb-2 block">👥</span>
            <div className="text-xl sm:text-2xl font-bold text-purple-400">{stats.vacancies}</div>
            <div className="text-xs text-gray-400 mt-1">Vacancies</div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg shadow-lg p-3 sm:p-4 border border-gray-800">
          <div className="text-center">
            <span className="text-xl sm:text-2xl mb-2 block">📊</span>
            <div className="text-xl sm:text-2xl font-bold text-red-400">{stats.budgets}</div>
            <div className="text-xs text-gray-400 mt-1">Budgets</div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg shadow-lg p-3 sm:p-4 border border-gray-800">
          <div className="text-center">
            <span className="text-xl sm:text-2xl mb-2 block">📝</span>
            <div className="text-xl sm:text-2xl font-bold text-indigo-400">{stats.applications}</div>
            <div className="text-xs text-gray-400 mt-1">Applications</div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg shadow-lg p-3 sm:p-4 border border-gray-800">
          <div className="text-center">
            <span className="text-xl sm:text-2xl mb-2 block">📢</span>
            <div className="text-xl sm:text-2xl font-bold text-orange-400">{stats.announcements}</div>
            <div className="text-xs text-gray-400 mt-1">Announcements</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-white">Quick Actions</h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-200 shadow-lg text-xs sm:text-sm">
              <span className="mr-1 sm:mr-2">➕</span>
              <span className="hidden sm:inline">New Resolution</span>
              <span className="sm:hidden">Resolution</span>
            </button>
            <button className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg text-xs sm:text-sm">
              <span className="mr-1 sm:mr-2">➕</span>
              <span className="hidden sm:inline">New Ordinance</span>
              <span className="sm:hidden">Ordinance</span>
            </button>
            <button className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 shadow-lg text-xs sm:text-sm">
              <span className="mr-1 sm:mr-2">➕</span>
              <span className="hidden sm:inline">New Procurement</span>
              <span className="sm:hidden">Procurement</span>
            </button>
            <button className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 shadow-lg text-xs sm:text-sm">
              <span className="mr-1 sm:mr-2">➕</span>
              <span className="hidden sm:inline">New Vacancy</span>
              <span className="sm:hidden">Vacancy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-white">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-700">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-800 transition-colors space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">New resolution approved</p>
                <p className="text-xs text-gray-400 truncate">Resolution No. 007, Series 2025</p>
              </div>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">2 hours ago</span>
          </div>
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-800 transition-colors space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">New ordinance created</p>
                <p className="text-xs text-gray-400 truncate">Ordinance No. 001, Series 2025</p>
              </div>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">5 hours ago</span>
          </div>
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-800 transition-colors space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">New job application received</p>
                <p className="text-xs text-gray-400 truncate">Administrative Assistant position</p>
              </div>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
