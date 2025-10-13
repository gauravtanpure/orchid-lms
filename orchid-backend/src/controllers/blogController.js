import Blog from '../models/Blog.js'; // MUST ADD .js
import cloudinary from '../config/cloudinaryConfig.js'; // ⬅️ NEW: Import Cloudinary config
import DatauriParser from 'datauri/parser.js'; // ⬅️ NEW: Import DataUri helper

const parser = new DatauriParser(); 

// Helper function to convert buffer to data URI
const dataUri = (req) => {
  if (!req.file) return null;
  // The 'image' is the field name used in the frontend FormData
  return parser.format(req.file.originalname, req.file.buffer);
};

// Create a new blog post
export const createBlog = async (req, res) => {
  try {
    let imageUrl = '';
    
    // 1. Handle Image Upload via Cloudinary
    if (req.file) {
      const fileUri = dataUri(req)?.content;
      if (fileUri) {
        const result = await cloudinary.uploader.upload(fileUri, {
          folder: 'blog-images', // Specify a folder in Cloudinary
        });
        imageUrl = result.secure_url;
      }
    }

    // 2. Extract and Parse text fields from FormData (they arrive as JSON strings)
    const { 
      title: titleStr, 
      excerpt: excerptStr, 
      content: contentStr, 
      category: categoryStr, 
      readTime: readTimeStr 
    } = req.body;
    
    const title = JSON.parse(titleStr);
    const excerpt = JSON.parse(excerptStr);
    const content = JSON.parse(contentStr);
    const category = JSON.parse(categoryStr);
    const readTime = JSON.parse(readTimeStr);
    
    // 3. Validation: imageUrl is now mandatory
    if (!title || !excerpt || !content || !category || !readTime || !imageUrl) {
      return res.status(400).json({ message: 'Please provide all required fields, including an image.' });
    }

    const newBlog = new Blog({ 
      title, 
      excerpt, 
      content, 
      imageUrl, // Use the Cloudinary URL
      category, 
      readTime,
      user: req.user._id // Links the blog to the admin user
    });
    
    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error('Error in createBlog:', error);
    res.status(500).json({ message: 'Server Error during blog creation.', error: error.message });
  }
};

// Get all blog posts (remains the same)
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get a blog post by ID (remains the same)
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog post not found' });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update blog post
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Extract and Parse text fields from FormData
    const { 
      title: titleStr, 
      excerpt: excerptStr, 
      content: contentStr, 
      category: categoryStr, 
      readTime: readTimeStr, 
      existingImageUrl 
    } = req.body;

    // Default to the existing image URL passed from the frontend
    let finalImageUrl = existingImageUrl || blog.imageUrl; 

    // 1. Handle New Image Upload via Cloudinary
    if (req.file) {
      const fileUri = dataUri(req)?.content;
      if (fileUri) {
        // Upload the new image
        const result = await cloudinary.uploader.upload(fileUri, {
          folder: 'blog-images',
        });
        finalImageUrl = result.secure_url;
        // NOTE: You may want to add logic here to delete the old image from Cloudinary
      }
    }

    // 2. Update all fields (parsing the JSON strings if they were provided)
    // We check if the string exists before parsing to handle partial updates
    blog.title = titleStr ? JSON.parse(titleStr) : blog.title;
    blog.excerpt = excerptStr ? JSON.parse(excerptStr) : blog.excerpt;
    blog.content = contentStr ? JSON.parse(contentStr) : blog.content;
    blog.category = categoryStr ? JSON.parse(categoryStr) : blog.category;
    blog.readTime = readTimeStr ? JSON.parse(readTimeStr) : blog.readTime;
    
    blog.imageUrl = finalImageUrl; // Update the image URL

    // Validation check after potential image removal/no image in update
    if (!blog.imageUrl) {
        return res.status(400).json({ message: 'Image is required for the blog post.' });
    }

    const updatedBlog = await blog.save();
    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error('Error in updateBlog:', error);
    res.status(500).json({ message: 'Server Error during blog update.', error: error.message });
  }
};

// Delete blog post (remains the same)
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // OPTIONAL: Add Cloudinary delete logic here if you want to remove the image file
    // await cloudinary.uploader.destroy(publicId);

    await blog.deleteOne();
    res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};