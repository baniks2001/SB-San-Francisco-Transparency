import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import api, { apiWithRetry } from '../services/api';
import { SystemSettings } from '../types';

const PublicLayout: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const response = await apiWithRetry.get('/settings');
        setSystemSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch system settings:', error);
      }
    };

    fetchSystemSettings();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    try {
      await login(loginForm.username, loginForm.password);
      setIsDropdownOpen(false);
      setLoginForm({ username: '', password: '' });
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Top Navigation */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar with Logos */}
          <div className="flex justify-between items-center h-16">
            {/* Logos and System Name */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2 pr-2 sm:pr-3 border-r border-white">
                {systemSettings?.systemLogos && systemSettings.systemLogos.length > 0 ? (
                  systemSettings.systemLogos.slice(0, 3).map((logo, index) => (
                    <img 
                      key={index}
                      className="h-6 w-6 sm:h-8 sm:w-8 object-contain" 
                      src={getImageUrl(logo)}
                      alt={`System Logo ${index + 1}`}
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y1OUUwQiIvPgo8cGF0aCBkPSJNOCAxNkgxNlY4SDhWMTZaTTE2IDE2SDI0VjhIMTZWMTZaTTggMjRIMTZWMTZIOFYyNFpNMTYgMjRIMjRWMTZIMTZWMjRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                      }}
                    />
                  ))
                ) : systemSettings?.systemLogo ? (
                  <img 
                    className="h-6 w-6 sm:h-8 sm:w-8" 
                    src={getImageUrl(systemSettings.systemLogo)}
                    alt="System Logo"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y1OUUwQiIvPgo8cGF0aCBkPSJNOCAxNkgxNlY4SDhWMTZaTTE2IDE2SDI0VjhIMTZWMTZaTTggMjRIMTZWMTZIOFYyNFpNMTYgMjRIMjRWMTZIMTZWMjRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                    }}
                  />
                ) : (
                  <img 
                    className="h-6 w-6 sm:h-8 sm:w-8" 
                    src="/logo192.png" 
                    alt="System Logo"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y1OUUwQiIvPgo8cGF0aCBkPSJNOCAxNkgxNlY4SDhWMTZaTTE2IDE2SDI0VjhIMTZWMTZaTTggMjRIMTZWMTZIOFYyNFpNMTYgMjRIMjRWMTZIMTZWMjRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                    }}
                  />
                )}
              </div>
              <div className="ml-2 sm:ml-4 flex-1 min-w-0">
                <h1 className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base font-bold text-white leading-tight">
                  {systemSettings?.systemName || 'Sangguniang Bayan Transparency Portal'}
                </h1>
                <p className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm xl:text-sm text-gray-300 leading-tight">{systemSettings?.location || 'San Francisco, Southern Leyte'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu Row */}
          <div className="border-t border-gray-700 bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex justify-between items-center py-3">
                {/* Navigation Links */}
                <div className="hidden md:flex space-x-4 sm:space-x-6 lg:space-x-8">
                  <Link
                    to="/"
                    className={`inline-flex items-center px-1 pt-1 text-xs sm:text-sm font-medium ${
                      isActivePath('/') 
                        ? 'text-yellow-400 border-b-2 border-yellow-400' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/resolutions"
                    className={`inline-flex items-center px-1 pt-1 text-xs sm:text-sm font-medium ${
                      isActivePath('/resolutions') 
                        ? 'text-yellow-400 border-b-2 border-yellow-400' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    Resolutions
                  </Link>
                  <Link
                    to="/ordinances"
                    className={`inline-flex items-center px-1 pt-1 text-xs sm:text-sm font-medium ${
                      isActivePath('/ordinances') 
                        ? 'text-yellow-400 border-b-2 border-yellow-400' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    Ordinances
                  </Link>
                  <Link
                    to="/procurements"
                    className={`inline-flex items-center px-1 pt-1 text-xs sm:text-sm font-medium ${
                      isActivePath('/procurements') 
                        ? 'text-yellow-400 border-b-2 border-yellow-400' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    Procurements & Budget
                  </Link>
                  <Link
                    to="/vacancies"
                    className={`inline-flex items-center px-1 pt-1 text-xs sm:text-sm font-medium ${
                      isActivePath('/vacancies') 
                        ? 'text-yellow-400 border-b-2 border-yellow-400' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    Vacancies
                  </Link>
                </div>
                
                {/* Right side */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                  {/* Current Date/Time */}
                  <div className="hidden sm:block text-xs sm:text-sm text-gray-300">
                    {formatTime(currentTime)}
                  </div>

                  {/* Login Dropdown - Hidden on mobile, shown on desktop */}
                  <div className="relative hidden sm:block">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center text-xs sm:text-sm font-medium text-gray-300 hover:text-yellow-400 focus:outline-none"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="ml-1 text-white hidden sm:inline">Login</span>
                      <svg className="ml-1 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 sm:w-80 bg-white rounded-md shadow-lg py-2 sm:py-4 z-50">
                        <form onSubmit={handleLogin} className="px-2 sm:px-4">
                          <div className="mb-2 sm:mb-3">
                            <label className="block text-xs sm:text-sm font-medium text-white mb-1">Username</label>
                            <input
                              type="text"
                              value={loginForm.username}
                              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                              className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-xs sm:text-sm"
                              placeholder="Enter username"
                              required
                            />
                          </div>
                          <div className="mb-2 sm:mb-3">
                            <label className="block text-xs sm:text-sm font-medium text-white mb-1">Password</label>
                            <input
                              type="password"
                              value={loginForm.password}
                              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                              className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-xs sm:text-sm"
                              placeholder="Enter password"
                              required
                            />
                          </div>
                          {error && (
                            <div className="mb-2 sm:mb-3 text-xs sm:text-sm text-red-600">
                              {error}
                            </div>
                          )}
                          <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full bg-yellow-600 text-white py-1 sm:py-2 px-2 sm:px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                          >
                            {isLoggingIn ? 'Logging in...' : 'Login'}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className="md:hidden border-t border-gray-700 bg-gray-800">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActivePath('/') 
                ? 'text-yellow-400 bg-gray-700' 
                : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-700'
            }`}
          >
            Home
          </Link>
          <Link
            to="/resolutions"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActivePath('/resolutions') 
                ? 'text-yellow-400 bg-gray-700' 
                : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-700'
            }`}
          >
            Resolutions
          </Link>
          <Link
            to="/ordinances"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActivePath('/ordinances') 
                ? 'text-yellow-400 bg-gray-700' 
                : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-700'
            }`}
          >
            Ordinances
          </Link>
          <Link
            to="/procurements"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActivePath('/procurements') 
                ? 'text-yellow-400 bg-gray-700' 
                : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-700'
            }`}
          >
            Procurements & Budget
          </Link>
          <Link
            to="/vacancies"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActivePath('/vacancies') 
                ? 'text-yellow-400 bg-gray-700' 
                : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-700'
            }`}
          >
            Vacancies
          </Link>
          
          {/* Mobile Right Side - Date/Time and Login */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-700 mt-2">
            <div className="text-xs text-gray-300">
              {formatTime(currentTime)}
            </div>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center text-xs font-medium text-gray-300 hover:text-yellow-400 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="ml-1 text-white">Login</span>
              <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Mobile Login Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-4 z-50">
              <form onSubmit={handleLogin} className="px-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                    placeholder="Enter password"
                    required
                  />
                </div>
                {error && (
                  <div className="mb-3 text-sm text-red-600">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-yellow-900 text-white">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Quick Links</h3>
              <ul className="space-y-1">
                <li><Link to="/" className="hover:text-yellow-200 text-xs">Home</Link></li>
                <li><Link to="/resolutions" className="hover:text-yellow-200 text-xs">Resolutions</Link></li>
                <li><Link to="/ordinances" className="hover:text-yellow-200 text-xs">Ordinances</Link></li>
                <li><Link to="/procurements" className="hover:text-yellow-200 text-xs">Procurements</Link></li>
                <li><Link to="/vacancies" className="hover:text-yellow-200 text-xs">Vacancies</Link></li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Contact Us</h3>
              <div className="space-y-1">
                {systemSettings?.contactInfo?.mobileNumbers?.map((phone, index) => (
                  <p key={index} className="text-xs">📞 {phone}</p>
                ))}
                <p className="text-xs">📧 {systemSettings?.contactInfo?.email || 'info@sanfranciscosl.gov.ph'}</p>
                <p className="text-xs">📍 {systemSettings?.contactInfo?.address || 'San Francisco, Southern Leyte'}</p>
              </div>
            </div>

            {/* Office Hours */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Office Hours</h3>
              <div className="space-y-1">
                <p className="text-xs">Monday: {systemSettings?.officeHours?.monday || '8:00 AM - 5:00 PM'}</p>
                <p className="text-xs">Tuesday: {systemSettings?.officeHours?.tuesday || '8:00 AM - 5:00 PM'}</p>
                <p className="text-xs">Wednesday: {systemSettings?.officeHours?.wednesday || '8:00 AM - 5:00 PM'}</p>
                <p className="text-xs">Thursday: {systemSettings?.officeHours?.thursday || '8:00 AM - 5:00 PM'}</p>
                <p className="text-xs">Friday: {systemSettings?.officeHours?.friday || '8:00 AM - 5:00 PM'}</p>
                <p className="text-xs">Saturday: {systemSettings?.officeHours?.saturday || '8:00 AM - 12:00 PM'}</p>
                <p className="text-xs">Sunday: {systemSettings?.officeHours?.sunday || 'Closed'}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-yellow-800 text-center">
            <p className="text-xs">
              {systemSettings?.copyrightText || `© ${new Date().getFullYear()} Sangguniang Bayan, San Francisco, Southern Leyte. All rights reserved.`}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
