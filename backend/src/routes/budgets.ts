import express, { Request, Response } from 'express';
import Budget from '../models/Budget';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all budgets
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, isPublic, fiscalYear } = req.query;
    let filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (isPublic !== undefined) {
      filter.isPublic = isPublic === 'true';
    }
    
    if (fiscalYear) {
      filter.fiscalYear = fiscalYear;
    }

    const budgets = await Budget.find(filter)
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 });
    
    res.json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get budget by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate('createdBy', 'fullName');
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    res.json(budget);
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new budget
router.post('/', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  [
    body('budgetNumber').trim().notEmpty().withMessage('Budget number is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
    body('allocatedAmount').isNumeric().withMessage('Allocated amount must be a number'),
    body('fiscalYear').trim().notEmpty().withMessage('Fiscal year is required'),
    body('department').trim().notEmpty().withMessage('Department is required')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const budgetData = {
        ...req.body,
        createdBy: req.user?._id
      };

      const budget = new Budget(budgetData);
      await budget.save();
      
      res.status(201).json({ message: 'Budget created successfully', budget });
    } catch (error) {
      console.error('Create budget error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update budget
router.put('/:id', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  [
    body('budgetNumber').trim().notEmpty().withMessage('Budget number is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
    body('allocatedAmount').isNumeric().withMessage('Allocated amount must be a number'),
    body('fiscalYear').trim().notEmpty().withMessage('Fiscal year is required'),
    body('department').trim().notEmpty().withMessage('Department is required')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const budget = await Budget.findByIdAndUpdate(
        req.params.id,
        req.body,
        { returnDocument: 'after' }
      );

      if (!budget) {
        return res.status(404).json({ message: 'Budget not found' });
      }

      res.json({ message: 'Budget updated successfully', budget });
    } catch (error) {
      console.error('Update budget error:', error);
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

      const budget = await Budget.findByIdAndUpdate(
        req.params.id,
        { documentFile: req.file.filename },
        { returnDocument: 'after' }
      );

      if (!budget) {
        return res.status(404).json({ message: 'Budget not found' });
      }

      res.json({ message: 'File uploaded successfully', budget });
    } catch (error) {
      console.error('Upload file error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete budget
router.delete('/:id', 
  authenticate, 
  authorize(['System Administrator', 'Administrator']),
  async (req: Request, res: Response) => {
    try {
      const budget = await Budget.findByIdAndDelete(req.params.id);
      
      if (!budget) {
        return res.status(404).json({ message: 'Budget not found' });
      }

      res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
      console.error('Delete budget error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
