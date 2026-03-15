import express, { Request, Response } from 'express';
import Procurement from '../models/Procurement';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all procurements
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

    const procurements = await Procurement.find(filter)
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 });
    
    res.json(procurements);
  } catch (error) {
    console.error('Get procurements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get procurement by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const procurement = await Procurement.findById(req.params.id)
      .populate('createdBy', 'fullName');
    
    if (!procurement) {
      return res.status(404).json({ message: 'Procurement not found' });
    }
    
    res.json(procurement);
  } catch (error) {
    console.error('Get procurement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new procurement
router.post('/', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  [
    body('procurementNumber').trim().notEmpty().withMessage('Procurement number is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('procurementType').trim().notEmpty().withMessage('Procurement type is required')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const procurementData = {
        ...req.body,
        createdBy: req.user?._id
      };

      const procurement = new Procurement(procurementData);
      await procurement.save();
      
      res.status(201).json({ message: 'Procurement created successfully', procurement });
    } catch (error) {
      console.error('Create procurement error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update procurement
router.put('/:id', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  [
    body('procurementNumber').trim().notEmpty().withMessage('Procurement number is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('procurementType').trim().notEmpty().withMessage('Procurement type is required')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const procurement = await Procurement.findByIdAndUpdate(
        req.params.id,
        req.body,
        { returnDocument: 'after' }
      );

      if (!procurement) {
        return res.status(404).json({ message: 'Procurement not found' });
      }

      res.json({ message: 'Procurement updated successfully', procurement });
    } catch (error) {
      console.error('Update procurement error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Upload document file
router.post('/:id/upload', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  uploadSingle,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const procurement = await Procurement.findByIdAndUpdate(
        req.params.id,
        { documentFile: req.file.filename },
        { returnDocument: 'after' }
      );

      if (!procurement) {
        return res.status(404).json({ message: 'Procurement not found' });
      }

      res.json({ message: 'File uploaded successfully', procurement });
    } catch (error) {
      console.error('Upload file error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete procurement
router.delete('/:id', 
  authenticate, 
  authorize(['System Administrator', 'Administrator']),
  async (req: Request, res: Response) => {
    try {
      const procurement = await Procurement.findByIdAndDelete(req.params.id);
      
      if (!procurement) {
        return res.status(404).json({ message: 'Procurement not found' });
      }

      res.json({ message: 'Procurement deleted successfully' });
    } catch (error) {
      console.error('Delete procurement error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
