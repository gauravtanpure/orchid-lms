// /backend/src/routes/dubbingRoutes.js
import express from 'express';
import dubbingQueue from '../queues/dubbingQueue.js';
import Course from '../models/Course.js';

const router = express.Router();

/**
 * POST /api/dubbing/enqueue
 * Body: { courseId, lessonId }
 * NOTE: Protect with admin auth in production
 */
router.post('/enqueue', async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    if (!courseId || !lessonId) return res.status(400).json({ message: 'courseId and lessonId required' });

    const course = await Course.findById(courseId).select('_id');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const job = await dubbingQueue.add({ courseId, lessonId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 60 * 1000 },
      removeOnComplete: true,
      removeOnFail: false,
      timeout: 1000 * 60 * 60 * 2,
    });

    return res.json({ success: true, jobId: job.id });
  } catch (err) {
    console.error('Enqueue error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/dubbing/status/:jobId
 */
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!jobId) return res.status(400).json({ message: 'jobId required' });

    const job = await dubbingQueue.getJob(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const state = await job.getState();
    const progress = job._progress || 0;
    const result = job.returnvalue || null;
    const failedReason = job.failedReason || null;

    return res.json({ jobId, state, progress, result, failedReason });
  } catch (err) {
    console.error('Status error', err);
    return res.status(500).json({ message: err.message });
  }
});

export default router;
