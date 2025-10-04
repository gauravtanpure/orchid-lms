// /backend/src/middleware/adminMiddleware.js

const admin = (req, res, next) => {
  // Check if a user is attached to the request (from the 'protect' middleware)
  // and if that user has the 'admin' role.
  if (req.user && req.user.role === 'admin') {
    next(); // User is an admin, proceed to the next function
  } else {
    // If not an admin, send a 403 Forbidden error
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { admin };