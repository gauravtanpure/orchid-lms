// /backend/src/models/Course.js
import mongoose from 'mongoose';
import slugify from 'slugify'; // ✅ you'll need to install this

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

  // ✅ ADD THIS FIELD
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
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model('Course', courseSchema);
