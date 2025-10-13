// /backend/src/middleware/multerMiddleware.js
import multer from 'multer'; // Import statement

// Configure multer to use memory storage.
// This temporarily stores files as Buffers in memory.
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB file size limit
  },
});

export default upload; // Export statement