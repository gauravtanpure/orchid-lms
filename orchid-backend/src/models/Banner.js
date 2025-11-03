// backend/src/models/Banner.js

import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: '/',
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  // We don't need content here anymore
}, {
  timestamps: true,
});

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;