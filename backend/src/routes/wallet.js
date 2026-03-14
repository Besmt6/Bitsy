import express from 'express';
import { protect } from '../middleware/auth.js';
import Hotel from '../models/Hotel.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   GET /api/wallets
// @desc    Get wallet addresses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      wallets: req.hotel.wallets
    });
  } catch (error) {
    console.error('Get wallets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/wallets
// @desc    Update wallet addresses
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    const { bitcoin, ethereum, polygon, solana, tron } = req.body;

    const updateFields = {};
    if (bitcoin !== undefined) updateFields['wallets.bitcoin'] = bitcoin.trim();
    if (ethereum !== undefined) updateFields['wallets.ethereum'] = ethereum.trim();
    if (polygon !== undefined) updateFields['wallets.polygon'] = polygon.trim();
    if (solana !== undefined) updateFields['wallets.solana'] = solana.trim();
    if (tron !== undefined) updateFields['wallets.tron'] = tron.trim();

    const hotel = await Hotel.findByIdAndUpdate(
      req.hotel._id,
      { $set: updateFields },
      { new: true }
    );

    res.json({
      success: true,
      wallets: hotel.wallets
    });
  } catch (error) {
    console.error('Update wallets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
