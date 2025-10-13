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

const router = express.Router();

// ----------------------------------------------------------------
// Public Routes (anyone can view)
// ----------------------------------------------------------------

// @route   GET /api/blogs
// @desc    Get all blog posts
// @access  Public
router.get('/', getAllBlogs); 

// @route   GET /api/blogs/:id
// @desc    Get single blog post by ID
// @access  Public
router.get('/:id', getBlogById);

// ----------------------------------------------------------------
// Protected Admin Routes (require authentication + admin role)
// ----------------------------------------------------------------

// @route   POST /api/blogs
// @desc    Create new blog post
// @access  Private/Admin
router.post('/', protect, adminMiddleware, createBlog); 

// @route   PUT /api/blogs/:id
// @desc    Update blog post
// @access  Private/Admin
router.put('/:id', protect, adminMiddleware, updateBlog);

// @route   DELETE /api/blogs/:id
// @desc    Delete blog post
// @access  Private/Admin
router.delete('/:id', protect, adminMiddleware, deleteBlog);

export default router;