// /backend/src/routes/authRoutes.js
import express from 'express';
// Note the .js extension is REQUIRED
import { 
  registerUser, 
  loginUser,
  // 🚨 NEW IMPORTS for password reset
  sendOtpForPasswordReset, 
  verifyOtpForPasswordReset, 
  resetPassword 
} from '../controllers/authController.js'; 

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// 🚨 NEW ROUTES for Forgot Password 
router.post('/forgot-password/send-otp', sendOtpForPasswordReset);
router.post('/forgot-password/verify-otp', verifyOtpForPasswordReset);
router.post('/forgot-password/reset-password', resetPassword);

// Use 'export default' instead of 'module.exports'
export default router;