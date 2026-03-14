import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import ResolutionTemplate from '../models/ResolutionTemplate';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Seed default template
router.post('/seed', async (req: Request, res: Response) => {
  try {
    console.log('Seeding default template...');
    
    // Check if template already exists
    const existingTemplate = await ResolutionTemplate.findOne({ templateName: 'Default Resolution Template' });
    if (existingTemplate) {
      return res.json({ message: 'Default template already exists' });
    }
    
    // Create default template
    const defaultTemplate = new ResolutionTemplate({
      templateName: 'Default Resolution Template',
      header: {
        logos: [],
        texts: [
          {
            id: '1',
            text: 'Republic of the Philippines',
            fontSize: 14,
            fontFamily: 'Arial',
            fontColor: '#000000',
            alignment: 'Center',
            isBold: true,
            isUnderline: false,
            isItalic: false
          },
          {
            id: '2',
            text: 'Sangguniang Bayan',
            fontSize: 12,
            fontFamily: 'Arial',
            fontColor: '#000000',
            alignment: 'Center',
            isBold: false,
            isUnderline: false,
            isItalic: false
          }
        ],
        backgroundColor: '#ffffff'
      },
      footer: {
        texts: [
          {
            id: '1',
            text: 'Approved by:',
            fontSize: 12,
            fontFamily: 'Arial',
            fontColor: '#000000',
            alignment: 'Center',
            isBold: false,
            isUnderline: false,
            isItalic: false
          }
        ],
        backgroundColor: '#ffffff'
      },
      content: 'Default resolution content here...',
      paperSize: 'A4',
      defaultPageCount: 1,
      defaultSignatories: [
        {
          name: 'Juan Dela Cruz',
          position: 'Mayor',
          alignment: 'Right',
          isBold: true,
          isUnderline: true
        }
      ]
    });
    
    await defaultTemplate.save();
    console.log('✅ Default template created successfully!');
    
    res.json({ message: 'Default template created successfully', template: defaultTemplate });
    
  } catch (error: any) {
    console.error('❌ Error creating template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all resolution templates
router.get('/', async (req: Request, res: Response) => {
  try {
    const templates = await ResolutionTemplate.find()
      .select('templateName paperSize defaultPageCount header footer createdAt updatedAt')
      .sort({ createdAt: -1 });
    
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get template by ID
router.get('/:id', authenticate, authorize(['System Administrator', 'Administrator', 'Legislative Staff']), async (req: Request, res: Response) => {
  try {
    const template = await ResolutionTemplate.findById(req.params.id)
      .populate('createdBy', 'fullName');
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new resolution template
router.post('/', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  [
    body('templateName').trim().notEmpty().withMessage('Template name is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('paperSize').isIn(['A4', 'Legal', 'Letter']).withMessage('Invalid paper size'),
    body('defaultPageCount').isInt({ min: 1, max: 10 }).withMessage('Page count must be between 1 and 10')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        templateName,
        content,
        header = {},
        footer = {},
        paperSize = 'A4',
        defaultPageCount = 1,
        defaultSignatories = []
      } = req.body;

      const templateData = {
        templateName,
        header: {
          logos: header.logos || [],
          texts: header.texts || [],
          backgroundColor: header.backgroundColor || ''
        },
        footer: {
          texts: footer.texts || [],
          backgroundColor: footer.backgroundColor || ''
        },
        content,
        paperSize,
        defaultPageCount,
        defaultSignatories: Array.isArray(defaultSignatories) ? defaultSignatories : [],
        createdBy: req.user!._id
      };

      const template = new ResolutionTemplate(templateData);
      await template.save();
      
      res.status(201).json({ message: 'Template created successfully', template });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Template name already exists' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update resolution template
router.put('/:id', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  [
    body('templateName').trim().notEmpty().withMessage('Template name is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('paperSize').isIn(['A4', 'Legal', 'Letter']).withMessage('Invalid paper size'),
    body('defaultPageCount').isInt({ min: 1, max: 10 }).withMessage('Page count must be between 1 and 10')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        templateName,
        content,
        header = {},
        footer = {},
        paperSize,
        defaultPageCount,
        defaultSignatories
      } = req.body;

      const template = await ResolutionTemplate.findByIdAndUpdate(
        req.params.id,
        {
          templateName,
          header: {
            logos: header.logos || [],
            texts: header.texts || [],
            backgroundColor: header.backgroundColor || ''
          },
          footer: {
            texts: footer.texts || [],
            backgroundColor: footer.backgroundColor || ''
          },
          content,
          defaultSignatories: Array.isArray(defaultSignatories) ? defaultSignatories : [],
          paperSize,
          defaultPageCount
        },
        { returnDocument: 'after', runValidators: true }
      );

      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      res.json({ message: 'Template updated successfully', template });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Template name already exists' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Upload template logo
router.post('/:id/logo', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  uploadSingle,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const template = await ResolutionTemplate.findById(req.params.id);
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      // Create new logo object
      const newLogo = {
        id: Date.now().toString(),
        url: `/uploads/${req.file.filename}`,
        name: req.file.originalname
      };

      // Add logo to the logos array
      template.header.logos.push(newLogo);
      await template.save();

      res.json({ message: 'Logo uploaded successfully', template });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete resolution template
router.delete('/:id', 
  authenticate, 
  authorize(['System Administrator', 'Administrator']),
  async (req: Request, res: Response) => {
    try {
      const template = await ResolutionTemplate.findByIdAndDelete(req.params.id);
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
