import express, { Request, Response } from 'express';
import Vacancy from '../models/Vacancy';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all active vacancies (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let filter: any = {};
    
    if (status) {
      filter.status = status;
    } else {
      // By default, only show active vacancies
      filter.status = 'Active';
    }

    const vacancies = await Vacancy.find(filter)
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 });
    
    res.json(vacancies);
  } catch (error) {
    console.error('Get vacancies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vacancy by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id)
      .populate('createdBy', 'fullName');
    
    if (!vacancy) {
      return res.status(404).json({ message: 'Vacancy not found' });
    }
    
    res.json(vacancy);
  } catch (error) {
    console.error('Get vacancy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new vacancy (admin only)
router.post('/', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  [
    body('jobTitle').trim().notEmpty().withMessage('Job title is required'),
    body('position').trim().notEmpty().withMessage('Position is required'),
    body('estimatedSalary').isNumeric().withMessage('Estimated salary must be a number'),
    body('jobDescription').trim().notEmpty().withMessage('Job description is required'),
    body('qualifications').trim().notEmpty().withMessage('Qualifications are required'),
    body('requirements').trim().notEmpty().withMessage('Requirements are required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('employmentType').isIn(['Full-time', 'Part-time', 'Contract', 'Temporary']).withMessage('Invalid employment type')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const vacancyData = {
        ...req.body,
        createdBy: req.user?._id
      };

      const vacancy = new Vacancy(vacancyData);
      await vacancy.save();
      
      res.status(201).json({ message: 'Vacancy created successfully', vacancy });
    } catch (error) {
      console.error('Create vacancy error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update vacancy
router.put('/:id', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  [
    body('jobTitle').trim().notEmpty().withMessage('Job title is required'),
    body('position').trim().notEmpty().withMessage('Position is required'),
    body('estimatedSalary').isNumeric().withMessage('Estimated salary must be a number'),
    body('jobDescription').trim().notEmpty().withMessage('Job description is required'),
    body('qualifications').trim().notEmpty().withMessage('Qualifications are required'),
    body('requirements').trim().notEmpty().withMessage('Requirements are required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('employmentType').isIn(['Full-time', 'Part-time', 'Contract', 'Temporary']).withMessage('Invalid employment type')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const vacancy = await Vacancy.findByIdAndUpdate(
        req.params.id,
        req.body,
        { returnDocument: 'after' }
      );

      if (!vacancy) {
        return res.status(404).json({ message: 'Vacancy not found' });
      }

      res.json({ message: 'Vacancy updated successfully', vacancy });
    } catch (error) {
      console.error('Update vacancy error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete vacancy
router.delete('/:id', 
  authenticate, 
  authorize(['System Administrator', 'Administrator']),
  async (req: Request, res: Response) => {
    try {
      const vacancy = await Vacancy.findByIdAndDelete(req.params.id);
      
      if (!vacancy) {
        return res.status(404).json({ message: 'Vacancy not found' });
      }

      res.json({ message: 'Vacancy deleted successfully' });
    } catch (error) {
      console.error('Delete vacancy error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
