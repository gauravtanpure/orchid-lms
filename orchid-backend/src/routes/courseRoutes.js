// /backend/src/routes/courseRoutes.js
import express from 'express';
const router = express.Router();
import Course from '../models/Course.js'; // MUST ADD .js
import upload from '../middleware/multerMiddleware.js'; // MUST ADD .js
import cloudinary from '../config/cloudinaryConfig.js'; // MUST ADD .js
import { Readable } from 'stream';
// NOTE: You'll also need to import your auth middleware here for admin routes
import { protect } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

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

// POST: Create a new course (Protected by admin middleware)
router.post(
  '/',
  protect, // Add protect
  adminMiddleware, // Add adminMiddleware
  upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'video', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { title, instructor, price, duration, category, specialOfferString } = req.body;
      
      // Parse specialOfferString back into an object
      const specialOffer = specialOfferString ? JSON.parse(specialOfferString) : {};

      const thumbnailFile = req.files.thumbnail[0];
      const videoFile = req.files.video[0];

      // --- 1. Log the received string ---
      console.log("Backend received specialOfferString:", specialOfferString);

      if (!thumbnailFile || !videoFile) {
        return res.status(400).json({ message: 'Both thumbnail and video files are required.' });
      }

      // --- 2. Upload to Cloudinary ---
      const [thumbnailResult, videoResult] = await Promise.all([
        uploadToCloudinary(thumbnailFile.buffer, { folder: 'course_thumbnails' }),
        uploadToCloudinary(videoFile.buffer, { 
          resource_type: 'video', 
          folder: 'course_videos',
          // Optional: Add transformation for video
          eager: [
             { width: 400, height: 300, crop: 'pad', audio_codec: 'none' }
          ]
        })
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
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT: Update a course (Protected by admin middleware)
router.put('/:id', protect, adminMiddleware, async (req, res) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json({ message: 'Course updated successfully', course: updatedCourse });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE: Delete a course (Protected by admin middleware)
router.delete('/:id', protect, adminMiddleware, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // Delete files from Cloudinary
        await cloudinary.uploader.destroy(course.thumbnail_cloudinary_id);
        await cloudinary.uploader.destroy(course.video_cloudinary_id, { resource_type: 'video' });

        await course.deleteOne(); // Use deleteOne() in Mongoose 8+
        
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


export default router; // Export statement