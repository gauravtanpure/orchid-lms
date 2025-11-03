// ✅ /backend/src/routes/bannerRoutes.js

import express from 'express';
import Banner from '../models/Banner.js';
import cloudinary from '../config/cloudinaryConfig.js';
import upload from '../middleware/multerMiddleware.js';
import { adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ============================================================
   1️⃣ Get all banners (Admin only)
   ============================================================ */
router.get('/', adminProtect, async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    console.error('Error fetching all banners:', error);
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
});

/* ============================================================
   2️⃣ Get the active banner (Public)
   ============================================================ */
router.get('/active', async (req, res) => {
  try {
    const activeBanner = await Banner.findOne({ isActive: true }).lean();

    if (!activeBanner) {
      return res.status(404).json({ message: 'No active banner found', banner: null });
    }

    res.status(200).json(activeBanner);
  } catch (error) {
    console.error('Error fetching active banner:', error);
    res.status(500).json({ message: 'Error fetching active banner', error: error.message });
  }
});

/* ============================================================
   3️⃣ Create new banner (Admin only)
   ============================================================ */
router.post('/', adminProtect, upload.single('bannerImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // ✅ Convert in-memory buffer to base64 and upload to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, { folder: 'orchid_banners' });

    const { link = '/' } = req.body;
    const newBanner = new Banner({
      imageUrl: result.secure_url,
      link,
      isActive: false,
    });

    const createdBanner = await newBanner.save();
    res.status(201).json(createdBanner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ message: 'Error creating banner', error: error.message });
  }
});

/* ============================================================
   4️⃣ Update banner (Admin only)
   ============================================================ */
router.put('/:id', adminProtect, async (req, res) => {
  const { isActive, link } = req.body;
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });

    // ✅ If activating this banner, deactivate all others
    if (isActive === true) {
      await Banner.updateMany({ isActive: true }, { isActive: false });
    }

    banner.isActive = isActive ?? banner.isActive;
    banner.link = link ?? banner.link;

    const updated = await banner.save();
    res.json(updated);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Error updating banner', error: error.message });
  }
});

/* ============================================================
   5️⃣ Delete banner (Admin only)
   ============================================================ */
router.delete('/:id', adminProtect, async (req, res) => {
  try {
    const result = await Banner.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json({ message: 'Banner removed successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: 'Error deleting banner', error: error.message });
  }
});

export default router;
