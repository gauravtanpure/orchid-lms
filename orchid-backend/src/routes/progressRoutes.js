// /backend/src/routes/progressRoutes.js
import express from 'express';
import Course from '../models/Course.js';
// import UserProgress from '../models/UserProgress.js'; // if you have one
const router = express.Router();

function computeCompletionRate(total, completed) {
  if (!total || total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

// GET /api/users/course-progress/:courseId
router.get('/course-progress/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ message: 'courseId required' });

    // optionally use authentication: req.user._id if you have protect middleware
    const userId = (req.user && req.user._id) || req.query.userId || req.headers['x-user-id'] || null;

    const course = await Course.findById(courseId).select('lessons');
    if (!course) return res.status(404).json({ message: 'course not found' });

    const totalLessons = Array.isArray(course.lessons) ? course.lessons.length : 0;

    // If you have per-user progress, load it here and compute completedLessons.
    // Fallback: return empty progress (so frontend won't fail).
    const completedLessons = []; // load from DB if you have a model
    const completionRate = computeCompletionRate(totalLessons, completedLessons.length);

    return res.json({ courseId, completedLessons, completionRate });
  } catch (err) {
    console.error('course-progress error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
