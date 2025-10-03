// /backend/src/models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructor: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  category: { type: String, enum: ['english', 'marathi'], required: true },
  enrollments: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 },
  thumbnailUrl: { type: String, required: true },
  thumbnail_cloudinary_id: { type: String, required: true },
  videoUrl: { type: String, required: true },
  video_cloudinary_id: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);