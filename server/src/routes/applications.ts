import express, { Request, Response } from 'express';
import * as multer from 'multer';
import Application from '../models/Application';
import Vacancy from '../models/Vacancy';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all applications (admin only)
router.get('/', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  async (req: Request, res: Response) => {
    try {
      const { status, vacancyId } = req.query;
      let filter: any = {};
      
      if (status) {
        filter.status = status;
      }
      
      if (vacancyId) {
        filter.vacancyId = vacancyId;
      }

      const applications = await Application.find(filter)
        .populate('vacancyId', 'jobTitle position department')
        .sort({ createdAt: -1 });
      
      res.json(applications);
    } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get application by ID (admin only)
router.get('/:id', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  async (req: Request, res: Response) => {
    try {
      const application = await Application.findById(req.params.id)
        .populate('vacancyId', 'jobTitle position department estimatedSalary');
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      res.json(application);
    } catch (error) {
      console.error('Get application error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Submit new application (public)
router.post('/', 
  uploadMultiple,
  [
    body('vacancyId').notEmpty().withMessage('Vacancy ID is required'),
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('age').isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
    body('mobileNumber').trim().notEmpty().withMessage('Mobile number is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('address').trim().notEmpty().withMessage('Address is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if vacancy exists and is active
      const vacancy = await Vacancy.findById(req.body.vacancyId);
      if (!vacancy || vacancy.status !== 'Active') {
        return res.status(400).json({ message: 'Vacancy not available' });
      }

      const files = req.files as any[];
      const applicationData = {
        ...req.body,
        resume: files && files.length > 0 ? files[0].filename : undefined,
        certificates: files && files.length > 1 
          ? files.slice(1).map((file: any) => file.filename) 
          : []
      };

      const application = new Application(applicationData);
      await application.save();
      
      res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (error) {
      console.error('Create application error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update application status (admin only)
router.put('/:id/status', 
  authenticate, 
  authorize(['System Administrator', 'Administrator', 'Legislative Staff']),
  [
    body('status').isIn(['Under Review', 'Hired', 'Rejected']).withMessage('Invalid status'),
    body('notes').optional().trim()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, notes } = req.body;

      const application = await Application.findByIdAndUpdate(
        req.params.id,
        { status, notes },
        { returnDocument: 'after' }
      ).populate('vacancyId', 'jobTitle position');

      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      res.json({ message: 'Application status updated successfully', application });
    } catch (error) {
      console.error('Update application status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete application (admin only)
router.delete('/:id', 
  authenticate, 
  authorize(['System Administrator', 'Administrator']),
  async (req: Request, res: Response) => {
    try {
      const application = await Application.findByIdAndDelete(req.params.id);
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      res.json({ message: 'Application deleted successfully' });
    } catch (error) {
      console.error('Delete application error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
