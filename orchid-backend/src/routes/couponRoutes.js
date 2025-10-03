// /backend/src/routes/couponRoutes.js
const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// GET all active coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.status(200).json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Server error while fetching coupons.' });
  }
});

module.exports = router;