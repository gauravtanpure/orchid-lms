import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Assuming this path is correct


export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1️⃣ Extract token
      token = req.headers.authorization.split(' ')[1];

      // 2️⃣ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3️⃣ Extract user ID safely
      const userId = decoded.id || decoded.userId || (decoded.user && decoded.user.id);
      if (!userId) {
        console.error('🔴 Auth Middleware Error: No user ID in token payload.');
        return res.status(401).json({ message: 'Invalid token payload.' });
      }

      // 4️⃣ Fetch the user, populate enrolledCourses
      const user = await User.findById(userId)
        .populate('enrolledCourses.courseId', 'title slug') // ✅ critical fix
        .select('-password');

      if (!user) {
        console.error('🔴 Auth Middleware Error: Token valid but user not found in DB.');
        return res.status(401).json({ message: 'User not found.' });
      }

      // 5️⃣ Attach user to request
      req.user = user;
      next();

    } catch (error) {
      console.error('🔴 Auth Middleware Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.error('🔴 Auth Middleware - No token provided');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};


// ... (other middleware functions like adminMiddleware should be here)
