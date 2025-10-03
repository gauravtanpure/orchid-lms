// /backend/src/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const upload = require('../middleware/multerMiddleware');
const cloudinary = require('../config/cloudinaryConfig');
const { Readable } = require('stream');

// Helper function to upload a buffer to Cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    Readable.from(buffer).pipe(stream);
  });
};

// POST: Create a new course
router.post(
  '/',
  upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'video', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { title, instructor, price, duration, category } = req.body;
      const thumbnailFile = req.files.thumbnail[0];
      const videoFile = req.files.video[0];

      if (!thumbnailFile || !videoFile) {
        return res.status(400).json({ message: 'Thumbnail and video files are required.' });
      }

      // Upload files to Cloudinary
      const [thumbnailResult, videoResult] = await Promise.all([
        uploadToCloudinary(thumbnailFile.buffer, { folder: 'course_thumbnails' }),
        uploadToCloudinary(videoFile.buffer, { resource_type: 'video', folder: 'course_videos' })
      ]);

      const newCourse = new Course({
        title,
        instructor,
        price,
        duration,
        category,
        thumbnailUrl: thumbnailResult.secure_url,
        thumbnail_cloudinary_id: thumbnailResult.public_id,
        videoUrl: videoResult.secure_url,
        video_cloudinary_id: videoResult.public_id,
      });

      await newCourse.save();
      res.status(201).json({ message: 'Course created successfully', course: newCourse });

    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET: Fetch all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// NOTE: You would add a GET route for `my-courses` that uses authentication
// to find courses based on the user's enrolledCourses array.

module.exports = router;