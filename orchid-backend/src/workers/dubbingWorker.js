// /backend/src/workers/dubbingWorker.js
import 'dotenv/config';
import mongoose from 'mongoose';
import dubbingQueue from '../queues/dubbingQueue.js';
import { generateDubbedVideos } from '../services/dubbingService.js';
import Course from '../models/Course.js';

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Worker: MongoDB connected'))
  .catch(err => { console.error('Worker: Mongo error', err); process.exit(1); });

dubbingQueue.process(1, async (job) => {
  try {
    console.log(`Worker: Starting job ${job.id}`, job.data);
    const { courseId, lessonId } = job.data;
    if (!courseId || !lessonId) throw new Error('courseId & lessonId required');

    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    const lesson = course.lessons.id(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const origUrl = lesson.videoUrl;
    if (!origUrl) throw new Error('Original lesson.videoUrl missing');

    const results = await generateDubbedVideos(origUrl, (percent, message) => {
      try {
        job.progress(Math.max(0, Math.min(100, percent || 0)));
      } catch (e) { /* ignore */ }
      if (message) console.log(`Job ${job.id} -> ${message}`);
    });

    for (const r of results) {
      if (r.code === 'hi') {
        lesson.videoUrl_hi = r.url;
        lesson.video_cloudinary_id_hi = (r.url.split('/').pop() || '').split('.')[0];
      }
      if (r.code === 'mr') {
        lesson.videoUrl_mr = r.url;
        lesson.video_cloudinary_id_mr = (r.url.split('/').pop() || '').split('.')[0];
      }
      if (r.code === 'en') {
        lesson.videoUrl_en = r.url;
        lesson.video_cloudinary_id_en = (r.url.split('/').pop() || '').split('.')[0];
      }
    }

    await course.save();

    await job.progress(100);
    console.log(`Worker: Job ${job.id} completed`);
    return { success: true, dubbed: results };
  } catch (err) {
    console.error('Worker error:', err);
    throw err;
  }
});
