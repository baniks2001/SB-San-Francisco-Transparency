import React, { useState, useEffect } from 'react';
import { Resolution, ResolutionTemplate } from '../types';
import api from '../services/api';
import { getImageUrl, getLogoUrl } from '../utils/imageUtils';

const Resolutions: React.FC = () => {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [templates, setTemplates] = useState<ResolutionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResolution, setSelectedResolution] = useState<Resolution | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resolutionsResponse, templatesResponse] = await Promise.all([
          api.get('/resolutions'),
          api.get('/templates')
        ]);
        setResolutions(resolutionsResponse.data);
        setTemplates(templatesResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredResolutions = resolutions.filter((resolution) => {
    const matchesStatus = statusFilter === 'all' || resolution.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      resolution.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resolution.resolutionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resolution.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-600 text-white border-green-700';
      case 'Pending': return 'bg-yellow-600 text-white border-yellow-700';
      case 'Rejected': return 'bg-red-600 text-white border-red-700';
      default: return 'bg-gray-600 text-white border-gray-700';
    }
  };

  const handleViewResolution = (resolution: Resolution) => {
    setSelectedResolution(resolution);
  };

  const viewDocument = (resolution: Resolution) => {
    console.log('Viewing resolution:', resolution);
    console.log('Resolution templateId:', resolution.templateId);
    console.log('Available templates:', templates);
    
    // Find the template for this resolution
    const selectedTemplate = templates.find(t => t._id === resolution.templateId);
    
    if (!selectedTemplate) {
      console.error('No template found for this resolution');
      alert('No template is assigned to this resolution. Please contact the administrator.');
      return;
    }
    
    // Create a new window to display the formatted document
    const documentWindow = window.open('', '_blank');
    if (documentWindow) {
      const documentContent = generateDocumentHTML(resolution, selectedTemplate);
      documentWindow.document.write(documentContent);
      documentWindow.document.title = `Resolution ${resolution.resolutionNumber}`;
      documentWindow.document.close();
    }
  };

  const printDocument = (resolution: Resolution) => {
    // Handle templateId
    const templateId = resolution.templateId;
    
    if (!templateId) {
      console.error('No template assigned to this resolution');
      alert('No template is assigned to this resolution. Please contact the administrator.');
      return;
    }
    
    // Find the template
    const selectedTemplate = templates.find(t => t._id === templateId);
    
    if (!selectedTemplate) {
      console.error('No template found for this resolution');
      alert('No template is assigned to this resolution. Please contact the administrator.');
      return;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const documentContent = generateDocumentHTML(resolution, selectedTemplate);
      printWindow.document.write(documentContent);
      printWindow.document.title = `Resolution ${resolution.resolutionNumber}`;
      printWindow.document.close();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const generateDocumentHTML = (resolution: Resolution, template: ResolutionTemplate): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Resolution ${resolution.resolutionNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            margin: 40px; 
            color: #000;
            background: white;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .title { 
            font-size: 18px; 
            font-weight: bold; 
            margin: 20px 0; 
            text-align: center;
          }
          .content-section { margin: 20px 0; }
          .content-text { 
            padding: 10px 0; 
            line-height: 1.6;
          }
          .signatories { margin-top: 40px; }
          .signatory { margin: 15px 0; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          ${template.header?.logos?.map(logo => {
            const logoSrc = getLogoUrl(logo.url);
            return logo.url ? `<img src="${logoSrc}" style="height: 60px; margin: 0 10px;" alt="Logo" />` : '';
          }).join('') || ''}
          ${template.header?.texts?.map(text => 
            `<div style="font-size: ${text.fontSize}px; font-family: ${text.fontFamily}; color: ${text.fontColor || '#000'}; text-align: ${text.alignment.toLowerCase()}; font-weight: ${text.isBold ? 'bold' : 'normal'}; font-style: ${text.isItalic ? 'italic' : 'normal'}; text-decoration: ${text.isUnderline ? 'underline' : 'none'}; margin: 5px 0;">${text.text}</div>`
          ).join('') || ''}
        </div>

        <!-- Present and Absent at top -->
        <div class="content-section">
          <label>Present:</label>
          <div class="content-text">
            <!-- Present members will be listed here -->
          </div>
        </div>

        <div class="content-section">
          <label>Absent:</label>
          <div class="content-text">
            <!-- Absent members will be listed here -->
          </div>
        </div>

        <!-- Resolution Content -->
        <div class="title-section">
          <h2 style="font-size: 20px; font-weight: bold;">RESOLUTION NO. ${resolution.resolutionNumber}, Series ${resolution.series}</h2>
        </div>

        <div class="content-section">
          <div class="content-text">${resolution.content || ''}</div>
        </div>

        <div class="content-section">
          <div class="content-text">${resolution.content || ''}</div>
        </div>

        <!-- Signatories -->
        <div class="signatories">
          ${template.footer?.texts?.map(text => 
            `<div style="font-size: ${text.fontSize}px; font-family: ${text.fontFamily}; color: ${text.fontColor || '#000'}; text-align: ${text.alignment.toLowerCase()}; font-weight: ${text.isBold ? 'bold' : 'normal'}; font-style: ${text.isItalic ? 'italic' : 'normal'}; text-decoration: ${text.isUnderline ? 'underline' : 'none'}; margin: 5px 0;">${text.text}</div>`
          ).join('') || ''}
          
          <div class="signatory">
            <div style="text-align: center; margin-top: 30px;">
              <div style="border-bottom: 1px solid #000; width: 200px; margin: 0 auto;"></div>
              <div style="margin-top: 5px;">${resolution.author || 'Sangguniang Bayan Member'}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-black">Loading resolutions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Resolutions</h1>
        <p className="text-black">
          View and download municipal resolutions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Search Resolutions</label>
            <input
              type="text"
              placeholder="Search by title, number, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Resolutions</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {filteredResolutions.length === 0 ? (
        <div className="bg-white shadow rounded-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No resolutions found</h3>
          <p className="text-white">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Resolution No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Series
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResolutions.map((resolution) => (
                  <tr key={resolution._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {resolution.resolutionNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      <div className="max-w-xs truncate" title={resolution.title}>
                        {resolution.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {resolution.series}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {resolution.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resolution.status)}`}>
                        {resolution.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewResolution(resolution)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => viewDocument(resolution)}
                          className="text-green-600 hover:text-green-900"
                        >
                          View Document
                        </button>
                        <button
                          onClick={() => printDocument(resolution)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Print
                        </button>
                        {resolution.scannedCopy && (
                          <a
                            href={getImageUrl(resolution.scannedCopy)}
                            download
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Document Modal */}
      {selectedResolution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedResolution.title}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span><strong>Resolution No:</strong> {selectedResolution.resolutionNumber}</span>
                    <span><strong>Series:</strong> {selectedResolution.series}</span>
                    <span><strong>Author:</strong> {selectedResolution.author}</span>
                    <span><strong>Status:</strong> {selectedResolution.status}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedResolution(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Content</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedResolution.content}</p>
                </div>
              </div>
              
              {selectedResolution.scannedCopy && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Scanned Document</h3>
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={getImageUrl(selectedResolution.scannedCopy)}
                      alt="Scanned Resolution"
                      className="w-full h-auto max-h-[600px] object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0Y1OUUwQiIvPgo8cGF0aCBkPSJNOCAxNkgxNlY4SDhWMTZaTTE2IDE2SDI0VjhIMTZWMTZaTTggMjRIMTZWMTZIOFYyNFpNMTYgMjRIMjRWMTZIMTZWMjRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedResolution(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedResolution.scannedCopy && (
                  <a
                    href={getImageUrl(selectedResolution.scannedCopy)}
                    download
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Download
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resolutions;
