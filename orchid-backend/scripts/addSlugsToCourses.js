// /scripts/addSlugsToCourses.js
import mongoose from 'mongoose';
import slugify from 'slugify';
import dotenv from 'dotenv';
import Course from '../src/models/Course.js';

dotenv.config();

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ MongoDB connection string not found in .env');
  process.exit(1);
}

try {
  await mongoose.connect(mongoURI);
  console.log('✅ Connected to MongoDB');

  const courses = await Course.find();
  for (const course of courses) {
    if (!course.slug) {
      course.slug = slugify(course.title, { lower: true, strict: true });
      await course.save();
      console.log(`Added slug for: ${course.title}`);
    }
  }

  console.log('✅ All missing slugs added successfully.');
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error('❌ Error adding slugs:', err.message);
  process.exit(1);
}
