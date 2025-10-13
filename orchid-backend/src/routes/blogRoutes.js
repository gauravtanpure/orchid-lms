// /backend/src/routes/blogRoutes.js

import express from 'express';
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js'; 

import { protect } from '../middleware/authMiddleware.js'; 
import { adminMiddleware } from '../middleware/adminMiddleware.js'; 
import upload from '../middleware/multerMiddleware.js'; // ⬅️ NEW IMPORT

const router = express.Router();

// Public Routes (no change)
router.get('/', getAllBlogs); 
router.get('/:id', getBlogById);

// Protected Admin Routes 
// ⬇️ CHANGE: Add upload.single('image') to handle the file upload
router.post('/', protect, adminMiddleware, upload.single('image'), createBlog); 
// ⬇️ CHANGE: Add upload.single('image') to handle the file upload
router.put('/:id', protect, adminMiddleware, upload.single('image'), updateBlog);

router.delete('/:id', protect, adminMiddleware, deleteBlog);

export default router;