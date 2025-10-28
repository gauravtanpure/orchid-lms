// /backend/src/routes/adminRoutes.js
import express from 'express';
const router = express.Router();

import User from '../models/User.js'; // Must include .js for ESM
import { protect } from '../middleware/authMiddleware.js'; // Must include .js
import { adminMiddleware } from '../middleware/adminMiddleware.js'; // Must include .js

// 🚨 NEW IMPORT: Import the controller functions
import { getAdminDashboardSummary, getAdminAnalyticsSummary } from '../controllers/adminController.js'; 


// -----------------------------------------------------------
// 🚨 NEW ROUTES TO FETCH DASHBOARD AND ANALYTICS DATA 🚨

// @desc    Get key metrics for the main dashboard (Admin only)
// @route   GET /api/admin/dashboard-summary
// @access  Private/Admin
router.get('/dashboard-summary', protect, adminMiddleware, getAdminDashboardSummary);

// @desc    Get detailed data for the analytics page (Admin only)
// @route   GET /api/admin/analytics-summary
// @access  Private/Admin
router.get('/analytics-summary', protect, adminMiddleware, getAdminAnalyticsSummary);
// -----------------------------------------------------------


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

// Example: Delete a user
router.delete('/users/:id', protect, adminMiddleware, async (req, res) => {
  try {
    // Find user to ensure existence before deleting
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Assuming Mongoose 8+, we use findByIdAndDelete or .deleteOne()
    await user.deleteOne(); 
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error deleting user.' });
  }
});

export default router;
