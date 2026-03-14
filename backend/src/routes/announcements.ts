import express, { Request, Response } from 'express';
import Announcement from '../models/Announcement';

const router = express.Router();

// Get all active announcements (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { priority, isActive } = req.query;
    let filter: any = {};
    
    if (priority) {
      filter.priority = priority;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    } else {
      // By default, only show active announcements
      filter.isActive = true;
    }

    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'fullName')
      .sort({ priority: -1, datePosted: -1 });
    
    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get announcement by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'fullName');
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    res.json(announcement);
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new announcement (admin only)
router.post('/', 
  async (req: Request, res: Response) => {
    try {
      const { title, content, priority } = req.body;
      
      // Manual validation
      if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Title is required' });
      }
      
      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Content is required' });
      }
      
      if (!priority || !['Urgent', 'Normal', 'Low'].includes(priority)) {
        return res.status(400).json({ message: 'Invalid priority' });
      }

      const announcementData = {
        title: title.trim(),
        content: content.trim(),
        priority: priority || 'Normal',
        createdBy: '64a1f2a3b5c6d7e8f9a0b1c2d3e4f5g6h7' // Dummy user ID for testing
      };

      const announcement = new Announcement(announcementData);
      await announcement.save();
      
      res.status(201).json({ message: 'Announcement created successfully', announcement });
    } catch (error) {
      console.error('Create announcement error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update announcement
router.put('/:id', 
  async (req: Request, res: Response) => {
    try {
      const { title, content, priority } = req.body;
      
      // Manual validation
      if (title !== undefined && (!title || !title.trim())) {
        return res.status(400).json({ message: 'Title is required' });
      }
      
      if (content !== undefined && (!content || !content.trim())) {
        return res.status(400).json({ message: 'Content is required' });
      }
      
      if (priority !== undefined && !['Urgent', 'Normal', 'Low'].includes(priority)) {
        return res.status(400).json({ message: 'Invalid priority' });
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title.trim();
      if (content !== undefined) updateData.content = content.trim();
      if (priority !== undefined) updateData.priority = priority;

      const announcement = await Announcement.findByIdAndUpdate(
        req.params.id,
        updateData,
        { returnDocument: 'after' }
      );

      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      res.json({ message: 'Announcement updated successfully', announcement });
    } catch (error) {
      console.error('Update announcement error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete announcement
router.delete('/:id', 
  async (req: Request, res: Response) => {
    try {
      const announcement = await Announcement.findByIdAndDelete(req.params.id);
      
      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
      console.error('Delete announcement error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
