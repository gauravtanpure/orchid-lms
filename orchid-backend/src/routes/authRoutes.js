// /backend/src/routes/authRoutes.js
import express from 'express';
// Note the .js extension is REQUIRED
import { registerUser, loginUser } from '../controllers/authController.js'; 

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Use 'export default' instead of 'module.exports'
export default router;