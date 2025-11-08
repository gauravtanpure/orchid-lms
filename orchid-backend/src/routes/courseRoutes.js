// /backend/src/routes/courseRoutes.js
import express from 'express';
const router = express.Router();
import Course from '../models/Course.js'; 
import upload from '../middleware/multerMiddleware.js'; 
import cloudinary from '../config/cloudinaryConfig.js'; 
import { Readable } from 'stream';
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


// =================================================================
//  *** POST: Create a new course ***
// =================================================================
router.post(
  '/',
  protect,
  adminMiddleware,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'videoFiles' },
  ]),
  async (req, res) => {
    try {
      const { title, instructor, price, category, description } = req.body;
      const thumbnailFile = req.files?.thumbnail?.[0];
      
      const videoFiles = req.files?.videoFiles;
      const videoTitles = req.body.videoTitles;

      if (!thumbnailFile || !videoFiles || videoFiles.length === 0) {
        return res.status(400).json({
          message: 'Thumbnail and at least one course video are required.',
        });
      }

      // 1. Upload thumbnail
      const thumbnailResult = await uploadToCloudinary(thumbnailFile.buffer, {
        folder: 'course_thumbnails',
        resource_type: 'image',
      });

      // 2. Upload ALL videos and build the lessons array
      const lessons = [];
      let totalDuration = 0;
      const titles = Array.isArray(videoTitles) ? videoTitles : [videoTitles];

      for (let i = 0; i < videoFiles.length; i++) {
        const file = videoFiles[i];
        const title = titles[i] || `Lesson ${i + 1}`;

        const videoResult = await uploadToCloudinary(file.buffer, {
          folder: 'course_videos',
          resource_type: 'video',
          eager: [{ format: 'mp4' }],
          eager_async: true,
        });

        const videoDurationInSeconds = videoResult.duration || 0;
        const durationInMinutes = Math.round(videoDurationInSeconds / 60);
        totalDuration += durationInMinutes;

        lessons.push({
          title: title,
          videoUrl: videoResult.secure_url,
          video_cloudinary_id: videoResult.public_id,
          duration: durationInMinutes,
          order: i,
        });
      }

      // 3. Parse Special Offer
      let parsedSpecialOffer = {};
      const isActiveString = req.body['specialOffer[isActive]'];

      if (isActiveString === 'true') {
        parsedSpecialOffer = {
          isActive: true,
          discountType: req.body['specialOffer[discountType]'],
          discountValue: parseFloat(req.body['specialOffer[discountValue]']) || 0,
          description: req.body['specialOffer[description]'] || '',
        };
      } else {
        parsedSpecialOffer = {
          isActive: false,
          discountType: 'percentage',
          discountValue: 0,
          description: '',
        };
      }

      // 4. Create the course document
      const newCourse = new Course({
        title,
        instructor,
        price: parseFloat(price) || 0,
        duration: totalDuration,
        description: description || 'A new course.',
        category,
        thumbnailUrl: thumbnailResult.secure_url,
        thumbnail_cloudinary_id: thumbnailResult.public_id,
        lessons: lessons,
        specialOffer: parsedSpecialOffer,
      });

      await newCourse.save();
      res
        .status(201)
        .json({ message: 'Course created successfully!', course: newCourse });
    } catch (error) {
      console.error('Error creating course:', error);
      const errorMessage =
        error.message.includes('Multer') || error.message.includes('file')
          ? error.message
          : 'Server error';
      res.status(500).json({ message: errorMessage, details: error.message });
    }
  }
);


