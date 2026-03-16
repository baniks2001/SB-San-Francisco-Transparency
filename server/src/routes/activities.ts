import express from 'express';
import multer from 'multer';
import path from 'path';
import Activity, { IActivity } from '../models/Activity';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/activities'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET all activities
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(50); // Limit to prevent performance issues
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
});

// GET a single activity by ID
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ message: 'Failed to fetch activity' });
  }
});

// POST create a new activity
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, time, location, type, status, organizer, contactInfo, isPublic } = req.body;
    
    // Validate required fields
    if (!title || !description || !date || !time || !location || !type || !status || !organizer) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create activity object
    const activityData: Partial<IActivity> = {
      title,
      description,
      date,
      time,
      location,
      type,
      status,
      organizer,
      contactInfo: contactInfo || '',
      isPublic: isPublic === 'true',
      image: req.file ? req.file.filename : undefined
    };

    const newActivity = new Activity(activityData);
    const savedActivity = await newActivity.save();

    res.status(201).json(savedActivity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ message: 'Failed to create activity' });
  }
});

// PUT update an activity
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, time, location, type, status, organizer, contactInfo, isPublic } = req.body;
    const { id } = req.params;

    // Validate required fields
    if (!title || !description || !date || !time || !location || !type || !status || !organizer) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find and update activity
    const updateData: Partial<IActivity> = {
      title,
      description,
      date,
      time,
      location,
      type,
      status,
      organizer,
      contactInfo: contactInfo || '',
      isPublic: isPublic === 'true'
    };

    // Add new image if uploaded
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedActivity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json(updatedActivity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: 'Failed to update activity' });
  }
});

// DELETE an activity
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedActivity = await Activity.findByIdAndDelete(id);
    
    if (!deletedActivity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Failed to delete activity' });
  }
});

export default router;
