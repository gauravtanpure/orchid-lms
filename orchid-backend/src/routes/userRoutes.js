// /backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const { protect } = require('../middleware/authMiddleware');

// @desc    Enroll user in courses after "payment"
// @route   POST /api/users/enroll
// @access  Private
router.post('/enroll', protect, async (req, res) => {
  const { courseIds } = req.body;
  if (!courseIds || !Array.isArray(courseIds)) {
    return res.status(400).json({ message: 'Course IDs must be an array.' });
  }

  try {
    // Use $addToSet to add courses to the user's enrolledCourses array, preventing duplicates
    await User.updateOne({ _id: req.user.id }, { $addToSet: { enrolledCourses: { $each: courseIds } } });
    
    // Fetch the updated user document to return to the frontend
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.status(200).json({ message: 'Successfully enrolled!', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error during enrollment.' });
  }
});

// @desc    Get courses the current user is enrolled in
// @route   GET /api/users/my-courses
// @access  Private
router.get('/my-courses', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('enrolledCourses');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.enrolledCourses);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching enrolled courses.' });
    }
});


module.exports = router;