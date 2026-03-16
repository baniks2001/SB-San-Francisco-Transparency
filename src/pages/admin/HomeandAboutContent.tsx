import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import NotificationModal from '../../components/NotificationModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { SystemSettings, Activity } from '../../types';
import { getImageUrl } from '../../utils/imageUtils';

const AdminHomeContent: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalField, setModalField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [projectImages, setProjectImages] = useState<any[]>([]);
  const [organizationStructure, setOrganizationStructure] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [sealTitle, setSealTitle] = useState('');
  const [sealDescription, setSealDescription] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'meeting' as 'meeting' | 'event' | 'hearing' | 'ceremony' | 'other',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
    organizer: '',
    contactInfo: '',
    isPublic: true
  });
  
  // Contact information state
  const [contactInfo, setContactInfo] = useState({
    mobileNumbers: [''],
    email: '',
    address: '',
    facebook: ''
  });

  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger' as 'danger' | 'warning' | 'info',
    isLoading: false
  });

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotificationModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const showConfirmation = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'danger') => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type,
      isLoading: false
    });
  };

  useEffect(() => {
    fetchSettings();
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activities');
      setActivities(response.data || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
      setProjectImages(response.data.projectImages || []);
      setOrganizationStructure(response.data.organizationStructure || []);
      
      // Initialize contact info
      if (response.data.contactInfo) {
        setContactInfo({
          mobileNumbers: response.data.contactInfo.mobileNumbers || [''],
          email: response.data.contactInfo.email || '',
          address: response.data.contactInfo.address || '',
          facebook: response.data.contactInfo.facebook || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (field: string, item?: any) => {
    setModalField(field);
    setSelectedFiles([]);
    setEditingProject(null);
    setEditingStaff(null);
    
    // Initialize editValue for text fields
    if (field === 'aboutOffice' || field === 'mission' || field === 'vision' || field === 'keyResponsibilities') {
      setEditValue(settings?.[field as keyof SystemSettings] as string || '');
    } else if (field === 'editProject' && item) {
      setEditingProject(item);
    } else if (field === 'editStaff' && item) {
      setEditingStaff(item);
    } else if (field === 'officialSeal') {
      setSealTitle(settings?.officialSeal?.title || '');
      setSealDescription(settings?.officialSeal?.description || '');
    } else if (field === 'contactInfo') {
      // Contact info is already initialized in state
    }
    
    setIsModalOpen(true);
  };

  const handleContactInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await api.put('/settings', {
        contactInfo: {
          mobileNumbers: contactInfo.mobileNumbers.filter(num => num.trim() !== ''),
          email: contactInfo.email,
          address: contactInfo.address,
          facebook: contactInfo.facebook
        }
      });
      
      await fetchSettings();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update contact info:', error);
    }
  };

  const addMobileNumber = () => {
    setContactInfo(prev => ({
      ...prev,
      mobileNumbers: [...prev.mobileNumbers, '']
    }));
  };

  // Activity management functions
  const openActivityModal = (activity?: Activity) => {
    if (activity) {
      setEditingActivity(activity);
      setActivityForm({
        title: activity.title,
        description: activity.description,
        date: activity.date,
        time: activity.time,
        location: activity.location,
        type: activity.type,
        status: activity.status,
        organizer: activity.organizer,
        contactInfo: activity.contactInfo || '',
        isPublic: activity.isPublic
      });
    } else {
      setEditingActivity(null);
      setActivityForm({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'meeting',
        status: 'upcoming',
        organizer: '',
        contactInfo: '',
        isPublic: true
      });
    }
    setIsActivityModalOpen(true);
  };

  const editActivity = (activity: Activity) => {
    openActivityModal(activity);
  };

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingActivity) {
        // Update existing activity
        await api.put(`/activities/${editingActivity._id}`, activityForm);
      } else {
        // Create new activity
        await api.post('/activities', activityForm);
      }
      
      await fetchActivities();
      setIsActivityModalOpen(false);
      setEditingActivity(null);
      setActivityForm({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'meeting',
        status: 'upcoming',
        organizer: '',
        contactInfo: '',
        isPublic: true
      });
    } catch (error) {
      console.error('Failed to save activity:', error);
    }
  };

  const deleteActivity = async (id: string) => {
    showConfirmation(
      'Delete Activity',
      'Are you sure you want to delete this activity? This action cannot be undone.',
      async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await api.delete(`/activities/${id}`);
          showNotification('Success', 'Activity deleted successfully!', 'success');
          await fetchActivities();
        } catch (error: any) {
          showNotification('Error', error.response?.data?.message || 'Failed to delete activity', 'error');
        } finally {
          setConfirmationModal(prev => ({ ...prev, isLoading: false, isOpen: false }));
        }
      }
    );
  };

  const removeMobileNumber = (index: number) => {
    setContactInfo(prev => ({
      ...prev,
      mobileNumbers: prev.mobileNumbers.filter((_, i) => i !== index)
    }));
  };

  const updateMobileNumber = (index: number, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      mobileNumbers: prev.mobileNumbers.map((num, i) => i === index ? value : num)
    }));
  };

  const handleTextEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData: any = {};
      updateData[modalField] = editValue;
      
      await api.put('/settings', updateData);
      await fetchSettings();
      setIsModalOpen(false);
      setEditValue('');
    } catch (error) {
      console.error('Failed to update content:', error);
    }
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      
      if (modalField === 'carouselImages') {
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });
        await api.post('/settings/carousel', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (modalField === 'projectImages') {
        return;
      } else if (modalField === 'organizationStructure') {
        return;
      }
      
      await fetchSettings();
      setIsModalOpen(false);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Failed to upload images:', error);
    }
  };

  const handleSealUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      
      if (selectedFiles.length > 0) {
        formData.append('file', selectedFiles[0]);
      }
      
      await api.post('/settings/seal', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update seal details
      await api.put('/settings/seal', {
        title: sealTitle,
        description: sealDescription
      });
      
      await fetchSettings();
      setIsModalOpen(false);
      setSelectedFiles([]);
      setSealTitle('');
      setSealDescription('');
    } catch (error) {
      console.error('Failed to update seal:', error);
    }
  };

  const handleProjectImageAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      const projectName = (document.getElementById('projectName') as HTMLInputElement)?.value;
      const projectDetails = (document.getElementById('projectDetails') as HTMLTextAreaElement)?.value;
      
      // Validate required fields
      if (!projectName || !projectDetails) {
        showNotification('Validation Error', 'Please fill in both project name and details', 'warning');
        return;
      }
      
      formData.append('projectName', projectName);
      formData.append('details', projectDetails);
      
      if (selectedFiles.length > 0) {
        formData.append('file', selectedFiles[0]);
      }
      
      await api.post('/settings/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await fetchSettings();
      setIsModalOpen(false);
      setSelectedFiles([]);
      
      // Clear form fields
      const projectNameInput = document.getElementById('projectName') as HTMLInputElement;
      const projectDetailsInput = document.getElementById('projectDetails') as HTMLTextAreaElement;
      if (projectNameInput) projectNameInput.value = '';
      if (projectDetailsInput) projectDetailsInput.value = '';
      
    } catch (error) {
      console.error('Failed to add project image:', error);
      showNotification('Error', 'Failed to add project. Please try again.', 'error');
    }
  };

  const handleStaffMemberAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      const name = (document.getElementById('staffName') as HTMLInputElement)?.value;
      const position = (document.getElementById('staffPosition') as HTMLInputElement)?.value;
      
      if (selectedFiles.length > 0) {
        formData.append('file', selectedFiles[0]);
        formData.append('name', name);
        formData.append('position', position);
        formData.append('order', organizationStructure.length.toString());
        
        await api.put('/settings/organization', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        await fetchSettings();
        setIsModalOpen(false);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Failed to add staff member:', error);
    }
  };

  const deleteCarouselImage = async (imageName: string) => {
    try {
      await api.delete(`/settings/carousel/${imageName}`);
      await fetchSettings();
    } catch (error) {
      console.error('Failed to delete carousel image:', error);
    }
  };

  const deleteSealImage = async () => {
    try {
      await api.put('/settings/seal', { image: '', title: '', description: '' });
      await fetchSettings();
    } catch (error) {
      console.error('Failed to delete seal image:', error);
    }
  };

  const deleteProjectImage = async (index: number) => {
    try {
      await api.delete(`/settings/projects/${index}`);
      await fetchSettings();
    } catch (error) {
      console.error('Failed to delete project image:', error);
    }
  };

  const deleteStaffMember = async (index: number) => {
    try {
      await api.delete(`/settings/organization/${index}`);
      await fetchSettings();
    } catch (error) {
      console.error('Failed to delete staff member:', error);
    }
  };

  const handleProjectEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      const projectName = (document.getElementById('editProjectName') as HTMLInputElement)?.value;
      const projectDetails = (document.getElementById('editProjectDetails') as HTMLTextAreaElement)?.value;
      
      formData.append('projectName', projectName);
      formData.append('details', projectDetails);
      
      if (selectedFiles.length > 0) {
        formData.append('file', selectedFiles[0]);
      }
      
      await api.put(`/settings/projects/${editingProject.index}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await fetchSettings();
      setIsModalOpen(false);
      setEditingProject(null);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Failed to edit project:', error);
    }
  };

  const handleStaffEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      const name = (document.getElementById('editStaffName') as HTMLInputElement)?.value;
      const position = (document.getElementById('editStaffPosition') as HTMLInputElement)?.value;
      
      formData.append('name', name);
      formData.append('position', position);
      formData.append('order', editingStaff.order.toString());
      
      if (selectedFiles.length > 0) {
        formData.append('file', selectedFiles[0]);
      }
      
      await api.put('/settings/organization', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await fetchSettings();
      setIsModalOpen(false);
      setEditingStaff(null);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Failed to edit staff member:', error);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Home Content Management</h1>
        <p className="text-gray-300 text-sm sm:text-base">Manage home page content, images, projects, and organization structure</p>
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
            onClick={() => openModal('contactInfo')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Mobile Numbers</h3>
              <div className="space-y-1">
                {settings?.contactInfo?.mobileNumbers?.map((phone, index) => (
                  <p key={index} className="text-white">📞 {phone}</p>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Email</h3>
              <p className="text-white">📧 {settings?.contactInfo?.email || 'No email set'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Address</h3>
              <p className="text-white">📍 {settings?.contactInfo?.address || 'No address set'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Facebook</h3>
              {settings?.contactInfo?.facebook ? (
                <a 
                  href={settings.contactInfo.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook Page
                </a>
              ) : (
                <p className="text-gray-400">No Facebook link set</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar of Activities */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Calendar of Activities</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => openActivityModal()}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
            >
              Add Activity
            </button>
          </div>
        </div>
        <div className="p-6">
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{activity.title}</h3>
                      <p className="text-gray-300 text-sm mb-3">{activity.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-400">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(activity.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-400">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {activity.time}
                        </div>
                        <div className="flex items-center text-gray-400">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {activity.location}
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            activity.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                            activity.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                            activity.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-400">
                        <span className="font-medium">Organizer:</span> {activity.organizer}
                        {activity.contactInfo && (
                          <span className="ml-4">
                            <span className="font-medium">Contact:</span> {activity.contactInfo}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => editActivity(activity)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteActivity(activity._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 text-lg">No activities scheduled</p>
              <p className="text-gray-500 text-sm mt-2">Add your first activity to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Carousel */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-bold text-white">Image Carousel</h2>
          <button
            onClick={() => openModal('carouselImages')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm sm:text-base"
          >
            Add Images
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings?.carouselImages?.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={getImageUrl(image)}
                  alt={`Carousel ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteCarouselImage(image)}
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-white text-sm">Slide {index + 1}</p>
                </div>
              </div>
            ))}
          </div>
          {(!settings?.carouselImages || settings.carouselImages.length === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-400">No carousel images uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Official Seal */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Official Seal</h2>
          <button
            onClick={() => openModal('officialSeal')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Edit Seal
          </button>
        </div>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Seal Image */}
            <div className="flex-shrink-0">
              {settings?.officialSeal?.image ? (
                <div className="relative group">
                  <img
                    src={getImageUrl(settings.officialSeal.image)}
                    alt="Official Seal"
                    className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-lg border border-gray-700"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => deleteSealImage()}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Seal Details */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Seal Title</label>
                <p className="text-white text-lg font-semibold">
                  {settings?.officialSeal?.title || 'Official Seal of Sangguniang Bayan'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <p className="text-gray-300 leading-relaxed">
                  {settings?.officialSeal?.description || 'The official seal represents the authority, integrity, and commitment of the Sangguniang Bayan in serving the people of our municipality with dedication and excellence.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* News, Projects, & Activities */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">News, Projects, & Activities</h2>
          <button
            onClick={() => openModal('projectImages')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Add Project/Activity
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectImages.map((project, index) => (
              <div key={index} className="bg-gray-800 rounded-lg overflow-hidden group">
                {project.image && (
                  <img
                    src={getImageUrl(project.image)}
                    alt={project.projectName}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2">{project.projectName}</h3>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{project.details}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">#{index + 1}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('editProject', { ...project, index })}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProjectImage(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {projectImages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No projects or activities added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Organization Structure */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Organization Structure</h2>
          <button
            onClick={() => openModal('organizationStructure')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Add Staff Member
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizationStructure.map((staff, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 text-center">
                {staff.image ? (
                  <img
                    src={getImageUrl(staff.image)}
                    alt={staff.name}
                    className="w-20 h-20 object-cover rounded-full mx-auto mb-3"
                  />
                ) : (
                  <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">
                      {staff.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                )}
                <h3 className="text-white font-semibold mb-1">{staff.name}</h3>
                <p className="text-gray-300 text-sm mb-3">{staff.position}</p>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => openModal('editStaff', { ...staff, index })}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteStaffMember(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          {organizationStructure.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No organization structure added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {modalField === 'aboutOffice' && 'Edit About Office'}
              {modalField === 'mission' && 'Edit Mission'}
              {modalField === 'vision' && 'Edit Vision'}
              {modalField === 'keyResponsibilities' && 'Edit Key Responsibilities'}
              {modalField === 'carouselImages' && 'Add Carousel Images'}
              {modalField === 'officialSeal' && 'Edit Official Seal'}
              {modalField === 'projectImages' && 'Add Project/Activity'}
              {modalField === 'organizationStructure' && 'Add Staff Member'}
              {modalField === 'editProject' && 'Edit Project/Activity'}
              {modalField === 'editStaff' && 'Edit Staff Member'}
              {modalField === 'contactInfo' && 'Edit Contact Information'}
            </h3>
            
            <form onSubmit={
              modalField === 'aboutOffice' || modalField === 'mission' || modalField === 'vision' || modalField === 'keyResponsibilities' ? handleTextEdit :
              modalField === 'projectImages' ? handleProjectImageAdd :
              modalField === 'organizationStructure' ? handleStaffMemberAdd :
              modalField === 'editProject' ? handleProjectEdit :
              modalField === 'editStaff' ? handleStaffEdit :
              modalField === 'officialSeal' ? handleSealUpload :
              modalField === 'contactInfo' ? handleContactInfoUpdate :
              handleImageUpload
            }>
              {(modalField === 'editProject' || modalField === 'editStaff') && (
                <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Current Information:</h4>
                  {modalField === 'editProject' && editingProject && (
                    <>
                      <p className="text-gray-300 text-sm mb-1">Name: {editingProject.projectName}</p>
                      <p className="text-gray-300 text-sm mb-3">Details: {editingProject.details}</p>
                    </>
                  )}
                  {modalField === 'editStaff' && editingStaff && (
                    <>
                      <p className="text-gray-300 text-sm mb-1">Name: {editingStaff.name}</p>
                      <p className="text-gray-300 text-sm mb-3">Position: {editingStaff.position}</p>
                    </>
                  )}
                </div>
              )}
              
              {/* Text Editing Fields */}
              {(modalField === 'aboutOffice' || modalField === 'mission' || modalField === 'vision' || modalField === 'keyResponsibilities') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-1">
                    {modalField === 'aboutOffice' && 'About Office Content'}
                    {modalField === 'mission' && 'Mission Statement'}
                    {modalField === 'vision' && 'Vision Statement'}
                    {modalField === 'keyResponsibilities' && 'Key Responsibilities'}
                  </label>
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    rows={6}
                    placeholder={
                      modalField === 'aboutOffice' ? 'Enter a description about the Sangguniang Bayan office...' :
                      modalField === 'mission' ? 'Enter the mission statement...' :
                      modalField === 'vision' ? 'Enter the vision statement...' :
                      modalField === 'keyResponsibilities' ? 'Enter the key responsibilities...' : ''
                    }
                  />
                </div>
              )}
              
              {modalField === 'projectImages' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1">Project Name</label>
                    <input
                      type="text"
                      id="projectName"
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1">Project Details</label>
                    <textarea
                      id="projectDetails"
                      rows={3}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </>
              )}
              
              {modalField === 'officialSeal' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1">Seal Title</label>
                    <input
                      type="text"
                      value={sealTitle}
                      onChange={(e) => setSealTitle(e.target.value)}
                      placeholder="Official Seal of Sangguniang Bayan"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1">Seal Description</label>
                    <textarea
                      value={sealDescription}
                      onChange={(e) => setSealDescription(e.target.value)}
                      placeholder="The official seal represents the authority, integrity, and commitment..."
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </>
              )}
              
              {modalField === 'editProject' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1">Project Name</label>
                    <input
                      type="text"
                      id="editProjectName"
                      defaultValue={editingProject?.projectName}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1">Project Details</label>
                    <textarea
                      id="editProjectDetails"
                      rows={3}
                      defaultValue={editingProject?.details}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </>
              )}
              
              {modalField === 'organizationStructure' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1">Name</label>
                    <input
                      type="text"
                      id="staffName"
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1">Position</label>
                    <input
                      type="text"
                      id="staffPosition"
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </>
              )}
              
              {modalField === 'editStaff' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1">Name</label>
                    <input
                      type="text"
                      id="editStaffName"
                      defaultValue={editingStaff?.name}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1">Position</label>
                    <input
                      type="text"
                      id="editStaffPosition"
                      defaultValue={editingStaff?.position}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </>
              )}
              
              {/* Contact Information Fields */}
              {modalField === 'contactInfo' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">Mobile Numbers</label>
                    {contactInfo.mobileNumbers.map((phone, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => updateMobileNumber(index, e.target.value)}
                          placeholder="Enter mobile number"
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        {contactInfo.mobileNumbers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMobileNumber(index)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addMobileNumber}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Add Mobile Number
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1">Email</label>
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1">Address</label>
                    <textarea
                      value={contactInfo.address}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter office address"
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1">Facebook URL</label>
                    <input
                      type="url"
                      value={contactInfo.facebook}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, facebook: e.target.value }))}
                      placeholder="Enter Facebook page URL (optional)"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </>
              )}
              
              {/* Image Upload Section - Only for fields that need images */}
              {!['aboutOffice', 'mission', 'vision', 'keyResponsibilities', 'contactInfo'].includes(modalField) && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-1">
                    {modalField === 'carouselImages' ? 'Images' : 'Image'}
                    {(modalField === 'editProject' || modalField === 'editStaff') && ' (New Image - Optional)'}
                    {modalField === 'officialSeal' && ' (Optional - Leave empty to keep current)'}
                  </label>
                  <input
                    type="file"
                    multiple={modalField === 'carouselImages'}
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                    accept="image/*"
                    required={modalField !== 'editProject' && modalField !== 'editStaff' && modalField !== 'officialSeal'}
                  />
                </div>
              )}
              
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
                  {modalField === 'aboutOffice' && 'Update About Office'}
                  {modalField === 'mission' && 'Update Mission'}
                  {modalField === 'vision' && 'Update Vision'}
                  {modalField === 'keyResponsibilities' && 'Update Key Responsibilities'}
                  {modalField === 'carouselImages' && 'Upload'}
                  {modalField === 'officialSeal' && 'Update Seal'}
                  {modalField === 'projectImages' && 'Add Project'}
                  {modalField === 'organizationStructure' && 'Add Staff Member'}
                  {modalField === 'editProject' && 'Update Project'}
                  {modalField === 'editStaff' && 'Update Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingActivity ? 'Edit Activity' : 'Add New Activity'}
                </h3>
                <button
                  onClick={() => setIsActivityModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleActivitySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Activity Title *</label>
                    <input
                      type="text"
                      value={activityForm.title}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter activity title"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Activity Type *</label>
                    <select
                      value={activityForm.type}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    >
                      <option value="meeting">Meeting</option>
                      <option value="event">Event</option>
                      <option value="hearing">Hearing</option>
                      <option value="ceremony">Ceremony</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Description *</label>
                  <textarea
                    value={activityForm.description}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter activity description"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Date *</label>
                    <input
                      type="date"
                      value={activityForm.date}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Time *</label>
                    <input
                      type="time"
                      value={activityForm.time}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Location *</label>
                  <input
                    type="text"
                    value={activityForm.location}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter activity location"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Organizer *</label>
                    <input
                      type="text"
                      value={activityForm.organizer}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, organizer: e.target.value }))}
                      placeholder="Enter organizer name"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Contact Information</label>
                    <input
                      type="text"
                      value={activityForm.contactInfo}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, contactInfo: e.target.value }))}
                      placeholder="Phone number or email"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Status *</label>
                    <select
                      value={activityForm.status}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={activityForm.isPublic}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="w-4 h-4 text-yellow-600 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500"
                    />
                    <label htmlFor="isPublic" className="ml-2 text-sm text-white">
                      Make this activity public
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsActivityModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    {editingActivity ? 'Update Activity' : 'Add Activity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={() => setNotificationModal(prev => ({ ...prev, isOpen: false }))}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        isLoading={confirmationModal.isLoading}
      />
    </div>
  );
};

export default AdminHomeContent;
