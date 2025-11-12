// ✅ /backend/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './src/routes/authRoutes.js';
import courseRoutes from './src/routes/courseRoutes.js';
import couponRoutes from './src/routes/couponRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import blogRoutes from './src/routes/blogRoutes.js';
import bannerRoutes from './src/routes/bannerRoutes.js';
import dubbingRoutes from './src/routes/dubbingRoutes.js';
import dynamicDubbingRoutes from './src/routes/dynamicDubbingRoutes.js';
import progressRoutes from './src/routes/progressRoutes.js';

const app = express();
const PORT = process.env.PORT || 1337;

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/dubbing', dubbingRoutes);
app.use('/api/dubbing', dynamicDubbingRoutes);
app.use('/api/users', progressRoutes);

app.get('/', (req, res) => res.send('Orchid API is running!'));

app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
