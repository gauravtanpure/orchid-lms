// /backend/src/middleware/multerMiddleware.js
import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  fileFilter: (req, file, cb) => {
    // FIX: Include common video MIME types
    const allowed = [
      'image/jpeg', 
      'image/png', 
      'image/webp',
      'video/mp4',         // Added MP4
      'video/quicktime',   // Added MOV/QuickTime
      'video/webm'         // Added WEBM
    ];
    
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only images (JPG, PNG, WEBP) and videos (MP4, MOV, WEBM) are allowed.'));
    }
    cb(null, true);
  },
});

export default upload;