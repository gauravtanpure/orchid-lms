export const adminMiddleware = (req, res, next) => {
  console.log('🟡 Admin Middleware - Checking user role...');
  console.log('User from request:', req.user);
  console.log('User role:', req.user?.role);

  if (req.user && req.user.role === 'admin') {
    console.log('🟢 Admin Middleware - User is admin, access granted');
    next();
  } else {
    console.error('🔴 Admin Middleware - Access denied. User role:', req.user?.role);
    res.status(403).json({ 
      message: 'Access denied. Admin privileges required.',
      userRole: req.user?.role,
      userId: req.user?._id
    });
  }
};