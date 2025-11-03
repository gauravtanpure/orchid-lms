// ✅ /backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/* Verify JWT and attach user */
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded.userId || (decoded.user && decoded.user.id);
      const user = await User.findById(userId).select('-password');
      if (!user) return res.status(401).json({ message: 'User not found' });
      req.user = user;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/* Require admin role */
export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin')
    return res.status(403).json({ message: 'Access denied, admin only' });
  next();
};

/* Combine protect + admin */
export const adminProtect = [protect, adminMiddleware];
