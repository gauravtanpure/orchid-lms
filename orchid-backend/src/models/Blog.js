import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true, trim: true },
    mr: { type: String, required: true, trim: true },
  },
  excerpt: {
    en: { type: String, required: true, trim: true },
    mr: { type: String, required: true, trim: true },
  },
  content: {
    en: { type: String, required: true },
    mr: { type: String, required: true },
  },
  imageUrl: {
    type: String,
    required: true,
  },
  category: {
    en: { type: String, required: true },
    mr: { type: String, required: true },
  },
  readTime: {
    en: { type: String, required: true },
    mr: { type: String, required: true },
  },
}, { timestamps: true });

export default mongoose.model('Blog', blogSchema);