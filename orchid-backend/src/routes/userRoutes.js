// /backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course'); // Course model is imported but not used in the routes below
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
    // ✅ CORRECT: Map the course IDs to the correct enrollment format
    const enrollments = courseIds.map(id => ({ courseId: id, completionRate: 0 }));

    // ✅ CORRECT: Use $addToSet to add the formatted objects, preventing duplicates
    // NOTE: The update will only happen if the courseId is not already in the array.
    await User.updateOne({ _id: req.user.id }, { $addToSet: { enrolledCourses: { $each: enrollments } } });

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
        // ✅ CORRECT: Use nested population to get course details for each enrollment
        const user = await User.findById(req.user.id).populate({
            path: 'enrolledCourses.courseId',
            model: 'Course',
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // ✅ CORRECT: Map the result to combine course details with completion rate
        const myCourses = user.enrolledCourses.map(enrollment => {
            // Check if courseId exists (i.e., successfully populated)
            if (!enrollment.courseId) return null; 

            // De-structure course details and add completionRate
            return {
                ...enrollment.courseId.toObject(),
                completionRate: enrollment.completionRate,
            };
        }).filter(course => course !== null); // Filter out any null entries

        res.status(200).json(myCourses);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching enrolled courses.' });
    }
});

module.exports = router;