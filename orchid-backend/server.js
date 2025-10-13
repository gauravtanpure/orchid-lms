// /backend/server.js

import 'dotenv/config'; // ES Module way to load .env
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// ✅ FIX: Use 'import' and ensure all local files have the .js extension
import authRoutes from './src/routes/authRoutes.js';
import courseRoutes from './src/routes/courseRoutes.js';
import couponRoutes from './src/routes/couponRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import blogRoutes from './src/routes/blogRoutes.js'; // This must be a default import

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
// Mongoose V8+ no longer requires useNewUrlParser/useUnifiedTopology
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);

app.get('/', (req, res) => {
  res.send('Orchid API is running!');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});