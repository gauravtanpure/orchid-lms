// /backend/src/routes/couponRoutes.js
const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
// Note: In a real app, you'd protect admin routes with middleware, e.g., const { isAdmin } = require('../middleware/authMiddleware');

// GET all active coupons (You already have this)
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.status(200).json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Server error while fetching coupons.' });
  }
});

// ---------------------------------------------------
// --- NEW: Admin & Validation Routes ---
// ---------------------------------------------------

// GET all coupons (for Admin Panel)
// We need a route to get ALL coupons, including inactive ones for the admin.
// In a real app, protect this with: router.get('/all', isAdmin, async (req, res) => { ... });
router.get('/all', async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
     res.status(500).json({ message: 'Server error while fetching all coupons.' });
  }
});


// POST: Create a new coupon (Admin only)
router.post('/', async (req, res) => {
  try {
    const { code, discount, type, description, minAmount } = req.body;
    
    // Basic validation
    if (!code || !discount || !type || !description) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'A coupon with this code already exists.' });
    }
    
    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      discount,
      type,
      description,
      minAmount: minAmount || 0,
    });

    await newCoupon.save();
    res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });

  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST: Validate a coupon for the user's cart
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required.' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon code.' });
    }

    if (subtotal < coupon.minAmount) {
      return res.status(400).json({ 
        message: `This coupon requires a minimum purchase of ₹${coupon.minAmount}.` 
      });
    }

    // If all checks pass, return the valid coupon details
    res.status(200).json(coupon);

  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ message: 'Server error while validating coupon.' });
  }
});

// PUT: Update a coupon (Admin only)
router.put('/:id', async (req, res) => {
    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // new:true returns the updated doc
        );
        if (!updatedCoupon) {
            return res.status(404).json({ message: 'Coupon not found.' });
        }
        res.status(200).json({ message: 'Coupon updated successfully', coupon: updatedCoupon });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating coupon.' });
    }
});

// DELETE: Delete a coupon (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!deletedCoupon) {
            return res.status(404).json({ message: 'Coupon not found.' });
        }
        res.status(200).json({ message: 'Coupon deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting coupon.' });
    }
});


module.exports = router;