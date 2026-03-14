import express, { Request, Response } from 'express';
import Ordinance from '../models/Ordinance';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all ordinances
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, isPublic } = req.query;
    let filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (isPublic !== undefined) {
      filter.isPublic = isPublic === 'true';
    }

    const ordinances = await Ordinance.find(filter)
      .sort({ createdAt: -1 });
    
    res.json(ordinances);
  } catch (error) {
    console.error('Get ordinances error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ordinance by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ordinance = await Ordinance.findById(req.params.id);
    
    if (!ordinance) {
      return res.status(404).json({ message: 'Ordinance not found' });
    }
    
    res.json(ordinance);
  } catch (error) {
    console.error('Get ordinance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new ordinance
router.post('/', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  [
    body('ordinanceNumber').trim().notEmpty().withMessage('Ordinance number is required'),
    body('series').trim().notEmpty().withMessage('Series is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('author').trim().notEmpty().withMessage('Author is required')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const ordinanceData = {
        ...req.body,
        createdBy: req.user?._id
      };

      const ordinance = new Ordinance(ordinanceData);
      await ordinance.save();
      
      res.status(201).json({ message: 'Ordinance created successfully', ordinance });
    } catch (error) {
      console.error('Create ordinance error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update ordinance
router.put('/:id', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  [
    body('ordinanceNumber').trim().notEmpty().withMessage('Ordinance number is required'),
    body('series').trim().notEmpty().withMessage('Series is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const ordinance = await Ordinance.findByIdAndUpdate(
        req.params.id,
        req.body,
        { returnDocument: 'after' }
      );

      if (!ordinance) {
        return res.status(404).json({ message: 'Ordinance not found' });
      }

      res.json({ message: 'Ordinance updated successfully', ordinance });
    } catch (error) {
      console.error('Update ordinance error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Upload scanned copy
router.post('/:id/upload', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  uploadSingle,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const ordinance = await Ordinance.findByIdAndUpdate(
        req.params.id,
        { scannedCopy: req.file.filename },
        { returnDocument: 'after' }
      );

      if (!ordinance) {
        return res.status(404).json({ message: 'Ordinance not found' });
      }

      res.json({ message: 'File uploaded successfully', ordinance });
    } catch (error) {
      console.error('Upload file error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete ordinance
router.delete('/:id', 
  authenticate, 
  authorize(['System Administrator', 'Administrator']),
  async (req: Request, res: Response) => {
    try {
      const ordinance = await Ordinance.findByIdAndDelete(req.params.id);
      
      if (!ordinance) {
        return res.status(404).json({ message: 'Ordinance not found' });
      }

      res.json({ message: 'Ordinance deleted successfully' });
    } catch (error) {
      console.error('Delete ordinance error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
