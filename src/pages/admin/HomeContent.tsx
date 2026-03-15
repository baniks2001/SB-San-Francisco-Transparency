import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { SystemSettings } from '../../types';
import { getImageUrl } from '../../utils/imageUtils';

const AdminHomeContent: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalField, setModalField] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [projectImages, setProjectImages] = useState<any[]>([]);
  const [organizationStructure, setOrganizationStructure] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [sealTitle, setSealTitle] = useState('');
  const [sealDescription, setSealDescription] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
      setProjectImages(response.data.projectImages || []);
      setOrganizationStructure(response.data.organizationStructure || []);
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
    
    if (field === 'editProject' && item) {
      setEditingProject(item);
    } else if (field === 'editStaff' && item) {
      setEditingStaff(item);
    } else if (field === 'officialSeal') {
      setSealTitle(settings?.officialSeal?.title || '');
      setSealDescription(settings?.officialSeal?.description || '');
    }
    
    setIsModalOpen(true);
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
      
      if (selectedFiles.length > 0) {
        formData.append('file', selectedFiles[0]);
        formData.append('projectName', projectName);
        formData.append('details', projectDetails);
        
        await api.post('/settings/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        await fetchSettings();
        setIsModalOpen(false);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Failed to add project image:', error);
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
      <div className="bg-gray-900 rounded-xl shadow-xl p-6 border border-gray-800">
        <h1 className="text-3xl font-bold text-white mb-2">Home Content Management</h1>
        <p className="text-gray-300">Manage carousel images, projects, activities, and organization structure</p>
      </div>

      {/* Image Carousel */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Image Carousel</h2>
          <button
            onClick={() => openModal('carouselImages')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Add Images
          </button>
        </div>
        <div className="p-6">
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
              {modalField === 'carouselImages' && 'Add Carousel Images'}
              {modalField === 'officialSeal' && 'Edit Official Seal'}
              {modalField === 'projectImages' && 'Add Project/Activity'}
              {modalField === 'organizationStructure' && 'Add Staff Member'}
              {modalField === 'editProject' && 'Edit Project/Activity'}
              {modalField === 'editStaff' && 'Edit Staff Member'}
            </h3>
            
            <form onSubmit={
              modalField === 'projectImages' ? handleProjectImageAdd :
              modalField === 'organizationStructure' ? handleStaffMemberAdd :
              modalField === 'editProject' ? handleProjectEdit :
              modalField === 'editStaff' ? handleStaffEdit :
              modalField === 'officialSeal' ? handleSealUpload :
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
    </div>
  );
};

export default AdminHomeContent;
