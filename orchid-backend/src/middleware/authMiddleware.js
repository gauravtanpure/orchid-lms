import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ----------------------------------------------------------------------
      // FIX 1: Retrieve user ID from the decoded payload. Assumes { id: ... } or { user: { id: ... } }
      // ----------------------------------------------------------------------
      const userId = decoded.user?.id || decoded.id; 

      // Get user from token (exclude password)
      const user = await User.findById(userId).select('-password');

      // ----------------------------------------------------------------------
      // FIX 2: Check if the user was found in the database. 
      // This prevents the "Cannot read properties of null (reading 'email')" crash.
      // ----------------------------------------------------------------------
      if (!user) {
        console.error('🔴 Auth Middleware Error: Token valid but user not found in DB.');
        return res.status(401).json({ message: 'Not authorized, user not found.' });
      }

      req.user = user;
      console.log('🟢 Auth Middleware - User authenticated:', req.user.email, 'Role:', req.user.role);

      next();
    } catch (error) {
      console.error('🔴 Auth Middleware Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.error('🔴 Auth Middleware - No token provided');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};