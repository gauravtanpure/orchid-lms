import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Assuming this path is correct

export const protect = async (req, res, next) => {
  let token;

  // 1. Check if authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // --- CRITICAL FIX START ---
      // The JWT payload might contain the user ID under different keys (id, userId, or user.id).
      // We need to safely extract the ID, which MUST be a string representation of the MongoDB ObjectId.
      
      const userId = decoded.id || decoded.userId || (decoded.user && decoded.user.id);
      
      if (!userId) {
          console.error('🔴 Auth Middleware Error: Decoded token is missing a user ID.');
          return res.status(401).json({ message: 'Not authorized, invalid token payload.' });
      }

      // Get user from token (exclude password)
      // Mongoose expects a valid ID string.
      const user = await User.findById(userId).select('-password');
      
      // Check if the user was found in the database.
      if (!user) {
        console.error('🔴 Auth Middleware Error: Token valid but user not found in DB.');
        return res.status(401).json({ message: 'Not authorized, user not found.' });
      }
      
      // Attach user to the request object
      req.user = user;

      next();
    } catch (error) {
      console.error('🔴 Auth Middleware Error: Token failed verification or lookup:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.error('🔴 Auth Middleware - No token provided');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// ... (other middleware functions like adminMiddleware should be here)
