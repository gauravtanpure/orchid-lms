import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = async (req, res) => {
  try {
    // 🚨 MODIFIED: Destructure 'phone' and make email optional
    const { name, email, phone, password } = req.body;

    // Validation: Require at least an email or a phone number
    if (!email && !phone) {
      return res.status(400).json({ msg: 'Registration requires either an email or a phone number.' });
    }

    // Check for existing user by either email or phone
    let user = await User.findOne({ 
      $or: [
        { email: email || null }, // Check email if provided
        { phone: phone || null }  // Check phone if provided
      ]
    });
    
    if (user) {
      // Check which field caused the conflict
      let msg = '';
      if (email && user.email === email) {
        msg = 'User with this email already exists';
      } else if (phone && user.phone === phone) {
        msg = 'User with this phone number already exists';
      } else {
        msg = 'User already exists';
      }
      return res.status(400).json({ msg: msg });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🚨 MODIFIED: Include phone in the new user object
    user = new User({ name, email, phone, password: hashedPassword, role: 'user' });
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
    // 🚨 Optional: Check for duplicate key error on email/phone, though handled above
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ msg: `User with this ${field} already exists` });
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
    // 🚨 MODIFIED: Expect a single 'identifier' field that could be email or phone, and 'password'
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ msg: 'Please provide an identifier (email or phone) and password' });
    }

    // 🚨 MODIFIED: Find user by either email OR phone
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