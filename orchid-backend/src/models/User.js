// /backend/src/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
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
  // ⬅️ NEW: Fields for OTP storage (for password reset)
  otp: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('User', UserSchema);
