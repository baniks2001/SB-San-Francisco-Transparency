import React, { useState, useEffect } from 'react';
import { ResolutionTemplate } from '../../types';
import api from '../../services/api';
import NotificationModal from '../../components/NotificationModal';
import ConfirmationModal from '../../components/ConfirmationModal';

const AdminTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<ResolutionTemplate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ResolutionTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<ResolutionTemplate, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>>({
    templateName: '',
    header: {
      logos: [] as Array<{
        id: string;
        url: string;
        name?: string;
      }>,
      texts: [] as Array<{
        id: string;
        text: string;
        fontSize: number;
        fontFamily: string;
        fontColor: string;
        alignment: 'Left' | 'Center' | 'Right' | 'Justify';
        isBold?: boolean;
        isUnderline?: boolean;
        isItalic?: boolean;
      }>,
      backgroundColor: ''
    },
    footer: {
      texts: [] as Array<{
        id: string;
        text: string;
        fontSize: number;
        fontFamily: string;
        fontColor: string;
        alignment: 'Left' | 'Center' | 'Right' | 'Justify';
        isBold?: boolean;
        isUnderline?: boolean;
        isItalic?: boolean;
      }>,
      backgroundColor: ''
    },
    content: '',
    paperSize: 'A4',
    defaultPageCount: 1
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/templates');
      setTemplates(response.data);
    } catch (err: any) {
      setError('Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to clean template data
  const cleanTemplateData = (data: any) => {
    const cleaned = {
        ...data,
        content: data.content || 'Default template content',
        header: {
          ...data.header,
          logos: data.header.logos || [],
          texts: (data.header.texts || []).map((text: any) => {
            const cleanedText = {
              ...text,
              fontColor: text.fontColor || '#000000',
              fontSize: text.fontSize || 12,
              fontFamily: text.fontFamily || 'Arial',
              alignment: text.alignment || 'Center',
              isBold: text.isBold || false,
              isUnderline: text.isUnderline || false,
              isItalic: text.isItalic || false
            };
            return cleanedText;
          }),
          backgroundColor: data.header.backgroundColor || ''
        },
        footer: {
          ...data.footer,
          texts: (data.footer.texts || []).map((text: any) => {
            const cleanedText = {
              ...text,
              fontColor: text.fontColor || '#000000',
              fontSize: text.fontSize || 12,
              fontFamily: text.fontFamily || 'Arial',
              alignment: text.alignment || 'Center',
              isBold: text.isBold || false,
              isUnderline: text.isUnderline || false,
              isItalic: text.isItalic || false
            };
            return cleanedText;
          }),
          backgroundColor: data.footer.backgroundColor || ''
        },
        defaultSignatories: (data.defaultSignatories || []).map((signatory: any) => {
          const cleanedSignatory = {
            ...signatory,
            alignment: signatory.alignment || 'Left',
            isBold: signatory.isBold || false,
            isUnderline: signatory.isUnderline || true
          };
          return cleanedSignatory;
        })
      };
      return cleaned;
    };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Create template data without logos to prevent backend hanging
      const templateData = cleanTemplateData({
        ...formData,
        header: {
          ...formData.header,
          logos: [] // Don't send logos in main payload
        }
      });

      let templateId: string;
      if (editingTemplate) {
        await api.put(`/templates/${editingTemplate._id}`, templateData);
        templateId = editingTemplate._id;
        setSuccess('Template updated successfully!');
      } else {
        const response = await api.post('/templates', templateData);
        templateId = response.data._id;
        setSuccess('Template created successfully!');
      }

      // Upload logos separately if they exist
      if (formData.header.logos.length > 0) {
        for (const logo of formData.header.logos) {
          // Convert base64 back to blob for upload
          const response = await fetch(logo.url);
          const blob = await response.blob();
          const file = new File([blob], logo.name || 'logo.png', { type: blob.type });
          
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          await api.post(`/templates/${templateId}/logo`, uploadFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      }

      await fetchTemplates();
      closeModal();
      showNotification('Success', editingTemplate ? 'Template updated successfully!' : 'Template created successfully!', 'success');
    } catch (err: any) {
      showNotification('Error', err.response?.data?.message || 'Failed to save template', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirmation(
      'Delete Template',
      'Are you sure you want to delete this template? This action cannot be undone.',
      async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await api.delete(`/templates/${id}`);
          showNotification('Success', 'Template deleted successfully!', 'success');
          await fetchTemplates();
        } catch (err: any) {
          showNotification('Error', err.response?.data?.message || 'Failed to delete template', 'error');
        } finally {
          setConfirmationModal(prev => ({ ...prev, isLoading: false, isOpen: false }));
        }
      }
    );
  };

  const openModal = (template?: ResolutionTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        templateName: template.templateName,
        header: {
          logos: template.header.logos || [],
          texts: (template.header.texts || []).map(text => ({
            ...text,
            fontColor: text.fontColor || '#000000',
            isItalic: text.isItalic || false
          })),
          backgroundColor: template.header.backgroundColor || ''
        },
        footer: {
          texts: (template.footer.texts || []).map(text => ({
            ...text,
            fontColor: text.fontColor || '#000000',
            isItalic: text.isItalic || false
          })),
          backgroundColor: template.footer.backgroundColor || ''
        },
        content: template.content,
        paperSize: template.paperSize,
        defaultPageCount: template.defaultPageCount
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        templateName: '',
        header: {
          logos: [],
          texts: [],
          backgroundColor: ''
        },
        footer: {
          texts: [],
          backgroundColor: ''
        },
        content: '',
        paperSize: 'A4',
        defaultPageCount: 1
      });
    }
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setFormData({
      templateName: '',
      header: {
        logos: [],
        texts: [],
        backgroundColor: ''
      },
      footer: {
        texts: [],
        backgroundColor: ''
      },
      content: '',
      paperSize: 'A4',
      defaultPageCount: 1
    });
    setError('');
    setSuccess('');
  };

  const addHeaderText = () => {
    const newText = {
      id: Date.now().toString(),
      text: '',
      fontSize: 12,
      fontFamily: 'Arial',
      fontColor: '#000000',
      alignment: 'Center' as const,
      isBold: false,
      isUnderline: false,
      isItalic: false
    };
    setFormData({
      ...formData,
      header: {
        ...formData.header,
        texts: [...formData.header.texts, newText]
      }
    });
  };

  const addFooterText = () => {
    const newText = {
      id: Date.now().toString(),
      text: '',
      fontSize: 12,
      fontFamily: 'Arial',
      fontColor: '#000000',
      alignment: 'Center' as const,
      isBold: false,
      isUnderline: false,
      isItalic: false
    };
    setFormData({
      ...formData,
      footer: {
        ...formData.footer,
        texts: [...formData.footer.texts, newText]
      }
    });
  };

  const updateHeaderText = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      header: {
        ...formData.header,
        texts: formData.header.texts.map(text => 
          text.id === id ? { ...text, [field]: field === 'fontColor' ? (value || '#000000') : value } : text
        )
      }
    });
  };

  const updateFooterText = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      footer: {
        ...formData.footer,
        texts: formData.footer.texts.map(text => 
          text.id === id ? { ...text, [field]: field === 'fontColor' ? (value || '#000000') : value } : text
        )
      }
    });
  };

  const removeHeaderText = (id: string) => {
    setFormData({
      ...formData,
      header: {
        ...formData.header,
        texts: formData.header.texts.filter(text => text.id !== id)
      }
    });
  };

  const removeFooterText = (id: string) => {
    setFormData({
      ...formData,
      footer: {
        ...formData.footer,
        texts: formData.footer.texts.filter(text => text.id !== id)
      }
    });
  };

  const addLogo = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newLogo = {
        id: Date.now().toString(),
        url: reader.result as string,
        name: file.name
      };
      setFormData({
        ...formData,
        header: {
          ...formData.header,
          logos: [...formData.header.logos, newLogo]
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = (id: string) => {
    setFormData({
      ...formData,
      header: {
        ...formData.header,
        logos: formData.header.logos.filter(logo => logo.id !== id)
      }
    });
  };

  if (isLoading) {
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Manage Templates</h1>
            <p className="text-gray-300 text-sm sm:text-base">Create and manage resolution and ordinance templates</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm sm:text-base"
          >
            Add Template
          </button>
        </div>
      </div>

      
      {/* Templates Table */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        {/* Mobile Card View */}
        <div className="lg:hidden">
          {templates.map((template) => (
            <div key={template._id} className="p-4 border-b border-gray-700 last:border-b-0">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{template.templateName}</h3>
                    <p className="text-sm text-gray-400">
                      {template.header?.texts?.length || 0} header texts, 
                      {template.footer?.texts?.length || 0} footer texts
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openModal(template)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(template._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Template Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Paper Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Default Pages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {templates.map((template) => (
                <tr key={template._id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{template.templateName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{template.paperSize}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{template.defaultPageCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openModal(template)}
                      className="text-yellow-400 hover:text-yellow-300 font-medium mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="text-red-400 hover:text-red-300 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {templates.length === 0 && (
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 p-12 text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No templates yet</h3>
          <p className="text-gray-400 mb-4">Create your first template to get started with document formatting</p>
          <button
            onClick={() => openModal()}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Create Your First Template
          </button>
        </div>
      )}

      {/* Add/Edit Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingTemplate ? 'Edit Template' : 'Add Template'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">Template Name</label>
                <input
                  type="text"
                  value={formData.templateName}
                  onChange={(e) => setFormData({...formData, templateName: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>

              {/* Header Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">Header Configuration</h4>
                
                {/* Header Logos */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-white">Header Logos</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) addLogo(file);
                        e.target.value = ''; // Reset input
                      }}
                      className="hidden"
                      id="logo-upload"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Add Logo
                    </button>
                  </div>
                  
                  {formData.header.logos.map((logo) => (
                    <div key={logo.id} className="bg-gray-800 rounded-lg p-3 mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={logo.url} 
                          alt={logo.name || 'Logo'} 
                          className="w-12 h-12 object-contain rounded"
                        />
                        <div>
                          <p className="text-white text-sm font-medium">{logo.name || 'Logo'}</p>
                          <p className="text-gray-400 text-xs">Header logo</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLogo(logo.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  {formData.header.logos.length === 0 && (
                    <div className="bg-gray-800 rounded-lg p-6 text-center">
                      <p className="text-gray-400 text-sm">No logos added. Click "Add Logo" to upload logos.</p>
                    </div>
                  )}
                </div>

                {/* Header Texts */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-white">Header Texts</label>
                    <button
                      type="button"
                      onClick={addHeaderText}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Add Text
                    </button>
                  </div>
                  
                  {formData.header.texts.map((text, index) => (
                    <div key={text.id} className="bg-gray-800 rounded-lg p-4 mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Text content"
                          value={text.text}
                          onChange={(e) => updateHeaderText(text.id, 'text', e.target.value)}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                        <select
                          value={text.fontSize}
                          onChange={(e) => updateHeaderText(text.id, 'fontSize', parseInt(e.target.value))}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        >
                          <option value={10}>10px</option>
                          <option value={11}>11px</option>
                          <option value={12}>12px</option>
                          <option value={14}>14px</option>
                          <option value={16}>16px</option>
                          <option value={18}>18px</option>
                          <option value={20}>20px</option>
                          <option value={24}>24px</option>
                        </select>
                        <select
                          value={text.fontFamily}
                          onChange={(e) => updateHeaderText(text.id, 'fontFamily', e.target.value)}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Calibri">Calibri</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Helvetica">Helvetica</option>
                        </select>
                        <input
                          type="color"
                          value={text.fontColor || '#000000'}
                          onChange={(e) => updateHeaderText(text.id, 'fontColor', e.target.value)}
                          className="w-full h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                          title="Text Color"
                        />
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <select
                          value={text.alignment}
                          onChange={(e) => updateHeaderText(text.id, 'alignment', e.target.value)}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        >
                          <option value="Left">Left</option>
                          <option value="Center">Center</option>
                          <option value="Right">Right</option>
                          <option value="Justify">Justify</option>
                        </select>
                        
                        <label className="flex items-center text-white">
                          <input
                            type="checkbox"
                            checked={text.isBold || false}
                            onChange={(e) => updateHeaderText(text.id, 'isBold', e.target.checked)}
                            className="mr-2"
                          />
                          Bold
                        </label>
                        
                        <label className="flex items-center text-white">
                          <input
                            type="checkbox"
                            checked={text.isItalic || false}
                            onChange={(e) => updateHeaderText(text.id, 'isItalic', e.target.checked)}
                            className="mr-2"
                          />
                          Italic
                        </label>
                        
                        <label className="flex items-center text-white">
                          <input
                            type="checkbox"
                            checked={text.isUnderline || false}
                            onChange={(e) => updateHeaderText(text.id, 'isUnderline', e.target.checked)}
                            className="mr-2"
                          />
                          Underline
                        </label>
                        
                        {formData.header.texts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeHeaderText(text.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Header Background Color */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-1">Header Background Color (Optional)</label>
                  <input
                    type="color"
                    value={formData.header.backgroundColor || '#ffffff'}
                    onChange={(e) => setFormData({...formData, header: {...formData.header, backgroundColor: e.target.value}})}
                    className="w-full h-10 bg-gray-800 border border-gray-600 rounded cursor-pointer"
                    title="Header Background Color"
                  />
                </div>
              </div>

              {/* Footer Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">Footer Configuration</h4>
                
                {/* Footer Texts */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-white">Footer Texts</label>
                    <button
                      type="button"
                      onClick={addFooterText}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Add Text
                    </button>
                  </div>
                  
                  {formData.footer.texts.map((text, index) => (
                    <div key={text.id} className="bg-gray-800 rounded-lg p-4 mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Text content"
                          value={text.text}
                          onChange={(e) => updateFooterText(text.id, 'text', e.target.value)}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                        <select
                          value={text.fontSize}
                          onChange={(e) => updateFooterText(text.id, 'fontSize', parseInt(e.target.value))}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        >
                          <option value={10}>10px</option>
                          <option value={11}>11px</option>
                          <option value={12}>12px</option>
                          <option value={14}>14px</option>
                          <option value={16}>16px</option>
                          <option value={18}>18px</option>
                          <option value={20}>20px</option>
                          <option value={24}>24px</option>
                        </select>
                        <select
                          value={text.fontFamily}
                          onChange={(e) => updateFooterText(text.id, 'fontFamily', e.target.value)}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Calibri">Calibri</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Helvetica">Helvetica</option>
                        </select>
                        <input
                          type="color"
                          value={text.fontColor || '#000000'}
                          onChange={(e) => updateFooterText(text.id, 'fontColor', e.target.value)}
                          className="w-full h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                          title="Text Color"
                        />
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <select
                          value={text.alignment}
                          onChange={(e) => updateFooterText(text.id, 'alignment', e.target.value)}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        >
                          <option value="Left">Left</option>
                          <option value="Center">Center</option>
                          <option value="Right">Right</option>
                          <option value="Justify">Justify</option>
                        </select>
                        
                        <label className="flex items-center text-white">
                          <input
                            type="checkbox"
                            checked={text.isBold || false}
                            onChange={(e) => updateFooterText(text.id, 'isBold', e.target.checked)}
                            className="mr-2"
                          />
                          Bold
                        </label>
                        
                        <label className="flex items-center text-white">
                          <input
                            type="checkbox"
                            checked={text.isItalic || false}
                            onChange={(e) => updateFooterText(text.id, 'isItalic', e.target.checked)}
                            className="mr-2"
                          />
                          Italic
                        </label>
                        
                        <label className="flex items-center text-white">
                          <input
                            type="checkbox"
                            checked={text.isUnderline || false}
                            onChange={(e) => updateFooterText(text.id, 'isUnderline', e.target.checked)}
                            className="mr-2"
                          />
                          Underline
                        </label>
                        
                        {formData.footer.texts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFooterText(text.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Background Color */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-1">Footer Background Color (Optional)</label>
                  <input
                    type="color"
                    value={formData.footer.backgroundColor || '#ffffff'}
                    onChange={(e) => setFormData({...formData, footer: {...formData.footer, backgroundColor: e.target.value}})}
                    className="w-full h-10 bg-gray-800 border border-gray-600 rounded cursor-pointer"
                    title="Footer Background Color"
                  />
                </div>
              </div>

              
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows={4}
                  placeholder="Default content for this template"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Paper Size</label>
                  <select
                    value={formData.paperSize}
                    onChange={(e) => setFormData({...formData, paperSize: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="A4">A4</option>
                    <option value="Legal">Legal</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Default Page Count</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.defaultPageCount}
                    onChange={(e) => setFormData({...formData, defaultPageCount: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
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

export default AdminTemplates;
