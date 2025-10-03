// /backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes'); // <-- IMPORT
const couponRoutes = require('./src/routes/couponRoutes'); 
const userRoutes = require('./src/routes/userRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes); // <-- USE NEW ROUTES
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Orchid API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});