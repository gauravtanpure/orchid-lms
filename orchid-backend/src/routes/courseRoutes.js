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
      const { title, instructor, price, duration, category, specialOfferString } = req.body;
      const thumbnailFile = req.files.thumbnail[0];
      const videoFile = req.files.video[0];

      // --- 1. Log the received string ---
      console.log("Backend received specialOfferString:", specialOfferString);

      if (!thumbnailFile || !videoFile) {
        return res.status(400).json({ message: 'Thumbnail and video files are required.' });
      }

      let specialOffer = { isActive: false };
      if (specialOfferString) {
        try {
          specialOffer = JSON.parse(specialOfferString);
        } catch (e) {
          return res.status(400).json({ message: 'Invalid special offer format.' });
        }
      }

      // --- 2. Log the parsed object ---
      console.log("Parsed specialOffer object:", specialOffer);

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
        specialOffer,
      });

      // --- 3. Log the object before it's saved ---
      console.log("Mongoose document before saving:", newCourse);

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

// GET a single course by ID
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json(course);
    } catch (error) {
        if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Course not found' });
        }
        console.error('Error fetching single course:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;