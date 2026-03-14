import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import SystemSettings from '../models/SystemSettings';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { uploadSingle, uploadMultiple } from '../middleware/upload';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get system settings (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    let settings = await SystemSettings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = new SystemSettings({
        systemName: 'Sangguniang Bayan Transparency Portal',
        themeColors: {
          primary: '#F59E0B',
          secondary: '#92400E',
          accent: '#FFFFFF',
          background: '#FFFFFF'
        },
        aboutOffice: 'The Sangguniang Bayan serves as the legislative body of San Francisco, Southern Leyte.',
        mission: 'To provide transparent and accountable governance through responsive legislation.',
        vision: 'A progressive municipality with empowered citizens and sustainable development.',
        coreValues: 'Integrity, Transparency, Accountability, Service, Excellence',
        contactInfo: {
          mobileNumbers: [],
          email: '',
          address: ''
        },
        location: 'San Francisco, Southern Leyte',
        officeHours: {
          monday: '8:00 AM - 5:00 PM',
          tuesday: '8:00 AM - 5:00 PM',
          wednesday: '8:00 AM - 5:00 PM',
          thursday: '8:00 AM - 5:00 PM',
          friday: '8:00 AM - 5:00 PM',
          saturday: '8:00 AM - 12:00 PM',
          sunday: 'Closed'
        },
        organizationStructure: [],
        carouselImages: [],
        projectImages: [],
        copyrightText: `© ${new Date().getFullYear()} Sangguniang Bayan, San Francisco, Southern Leyte. All rights reserved.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update system settings (admin only)
router.put('/', 
  authenticate, 
  authorize(['System Administrator', 'Administrator']),
  async (req: AuthRequest, res: Response) => {
    try {
      let settings = await SystemSettings.findOne();
      
      if (!settings) {
        settings = new SystemSettings();
      }

      // Update settings with provided data
      Object.assign(settings, req.body);
      settings.updatedAt = new Date();
      await settings.save();
      
      res.json({ message: 'Settings updated successfully', settings });
    } catch (error) {
      console.error('Update system settings error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Upload system logo
router.post('/logo', 
  authenticate, 
  authorize(['System Administrator']),
  uploadSingle,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      let settings = await SystemSettings.findOne();
      if (!settings) {
        settings = new SystemSettings();
      }

      settings.systemLogo = req.file.filename;
      settings.updatedAt = new Date();
      await settings.save();

      res.json({ message: 'Logo uploaded successfully', settings });
    } catch (error) {
      console.error('Upload logo error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Upload carousel images
router.post('/carousel', 
  authenticate, 
  authorize(['System Administrator']),
  uploadMultiple,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      let settings = await SystemSettings.findOne();
      if (!settings) {
        settings = new SystemSettings();
      }

      const files = req.files as any[];
      const newImages = files.map(file => file.filename);
      settings.carouselImages = [...settings.carouselImages, ...newImages];
      settings.updatedAt = new Date();
      await settings.save();

      res.json({ message: 'Carousel images uploaded successfully', settings });
    } catch (error) {
      console.error('Upload carousel images error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete carousel image
router.delete('/carousel/:imageName', 
  authenticate, 
  authorize(['System Administrator']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { imageName } = req.params;

      let settings = await SystemSettings.findOne();
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      settings.carouselImages = settings.carouselImages.filter(img => img !== imageName);
      settings.updatedAt = new Date();
      await settings.save();

      res.json({ message: 'Carousel image deleted successfully', settings });
    } catch (error) {
      console.error('Delete carousel image error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Upload project images
router.post('/projects', 
  authenticate, 
  authorize(['System Administrator']),
  uploadMultiple,
  [
    body('projectName').trim().notEmpty().withMessage('Project name is required'),
    body('details').trim().notEmpty().withMessage('Project details are required')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const { projectName, details } = req.body;
      const files = req.files as any[];
      
      let settings = await SystemSettings.findOne();
      if (!settings) {
        settings = new SystemSettings();
      }

      const newProjects = files.map(file => ({
        image: file.filename,
        projectName,
        details
      }));

      settings.projectImages = [...settings.projectImages, ...newProjects];
      settings.updatedAt = new Date();
      await settings.save();

      res.json({ message: 'Project images uploaded successfully', settings });
    } catch (error) {
      console.error('Upload project images error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update project image
router.put('/projects/:index', 
  authenticate, 
  authorize(['System Administrator']),
  uploadSingle,
  [
    body('projectName').trim().notEmpty().withMessage('Project name is required'),
    body('details').trim().notEmpty().withMessage('Project details are required')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { index } = req.params;
      const { projectName, details } = req.body;
      const projectIndex = parseInt(Array.isArray(index) ? index[0] : index);

      let settings = await SystemSettings.findOne();
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      if (projectIndex < 0 || projectIndex >= settings.projectImages.length) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Update project details
      settings.projectImages[projectIndex].projectName = projectName;
      settings.projectImages[projectIndex].details = details;

      // Update image if new file uploaded
      if (req.file) {
        settings.projectImages[projectIndex].image = req.file.filename;
      }

      settings.updatedAt = new Date();
      await settings.save();

      res.json({ message: 'Project updated successfully', settings });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete project image
router.delete('/projects/:index', 
  authenticate, 
  authorize(['System Administrator']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { index } = req.params;
      const projectIndex = parseInt(Array.isArray(index) ? index[0] : index);

      let settings = await SystemSettings.findOne();
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      if (projectIndex < 0 || projectIndex >= settings.projectImages.length) {
        return res.status(404).json({ message: 'Project not found' });
      }

      settings.projectImages.splice(projectIndex, 1);
      settings.updatedAt = new Date();
      await settings.save();

      res.json({ message: 'Project deleted successfully', settings });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update organization structure
router.put('/organization', 
  authenticate, 
  authorize(['System Administrator']),
  uploadSingle,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, position, order } = req.body;
      const imageFilename = req.file ? req.file.filename : undefined;

      let settings = await SystemSettings.findOne();
      if (!settings) {
        settings = new SystemSettings();
      }

      // Find if person exists and update, otherwise add new
      const existingIndex = settings.organizationStructure.findIndex(
        person => person.name === name && person.position === position
      );

      const personData = {
        name,
        position,
        image: imageFilename,
        order: parseInt(order)
      };

      if (existingIndex >= 0) {
        // Update existing person
        settings.organizationStructure[existingIndex] = personData;
      } else {
        // Add new person
        settings.organizationStructure.push(personData);
      }

      // Sort by order
      settings.organizationStructure.sort((a, b) => a.order - b.order);
      settings.updatedAt = new Date();
      await settings.save();

      res.json({ message: 'Organization structure updated successfully', settings });
    } catch (error) {
      console.error('Update organization error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete from organization structure
router.delete('/organization/:index', 
  authenticate, 
  authorize(['System Administrator']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { index } = req.params;
      const orgIndex = parseInt(Array.isArray(index) ? index[0] : index);

      let settings = await SystemSettings.findOne();
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      if (orgIndex < 0 || orgIndex >= settings.organizationStructure.length) {
        return res.status(404).json({ message: 'Organization member not found' });
      }

      settings.organizationStructure.splice(orgIndex, 1);
      settings.updatedAt = new Date();
      await settings.save();

      res.json({ message: 'Organization member deleted successfully', settings });
    } catch (error) {
      console.error('Delete organization member error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Upload organization member image
router.post('/organization-image', 
  uploadSingle,
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { index } = req.body;
      let settings = await SystemSettings.findOne();
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      if (settings.organizationStructure && settings.organizationStructure[index]) {
        settings.organizationStructure[index].image = req.file.filename;
        await settings.save();
      }

      res.json({ message: 'Organization member image uploaded successfully' });
    } catch (error) {
      console.error('Upload organization image error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Add project image
router.post('/projects', 
  uploadSingle, 
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { projectName, details } = req.body;
      const settings = await SystemSettings.findOne();
      
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      const newProject = {
        projectName,
        details,
        image: req.file.filename
      };

      settings.projectImages.push(newProject);
      await settings.save();
      
      res.status(201).json({ message: 'Project added successfully', project: newProject });
    } catch (error) {
      console.error('Add project image error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Add announcement
router.post('/announcements', 
  uploadSingle, 
  async (req: Request, res: Response) => {
    try {
      const { title, content, priority } = req.body;
      const settings = await SystemSettings.findOne();
      
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      const newAnnouncement = {
        title,
        content,
        priority: priority || 'Normal',
        image: req.file?.filename,
        createdAt: new Date()
      };

      settings.announcements.push(newAnnouncement);
      await settings.save();
      
      res.status(201).json({ message: 'Announcement added successfully', announcement: newAnnouncement });
    } catch (error) {
      console.error('Add announcement error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update announcement
router.put('/announcements/:index', 
  uploadSingle, 
  async (req: Request, res: Response) => {
    try {
      const { title, content, priority } = req.body;
      const { index } = req.params;
      const settings = await SystemSettings.findOne();
      
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      const announcementIndex = parseInt(index as string);
      if (announcementIndex < 0 || announcementIndex >= settings.announcements.length) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      const announcement = settings.announcements[announcementIndex];
      announcement.title = title || announcement.title;
      announcement.content = content || announcement.content;
      announcement.priority = priority || announcement.priority;
      
      if (req.file) {
        announcement.image = req.file.filename;
      }

      await settings.save();
      
      res.json({ message: 'Announcement updated successfully', announcement });
    } catch (error) {
      console.error('Update announcement error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete announcement
router.delete('/announcements/:index', async (req: Request, res: Response) => {
  try {
    const { index } = req.params;
    const settings = await SystemSettings.findOne();
    
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    const announcementIndex = parseInt(index as string);
    if (announcementIndex < 0 || announcementIndex >= settings.announcements.length) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    settings.announcements.splice(announcementIndex, 1);
    await settings.save();
    
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistics for dashboard
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const Resolution = mongoose.model('Resolution');
    const Ordinance = mongoose.model('Ordinance');
    const Procurement = mongoose.model('Procurement');
    const Budget = mongoose.model('Budget');
    const Vacancy = mongoose.model('Vacancy');
    const Application = mongoose.model('Application');
    const Announcement = mongoose.model('Announcement');

    const [
      resolutionCount,
      ordinanceCount,
      procurementCount,
      budgetCount,
      vacancyCount,
      applicationCount,
      announcementCount
    ] = await Promise.all([
      Resolution.countDocuments(),
      Ordinance.countDocuments(),
      Procurement.countDocuments(),
      Budget.countDocuments(),
      Vacancy.countDocuments(),
      Application.countDocuments(),
      Announcement.countDocuments()
    ]);

    res.json({
      resolutions: resolutionCount,
      ordinances: ordinanceCount,
      procurements: procurementCount,
      budgets: budgetCount,
      vacancies: vacancyCount,
      applications: applicationCount,
      announcements: announcementCount
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
