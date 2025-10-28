// /backend/src/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    // Email is now OPTIONAL, but if provided, it must be unique.
    unique: true,
    // sparse: true is crucial for unique index when some documents might not have this field (e.g., they only registered with a phone number)
    sparse: true, 
  },
  phone: {
    type: String,
    // 🚨 MODIFIED: Phone number is now REQUIRED
    required: true,
    // Phone number must be unique
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
  },
  enrolledCourses: [
    {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      completionRate: {
        type: Number,
        default: 0,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('User', UserSchema);