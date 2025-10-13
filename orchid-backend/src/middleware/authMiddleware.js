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
      // FIX 1: Correctly retrieve user ID from the decoded payload.
      // We use decoded.user.id, assuming the token payload is { user: { id: ... } }
      // ----------------------------------------------------------------------
      const userId = decoded.user?.id || decoded.id;

      // Get user from token (exclude password)
      const user = await User.findById(userId).select('-password');
      
      // ----------------------------------------------------------------------
      // FIX 2: Check if the user was found in the database.
      // This prevents the "Cannot read properties of null (reading 'email')" crash.
      // ----------------------------------------------------------------------
      if (!user) {
        console.error('🔴 Auth Middleware Error: Token is valid but user ID not found in database.');
        return res.status(401).json({ message: 'Not authorized, user not found (deleted or invalid ID).' });
      }

      req.user = user;
      console.log('🟢 Auth Middleware - User authenticated:', req.user.email, 'Role:', req.user.role);

      next();
    } catch (error) {
      // This catches errors like expired token, invalid signature, or wrong JWT_SECRET
      console.error('🔴 Auth Middleware Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.error('🔴 Auth Middleware - No token provided');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};