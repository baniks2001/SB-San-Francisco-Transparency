import React, { useState, useEffect } from 'react';
import { Ordinance, ResolutionTemplate } from '../../types';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const AdminOrdinances: React.FC = () => {
  const [ordinances, setOrdinances] = useState<Ordinance[]>([]);
  const [templates, setTemplates] = useState<ResolutionTemplate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrdinance, setEditingOrdinance] = useState<Ordinance | null>(null);
  const [formData, setFormData] = useState({
    ordinanceNumber: '',
    series: '',
    title: '',
    content: '',
    present: '',
    absent: '',
    status: 'Draft' as 'Draft' | 'Pending' | 'Approved',
    isPublic: false,
    templateId: '',
    signatories: [] as Array<{
      name: string;
      position: string;
      alignment: 'Left' | 'Center' | 'Right' | 'Justify';
      isBold?: boolean;
      isUnderline?: boolean;
    }>,
    // Text formatting options for each field
    ordinanceNumberFormat: {
      fontSize: 20,
      fontFamily: 'Arial',
      isBold: true,
      isUnderline: false,
      alignment: 'Center' as 'Left' | 'Center' | 'Right' | 'Justify'
    },
    seriesFormat: {
      fontSize: 18,
      fontFamily: 'Arial',
      isBold: false,
      isUnderline: false,
      alignment: 'Center' as 'Left' | 'Center' | 'Right' | 'Justify'
    },
    titleFormat: {
      fontSize: 18,
      fontFamily: 'Arial',
      isBold: true,
      isUnderline: false,
      alignment: 'Center' as 'Left' | 'Center' | 'Right' | 'Justify'
    },
    presentFormat: {
      fontSize: 14,
      fontFamily: 'Arial',
      isBold: false,
      isUnderline: false,
      alignment: 'Left' as 'Left' | 'Center' | 'Right' | 'Justify'
    },
    absentFormat: {
      fontSize: 14,
      fontFamily: 'Arial',
      isBold: false,
      isUnderline: false,
      alignment: 'Left' as 'Left' | 'Center' | 'Right' | 'Justify'
    },
    contentFormat: {
      fontSize: 14,
      fontFamily: 'Arial',
      isBold: false,
      isUnderline: false,
      alignment: 'Justify' as 'Left' | 'Center' | 'Right' | 'Justify'
    }
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrdinances();
    fetchTemplates();
  }, []);

  const fetchOrdinances = async () => {
    try {
      const response = await api.get('/ordinances');
      setOrdinances(response.data);
    } catch (err) {
      setError('Failed to fetch ordinances');
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/templates');
      setTemplates(response.data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const ordinanceData = {
        ...formData,
        signatories: formData.signatories.length > 0 ? formData.signatories : [
          { name: 'Presiding Officer', position: 'Sangguniang Bayan Chairperson', alignment: 'Center' as const, isBold: false, isUnderline: true }
        ],
        dateIntroduced: new Date().toISOString(),
        paperSize: 'A4',
        pageCount: 1
      };

      if (editingOrdinance) {
        await api.put(`/ordinances/${editingOrdinance._id}`, ordinanceData);
      } else {
        await api.post('/ordinances', ordinanceData);
      }

      // Upload file if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        const endpoint = editingOrdinance 
          ? `/ordinances/${editingOrdinance._id}/upload`
          : `/ordinances/${ordinances.length + 1}/upload`;
        await api.post(endpoint, uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      fetchOrdinances();
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save ordinance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ordinance?')) return;

    try {
      await api.delete(`/ordinances/${id}`);
      fetchOrdinances();
    } catch (err) {
      setError('Failed to delete ordinance');
    }
  };

  const openModal = (ordinance?: Ordinance) => {
    if (ordinance) {
      setEditingOrdinance(ordinance);
      setFormData({
        ordinanceNumber: ordinance.ordinanceNumber,
        series: ordinance.series,
        title: ordinance.title,
        content: ordinance.content,
        present: (ordinance as any).present || '',
        absent: (ordinance as any).absent || '',
        status: ordinance.status,
        isPublic: ordinance.isPublic,
        templateId: ordinance.templateId || '',
        signatories: ordinance.signatories || [],
        ordinanceNumberFormat: {
          fontSize: 20,
          fontFamily: 'Arial',
          isBold: true,
          isUnderline: false,
          alignment: 'Center'
        },
        seriesFormat: {
          fontSize: 18,
          fontFamily: 'Arial',
          isBold: false,
          isUnderline: false,
          alignment: 'Center'
        },
        titleFormat: {
          fontSize: 18,
          fontFamily: 'Arial',
          isBold: true,
          isUnderline: false,
          alignment: 'Center'
        },
        presentFormat: {
          fontSize: 14,
          fontFamily: 'Arial',
          isBold: false,
          isUnderline: false,
          alignment: 'Left'
        },
        absentFormat: {
          fontSize: 14,
          fontFamily: 'Arial',
          isBold: false,
          isUnderline: false,
          alignment: 'Left'
        },
        contentFormat: {
          fontSize: 14,
          fontFamily: 'Arial',
          isBold: false,
          isUnderline: false,
          alignment: 'Justify'
        }
      });
    } else {
      setEditingOrdinance(null);
      setFormData({
        ordinanceNumber: '',
        series: '',
        title: '',
        content: '',
        present: '',
        absent: '',
        status: 'Draft',
        isPublic: false,
        templateId: '',
        signatories: [],
        ordinanceNumberFormat: {
          fontSize: 20,
          fontFamily: 'Arial',
          isBold: true,
          isUnderline: false,
          alignment: 'Center'
        },
        seriesFormat: {
          fontSize: 18,
          fontFamily: 'Arial',
          isBold: false,
          isUnderline: false,
          alignment: 'Center'
        },
        titleFormat: {
          fontSize: 18,
          fontFamily: 'Arial',
          isBold: true,
          isUnderline: false,
          alignment: 'Center'
        },
        presentFormat: {
          fontSize: 14,
          fontFamily: 'Arial',
          isBold: false,
          isUnderline: false,
          alignment: 'Left'
        },
        absentFormat: {
          fontSize: 14,
          fontFamily: 'Arial',
          isBold: false,
          isUnderline: false,
          alignment: 'Left'
        },
        contentFormat: {
          fontSize: 14,
          fontFamily: 'Arial',
          isBold: false,
          isUnderline: false,
          alignment: 'Justify'
        }
      });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOrdinance(null);
    setFormData({
      ordinanceNumber: '',
      series: '',
      title: '',
      content: '',
      present: '',
      absent: '',
      status: 'Draft',
      isPublic: false,
      templateId: '',
      signatories: [],
      ordinanceNumberFormat: {
        fontSize: 20,
        fontFamily: 'Arial',
        isBold: true,
        isUnderline: false,
        alignment: 'Center'
      },
      seriesFormat: {
        fontSize: 18,
        fontFamily: 'Arial',
        isBold: false,
        isUnderline: false,
        alignment: 'Center'
      },
      titleFormat: {
        fontSize: 18,
        fontFamily: 'Arial',
        isBold: true,
        isUnderline: false,
        alignment: 'Center'
      },
      presentFormat: {
        fontSize: 14,
        fontFamily: 'Arial',
        isBold: false,
        isUnderline: false,
        alignment: 'Left'
      },
      absentFormat: {
        fontSize: 14,
        fontFamily: 'Arial',
        isBold: false,
        isUnderline: false,
        alignment: 'Left'
      },
      contentFormat: {
        fontSize: 14,
        fontFamily: 'Arial',
        isBold: false,
        isUnderline: false,
        alignment: 'Justify'
      }
    });
    setSelectedFile(null);
    setError('');
  };

  const addSignatory = () => {
    const newSignatory = {
      name: '',
      position: '',
      alignment: 'Left' as const,
      isBold: false,
      isUnderline: true
    };
    setFormData({
      ...formData,
      signatories: [...formData.signatories, newSignatory]
    });
  };

  const updateSignatory = (index: number, field: string, value: any) => {
    const newSignatories = [...formData.signatories];
    newSignatories[index] = { ...newSignatories[index], [field]: value };
    setFormData({ ...formData, signatories: newSignatories });
  };

  const removeSignatory = (index: number) => {
    setFormData({
      ...formData,
      signatories: formData.signatories.filter((_, i) => i !== index)
    });
  };

  // Helper function to render the ordinance document preview
  const renderOrdinancePreview = () => {
    const selectedTemplate = templates.find(t => t._id === formData.templateId);
    
    if (!selectedTemplate) {
      return (
        <div className="bg-white p-8" style={{ minHeight: '600px' }}>
          <div className="text-center text-gray-500">No template selected</div>
        </div>
      );
    }
    
    return (
      <div className="bg-white p-8" style={{ minHeight: '600px' }}>
        {/* Header with logos and texts */}
        {selectedTemplate.header?.logos && selectedTemplate.header.logos.length > 0 && (
          <div className="flex justify-center mb-4">
            {selectedTemplate.header.logos.map((logo) => (
              <img key={logo.id} src={logo.url} alt="Logo" className="h-12 mx-2" />
            ))}
          </div>
        )}
        
        {selectedTemplate.header?.texts?.map((text, index) => (
          <div 
            key={text.id} 
            className="mb-2"
            style={{
              fontSize: `${text.fontSize}px`,
              fontFamily: text.fontFamily,
              color: text.fontColor || '#000000',
              textAlign: text.alignment.toLowerCase() as 'left' | 'center' | 'right' | 'justify',
              fontWeight: text.isBold ? 'bold' : 'normal',
              fontStyle: text.isItalic ? 'italic' : 'normal',
              textDecoration: text.isUnderline ? 'underline' : 'none'
            }}
          >
            {text.text}
          </div>
        ))}
        
        {/* Ordinance Title */}
        {formData.title && (
          <div className="text-center my-6">
            <h2 
              className="text-xl font-bold"
              style={{ textDecoration: 'underline' }}
            >
              ORDINANCE NO. {formData.ordinanceNumber}
            </h2>
            <h3 className="text-lg mt-2">Series: {formData.series}</h3>
            <h4 className="text-lg mt-2 font-semibold">{formData.title}</h4>
          </div>
        )}
        
        {/* Content */}
        {formData.content && (
          <div className="my-6 whitespace-pre-wrap" style={{ textAlign: 'justify' }}>
            {formData.content}
          </div>
        )}
        
        {/* Signatories */}
        {formData.signatories.length > 0 && (
          <div className="mt-8">
            {formData.signatories.map((signatory, index) => (
              <div 
                key={index}
                className="mb-4"
                style={{ textAlign: signatory.alignment.toLowerCase() as 'left' | 'center' | 'right' | 'justify' }}
              >
                <div 
                  style={{
                    fontWeight: signatory.isBold ? 'bold' : 'normal',
                    textDecoration: signatory.isUnderline ? 'underline' : 'none'
                  }}
                >
                  {signatory.name}
                </div>
                <div className="text-sm">{signatory.position}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Footer */}
        {selectedTemplate.footer?.texts?.map((text) => (
          <div 
            key={text.id} 
            className="mt-8"
            style={{
              fontSize: `${text.fontSize}px`,
              fontFamily: text.fontFamily,
              color: text.fontColor || '#000000',
              textAlign: text.alignment.toLowerCase() as 'left' | 'center' | 'right' | 'justify',
              fontWeight: text.isBold ? 'bold' : 'normal',
              fontStyle: text.isItalic ? 'italic' : 'normal',
              textDecoration: text.isUnderline ? 'underline' : 'none'
            }}
          >
            {text.text}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl shadow-xl p-4 sm:p-6 border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Manage Ordinances</h1>
            <p className="text-gray-300 text-sm sm:text-base">Create and manage municipal ordinances</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm sm:text-base"
          >
            Add New Ordinance
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Ordinances Table */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        {/* Mobile Card View */}
        <div className="lg:hidden">
          {ordinances.map((ordinance) => (
            <div key={ordinance._id} className="p-4 border-b border-gray-700 last:border-b-0">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{ordinance.ordinanceNumber}</h3>
                    <p className="text-sm text-gray-400">{ordinance.series}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ordinance.status === 'Approved' 
                        ? 'bg-green-900 text-green-200' 
                        : ordinance.status === 'Pending'
                        ? 'bg-yellow-900 text-yellow-200'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {ordinance.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ordinance.isPublic 
                        ? 'bg-blue-900 text-blue-200' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {ordinance.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-300 line-clamp-2">{ordinance.title}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openModal(ordinance)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  {ordinance.scannedCopy && (
                    <a
                      href={getImageUrl(ordinance.scannedCopy)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                    >
                      PDF
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(ordinance._id)}
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
                  Ordinance Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Public
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {ordinances.map((ordinance) => (
                <tr key={ordinance._id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{ordinance.ordinanceNumber}</div>
                    <div className="text-sm text-gray-400">{ordinance.series}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white max-w-xs truncate">{ordinance.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ordinance.status === 'Approved' 
                        ? 'bg-green-900 text-green-200' 
                        : ordinance.status === 'Pending'
                        ? 'bg-yellow-900 text-yellow-200'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {ordinance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ordinance.isPublic 
                        ? 'bg-blue-900 text-blue-200' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {ordinance.isPublic ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openModal(ordinance)}
                      className="text-yellow-400 hover:text-yellow-300 font-medium mr-3"
                    >
                      Edit
                    </button>
                    {ordinance.scannedCopy && (
                      <a
                        href={getImageUrl(ordinance.scannedCopy)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-medium mr-3"
                      >
                        View PDF
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(ordinance._id)}
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

      {ordinances.length === 0 && (
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 p-12 text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No ordinances yet</h3>
          <p className="text-gray-400">Create your first ordinance to get started</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-7xl mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingOrdinance ? 'Edit Ordinance' : 'Add New Ordinance'}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Section */}
              <div>
                <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Ordinance Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ordinanceNumber}
                    onChange={(e) => setFormData({...formData, ordinanceNumber: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Series
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.series}
                    onChange={(e) => setFormData({...formData, series: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">
                  Select Template
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => setFormData({...formData, templateId: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Select a template (optional)</option>
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.templateName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">
                  Content
                </label>
                <div className="mb-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, content: formData.content + '\n• '})}
                    className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Bullet Point
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, content: formData.content + '\n1. '})}
                    className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Numbered List
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, content: formData.content + '\n- '})}
                    className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Dash
                  </button>
                </div>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter ordinance content... Use formatting tools above for lists"
                />
              </div>

              {/* Signatories Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-white">Signatories</h4>
                  <button
                    type="button"
                    onClick={addSignatory}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Add Signatory
                  </button>
                </div>
                
                {formData.signatories.map((signatory, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">Name</label>
                        <input
                          type="text"
                          placeholder="Enter name"
                          value={signatory.name}
                          onChange={(e) => updateSignatory(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">Position</label>
                        <input
                          type="text"
                          placeholder="Enter position"
                          value={signatory.position}
                          onChange={(e) => updateSignatory(index, 'position', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <select
                        value={signatory.alignment}
                        onChange={(e) => updateSignatory(index, 'alignment', e.target.value)}
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
                          checked={signatory.isBold || false}
                          onChange={(e) => updateSignatory(index, 'isBold', e.target.checked)}
                          className="mr-2"
                        />
                        Bold
                      </label>
                      
                      <label className="flex items-center text-white">
                        <input
                          type="checkbox"
                          checked={signatory.isUnderline || false}
                          onChange={(e) => updateSignatory(index, 'isUnderline', e.target.checked)}
                          className="mr-2"
                        />
                        Underline
                      </label>
                      
                      {formData.signatories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSignatory(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {formData.signatories.length === 0 && (
                  <div className="bg-gray-800 rounded-lg p-8 text-center">
                    <p className="text-gray-400">No signatories added. Click "Add Signatory" to add one.</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">
                  Upload PDF Document
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                    className="mr-2 w-4 h-4 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500"
                  />
                  <span className="text-sm text-white">Make public</span>
                </label>
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
                  disabled={isLoading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : (editingOrdinance ? 'Update' : 'Create')}
                </button>
              </div>
                </form>
              </div>

              {/* Preview Section */}
              <div className="bg-white rounded-lg p-6 overflow-y-auto max-h-[70vh]">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Document Preview</h4>
                <div className="border border-gray-300 rounded p-4 bg-gray-50" style={{ minHeight: '600px' }}>
                  {renderOrdinancePreview()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdinances;
