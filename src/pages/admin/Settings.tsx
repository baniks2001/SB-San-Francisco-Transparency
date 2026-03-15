import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { SystemSettings } from '../../types';
import { getImageUrl } from '../../utils/imageUtils';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalField, setModalField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

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

  const openModal = (field: string) => {
    setModalField(field);
    setEditValue(getFieldValue(field));
    setSelectedFile(null);
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const deleteLogo = async (index: number) => {
    try {
      await api.delete(`/settings/logo/${index}`);
      await fetchSettings();
    } catch (error) {
      console.error('Failed to delete logo:', error);
    }
  };

  const getFieldValue = (field: string): string => {
    if (!settings) return '';
    
    switch (field) {
      case 'systemName':
        return settings.systemName || '';
      case 'transparencyTitle':
        return settings.transparencyTitle || '';
      case 'location':
        return settings.location || '';
      case 'aboutOffice':
        return settings.aboutOffice || '';
      case 'mission':
        return settings.mission || '';
      case 'vision':
        return settings.vision || '';
      case 'keyResponsibilities':
        return settings.keyResponsibilities || '';
      case 'contact':
        return settings.contactInfo?.email || '';
      case 'copyright':
        return settings.copyrightText || '';
      default:
        return '';
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData: any = {};
      
      if (modalField === 'systemLogo' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await api.post('/settings/logo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (modalField === 'systemLogos' && selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });
        await api.post('/settings/logos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        switch (modalField) {
          case 'systemName':
            updateData.systemName = editValue;
            break;
          case 'transparencyTitle':
            updateData.transparencyTitle = editValue;
            break;
          case 'location':
            updateData.location = editValue;
            break;
          case 'aboutOffice':
            updateData.aboutOffice = editValue;
            break;
          case 'mission':
            updateData.mission = editValue;
            break;
          case 'vision':
            updateData.vision = editValue;
            break;
          case 'keyResponsibilities':
            updateData.keyResponsibilities = editValue;
            break;
          case 'copyright':
            updateData.copyrightText = editValue;
            break;
        }
        
        await api.put('/settings', updateData);
      }
      
      await fetchSettings();
      setIsModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

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
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">System Settings</h1>
        <p className="text-gray-300 text-sm sm:text-base">Manage system configuration and content</p>
      </div>

      {/* System Information */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">System Information</h2>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">System Name</label>
                <button
                  onClick={() => openModal('systemName')}
                  className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors text-sm"
                >
                  Edit
                </button>
              </div>
              <p className="text-white">{settings?.systemName}</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">Transparency Title</label>
                <button
                  onClick={() => openModal('transparencyTitle')}
                  className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors text-sm"
                >
                  Edit
                </button>
              </div>
              <p className="text-white">{settings?.transparencyTitle || 'Sangguniang Bayan Transparency'}</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">Location</label>
                <button
                  onClick={() => openModal('location')}
                  className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors text-sm"
                >
                  Edit
                </button>
              </div>
              <p className="text-white">{settings?.location || 'San Francisco, Southern Leyte'}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">System Logos (Max 3)</label>
              <button
                onClick={() => openModal('systemLogos')}
                className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors text-sm"
              >
                Add Logos
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {settings?.systemLogos && settings.systemLogos.length > 0 ? (
                settings.systemLogos.map((logo, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={getImageUrl(logo)}
                      alt={`System Logo ${index + 1}`}
                      className="h-12 w-12 object-contain rounded"
                    />
                    <button
                      onClick={() => deleteLogo(index)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="mt-1 text-center">
                      <p className="text-gray-400 text-xs">{index + 1}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-12 w-12 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Logos</span>
                </div>
              )}
            </div>
            <div className="mt-2">
              <p className="text-gray-400 text-xs">Upload up to 3 logos that will appear in the top navigation bar</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Office */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">About Office</h2>
          <button
            onClick={() => openModal('aboutOffice')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="p-6">
          <p className="text-white whitespace-pre-wrap">
            {settings?.aboutOffice || 'No about information available'}
          </p>
        </div>
      </div>

      {/* Mission, Vision, Key Responsibilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Mission</h2>
            <button
              onClick={() => openModal('mission')}
              className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors text-sm"
            >
              Edit
            </button>
          </div>
          <div className="p-6">
            <p className="text-white">{settings?.mission || 'No mission statement'}</p>
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Vision</h2>
            <button
              onClick={() => openModal('vision')}
              className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors text-sm"
            >
              Edit
            </button>
          </div>
          <div className="p-6">
            <p className="text-white">{settings?.vision || 'No vision statement'}</p>
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Key Responsibilities</h2>
            <button
              onClick={() => openModal('keyResponsibilities')}
              className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors text-sm"
            >
              Edit
            </button>
          </div>
          <div className="p-6">
            <p className="text-white">{settings?.keyResponsibilities || 'No key responsibilities defined'}</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Contact Information</h2>
          <button
            onClick={() => openModal('contact')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Mobile Numbers</h3>
              {settings?.contactInfo?.mobileNumbers.map((phone, index) => (
                <p key={index} className="text-white mb-1">{phone}</p>
              ))}
            </div>
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Email</h3>
              <p className="text-white">{settings?.contactInfo?.email}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Address</h3>
              <p className="text-white">{settings?.contactInfo?.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Office Hours */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Office Hours</h2>
          <button
            onClick={() => openModal('officeHours')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Monday</h3>
              <p className="text-white">{settings?.officeHours?.monday || '8:00 AM - 5:00 PM'}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Tuesday</h3>
              <p className="text-white">{settings?.officeHours?.tuesday || '8:00 AM - 5:00 PM'}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Wednesday</h3>
              <p className="text-white">{settings?.officeHours?.wednesday || '8:00 AM - 5:00 PM'}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Thursday</h3>
              <p className="text-white">{settings?.officeHours?.thursday || '8:00 AM - 5:00 PM'}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Friday</h3>
              <p className="text-white">{settings?.officeHours?.friday || '8:00 AM - 5:00 PM'}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Saturday</h3>
              <p className="text-white">{settings?.officeHours?.saturday || '8:00 AM - 12:00 PM'}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Sunday</h3>
              <p className="text-white">{settings?.officeHours?.sunday || 'Closed'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Text */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-bold text-white">Footer Copyright Text</h2>
          <button
            onClick={() => openModal('copyright')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm sm:text-base"
          >
            Edit
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <p className="text-white">
            {settings?.copyrightText || `© ${new Date().getFullYear()} Sangguniang Bayan, San Francisco, Southern Leyte. All rights reserved.`}
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              Edit {modalField.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">
                  {modalField.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                {modalField === 'systemLogo' ? (
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                    accept="image/*"
                  />
                ) : modalField === 'systemLogos' ? (
                  <div>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                      accept="image/*"
                    />
                    <p className="text-gray-400 text-xs mt-2">
                      Select up to {3 - (settings?.systemLogos?.length || 0)} logo files (Max 3 total)
                    </p>
                  </div>
                ) : modalField === 'aboutOffice' || modalField === 'mission' || modalField === 'vision' || modalField === 'keyResponsibilities' || modalField === 'copyright' ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    rows={4}
                  />
                ) : (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