// --- NEW ROUTE: Add a lesson (video) to an existing course (remains correct) ---
router.post(
  '/:courseId/lesson',
  protect,
  adminMiddleware,
  upload.fields([{ name: 'video', maxCount: 1 }]), 
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const { lessonTitle, lessonDuration } = req.body;
      const videoFile = req.files?.video?.[0];

      if (!videoFile || !lessonTitle) {
        return res.status(400).json({ message: 'Lesson title and video file are required.' });
      }

      // 1. Upload video to Cloudinary
      const videoResult = await uploadToCloudinary(videoFile.buffer, {
        folder: 'course_videos',
        resource_type: 'video',
      });
      
      const course = await Course.findById(courseId);

      if (!course) {
        // Must delete the uploaded video if the course doesn't exist
        await cloudinary.uploader.destroy(videoResult.public_id, { resource_type: 'video' });
        return res.status(404).json({ message: 'Course not found' });
      }

      // 2. Create new lesson object
      const newLesson = {
        title: lessonTitle,
        videoUrl: videoResult.secure_url,
        video_cloudinary_id: videoResult.public_id,
        duration: parseInt(lessonDuration, 10) || 0,
        order: course.lessons.length
      };

      // 3. Add lesson to the course and save
      course.lessons.push(newLesson);
      course.duration = course.lessons.reduce((sum, lesson) => sum + lesson.duration, 0); 
      await course.save();

      res.status(201).json({ 
        message: 'Lesson added successfully', 
        lesson: newLesson,
        course: { id: course._id, title: course.title, lessonsCount: course.lessons.length } 
      });

    } catch (error) {
      console.error('Error adding lesson:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  }
);


// GET: Get all courses (Public)
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find({}).select('-lessons -__v');
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =================================================================
// 🚀 FIX APPLIED HERE 🚀
// GET: Get course by slug (Public/Detail page - Now includes lessons)
// =================================================================
router.get('/slug/:slug', async (req, res) => {
    try {
        // We removed .select('-lessons') to include lessons for the detail page
        const course = await Course.findOne({ slug: req.params.slug }).select('-__v'); 
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (error) {
        console.error('Error fetching single course by slug:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// =================================================================
//  GET: Get course details by slug (Protected/Player page - **Includes lessons + Enrollment Check**)
// =================================================================
router.get('/player/:slug', protect, async (req, res) => {
    try {
        const { slug } = req.params;
        
        // 1. Find the course
        const course = await Course.findOne({ slug }).select('-__v');

        if (!course) {
            // Course not found by slug
            return res.status(404).json({ message: 'Course Not Found' });
        }
        
        // 2. Perform Authorization/Enrollment Check
        // Assumes req.user is populated with enrolledCourses from authMiddleware.js
        const isAdmin = req.user && req.user.role === 'admin';
        
        const courseObjectId = course._id;
        
        const isEnrolled = req.user?.enrolledCourses?.some(enrollment => {
            // Use Mongoose's .equals() method for reliable comparison of ObjectIds
            // This is the most robust way to compare references in MongoDB
            // enrollment.courseId is the field on the User model
            return courseObjectId.equals(enrollment.courseId);
        });
        
        if (!isAdmin && !isEnrolled) {
            // If the user is neither an admin nor enrolled, deny access
            console.log(`[AUTH FAIL] User ${req.user._id} tried to access course ${courseObjectId} without enrollment.`);
            return res.status(404).json({ message: 'Access Denied or Course Not Found' });
        }


        // 3. If authorized, return the course content
        // Ensure lessons are returned in the correct order
        course.lessons.sort((a, b) => a.order - b.order); 

        res.status(200).json(course);

    } catch (error) {
        console.error('Error fetching single course by slug for player:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT: Update a course (Protected by admin middleware)
router.put('/:id', protect, adminMiddleware, async (req, res) => {
    try {
        const updateData = { ...req.body };
        delete updateData.lessons; 

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id, 
            updateData, 
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
        
        const courseToDelete = await Course.findById(req.params.id);

        if (!courseToDelete) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // Deletion of the lessons' videos should happen here
        for (const lesson of courseToDelete.lessons) {
            if(lesson.video_cloudinary_id) {
                await cloudinary.uploader.destroy(lesson.video_cloudinary_id, { resource_type: 'video' });
            }
        }
        if(courseToDelete.thumbnail_cloudinary_id) {
            await cloudinary.uploader.destroy(courseToDelete.thumbnail_cloudinary_id, { resource_type: 'image' });
        }


        await Course.deleteOne({ _id: req.params.id });

        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;