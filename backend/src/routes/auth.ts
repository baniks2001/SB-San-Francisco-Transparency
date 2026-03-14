import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if it's the default admin from environment variables
    if (username === process.env.DEFAULT_ADMIN_USERNAME && password === process.env.DEFAULT_ADMIN_PASSWORD) {
      // Check if default admin exists in database, create if not
      let adminUser = await User.findOne({ username: process.env.DEFAULT_ADMIN_USERNAME });
      if (!adminUser) {
        adminUser = new User({
          username: process.env.DEFAULT_ADMIN_USERNAME,
          fullName: process.env.DEFAULT_ADMIN_FULL_NAME,
          role: 'System Administrator',
          permissions: ['all'],
          password: process.env.DEFAULT_ADMIN_PASSWORD
        });
        await adminUser.save();
      }

      const token = jwt.sign(
        { userId: adminUser._id },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: adminUser._id,
          username: adminUser.username,
          fullName: adminUser.fullName,
          role: adminUser.role,
          profileImage: adminUser.profileImage,
          permissions: adminUser.permissions
        }
      });
    }

    // Check database for other users
    const user = await User.findOne({ username, isActive: true });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        profileImage: user.profileImage,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize default admin
router.post('/init', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ role: 'System Administrator' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'System already initialized' });
    }

    const defaultAdmin = new User({
      username: process.env.DEFAULT_ADMIN_USERNAME,
      fullName: process.env.DEFAULT_ADMIN_FULL_NAME,
      role: 'System Administrator',
      permissions: ['all'],
      password: process.env.DEFAULT_ADMIN_PASSWORD
    });

    await defaultAdmin.save();
    res.json({ message: 'Default admin account created successfully' });
  } catch (error) {
    console.error('Init error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
