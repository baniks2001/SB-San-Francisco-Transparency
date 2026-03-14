import express, { Request, Response } from 'express';
import SystemSettings from '../models/SystemSettings';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { uploadSingle, uploadMultiple } from '../middleware/upload';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get system settings
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
        contactInfo: {
          mobileNumbers: [],
          email: '',
          address: ''
        },
        organizationStructure: [],
        carouselImages: [],
        projectImages: []
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
  authorize(['System Administrator']),
  async (req: AuthRequest, res: Response) => {
    try {
      let settings = await SystemSettings.findOne();
      
      if (!settings) {
        settings = new SystemSettings();
      }

      // Update settings with provided data
      Object.assign(settings, req.body);
      await settings.save();
      
      res.json({ message: 'System settings updated successfully', settings });
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

      const newImages = (req.files as any[]).map(file => file.filename);
      settings.carouselImages = [...settings.carouselImages, ...newImages];
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

      let settings = await SystemSettings.findOne();
      if (!settings) {
        settings = new SystemSettings();
      }

      const { projectName, details } = req.body;
      const imageFilename = (req.files as any[])[0].filename;

      settings.projectImages.push({
        image: imageFilename,
        projectName,
        details
      });
      await settings.save();

      res.json({ message: 'Project image uploaded successfully', settings });
    } catch (error) {
      console.error('Upload project image error:', error);
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

      let settings = await SystemSettings.findOne();
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      const projectIndex = parseInt(Array.isArray(index) ? index[0] : index);
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

      let settings = await SystemSettings.findOne();
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      const projectIndex = parseInt(Array.isArray(index) ? index[0] : index);
      if (projectIndex < 0 || projectIndex >= settings.projectImages.length) {
        return res.status(404).json({ message: 'Project not found' });
      }

      settings.projectImages.splice(projectIndex, 1);
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

      if (existingIndex >= 0) {
        // Update existing
        settings.organizationStructure[existingIndex].name = name;
        settings.organizationStructure[existingIndex].position = position;
        settings.organizationStructure[existingIndex].order = order;
        if (imageFilename) {
          settings.organizationStructure[existingIndex].image = imageFilename;
        }
      } else {
        // Add new
        settings.organizationStructure.push({
          name,
          position,
          order,
          image: imageFilename
        });
      }

      // Sort by order
      settings.organizationStructure.sort((a, b) => a.order - b.order);

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

      let settings = await SystemSettings.findOne();
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      const orgIndex = parseInt(Array.isArray(index) ? index[0] : index);
      if (orgIndex < 0 || orgIndex >= settings.organizationStructure.length) {
        return res.status(404).json({ message: 'Organization member not found' });
      }

      settings.organizationStructure.splice(orgIndex, 1);
      await settings.save();

      res.json({ message: 'Organization member deleted successfully', settings });
    } catch (error) {
      console.error('Delete organization member error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
