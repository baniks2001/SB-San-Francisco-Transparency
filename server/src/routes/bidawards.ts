import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import BidAward, { IBidAward } from '../models/BidAward';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/bidawards');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
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
    // Allow both images and documents
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (allowedImageTypes.includes(file.mimetype) || allowedDocTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) and documents (PDF, DOC, DOCX, XLS, XLSX) are allowed'));
    }
  }
});

// GET all bid awards
router.get('/', async (req, res) => {
  try {
    const bidAwards = await BidAward.find().sort({ dateAwarded: -1 });
    res.json(bidAwards);
  } catch (error) {
    console.error('Error fetching bid awards:', error);
    res.status(500).json({ message: 'Error fetching bid awards' });
  }
});

// GET single bid award
router.get('/:id', async (req, res) => {
  try {
    const bidAward = await BidAward.findById(req.params.id);
    if (!bidAward) {
      return res.status(404).json({ message: 'Bid award not found' });
    }
    res.json(bidAward);
  } catch (error) {
    console.error('Error fetching bid award:', error);
    res.status(500).json({ message: 'Error fetching bid award' });
  }
});

// POST create new bid award (protected)
router.post('/', authenticate, authorize(['System Administrator', 'Administrator', 'Legislative Staff']), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]), async (req, res) => {
  try {
    const { awardName, description, contractor, amount, dateAwarded, status } = req.body;

    if (!awardName || !description || !contractor || !amount || !dateAwarded) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const bidAwardData: Partial<IBidAward> = {
      awardName,
      description,
      contractor,
      amount: parseFloat(amount),
      dateAwarded,
      status: status || 'Active'
    };

    // Add image path if file was uploaded
    if (req.files && 'image' in req.files && req.files.image[0]) {
      bidAwardData.image = `bidawards/${req.files.image[0].filename}`;
    }

    // Add document path if file was uploaded
    if (req.files && 'document' in req.files && req.files.document[0]) {
      bidAwardData.document = `bidawards/${req.files.document[0].filename}`;
    }

    const newBidAward = new BidAward(bidAwardData);
    const savedBidAward = await newBidAward.save();

    res.status(201).json(savedBidAward);
  } catch (error) {
    console.error('Error creating bid award:', error);
    res.status(500).json({ message: 'Error creating bid award' });
  }
});

// PUT update bid award (protected)
router.put('/:id', authenticate, authorize(['System Administrator', 'Administrator', 'Legislative Staff']), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]), async (req, res) => {
  try {
    const { awardName, description, contractor, amount, dateAwarded, status } = req.body;

    const bidAward = await BidAward.findById(req.params.id);
    if (!bidAward) {
      return res.status(404).json({ message: 'Bid award not found' });
    }

    // Update fields
    if (awardName) bidAward.awardName = awardName;
    if (description) bidAward.description = description;
    if (contractor) bidAward.contractor = contractor;
    if (amount) bidAward.amount = parseFloat(amount);
    if (dateAwarded) bidAward.dateAwarded = dateAwarded;
    if (status) bidAward.status = status;

    // Handle image update
    if (req.files && 'image' in req.files && req.files.image[0]) {
      // Delete old image if it exists
      if (bidAward.image) {
        const oldImagePath = path.join(__dirname, '../uploads', bidAward.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      // Set new image path
      bidAward.image = `bidawards/${req.files.image[0].filename}`;
    }

    // Handle document update
    if (req.files && 'document' in req.files && req.files.document[0]) {
      // Delete old document if it exists
      if (bidAward.document) {
        const oldDocPath = path.join(__dirname, '../uploads', bidAward.document);
        if (fs.existsSync(oldDocPath)) {
          fs.unlinkSync(oldDocPath);
        }
      }
      // Set new document path
      bidAward.document = `bidawards/${req.files.document[0].filename}`;
    }

    const updatedBidAward = await bidAward.save();
    res.json(updatedBidAward);
  } catch (error) {
    console.error('Error updating bid award:', error);
    res.status(500).json({ message: 'Error updating bid award' });
  }
});

// DELETE bid award (protected)
router.delete('/:id', authenticate, authorize(['System Administrator', 'Administrator']), async (req, res) => {
  try {
    const bidAward = await BidAward.findById(req.params.id);
    if (!bidAward) {
      return res.status(404).json({ message: 'Bid award not found' });
    }

    // Delete associated image if it exists
    if (bidAward.image) {
      const imagePath = path.join(__dirname, '../uploads', bidAward.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete associated document if it exists
    if (bidAward.document) {
      const docPath = path.join(__dirname, '../uploads', bidAward.document);
      if (fs.existsSync(docPath)) {
        fs.unlinkSync(docPath);
      }
    }

    await BidAward.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bid award deleted successfully' });
  } catch (error) {
    console.error('Error deleting bid award:', error);
    res.status(500).json({ message: 'Error deleting bid award' });
  }
});

export default router;
