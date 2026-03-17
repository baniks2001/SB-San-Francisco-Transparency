import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { SystemSettings } from '../types';
import { getImageUrl } from '../utils/imageUtils';
import apiWithRetry from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import GoogleMap from './GoogleMap';

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
                    to="/about"
                    className={`inline-flex items-center px-1 pt-1 text-xs sm:text-sm font-medium ${
                      isActivePath('/about') 
                        ? 'text-yellow-400 border-b-2 border-yellow-400' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    About
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
                  <Link
                    to="/announcements"
                    className={`inline-flex items-center px-1 pt-1 text-xs sm:text-sm font-medium ${
                      isActivePath('/announcements') 
                        ? 'text-yellow-400 border-b-2 border-yellow-400' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    Announcements
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
            to="/about"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActivePath('/about') 
                ? 'text-yellow-400 bg-gray-700' 
                : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-700'
            }`}
          >
            About
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
          <Link
            to="/announcements"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActivePath('/announcements') 
                ? 'text-yellow-400 bg-gray-700' 
                : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-700'
            }`}
          >
            Announcements
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
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            
            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold">Contact Us</h3>
              </div>
              
              <div className="space-y-2">
                {systemSettings?.contactInfo?.mobileNumbers?.slice(0, 1).map((phone, index) => (
                  <div key={index} className="flex items-center space-x-2 group">
                    <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center group-hover:bg-yellow-600 transition-colors">
                      <svg className="w-3 h-3 text-yellow-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium">{phone}</span>
                  </div>
                ))}
                
                <div className="flex items-center space-x-2 group">
                  <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center group-hover:bg-yellow-600 transition-colors">
                    <svg className="w-3 h-3 text-yellow-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">{systemSettings?.contactInfo?.email || 'info@sanfranciscosl.gov.ph'}</span>
                </div>
                
                {systemSettings?.contactInfo?.facebook && (
                  <div className="flex items-center space-x-2 group">
                    <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <svg className="w-3 h-3 text-yellow-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <a 
                      href={systemSettings.contactInfo.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-medium hover:text-yellow-400 transition-colors"
                    >
                      Facebook
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Address & Location */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold">Visit Us</h3>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-yellow-600/20 rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium leading-relaxed">
                      {systemSettings?.contactInfo?.address || 'Municipal Compound, San Francisco, Southern Leyte'}
                    </p>
                  </div>
                  
                  {systemSettings?.mapLocation && (
                    <div className="rounded overflow-hidden border border-gray-600">
                      <GoogleMap
                        latitude={systemSettings.mapLocation.latitude}
                        longitude={systemSettings.mapLocation.longitude}
                        address={systemSettings.contactInfo?.address || systemSettings.mapLocation.address}
                        height="120px"
                        zoom={15}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold">Office Hours</h3>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-gray-700">
                    <span className="text-xs font-medium text-gray-300">Monday - Friday</span>
                    <span className="text-xs font-bold text-yellow-400">{systemSettings?.officeHours?.monday || '8:00 AM - 5:00 PM'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-700">
                    <span className="text-xs font-medium text-gray-300">Saturday</span>
                    <span className="text-xs font-bold text-yellow-400">{systemSettings?.officeHours?.saturday || '8:00 AM - 12:00 PM'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-medium text-gray-300">Sunday</span>
                    <span className="text-xs font-bold text-red-400">{systemSettings?.officeHours?.sunday || 'Closed'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-3">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-yellow-600 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-xs text-gray-400">
                  {systemSettings?.copyrightText || `© ${new Date().getFullYear()} Sangguniang Bayan, San Francisco, Southern Leyte. All rights reserved.`}
                </p>
              </div>
              <div className="text-xs text-gray-500">
                Developer: Servando S. Tio III
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
