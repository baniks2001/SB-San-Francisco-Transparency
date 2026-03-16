import React, { useState, useEffect } from 'react';
import { Resolution, ResolutionTemplate } from '../../types';
import api from '../../services/api';
import { getLogoUrl } from '../../utils/imageUtils';
import NotificationModal from '../../components/NotificationModal';
import ConfirmationModal from '../../components/ConfirmationModal';

const AdminResolutions: React.FC = () => {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [templates, setTemplates] = useState<ResolutionTemplate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResolution, setEditingResolution] = useState<Resolution | null>(null);
  const [formData, setFormData] = useState({
    resolutionNumber: '',
    series: '',
    title: '', // Keep title for header display only
    content: '',
    secondContent: '',
    present: [] as Array<{name: string, position: string, position2?: string}>,
    absent: [] as Array<{name: string, position: string, position2?: string}>,
    status: 'Draft' as 'Draft' | 'Pending' | 'Approved',
    isPublic: false,
    templateId: '',
    paperSize: 'A4',
    signatories: [] as Array<{
      name: string;
      position: string;
      optionalText?: string;
      alignment: 'Left' | 'Center' | 'Right' | 'Justify';
      fontSize: number;
      fontFamily: string;
      isBold: boolean;
      isUnderline: boolean;
    }>,
    attestedBy: [] as Array<{
      name: string;
      position: string;
      optionalText?: string;
      alignment: 'Left' | 'Center' | 'Right' | 'Justify';
      isBold?: boolean;
      isUnderline?: boolean;
      fontSize?: number;
      fontFamily?: string;
    }>,
    // Text formatting options for each field
    resolutionNumberFormat: {
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
    },
    secondContentFormat: {
      fontSize: 14,
      fontFamily: 'Arial',
      isBold: false,
      isUnderline: false,
      alignment: 'Justify' as 'Left' | 'Center' | 'Right' | 'Justify'
    },
    signatoriesFormat: {
      fontSize: 14,
      fontFamily: 'Arial',
      isBold: false,
      isUnderline: false,
      alignment: 'Left' as 'Left' | 'Center' | 'Right' | 'Justify'
    },
    attestedByFormat: {
      fontSize: 14,
      fontFamily: 'Arial',
      isBold: false,
      isUnderline: false,
      alignment: 'Left' as 'Left' | 'Center' | 'Right' | 'Justify'
    }
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
    fetchResolutions();
    fetchTemplates();
  }, []);

  const fetchResolutions = async () => {
    try {
      const response = await api.get('/resolutions');
      console.log('Resolutions fetched:', response.data);
      console.log('First resolution templateId:', response.data[0]?.templateId);
      console.log('First resolution templateId type:', typeof response.data[0]?.templateId);
      setResolutions(response.data);
    } catch (err) {
      setError('Failed to fetch resolutions');
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/templates');
      console.log('Templates fetched:', response.data);
      setTemplates(response.data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
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
    setIsLoading(true);
    setError('');

    try {
      // Preserve existing templateId when editing a resolution that already has one
      const finalTemplateId = editingResolution && editingResolution.templateId 
        ? (typeof editingResolution.templateId === 'object' && editingResolution.templateId !== null 
            ? editingResolution.templateId._id 
            : editingResolution.templateId.toString())
        : formData.templateId;

      const resolutionData = {
        ...formData,
        templateId: finalTemplateId,
        signatories: formData.signatories.length > 0 ? formData.signatories : [
          { name: 'Presiding Officer', position: 'Sangguniang Bayan Chairperson', alignment: 'Center' as const, isBold: false, isUnderline: true }
        ],
        dateIntroduced: new Date().toISOString(),
        paperSize: 'A4',
        pageCount: 1
      };

      console.log('Sending resolution data:', resolutionData);
      console.log('Template ID being sent:', resolutionData.templateId);

      let resolutionId: string;
      
      if (editingResolution) {
        await api.put(`/resolutions/${editingResolution._id}`, resolutionData);
        resolutionId = editingResolution._id;
      } else {
        const response = await api.post('/resolutions', resolutionData);
        console.log('Resolution created response:', response.data);
        resolutionId = response.data.resolution._id;
      }

      // Upload file if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        await api.post(`/resolutions/${resolutionId}/upload`, uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      fetchResolutions();
      closeModal();
      showNotification('Success', editingResolution ? 'Resolution updated successfully!' : 'Resolution created successfully!', 'success');
    } catch (err: any) {
      showNotification('Error', err.response?.data?.message || 'Failed to save resolution', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirmation(
      'Delete Resolution',
      'Are you sure you want to delete this resolution? This action cannot be undone.',
      async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await api.delete(`/resolutions/${id}`);
          showNotification('Success', 'Resolution deleted successfully!', 'success');
          fetchResolutions();
        } catch (err: any) {
          showNotification('Error', err.response?.data?.message || 'Failed to delete resolution', 'error');
        } finally {
          setConfirmationModal(prev => ({ ...prev, isLoading: false, isOpen: false }));
        }
      }
    );
  };

  const openModal = (resolution?: Resolution) => {
    if (resolution) {
      setEditingResolution(resolution);
      setFormData({
        resolutionNumber: resolution.resolutionNumber,
        series: resolution.series,
        title: resolution.title,
        content: resolution.content,
        secondContent: resolution.secondContent || '',
        present: resolution.present || [],
        absent: resolution.absent || [],
        status: resolution.status,
        isPublic: resolution.isPublic,
        templateId: resolution.templateId ? 
          (typeof resolution.templateId === 'object' && resolution.templateId !== null 
            ? resolution.templateId._id 
            : resolution.templateId.toString()) 
          : '',
        paperSize: resolution.paperSize || 'A4',
        signatories: (resolution.signatories || []).map(sig => ({
          name: sig.name,
          position: sig.position,
          optionalText: '',
          alignment: sig.alignment || 'Left',
          fontSize: sig.fontSize || 14,
          fontFamily: sig.fontFamily || 'Arial',
          isBold: sig.isBold || false,
          isUnderline: sig.isUnderline || false
        })) || [],
        attestedBy: (resolution as any).attestedBy || [],
        resolutionNumberFormat: {
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
        },
        secondContentFormat: {
          fontSize: 14,
          fontFamily: 'Arial',
          isBold: false,
          isUnderline: false,
          alignment: 'Justify'
        },
        signatoriesFormat: {
          fontSize: 14,
          fontFamily: 'Arial',
          isBold: false,
          isUnderline: false,
          alignment: 'Left'
        },
        attestedByFormat: {
          fontSize: 14,
          fontFamily: 'Arial',
          isBold: false,
          isUnderline: false,
          alignment: 'Left'
        }
      });
    } else {
      setEditingResolution(null);
      setFormData({
        resolutionNumber: '',
        series: '',
        title: '',
        content: '',
        secondContent: '',
        present: [],
        absent: [],
        status: 'Draft',
        isPublic: false,
        templateId: '',
        paperSize: 'A4',
        signatories: [],
        attestedBy: [],
        resolutionNumberFormat: {
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
        },
        secondContentFormat: {
          fontSize: 14,
          fontFamily: 'Arial',
          isBold: false,
          isUnderline: false,
          alignment: 'Justify'
        },
        signatoriesFormat: {
          fontSize: 14,
          fontFamily: 'Arial',
          isBold: false,
          isUnderline: false,
          alignment: 'Left'
        },
        attestedByFormat: {
          fontSize: 14,
          fontFamily: 'Arial',
          isBold: false,
          isUnderline: false,
          alignment: 'Left'
        }
      });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingResolution(null);
    setFormData({
      resolutionNumber: '',
      series: '',
      title: '',
      content: '',
      secondContent: '',
      present: [],
      absent: [],
      status: 'Draft',
      isPublic: false,
      templateId: '',
      paperSize: 'A4',
      signatories: [],
      attestedBy: [],
      resolutionNumberFormat: {
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
      },
      secondContentFormat: {
        fontSize: 14,
        fontFamily: 'Arial',
        isBold: false,
        isUnderline: false,
        alignment: 'Justify'
      },
      signatoriesFormat: {
        fontSize: 14,
        fontFamily: 'Arial',
        isBold: false,
        isUnderline: false,
        alignment: 'Left'
      },
      attestedByFormat: {
        fontSize: 14,
        fontFamily: 'Arial',
        isBold: false,
        isUnderline: false,
        alignment: 'Left'
      }
    });
    setSelectedFile(null);
    setError('');
  };

  const viewDocument = (resolution: Resolution) => {
    console.log('Viewing resolution:', resolution);
    console.log('Resolution templateId:', resolution.templateId);
    console.log('Available templates:', templates);
    console.log('Template ID type:', typeof resolution.templateId);
    
    // Handle both string and ObjectId formats
    let templateId: string;
    if (typeof resolution.templateId === 'string') {
      templateId = resolution.templateId;
    } else if (resolution.templateId && typeof resolution.templateId === 'object') {
      templateId = (resolution.templateId as any)._id || (resolution.templateId as any).toString();
    } else {
      templateId = '';
    }
    
    console.log('Normalized template ID:', templateId);
    
    const selectedTemplate = templates.find(t => t._id === templateId);
    console.log('Found template:', selectedTemplate);
    
    if (!selectedTemplate) {
      console.log('No template found for ID:', templateId);
      alert('No template assigned to this resolution');
      return;
    }
    
    // Create a new window with the document preview
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      const documentContent = generateDocumentHTML(resolution, selectedTemplate);
      newWindow.document.write(documentContent);
      newWindow.document.title = `Resolution ${resolution.resolutionNumber}`;
      newWindow.document.close();
    }
  };

  const downloadDocument = (resolution: Resolution) => {
    // Handle both string and ObjectId formats
    let templateId: string;
    if (typeof resolution.templateId === 'string') {
      templateId = resolution.templateId;
    } else if (resolution.templateId && typeof resolution.templateId === 'object' && resolution.templateId !== null) {
      templateId = (resolution.templateId as any)._id || (resolution.templateId as any).toString();
    } else {
      console.error('Invalid templateId:', resolution.templateId);
      return;
    }
    
    const selectedTemplate = templates.find(t => t._id === templateId);
    if (!selectedTemplate) {
      console.error('Template not found:', templateId);
      return;
    }
    
    const documentContent = generateDocumentHTML(resolution, selectedTemplate);
    
    // Generate PDF using browser's print functionality
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    if (printWindow) {
      printWindow.document.write(documentContent);
      printWindow.document.title = `Resolution ${resolution.resolutionNumber}`;
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Note: User needs to select "Save as PDF" in the print dialog
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
      };
    }
  };

  const printDocument = (resolution: Resolution) => {
    // Handle both string and ObjectId formats
    let templateId: string;
    if (typeof resolution.templateId === 'string') {
      templateId = resolution.templateId;
    } else if (resolution.templateId && typeof resolution.templateId === 'object' && resolution.templateId !== null) {
      templateId = (resolution.templateId as any)._id || (resolution.templateId as any).toString();
    } else {
      console.error('Invalid templateId:', resolution.templateId);
      return;
    }
    
    const selectedTemplate = templates.find(t => t._id === templateId);
    if (!selectedTemplate) {
      console.error('Template not found:', templateId);
      return;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    if (printWindow) {
      const documentContent = generateDocumentHTML(resolution, selectedTemplate);
      printWindow.document.write(documentContent);
      printWindow.document.title = `Resolution ${resolution.resolutionNumber}`;
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
    }
  };

  const generateDocumentHTML = (resolution: Resolution, template: ResolutionTemplate) => {
    const present = resolution.present || [];
    const absent = resolution.absent || [];
    const secondContent = resolution.secondContent || '';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resolution ${resolution.resolutionNumber}</title>
        <style>
          @page { margin: 0.5in; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 10px; 
            background-color: white;
          }
          .header { text-align: center; margin-bottom: 10px; }
          .title-section { text-align: center; margin: 15px 0; }
          .content-section { 
            margin: 10px 0; 
            page-break-inside: avoid;
          }
          .content-text { 
            padding: 5px 0; 
            line-height: 1.1;
            margin-bottom: 5px;
            page-break-inside: avoid;
          }
          .title-section {
            margin: 10px 0;
            text-align: center;
            page-break-after: avoid;
          }
          .signatories {
            margin-top: 20px;
            page-break-inside: avoid;
          }
          .signatory {
            margin: 10px 0;
            page-break-inside: avoid;
          }
          .attested-by {
            margin-top: 15px;
            page-break-inside: avoid;
          }
          .attested-signatory {
            margin: 5px 0;
            page-break-inside: avoid;
          }
          /* Prevent page breaks before these elements */
          .content-section:first-child,
          .title-section,
          .signatories,
          .attested-by {
            page-break-before: auto;
          }
          /* Allow page breaks between sections if needed */
          .content-section + .content-section {
            page-break-before: auto;
          }
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

        <!-- Resolution Content -->
        <div class="content-section" style="text-align: center;">
          <div class="content-text" style="text-align: left; display: inline-block;">${resolution.content.replace(/\n/g, '<br>')}</div>
        </div>

        <!-- Add more space after main content -->
        <div style="margin-bottom: 15px;"></div>

        <!-- Present and Absent Members -->
        <div class="content-section">
          <!-- Present Members -->
          ${present.length > 0 ? `
            <div class="content-text" style="margin-bottom: 15px; color: #000000; text-align: left;">
              <div style="font-weight: bold; margin-bottom: 10px; color: #000000;">Present:</div>
${present.map((member: any, index: number) => 
  `  <div style="margin-bottom: 2px; color: #000000; line-height: 1.1;">
    <div style="display: flex; align-items: flex-start; justify-content: center;">
      <span style="display: inline-block; min-width: 200px; color: #000000;">${member.name}</span>
      <div style="margin-left: 50px;">
        <div style="font-weight: bold; color: #000000;">${member.position}</div>
        ${member.position2 ? `
          <div style="font-weight: bold; color: #000000; margin-top: 0px;">${member.position2}</div>
        ` : ''}
      </div>
    </div>
  </div>`
).join('\n')}
            </div>
          ` : ''}

          <!-- Add more space between Present and Absent -->
          <div style="margin-bottom: 10px;"></div>

          <!-- Absent Members -->
          ${absent.length > 0 ? `
            <div class="content-text" style="margin-bottom: 15px; color: #000000; text-align: left;">
              <div style="font-weight: bold; margin-bottom: 10px; color: #000000;">Absent:</div>
${absent.map((member: any, index: number) => 
  `  <div style="margin-bottom: 2px; color: #000000; line-height: 1.1;">
    <div style="display: flex; align-items: flex-start; justify-content: center;">
      <span style="display: inline-block; min-width: 200px; color: #000000;">${member.name}</span>
      <div style="margin-left: 50px;">
        <div style="font-weight: bold; color: #000000;">${member.position}</div>
        ${member.position2 ? `
          <div style="font-weight: bold; color: #000000; margin-top: 0px;">${member.position2}</div>
        ` : ''}
      </div>
    </div>
  </div>`
).join('\n')}
            </div>
          ` : ''}
        </div>

        <!-- Resolution Number and Series - Below Absent, Above Second Content -->
        <div class="title-section">
          <h2 style="font-size: 20px; font-weight: bold;">RESOLUTION NO. ${resolution.resolutionNumber} SERIES OF ${resolution.series}</h2>
        </div>

        <!-- Second Content -->
        ${secondContent ? `
          <div class="content-section" style="text-align: center; page-break-inside: auto;">
            <div class="content-text" style="font-size: ${formData.secondContentFormat.fontSize}px; font-family: ${formData.secondContentFormat.fontFamily}; font-weight: ${formData.secondContentFormat.isBold ? 'bold' : 'normal'}; text-decoration: ${formData.secondContentFormat.isUnderline ? 'underline' : 'none'}; text-align: left; display: inline-block; page-break-inside: auto;">${secondContent.replace(/\n/g, '<br>')}</div>
          </div>
        ` : ''}

        <!-- Signatories -->
        <div class="signatories">
          ${resolution.signatories?.map(signatory => `
            <div class="signatory" style="text-align: ${signatory.alignment || 'left'}; font-size: ${signatory.fontSize || 14}px; font-family: ${signatory.fontFamily || 'Arial'};">
              <div style="font-weight: ${signatory.isBold ? 'bold' : 'normal'}; text-decoration: ${signatory.isUnderline ? 'underline' : 'none'};">
                ${signatory.name}
              </div>
              <div style="font-size: 14px;">${signatory.position}</div>
              ${(signatory as any).optionalText ? `<div style="font-size: 12px; margin-top: 2px;">${(signatory as any).optionalText}</div>` : ''}
            </div>
          `).join('') || ''}
        </div>

        <!-- Attested By -->
        ${(resolution as any).attestedBy && (resolution as any).attestedBy.length > 0 ? `
          <div style="margin-top: 15px;">
            <div style="text-align: left; font-weight: bold; font-size: 14px; margin-bottom: 10px;">ATTESTED BY:</div>
            <div class="attested-by">
              ${(resolution as any).attestedBy.map((attested: any) => `
                <div class="attested-signatory" style="text-align: ${attested.alignment || 'left'}; font-size: ${attested.fontSize || 14}px; font-family: ${attested.fontFamily || 'Arial'};">
                  <div style="font-weight: ${attested.isBold ? 'bold' : 'normal'}; text-decoration: ${attested.isUnderline ? 'underline' : 'none'};">
                    ${attested.name}
                  </div>
                  <div style="font-size: 14px;">${attested.position}</div>
                  ${attested.optionalText ? `<div style="font-size: 12px; margin-top: 2px;">${attested.optionalText}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Footer -->
        <div style="margin-top: 40px;">
          ${template.footer?.texts?.map(text => 
            `<div style="font-size: ${text.fontSize}px; font-family: ${text.fontFamily}; color: ${text.fontColor || '#000'}; text-align: ${text.alignment.toLowerCase()}; font-weight: ${text.isBold ? 'bold' : 'normal'}; font-style: ${text.isItalic ? 'italic' : 'normal'}; text-decoration: ${text.isUnderline ? 'underline' : 'none'}; margin: 5px 0;">${text.text}</div>`
          ).join('') || ''}
        </div>
      </body>
      </html>
    `;
  };

  const addSignatory = () => {
    const newSignatory = {
      name: '',
      position: '',
      optionalText: '',
      alignment: 'Left' as const,
      isBold: false,
      isUnderline: true,
      fontSize: 14,
      fontFamily: 'Arial'
    };
    setFormData({
      ...formData,
      signatories: [...formData.signatories, newSignatory]
    });
  };

  const addPresentMember = () => {
    const newMember = { name: '', position: '', position2: '' };
    setFormData({
      ...formData,
      present: [...formData.present, newMember]
    });
  };

  const addAbsentMember = () => {
    const newMember = { name: '', position: '', position2: '' };
    setFormData({
      ...formData,
      absent: [...formData.absent, newMember]
    });
  };

  const updatePresentMember = (index: number, field: string, value: string) => {
    const newPresent = [...formData.present];
    newPresent[index] = { ...newPresent[index], [field]: value };
    setFormData({ ...formData, present: newPresent });
  };

  const updateAbsentMember = (index: number, field: string, value: string) => {
    const newAbsent = [...formData.absent];
    newAbsent[index] = { ...newAbsent[index], [field]: value };
    setFormData({ ...formData, absent: newAbsent });
  };

  const removePresentMember = (index: number) => {
    setFormData({
      ...formData,
      present: formData.present.filter((_, i) => i !== index)
    });
  };

  const removeAbsentMember = (index: number) => {
    setFormData({
      ...formData,
      absent: formData.absent.filter((_, i) => i !== index)
    });
  };

  const addAttestedBy = () => {
    const newAttestedBy = {
      name: '',
      position: '',
      alignment: 'Left' as const,
      isBold: false,
      isUnderline: true,
      fontSize: 14,
      fontFamily: 'Arial'
    };
    setFormData({
      ...formData,
      attestedBy: [...formData.attestedBy, newAttestedBy]
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

  const updateAttestedBy = (index: number, field: string, value: any) => {
    const newAttestedBy = [...formData.attestedBy];
    newAttestedBy[index] = { ...newAttestedBy[index], [field]: value };
    setFormData({ ...formData, attestedBy: newAttestedBy });
  };

  const removeAttestedBy = (index: number) => {
    setFormData({
      ...formData,
      attestedBy: formData.attestedBy.filter((_, i) => i !== index)
    });
  };

  // Helper function to render the document preview
  const renderPreview = () => {
    // formData.templateId is always a string in the form state
    const templateId = formData.templateId || '';
    
    const selectedTemplate = templates.find(t => t._id === templateId);
    console.log('Selected template:', selectedTemplate);
    console.log('Template ID from formData:', templateId);
    console.log('Available templates:', templates);
    
    if (!selectedTemplate) {
      return (
        <div className="bg-white p-8" style={{ minHeight: '600px' }}>
          <div className="text-center text-gray-500">No template selected</div>
        </div>
      );
    }
    
    return (
      <div className="bg-white p-8" style={{ minHeight: '600px', backgroundColor: '#ffffff' }}>
        {/* HEADER (FROM THE TEMPLATE) */}
        {selectedTemplate.header?.logos && selectedTemplate.header.logos.length > 0 && (
          <div className="flex justify-center mb-4">
            {selectedTemplate.header.logos.map((logo) => (
              logo.url && (
                <img 
                  key={logo.id} 
                  src={getLogoUrl(logo.url)} 
                  alt="Logo" 
                  className="h-12 mx-2" 
                  onError={(e) => {
                    console.log('Logo failed to load:', logo.url);
                    e.currentTarget.style.display = 'none';
                  }} 
                />
              )
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
              fontWeight: text.isBold ? 'bold' : 'normal',
              textDecoration: text.isUnderline ? 'underline' : 'none',
              textAlign: text.alignment.toLowerCase() as 'left' | 'center' | 'right' | 'justify'
            }}
          >
            {text.text}
          </div>
        ))}

        {/* TITLE CONTENT - RESOLUTION NUMBER AND SERIES TOGETHER */}
        {/* Removed top title as requested */}

        {/* 1ST MAIN CONTENT */}
        <div className="mb-6">
          <div 
            style={{
              fontSize: `${formData.contentFormat.fontSize}px`,
              fontFamily: formData.contentFormat.fontFamily,
              fontWeight: formData.contentFormat.isBold ? 'bold' : 'normal',
              textDecoration: formData.contentFormat.isUnderline ? 'underline' : 'none',
              textAlign: formData.contentFormat.alignment.toLowerCase() as 'left' | 'center' | 'right' | 'justify',
              backgroundColor: '#ffffff',
              color: '#000000'
            }}
          >
            {formData.content.replace(/\n/g, '<br>')}
          </div>
        </div>
        {formData.present.length > 0 && (
          <div className="mb-6" style={{ backgroundColor: '#ffffff' }}>
            <div className="mb-4">
              <div 
                style={{
                  fontSize: `${formData.presentFormat.fontSize}px`,
                  fontFamily: formData.presentFormat.fontFamily,
                  fontWeight: formData.presentFormat.isBold ? 'bold' : 'normal',
                  textDecoration: formData.presentFormat.isUnderline ? 'underline' : 'none',
                  textAlign: formData.presentFormat.alignment.toLowerCase() as 'left' | 'center' | 'right' | 'justify',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              >
                <strong style={{ color: '#000000' }}>Present:</strong>
              </div>
              <div 
                style={{
                  fontSize: `${formData.presentFormat.fontSize}px`,
                  fontFamily: formData.presentFormat.fontFamily,
                  fontWeight: formData.presentFormat.isBold ? 'bold' : 'normal',
                  textDecoration: formData.presentFormat.isUnderline ? 'underline' : 'none',
                  textAlign: formData.presentFormat.alignment.toLowerCase() as 'left' | 'center' | 'right' | 'justify',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              >
                {formData.present.map((member, index) => (
                  <div key={index} style={{ marginBottom: '2px', color: '#000000', lineHeight: 1.1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                      <span style={{ display: 'inline-block', minWidth: '200px', color: '#000000' }}>{member.name}</span>
                      <div style={{ marginLeft: '50px' }}>
                        <div style={{ fontWeight: 'bold', color: '#000000' }}>{member.position}</div>
                        {member.position2 && (
                          <div style={{ fontWeight: 'bold', color: '#000000', marginTop: '0px' }}>{member.position2}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {formData.absent.length > 0 && (
          <div className="mb-6" style={{ backgroundColor: '#ffffff' }}>
            <div className="mb-4">
              <div 
                style={{
                  fontSize: `${formData.absentFormat.fontSize}px`,
                  fontFamily: formData.absentFormat.fontFamily,
                  fontWeight: formData.absentFormat.isBold ? 'bold' : 'normal',
                  textDecoration: formData.absentFormat.isUnderline ? 'underline' : 'none',
                  textAlign: formData.absentFormat.alignment.toLowerCase() as 'left' | 'center' | 'right' | 'justify',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              >
                <strong style={{ color: '#000000' }}>Absent:</strong>
              </div>
              <div 
                style={{
                  fontSize: `${formData.absentFormat.fontSize}px`,
                  fontFamily: formData.absentFormat.fontFamily,
                  fontWeight: formData.absentFormat.isBold ? 'bold' : 'normal',
                  textDecoration: formData.absentFormat.isUnderline ? 'underline' : 'none',
                  textAlign: formData.absentFormat.alignment.toLowerCase() as 'left' | 'center' | 'right' | 'justify',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              >
                {formData.absent.map((member, index) => (
                  <div key={index} style={{ marginBottom: '2px', color: '#000000', lineHeight: 1.1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                      <span style={{ display: 'inline-block', minWidth: '200px', color: '#000000' }}>{member.name}</span>
                      <div style={{ marginLeft: '50px' }}>
                        <div style={{ fontWeight: 'bold', color: '#000000' }}>{member.position}</div>
                        {member.position2 && (
                          <div style={{ fontWeight: 'bold', color: '#000000', marginTop: '0px' }}>{member.position2}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESOLUTION NUMBER AND SERIES - BELOW ABSENT, ABOVE SECOND CONTENT */}
        <div className="text-center my-6" style={{ backgroundColor: '#ffffff' }}>
          <h2 
            style={{
              fontSize: `${formData.resolutionNumberFormat.fontSize}px`,
              fontFamily: formData.resolutionNumberFormat.fontFamily,
              fontWeight: formData.resolutionNumberFormat.isBold ? 'bold' : 'normal',
              textDecoration: formData.resolutionNumberFormat.isUnderline ? 'underline' : 'none',
              backgroundColor: '#ffffff',
              color: '#000000'
            }}
          >
            RESOLUTION NO. {formData.resolutionNumber} SERIES OF {formData.series}
          </h2>
        </div>

        {/* 2ND MAIN CONTENT */}
        {formData.secondContent && (
          <div className="mb-6">
            <div 
              style={{
                fontSize: `${formData.secondContentFormat.fontSize}px`,
                fontFamily: formData.secondContentFormat.fontFamily,
                fontWeight: formData.secondContentFormat.isBold ? 'bold' : 'normal',
                textDecoration: formData.secondContentFormat.isUnderline ? 'underline' : 'none',
                textAlign: formData.secondContentFormat.alignment.toLowerCase() as 'left' | 'center' | 'right' | 'justify',
                backgroundColor: '#ffffff'
              }}
            >
              {formData.secondContent.replace(/\n/g, '<br>')}
            </div>
          </div>
        )}

        {/* TITLE CONTENT - RESOLUTION NUMBER AND SERIES TOGETHER */}
        {/* Removed top title as requested */}
        
        {/* SIGNATORIES - OPTIONAL TO ADD IF THERE IS NEEDED TO ADD IT WILL BE TOP OF THE SIGNATORIES FROM TEMPLATE */}
        {formData.signatories.length > 0 && (
          <div className="mt-8" style={{ backgroundColor: '#ffffff' }}>
            {formData.signatories.map((signatory, index) => (
              <div 
                key={index}
                className="mb-4"
                style={{ 
                  textAlign: (signatory.alignment || formData.signatoriesFormat.alignment).toLowerCase() as 'left' | 'center' | 'right' | 'justify',
                  fontSize: `${signatory.fontSize || formData.signatoriesFormat.fontSize}px`,
                  fontFamily: signatory.fontFamily || formData.signatoriesFormat.fontFamily,
                  backgroundColor: '#ffffff'
                }}
              >
                <div 
                  style={{
                    fontWeight: signatory.isBold ? 'bold' : (formData.signatoriesFormat.isBold ? 'bold' : 'normal'),
                    textDecoration: signatory.isUnderline ? 'underline' : (formData.signatoriesFormat.isUnderline ? 'underline' : 'none')
                  }}
                >
                  {signatory.name}
                </div>
                <div className="text-sm">{signatory.position}</div>
                {signatory.optionalText && (
                  <div className="text-xs mt-1" style={{ opacity: 0.8 }}>{signatory.optionalText}</div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* ATTESTED BY - AFTER SIGNATORIES */}
        {formData.attestedBy.length > 0 && (
          <div className="mt-8" style={{ backgroundColor: '#ffffff' }}>
            <div 
              style={{
                textAlign: 'left',
                fontWeight: 'bold',
                fontSize: '14px',
                marginBottom: '20px',
                color: '#000000',
                backgroundColor: '#ffffff'
              }}
            >
              ATTESTED BY:
            </div>
            {formData.attestedBy.map((attested, index) => (
              <div 
                key={index}
                className="mb-4"
                style={{ 
                  textAlign: (attested.alignment || formData.attestedByFormat.alignment).toLowerCase() as 'left' | 'center' | 'right' | 'justify',
                  fontSize: `${attested.fontSize || formData.attestedByFormat.fontSize}px`,
                  fontFamily: attested.fontFamily || formData.attestedByFormat.fontFamily,
                  fontWeight: attested.isBold || formData.attestedByFormat.isBold ? 'bold' : 'normal',
                  textDecoration: attested.isUnderline || formData.attestedByFormat.isUnderline ? 'underline' : 'none',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              >
                <div style={{ fontWeight: attested.isBold || formData.attestedByFormat.isBold ? 'bold' : 'normal', textDecoration: attested.isUnderline || formData.attestedByFormat.isUnderline ? 'underline' : 'none' }}>
                  {attested.name}
                </div>
                <div style={{ fontSize: '14px', color: '#000000' }}>{attested.position}</div>
                {attested.optionalText && (
                  <div style={{ fontSize: '12px', marginTop: '2px', color: '#000000' }}>{attested.optionalText}</div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* FOOTER (FROM THE TEMPLATE) */}
        {selectedTemplate.footer?.texts?.map((text) => (
          <div 
            key={text.id} 
            className="mt-8"
            style={{
              fontSize: `${text.fontSize}px`,
              fontFamily: text.fontFamily,
              color: text.fontColor || '#000000',
              fontWeight: text.isBold ? 'bold' : 'normal',
              textDecoration: text.isUnderline ? 'underline' : 'none',
              textAlign: text.alignment.toLowerCase() as 'left' | 'center' | 'right' | 'justify',
              backgroundColor: '#ffffff'
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
      <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 border border-gray-300">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Manage Resolutions</h1>
            <p className="text-gray-800 text-sm sm:text-base">Create and manage municipal resolutions</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-yellow-600 text-gray-800 px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm sm:text-base"
          >
            Add New Resolution
          </button>
        </div>
      </div>

      
      {/* Resolutions Table */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-300 overflow-hidden">
        {/* Mobile Card View */}
        <div className="lg:hidden">
          {resolutions.map((resolution) => (
            <div key={resolution._id} className="p-4 border-b border-gray-700 last:border-b-0">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{resolution.resolutionNumber}</h3>
                    <p className="text-sm text-gray-400">{resolution.series}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      resolution.status === 'Approved' 
                        ? 'bg-green-900 text-green-200' 
                        : resolution.status === 'Pending'
                        ? 'bg-yellow-900 text-yellow-200'
                        : 'bg-gray-700 text-gray-800'
                    }`}>
                      {resolution.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      resolution.isPublic 
                        ? 'bg-blue-900 text-blue-200' 
                        : 'bg-gray-700 text-gray-800'
                    }`}>
                      {resolution.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-800 line-clamp-2">{resolution.title}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openModal(resolution)}
                    className="px-3 py-1 bg-blue-600 text-gray-800 rounded text-xs hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => viewDocument(resolution)}
                    className="px-3 py-1 bg-green-600 text-gray-800 rounded text-xs hover:bg-green-700"
                  >
                    View
                  </button>
                  <button
                    onClick={() => downloadDocument(resolution)}
                    className="px-3 py-1 bg-purple-600 text-gray-800 rounded text-xs hover:bg-purple-700"
                  >
                    � Download PDF
                  </button>
                  <button
                    onClick={() => printDocument(resolution)}
                    className="px-3 py-1 bg-orange-600 text-gray-800 rounded text-xs hover:bg-orange-700"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => handleDelete(resolution._id)}
                    className="px-3 py-1 bg-red-600 text-gray-800 rounded text-xs hover:bg-red-700"
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
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Resolution Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Public
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {resolutions.map((resolution) => (
                <tr key={resolution._id} className="hover:bg-gray-200 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-800">{resolution.resolutionNumber}</div>
                    <div className="text-sm text-gray-400">{resolution.series}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-800 max-w-xs truncate">{resolution.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      resolution.status === 'Approved' 
                        ? 'bg-green-900 text-green-200' 
                        : resolution.status === 'Pending'
                        ? 'bg-yellow-900 text-yellow-200'
                        : 'bg-gray-700 text-gray-800'
                    }`}>
                      {resolution.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      resolution.isPublic 
                        ? 'bg-blue-900 text-blue-200' 
                        : 'bg-gray-700 text-gray-800'
                    }`}>
                      {resolution.isPublic ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(resolution)}
                        className="text-blue-400 hover:text-blue-300 font-medium"
                      >
                        Edit
                      </button>
                      <span className="text-gray-400">|</span>
                      <button
                        onClick={() => viewDocument(resolution)}
                        className="text-green-400 hover:text-green-300 font-medium"
                      >
                        View
                      </button>
                      <span className="text-gray-400">|</span>
                      <button
                        onClick={() => downloadDocument(resolution)}
                        className="text-purple-400 hover:text-purple-300 font-medium"
                      >
                        � Download PDF
                      </button>
                      <span className="text-gray-400">|</span>
                      <button
                        onClick={() => printDocument(resolution)}
                        className="text-orange-400 hover:text-orange-300 font-medium"
                      >
                        Print
                      </button>
                      {resolution.scannedCopy && (
                        <>
                          <span className="text-gray-400">|</span>
                          <a
                            href={`http://localhost:5000/${resolution.scannedCopy}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 font-medium"
                          >
                            Scanned
                          </a>
                        </>
                      )}
                      <span className="text-gray-400">|</span>
                      <button
                        onClick={() => handleDelete(resolution._id)}
                        className="text-red-400 hover:text-red-300 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {resolutions.length === 0 && (
        <div className="bg-white rounded-xl shadow-xl border border-gray-300 p-12 text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No resolutions yet</h3>
          <p className="text-gray-400">Create your first resolution to get started</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-7xl mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingResolution ? 'Edit Resolution' : 'Create New Resolution'}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Section */}
              <div>
                <form onSubmit={handleSubmit}>
                  {/* Template Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-white mb-1">
                      Select Template
                      {editingResolution && editingResolution.templateId && (
                        <span className="ml-2 text-xs text-yellow-400">(Template is locked for this resolution)</span>
                      )}
                    </label>
                    {editingResolution && editingResolution.templateId ? (
                      <div className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        {(() => {
                          // Handle both string ID and populated template object
                          if (typeof editingResolution.templateId === 'object' && editingResolution.templateId !== null) {
                            // It's a populated template object
                            return editingResolution.templateId.templateName || 'Template ' + editingResolution.templateId._id;
                          } else {
                            // It's a string ID
                            const templateId = editingResolution.templateId as string;
                            const foundTemplate = templates.find(t => t._id === templateId);
                            return foundTemplate?.templateName || 'Template ' + templateId;
                          }
                        })()}
                      </div>
                    ) : (
                      <select
                        value={formData.templateId}
                        onChange={(e) => setFormData({...formData, templateId: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">Select a template...</option>
                        {templates.map((template) => (
                          <option key={template._id} value={template._id}>
                            {template.templateName || 'Template ' + template._id}
                          </option>
                        ))}
                      </select>
                    )}
                    {editingResolution && editingResolution.templateId && (
                      <p className="text-xs text-gray-400 mt-1">Template cannot be changed once a resolution is created with a template.</p>
                    )}
                  </div>

                  {/* Paper Size Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-white mb-1">
                      Paper Size
                    </label>
                    <select
                      value={formData.paperSize || 'A4'}
                      onChange={(e) => setFormData({...formData, paperSize: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                      <option value="Legal">Legal</option>
                    </select>
                  </div>

                  {/* Title Section - Individual Bordered Boxes */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Title Section</h4>
                    
                    {/* Resolution Number Box */}
                    <div className="mb-4 p-3 border-2 border-gray-600 rounded-lg bg-gray-800">
                      <label className="block text-sm font-medium text-white mb-2">RESOLUTION NO.</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          required
                          value={formData.resolutionNumber}
                          onChange={(e) => setFormData({...formData, resolutionNumber: e.target.value})}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Enter resolution number..."
                        />
                        <div className="flex gap-1">
                          <input
                            type="number"
                            value={formData.resolutionNumberFormat.fontSize}
                            onChange={(e) => setFormData({...formData, resolutionNumberFormat: {...formData.resolutionNumberFormat, fontSize: parseInt(e.target.value) || 12}})}
                            className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            placeholder="Size"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, resolutionNumberFormat: {...formData.resolutionNumberFormat, isBold: !formData.resolutionNumberFormat.isBold}})}
                            className={`px-2 py-1 rounded text-sm ${formData.resolutionNumberFormat.isBold ? 'bg-yellow-600' : 'bg-gray-600'} text-white font-bold`}
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, resolutionNumberFormat: {...formData.resolutionNumberFormat, isUnderline: !formData.resolutionNumberFormat.isUnderline}})}
                            className={`px-2 py-1 rounded text-sm ${formData.resolutionNumberFormat.isUnderline ? 'bg-yellow-600' : 'bg-gray-600'} text-white underline`}
                          >
                            U
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Series Box */}
                    <div className="mb-4 p-3 border-2 border-gray-600 rounded-lg bg-gray-800">
                      <label className="block text-sm font-medium text-white mb-2">Series</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          required
                          value={formData.series}
                          onChange={(e) => setFormData({...formData, series: e.target.value})}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Enter series..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Present Box */}
                  <div className="mb-6 p-3 border-2 border-gray-600 rounded-lg bg-gray-800">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-white">Present</label>
                      <button
                        type="button"
                        onClick={addPresentMember}
                        className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                      >
                        Add Member
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.present.map((member, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => updatePresentMember(index, 'name', e.target.value)}
                              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              placeholder="Name"
                            />
                            <input
                              type="text"
                              value={member.position}
                              onChange={(e) => updatePresentMember(index, 'position', e.target.value)}
                              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              placeholder="Position"
                            />
                            <button
                              type="button"
                              onClick={() => removePresentMember(index)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1"></div>
                            <input
                              type="text"
                              value={member.position2 || ''}
                              onChange={(e) => updatePresentMember(index, 'position2', e.target.value)}
                              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              placeholder="Second Position (Optional)"
                            />
                            <div className="w-20"></div>
                          </div>
                        </div>
                      ))}
                      {formData.present.length === 0 && (
                        <div className="text-gray-400 text-center py-4">No present members added</div>
                      )}
                    </div>
                  </div>

                  {/* Absent Box */}
                  <div className="mb-6 p-3 border-2 border-gray-600 rounded-lg bg-gray-800">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-white">Absent</label>
                      <button
                        type="button"
                        onClick={addAbsentMember}
                        className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                      >
                        Add Member
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.absent.map((member, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => updateAbsentMember(index, 'name', e.target.value)}
                              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              placeholder="Name"
                            />
                            <input
                              type="text"
                              value={member.position}
                              onChange={(e) => updateAbsentMember(index, 'position', e.target.value)}
                              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              placeholder="Position"
                            />
                            <button
                              type="button"
                              onClick={() => removeAbsentMember(index)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1"></div>
                            <input
                              type="text"
                              value={member.position2 || ''}
                              onChange={(e) => updateAbsentMember(index, 'position2', e.target.value)}
                              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              placeholder="Second Position (Optional)"
                            />
                            <div className="w-20"></div>
                          </div>
                        </div>
                      ))}
                      {formData.absent.length === 0 && (
                        <div className="text-gray-400 text-center py-4">No absent members added</div>
                      )}
                    </div>
                  </div>

                  {/* Main Content Box */}
                  <div className="mb-6 p-3 border-2 border-gray-600 rounded-lg bg-gray-800">
                    <label className="block text-sm font-medium text-white mb-2">Main Content</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className="mb-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, content: formData.content + '\n• '})}
                            className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
                          >
                            • Bullet
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, content: formData.content + '\n1. '})}
                            className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
                          >
                            1. Number
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, content: formData.content + '\n- '})}
                            className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
                          >
                            - Dash
                          </button>
                        </div>
                        <textarea
                          required
                          rows={8}
                          value={formData.content}
                          onChange={(e) => setFormData({...formData, content: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Enter resolution content..."
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <input
                          type="number"
                          value={formData.contentFormat.fontSize}
                          onChange={(e) => setFormData({...formData, contentFormat: {...formData.contentFormat, fontSize: parseInt(e.target.value) || 12}})}
                          className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          placeholder="Size"
                        />
                        <select
                          value={formData.contentFormat.fontFamily || 'Arial'}
                          onChange={(e) => setFormData({...formData, contentFormat: {...formData.contentFormat, fontFamily: e.target.value}})}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Calibri">Calibri</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Georgia">Georgia</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, contentFormat: {...formData.contentFormat, isBold: !formData.contentFormat.isBold}})}
                          className={`px-2 py-1 rounded text-sm ${formData.contentFormat.isBold ? 'bg-yellow-600' : 'bg-gray-600'} text-white font-bold`}
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, contentFormat: {...formData.contentFormat, isUnderline: !formData.contentFormat.isUnderline}})}
                          className={`px-2 py-1 rounded text-sm ${formData.contentFormat.isUnderline ? 'bg-yellow-600' : 'bg-gray-600'} text-white underline`}
                        >
                          U
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Second Main Content Box */}
                  <div className="mb-6 p-3 border-2 border-gray-600 rounded-lg bg-gray-800">
                    <label className="block text-sm font-medium text-white mb-2">Second Main Content</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className="mb-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, secondContent: formData.secondContent + '\n• '})}
                            className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
                          >
                            • Bullet
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, secondContent: formData.secondContent + '\n1. '})}
                            className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
                          >
                            1. Number
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, secondContent: formData.secondContent + '\n- '})}
                            className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
                          >
                            - Dash
                          </button>
                        </div>
                        <textarea
                          rows={8}
                          value={formData.secondContent}
                          onChange={(e) => setFormData({...formData, secondContent: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Enter second resolution content..."
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <input
                          type="number"
                          value={formData.secondContentFormat.fontSize}
                          onChange={(e) => setFormData({...formData, secondContentFormat: {...formData.secondContentFormat, fontSize: parseInt(e.target.value) || 12}})}
                          className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          placeholder="Size"
                        />
                        <select
                          value={formData.secondContentFormat.fontFamily || 'Arial'}
                          onChange={(e) => setFormData({...formData, secondContentFormat: {...formData.secondContentFormat, fontFamily: e.target.value}})}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Calibri">Calibri</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Georgia">Georgia</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, secondContentFormat: {...formData.secondContentFormat, isBold: !formData.secondContentFormat.isBold}})}
                          className={`px-2 py-1 rounded text-sm ${formData.secondContentFormat.isBold ? 'bg-yellow-600' : 'bg-gray-600'} text-white font-bold`}
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, secondContentFormat: {...formData.secondContentFormat, isUnderline: !formData.secondContentFormat.isUnderline}})}
                          className={`px-2 py-1 rounded text-sm ${formData.secondContentFormat.isUnderline ? 'bg-yellow-600' : 'bg-gray-600'} text-white underline`}
                        >
                          U
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status and File Upload */}
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
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Is Public
                      </label>
                      <div className="flex items-center h-10">
                        <input
                          type="checkbox"
                          checked={formData.isPublic}
                          onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                          className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                        />
                        <span className="ml-2 text-white">Make public</span>
                      </div>
                    </div>
                  </div>

              {/* Signatories Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-white">Signatories</h4>
                  <button
                    type="button"
                    onClick={addSignatory}
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                  >
                    Add Signatory
                  </button>
                </div>
                
                {/* Global Signatories Formatting Controls */}
                <div className="mb-4 p-3 border-2 border-gray-600 rounded-lg bg-gray-800">
                  <h5 className="text-sm font-medium text-white mb-2">Default Signatories Formatting</h5>
                  <div className="flex gap-2 items-center flex-wrap">
                    <select
                      value={formData.signatoriesFormat.alignment}
                      onChange={(e) => setFormData({...formData, signatoriesFormat: {...formData.signatoriesFormat, alignment: e.target.value as any}})}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    >
                      <option value="Left">Left</option>
                      <option value="Center">Center</option>
                      <option value="Right">Right</option>
                      <option value="Justify">Justify</option>
                    </select>
                    
                    <input
                      type="number"
                      value={formData.signatoriesFormat.fontSize}
                      onChange={(e) => setFormData({...formData, signatoriesFormat: {...formData.signatoriesFormat, fontSize: parseInt(e.target.value) || 12}})}
                      className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      placeholder="Size"
                    />
                    
                    <select
                      value={formData.signatoriesFormat.fontFamily}
                      onChange={(e) => setFormData({...formData, signatoriesFormat: {...formData.signatoriesFormat, fontFamily: e.target.value}})}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Calibri">Calibri</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Georgia">Georgia</option>
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, signatoriesFormat: {...formData.signatoriesFormat, isBold: !formData.signatoriesFormat.isBold}})}
                      className={`px-2 py-1 rounded text-sm ${formData.signatoriesFormat.isBold ? 'bg-yellow-600' : 'bg-gray-600'} text-white font-bold`}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, signatoriesFormat: {...formData.signatoriesFormat, isUnderline: !formData.signatoriesFormat.isUnderline}})}
                      className={`px-2 py-1 rounded text-sm ${formData.signatoriesFormat.isUnderline ? 'bg-yellow-600' : 'bg-gray-600'} text-white underline`}
                    >
                      U
                    </button>
                  </div>
                </div>
                
                {formData.signatories.map((signatory, index) => (
                  <div key={index} className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">Name</label>
                        <input
                          type="text"
                          placeholder="Enter name"
                          value={signatory.name}
                          onChange={(e) => updateSignatory(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
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
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-white mb-1">Optional Text (appears below position)</label>
                      <input
                        type="text"
                        placeholder="Enter optional text (e.g., Committee Chair)"
                        value={signatory.optionalText || ''}
                        onChange={(e) => updateSignatory(index, 'optionalText', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <select
                        value={signatory.alignment}
                        onChange={(e) => updateSignatory(index, 'alignment', e.target.value)}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="Left">Left</option>
                        <option value="Center">Center</option>
                        <option value="Right">Right</option>
                        <option value="Justify">Justify</option>
                      </select>
                      
                      <input
                        type="number"
                        placeholder="Size"
                        value={signatory.fontSize}
                        onChange={(e) => updateSignatory(index, 'fontSize', parseInt(e.target.value) || 14)}
                        className="w-16 px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      />
                      
                      <select
                        value={signatory.fontFamily || 'Arial'}
                        onChange={(e) => updateSignatory(index, 'fontFamily', e.target.value)}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Calibri">Calibri</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Georgia">Georgia</option>
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
                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 text-center">
                    <p className="text-gray-400">No signatories added. Click "Add Signatory" to add one.</p>
                  </div>
                )}
              </div>

              {/* Attested By Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-white">Attested By</h4>
                  <button
                    type="button"
                    onClick={addAttestedBy}
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                  >
                    Add Attested By
                  </button>
                </div>
                
                {/* Global Attested By Formatting Controls */}
                <div className="mb-4 p-3 border-2 border-gray-600 rounded-lg bg-gray-800">
                  <h5 className="text-sm font-medium text-white mb-2">Attested By Formatting</h5>
                  <div className="flex gap-2 items-center flex-wrap">
                    <select
                      value={formData.attestedByFormat.alignment}
                      onChange={(e) => setFormData({...formData, attestedByFormat: {...formData.attestedByFormat, alignment: e.target.value as any}})}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    >
                      <option value="Left">Left</option>
                      <option value="Center">Center</option>
                      <option value="Right">Right</option>
                      <option value="Justify">Justify</option>
                    </select>
                    
                    <input
                      type="number"
                      value={formData.attestedByFormat.fontSize}
                      onChange={(e) => setFormData({...formData, attestedByFormat: {...formData.attestedByFormat, fontSize: parseInt(e.target.value) || 12}})}
                      className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      placeholder="Size"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, attestedByFormat: {...formData.attestedByFormat, isBold: !formData.attestedByFormat.isBold}})}
                      className={`px-2 py-1 rounded text-sm ${formData.attestedByFormat.isBold ? 'bg-yellow-600' : 'bg-gray-600'} text-white font-bold`}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, attestedByFormat: {...formData.attestedByFormat, isUnderline: !formData.attestedByFormat.isUnderline}})}
                      className={`px-2 py-1 rounded text-sm ${formData.attestedByFormat.isUnderline ? 'bg-yellow-600' : 'bg-gray-600'} text-white underline`}
                    >
                      U
                    </button>
                  </div>
                </div>
                
                {/* Attested By List */}
                {formData.attestedBy.map((attested, index) => (
                  <div key={index} className="mb-4 p-3 border-2 border-gray-600 rounded-lg bg-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">Name</label>
                        <input
                          type="text"
                          value={attested.name}
                          onChange={(e) => updateAttestedBy(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                          placeholder="Enter name..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">Position</label>
                        <input
                          type="text"
                          value={attested.position}
                          onChange={(e) => updateAttestedBy(index, 'position', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                          placeholder="Enter position..."
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-white mb-1">Optional Text (appears below position)</label>
                      <input
                        type="text"
                        value={attested.optionalText || ''}
                        onChange={(e) => updateAttestedBy(index, 'optionalText', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        placeholder="Enter optional text (e.g., Committee Chair)"
                      />
                    </div>
                    <div className="mt-3 flex gap-4 items-center">
                      <label className="flex items-center text-white">
                        <input
                          type="checkbox"
                          checked={attested.isBold || false}
                          onChange={(e) => updateAttestedBy(index, 'isBold', e.target.checked)}
                          className="mr-2"
                        />
                        Bold
                      </label>
                      
                      <label className="flex items-center text-white">
                        <input
                          type="checkbox"
                          checked={attested.isUnderline || false}
                          onChange={(e) => updateAttestedBy(index, 'isUnderline', e.target.checked)}
                          className="mr-2"
                        />
                        Underline
                      </label>
                      
                      {formData.attestedBy.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAttestedBy(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {formData.attestedBy.length === 0 && (
                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 text-center">
                    <p className="text-gray-400">No attested by signatories added. Click "Add Attested By" to add one.</p>
                  </div>
                )}
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
                    className="mr-2 w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                  />
                  <span className="text-sm text-white">Make public</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : (editingResolution ? 'Update' : 'Create')}
                </button>
              </div>
                </form>
              </div>

              {/* Preview Section */}
              <div className="bg-gray-800 rounded-lg p-6 overflow-y-auto max-h-[70vh] border border-gray-600">
                <h4 className="text-lg font-semibold text-white mb-4">Document Preview</h4>
                <div className="border border-gray-600 rounded p-4 bg-white" style={{ minHeight: '600px', backgroundColor: '#ffffff' }}>
                  {renderPreview()}
                </div>
              </div>
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

export default AdminResolutions;
