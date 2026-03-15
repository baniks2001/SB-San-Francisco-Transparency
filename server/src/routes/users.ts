import express, { Request, Response } from 'express';
import User from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all users (System Administrator only)
router.get('/', authenticate, authorize(['System Administrator']), async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (System Administrator only)
router.post('/', 
  authenticate, 
  authorize(['System Administrator']),
  uploadSingle,
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('fullName').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('role').isIn(['System Administrator', 'Administrator', 'Legislative Staff']).withMessage('Invalid role'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, fullName, role, password, permissions } = req.body;

      // Check if username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const profileImage = req.file ? req.file.filename : '';

      const user = new User({
        username,
        fullName,
        role,
        password,
        permissions: permissions ? JSON.parse(permissions) : [],
        profileImage
      });

      await user.save();
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update user (System Administrator only)
router.put('/:id', 
  authenticate, 
  authorize(['System Administrator']),
  uploadSingle,
  [
    body('fullName').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('role').isIn(['System Administrator', 'Administrator', 'Legislative Staff']).withMessage('Invalid role')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { fullName, role, permissions, isActive } = req.body;
      const userId = req.params.id;

      const updateData: any = { fullName, role };
      
      if (permissions) {
        updateData.permissions = JSON.parse(permissions);
      }
      
      if (isActive !== undefined) {
        updateData.isActive = isActive;
      }

      if (req.file) {
        updateData.profileImage = req.file.filename;
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { returnDocument: 'after' }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User updated successfully', user });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete user (System Administrator only)
router.delete('/:id', authenticate, authorize(['System Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    
    // Prevent deletion of self
    if (userId === req.user?._id?.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID (System Administrator only)
router.get('/:id', authenticate, authorize(['System Administrator']), async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
