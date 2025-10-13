// /backend/src/routes/couponRoutes.js
import express from 'express';
const router = express.Router();
import Coupon from '../models/Coupon.js'; // MUST ADD .js
import { protect } from '../middleware/authMiddleware.js'; // MUST ADD .js
import { adminMiddleware } from '../middleware/adminMiddleware.js'; // MUST ADD .js

// GET all active coupons (Public)
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.status(200).json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Server error while fetching coupons.' });
  }
});

// GET all coupons (for Admin Panel) - Protected
router.get('/all', protect, adminMiddleware, async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
     res.status(500).json({ message: 'Server error while fetching all coupons.' });
  }
});


// POST: Create a new coupon (Admin only) - Protected
router.post('/', protect, adminMiddleware, async (req, res) => {
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

// POST: Validate a coupon for the user's cart (Public)
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

// PUT: Update a coupon (Admin only) - Protected
router.put('/:id', protect, adminMiddleware, async (req, res) => {
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

// DELETE: Delete a coupon (Admin only) - Protected
router.delete('/:id', protect, adminMiddleware, async (req, res) => {
    try {
        // Use findByIdAndDelete (Mongoose 8+)
        const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id); 
        if (!deletedCoupon) {
            return res.status(404).json({ message: 'Coupon not found.' });
        }
        res.status(200).json({ message: 'Coupon deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting coupon.' });
    }
});


export default router; // Export statement