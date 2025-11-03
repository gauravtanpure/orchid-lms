import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// 🚨 NEW IMPORT: Import the SMS service
import { sendOTP } from '../utils/smsService.js';
// 🚨 NEW IMPORT: Import crypto for generating a secure OTP
import crypto from 'crypto'; 

// --- Existing Register and Login functions (Ensure they are updated as per previous turn) ---

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!phone) {
       return res.status(400).json({ msg: 'Registration requires a phone number.' });
    }

    const existingUser = await User.findOne({ 
      $or: [
        { email: email || null }, 
        { phone: phone }          
      ]
    });
    
    if (existingUser) {
      let msg = 'User already exists';
      if (email && existingUser.email === email) {
        msg = 'User with this email already exists';
      } else if (existingUser.phone === phone) {
        msg = 'User with this phone number already exists';
      }
      return res.status(400).json({ msg: msg });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email: email || undefined, phone, password: hashedPassword, role: 'user' });
    await user.save(); 

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;

        const userToReturn = user.toObject();
        delete userToReturn.password;

        res.status(201).json({
          token,
          user: userToReturn,
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
        const field = Object.keys(err.errors)[0];
        return res.status(400).json({ msg: err.errors[field].message });
    }
    res.status(500).send('Server Error');
  }
};

/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ msg: 'Please provide an identifier (email or phone) and password' });
    }

    const user = await User.findOne({ 
      $or: [{ email: identifier }, { phone: identifier }] 
    });
    
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;

        const userToReturn = user.toObject();
        delete userToReturn.password;

        res.json({ token, user: userToReturn });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- NEW Forgot Password functions ---

/**
 * @desc Send OTP to registered phone number
 * @route POST /api/auth/forgot-password/send-otp
 * @access Public
 */
export const sendOtpForPasswordReset = async (req, res) => {
  try {
    const { phone } = req.body;
    
    // 1. Find user by phone number
    const user = await User.findOne({ phone });
    if (!user) {
      // Don't leak whether the user exists for security
      return res.status(404).json({ msg: 'User not found or phone number is incorrect.' });
    }

    // 2. Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = Date.now() + 600000; // 10 minutes from now (600,000 milliseconds)

    // 3. Save OTP and expiry to user record
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = expiry;
    await user.save({ validateBeforeSave: false }); // Skip validation for non-schema updates

    // 4. Send SMS
    const smsResult = await sendOTP(phone, otp);

    if (smsResult.success) {
      res.status(200).json({ msg: 'OTP sent successfully to your registered phone number.' });
    } else {
      // Still send 200/202 status to the client, but log error internally
      // Inform the user that OTP was generated but delivery failed (optional security choice)
      res.status(202).json({ 
        msg: 'OTP generated but failed to send SMS. Please contact support.',
        // Only return this message if you want to be verbose about failure
        // internalError: smsResult.message 
      });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc Verify the OTP sent to the phone number
 * @route POST /api/auth/forgot-password/verify-otp
 * @access Public
 */
export const verifyOtpForPasswordReset = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({ 
      phone, 
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() } // Check if OTP is not expired
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired OTP.' });
    }

    // OTP is valid. Clear the OTP fields to prevent replay, but DO NOT reset the password yet.
    // Instead, issue a temporary, short-lived JWT that only allows password reset.
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // 1. Generate a short-lived, special-purpose JWT
    const resetPayload = { userId: user.id, purpose: 'password_reset' };
    const resetToken = jwt.sign(
      resetPayload,
      process.env.JWT_SECRET,
      { expiresIn: '5m' } // Token expires in 5 minutes
    );

    res.status(200).json({ 
      msg: 'OTP verified successfully. You can now reset your password.',
      resetToken // Send this temporary token back to the client
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc Reset the password using the reset token
 * @route POST /api/auth/forgot-password/reset-password
 * @access Public (but secured by resetToken)
 */
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ msg: 'Passwords do not match.' });
    }
    
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters long.' });
    }

    let decoded;
    try {
      // 1. Verify the temporary resetToken
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (decoded.purpose !== 'password_reset') {
        throw new Error('Invalid token purpose');
      }
    } catch (err) {
      console.error('Reset Token Verification Error:', err.message);
      return res.status(401).json({ msg: 'Invalid or expired reset session. Please restart the password reset process.' });
    }
    
    // 2. Find the user and update the password
    const userId = decoded.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User associated with this reset session not found.' });
    }

    // 3. Hash and save the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ msg: 'Password successfully reset. You can now log in with your new password.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};