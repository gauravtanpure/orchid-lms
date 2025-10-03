// /backend/src/middleware/multerMiddleware.js
const multer = require('multer');

// Configure multer to use memory storage.
// This temporarily stores files as Buffers in memory.
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB file size limit
  },
});

module.exports = upload;