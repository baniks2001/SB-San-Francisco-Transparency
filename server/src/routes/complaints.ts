import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Complaint from '../models/Complaint';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/complaints');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed.'));
    }
  }
});

// Get all complaints (admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let filter: any = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 });
    
    res.json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get complaint by ID (admin)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.json(complaint);
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new complaint (public)
router.post('/', upload.single('evidence'), async (req: Request, res: Response) => {
  try {
    const {
      complainantName,
      contactNumber,
      address,
      email,
      incidentDate,
      incidentTime,
      incidentLocation,
      partiesInvolved,
      description,
      desiredOutcome,
      concernType
    } = req.body;

    // Validation
    if (!incidentDate || !incidentDate.trim()) {
      return res.status(400).json({ message: 'Incident date is required' });
    }
    
    if (!incidentTime || !incidentTime.trim()) {
      return res.status(400).json({ message: 'Incident time is required' });
    }
    
    if (!incidentLocation || !incidentLocation.trim()) {
      return res.status(400).json({ message: 'Incident location is required' });
    }
    
    if (!partiesInvolved || !partiesInvolved.trim()) {
      return res.status(400).json({ message: 'Parties involved is required' });
    }
    
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    
    if (!concernType || !['general', 'misconduct', 'safety', 'child_protection'].includes(concernType)) {
      return res.status(400).json({ message: 'Valid concern type is required' });
    }

    const complaintData: any = {
      complainantName: complainantName?.trim() || undefined,
      contactNumber: contactNumber?.trim() || undefined,
      address: address?.trim() || undefined,
      email: email?.trim() || undefined,
      incidentDate: incidentDate.trim(),
      incidentTime: incidentTime.trim(),
      incidentLocation: incidentLocation.trim(),
      partiesInvolved: partiesInvolved.trim(),
      description: description.trim(),
      desiredOutcome: desiredOutcome?.trim() || undefined,
      concernType: concernType,
      status: 'pending'
    };

    // Add evidence file if uploaded
    if (req.file) {
      complaintData.evidence = `complaints/${req.file.filename}`;
    }

    const complaint = new Complaint(complaintData);
    await complaint.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Complaint submitted successfully', 
      complaint 
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update complaint status (admin)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'in_progress', 'solved'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ 
      success: true, 
      message: 'Complaint status updated successfully', 
      complaint 
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload resolution report (admin)
router.post('/:id/report', upload.single('reportFile'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Report file is required' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { 
        reportFile: `complaints/${req.file.filename}`,
        status: 'solved',
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ 
      success: true, 
      message: 'Resolution report uploaded successfully', 
      complaint 
    });
  } catch (error) {
    console.error('Upload report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete complaint (admin)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Delete associated files if they exist
    if (complaint.evidence) {
      const evidencePath = path.join(__dirname, '../../uploads', complaint.evidence);
      if (fs.existsSync(evidencePath)) {
        fs.unlinkSync(evidencePath);
      }
    }

    if (complaint.reportFile) {
      const reportPath = path.join(__dirname, '../../uploads', complaint.reportFile);
      if (fs.existsSync(reportPath)) {
        fs.unlinkSync(reportPath);
      }
    }

    res.json({ 
      success: true, 
      message: 'Complaint deleted successfully' 
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
