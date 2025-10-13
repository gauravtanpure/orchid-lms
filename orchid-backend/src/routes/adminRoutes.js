// /backend/src/routes/adminRoutes.js
import express from 'express';
const router = express.Router();

import User from '../models/User.js'; // Must include .js for ESM
import { protect } from '../middleware/authMiddleware.js'; // Must include .js
import { adminMiddleware } from '../middleware/adminMiddleware.js'; // Must include .js

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, adminMiddleware, async (req, res) => {
  try {
    // Fetch all users but exclude the password
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// You can add more admin-only routes here, e.g., delete user, update user role, etc.
// Example: Delete a user
router.delete('/users/:id', protect, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await user.remove();
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error deleting user.' });
  }
});

export default router;
