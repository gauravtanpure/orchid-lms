// /backend/src/models/Course.js
import mongoose from 'mongoose';
import slugify from 'slugify'; // ✅ you'll need to install this

// --- NEW LESSON SCHEMA ---
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  videoUrl: { type: String, required: true },
  video_cloudinary_id: { type: String, required: true },
  duration: { type: Number, default: 0 }, // Duration in minutes for display
  order: { type: Number, default: 0 } // For lesson order
}, { _id: true }); // Ensure lessons have their own IDs

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: 'A comprehensive course.' }, // Added description for better data structure
  instructor: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, default: 0 }, // Total course duration (sum of lessons, can be updated)
  category: { type: String, enum: ['english', 'marathi'], required: true },
  enrollments: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 },
  thumbnailUrl: { type: String, required: true },
  thumbnail_cloudinary_id: { type: String, required: true },
  
  // --- UPDATED FIELD: Array of Lessons instead of single videoUrl ---
  lessons: [lessonSchema],

  // ✅ ADDED/KEPT THIS FIELD
  slug: { type: String, required: true, unique: true },

  specialOffer: {
    isActive: { type: Boolean, default: false },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, default: 0 },
    description: { type: String, trim: true }
  }
}, { timestamps: true });

// ✅ Automatically create a slug from the title if not provided
courseSchema.pre('validate', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;