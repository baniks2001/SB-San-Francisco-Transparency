import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Navigate to public portal
    navigate('/', { replace: true });
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Home Content', path: '/admin/home-content', icon: '🏠' },
    { name: 'Resolutions', path: '/admin/resolutions', icon: '📄' },
    { name: 'Ordinances', path: '/admin/ordinances', icon: '📋' },
    { name: 'Templates', path: '/admin/templates', icon: '📝' },
    { name: 'Procurement and Budget', path: '/admin/procurements', icon: '💰' },
    { name: 'Vacancy & Hiring', path: '/admin/vacancies', icon: '👥' },
    { name: 'Applications', path: '/admin/applications', icon: '📋' },
    { name: 'Announcement', path: '/admin/announcements', icon: '📢' },
    ...(user?.role === 'System Administrator' ? [
      { name: 'Manage Accounts', path: '/admin/users', icon: '👤' },
      { name: 'System Settings', path: '/admin/settings', icon: '⚙️' }
    ] : [])
  ];

  const isActivePath = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-56 bg-gray-900 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0 flex-shrink-0`}>
        <div className="flex items-center justify-between h-14 px-3 bg-gray-800 border-b border-gray-700">
          <h2 className="text-white font-bold text-base">Admin Portal</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Profile */}
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {user?.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-xs truncate">{user?.fullName}</p>
              <p className="text-gray-400 text-xs truncate">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-3 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center px-2 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                    isActivePath(item.path)
                      ? 'bg-yellow-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-2 text-sm">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-2 py-2 text-xs font-medium text-gray-300 rounded-md hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block">
                  <span className="text-sm font-medium text-gray-900">
                    Welcome back, 
                  </span>
                  <span className="text-sm font-bold text-gray-900 ml-1">
                    {user?.fullName}
                  </span>
                </div>
                <div className="sm:hidden">
                  <span className="text-sm font-bold text-gray-900">
                    {user?.fullName?.split(' ')[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
