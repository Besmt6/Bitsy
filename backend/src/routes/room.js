import express from 'express';
import { protect } from '../middleware/auth.js';
import Room from '../models/Room.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   GET /api/rooms
// @desc    Get all rooms for hotel
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find({ hotelId: req.hotel._id, isActive: true });
    
    res.json({
      success: true,
      rooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/rooms
// @desc    Create new room
// @access  Private
router.post('/', [
  protect,
  body('roomType').trim().notEmpty(),
  body('rate').isNumeric().isFloat({ min: 0 }),
  body('availableCount').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { roomType, description, rate, availableCount } = req.body;

    const room = new Room({
      hotelId: req.hotel._id,
      roomType,
      description: description || '',
      rate: parseFloat(rate),
      availableCount: parseInt(availableCount)
    });

    await room.save();

    res.status(201).json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { roomType, description, rate, availableCount } = req.body;

    // Find room and verify ownership
    const room = await Room.findOne({ _id: req.params.id, hotelId: req.hotel._id });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Update fields
    if (roomType !== undefined) room.roomType = roomType;
    if (description !== undefined) room.description = description;
    if (rate !== undefined) room.rate = parseFloat(rate);
    if (availableCount !== undefined) room.availableCount = parseInt(availableCount);

    await room.save();

    res.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete room (soft delete)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.id, hotelId: req.hotel._id });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    room.isActive = false;
    await room.save();

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
