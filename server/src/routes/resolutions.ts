import express from 'express';
import Resolution from '../models/Resolution';
import ResolutionTemplate from '../models/ResolutionTemplate';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all resolutions (public and admin)
router.get('/', async (req, res) => {
  try {
    const { status, isPublic } = req.query;
    let filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (isPublic !== undefined) {
      filter.isPublic = isPublic === 'true';
    }

    const resolutions = await Resolution.find(filter)
      .populate('templateId', 'templateName')
      .sort({ createdAt: -1 });
    
    res.json(resolutions);
  } catch (error) {
    console.error('Get resolutions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get resolution by ID
router.get('/:id', async (req, res) => {
  try {
    const resolution = await Resolution.findById(req.params.id)
      .populate('templateId');
    
    if (!resolution) {
      return res.status(404).json({ message: 'Resolution not found' });
    }
    
    res.json(resolution);
  } catch (error) {
    console.error('Get resolution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new resolution (admin only)
router.post('/', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  [
    body('resolutionNumber').trim().notEmpty().withMessage('Resolution number is required'),
    body('series').trim().notEmpty().withMessage('Series is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('status').optional().isIn(['Draft', 'Pending', 'Approved']).withMessage('Invalid status'),
    body('paperSize').optional().isIn(['A4', 'Letter', 'Legal']).withMessage('Invalid paper size')
  ],
  async (req: AuthRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      console.log('Received resolution data:', req.body);
      console.log('Template ID received:', req.body.templateId);

      const {
        resolutionNumber,
        series,
        title,
        content,
        secondContent,
        present,
        absent,
        templateId,
        status = 'Draft',
        isPublic = false,
        signatories = [],
        paperSize = 'A4',
        pageCount = 1,
        presentFormat,
        absentFormat,
        secondContentFormat,
        signatoriesFormat
      } = req.body;

      const resolutionData = {
        resolutionNumber,
        series,
        title,
        content,
        secondContent,
        present,
        absent,
        templateId,
        status,
        isPublic,
        signatories,
        paperSize,
        pageCount,
        presentFormat: presentFormat || {
          fontSize: 12,
          fontFamily: 'Arial',
          alignment: 'Left',
          isBold: false,
          isUnderline: false
        },
        absentFormat: absentFormat || {
          fontSize: 12,
          fontFamily: 'Arial',
          alignment: 'Left',
          isBold: false,
          isUnderline: false
        },
        secondContentFormat: secondContentFormat || {
          fontSize: 12,
          fontFamily: 'Arial',
          alignment: 'Left',
          isBold: false,
          isUnderline: false
        },
        signatoriesFormat: signatoriesFormat || {
          fontSize: 12,
          fontFamily: 'Arial',
          alignment: 'Left',
          isBold: false,
          isUnderline: false
        }
      };

      console.log('Final resolution data to save:', resolutionData);

      const resolution = new Resolution(resolutionData);
      await resolution.save();
      
      console.log('Saved resolution:', resolution);
      
      res.status(201).json({ message: 'Resolution created successfully', resolution });
    } catch (error) {
      console.error('Create resolution error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update resolution
router.put('/:id', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  [
    body('resolutionNumber').optional().trim().notEmpty().withMessage('Resolution number cannot be empty'),
    body('series').optional().trim().notEmpty().withMessage('Series cannot be empty'),
    body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
    body('status').optional().isIn(['Draft', 'Pending', 'Approved']).withMessage('Invalid status'),
    body('paperSize').optional().isIn(['A4', 'Letter', 'Legal']).withMessage('Invalid paper size')
  ],
  async (req: AuthRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const resolution = await Resolution.findByIdAndUpdate(
        req.params.id,
        req.body,
        { returnDocument: 'after' }
      );

      if (!resolution) {
        return res.status(404).json({ message: 'Resolution not found' });
      }

      res.json({ message: 'Resolution updated successfully', resolution });
    } catch (error) {
      console.error('Update resolution error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Upload scanned copy
router.post('/:id/upload', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  uploadSingle,
  async (req: AuthRequest, res: express.Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const resolution = await Resolution.findByIdAndUpdate(
        req.params.id,
        { scannedCopy: req.file.filename },
        { returnDocument: 'after' }
      );

      if (!resolution) {
        return res.status(404).json({ message: 'Resolution not found' });
      }

      res.json({ message: 'File uploaded successfully', resolution });
    } catch (error) {
      console.error('Upload file error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete resolution
router.delete('/:id', 
  authenticate, 
  authorize(['System Administrator', 'Administrator']),
  async (req, res) => {
    try {
      const resolution = await Resolution.findByIdAndDelete(req.params.id);
      
      if (!resolution) {
        return res.status(404).json({ message: 'Resolution not found' });
      }

      res.json({ message: 'Resolution deleted successfully' });
    } catch (error) {
      console.error('Delete resolution error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get resolution templates
router.get('/templates/all', authenticate, async (req, res) => {
  try {
    const templates = await ResolutionTemplate.find()
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 });
    
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create resolution template
router.post('/templates', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  [
    body('templateName').trim().notEmpty().withMessage('Template name is required'),
    body('content').trim().notEmpty().withMessage('Content is required')
  ],
  async (req: AuthRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const templateData = {
        ...req.body,
        createdBy: req.user?._id
      };

      const template = new ResolutionTemplate(templateData);
      await template.save();
      
      res.status(201).json({ message: 'Template created successfully', template });
    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
