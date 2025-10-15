import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import Course from '../models/Course.js';
import { protect } from '../middleware/authMiddleware.js';

/**
 * @desc Enroll user in selected courses (after "payment")
 * @route POST /api/users/enroll
 * @access Private
 */
router.post('/enroll', protect, async (req, res) => {
  const { courseIds } = req.body;

  if (!courseIds || !Array.isArray(courseIds)) {
    return res.status(400).json({ message: 'Course IDs must be an array.' });
  }

  try {
    // ✅ Fetch actual course details from DB to attach slugs too
    const enrollments = await Promise.all(
      courseIds.map(async (id) => {
        const course = await Course.findById(id);
        if (!course) return null;
        return {
          courseId: course._id,
          slug: course.slug, // ✅ store slug for frontend navigation
          completionRate: 0,
        };
      })
    );

    // Remove any invalid/null courses
    const validEnrollments = enrollments.filter(Boolean);

    if (validEnrollments.length === 0) {
      return res.status(400).json({ message: 'No valid courses found for enrollment.' });
    }

    // ✅ Add to enrolledCourses without duplicates
    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { enrolledCourses: { $each: validEnrollments } } }
    );

    // ✅ Get updated user (populating enrolledCourses)
    const updatedUser = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'enrolledCourses.courseId',
        model: 'Course',
      });

    // Disable caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.status(200).json({
      message: 'Successfully enrolled!',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Enrollment Server Error:', error.message);
    res.status(500).json({ message: 'Server error during enrollment.' });
  }
});

/**
 * @desc Get courses the current user is enrolled in
 * @route GET /api/users/my-courses
 * @access Private
 */
router.get('/my-courses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'enrolledCourses.courseId',
      model: 'Course',
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const myCourses = user.enrolledCourses
      .filter(enrollment => enrollment.courseId)
      .map(enrollment => ({
        ...enrollment.courseId.toObject(),
        slug: enrollment.slug || enrollment.courseId.slug, // ✅ ensure slug is passed
        completionRate: enrollment.completionRate,
      }));

    res.status(200).json(myCourses);
  } catch (error) {
    console.error('Error fetching my courses:', error);
    res.status(500).json({ message: 'Server error fetching user courses.' });
  }
});

export default router;
