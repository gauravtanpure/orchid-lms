import Blog from '../models/Blog.js'; // MUST ADD .js

// Create a new blog post
export const createBlog = async (req, res) => { // Export statement
  try {
    const { title, excerpt, content, imageUrl, category, readTime } = req.body;
    if (!title || !excerpt || !content || !imageUrl || !category || !readTime) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    const newBlog = new Blog({ title, excerpt, content, imageUrl, category, readTime });
    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all blog posts
export const getAllBlogs = async (req, res) => { // Export statement
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get a blog post by ID
export const getBlogById = async (req, res) => { // Export statement
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog post not found' });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update blog post
export const updateBlog = async (req, res) => { // Export statement
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const { title, excerpt, content, imageUrl, category, readTime } = req.body;
    blog.title = title || blog.title;
    blog.excerpt = excerpt || blog.excerpt;
    blog.content = content || blog.content;
    blog.imageUrl = imageUrl || blog.imageUrl;
    blog.category = category || blog.category;
    blog.readTime = readTime || blog.readTime;

    const updatedBlog = await blog.save();
    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete blog post
export const deleteBlog = async (req, res) => { // Export statement
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    await blog.deleteOne(); // Use deleteOne() or deleteMany() in Mongoose 8+
    res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};