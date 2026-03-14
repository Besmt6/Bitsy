import express from 'express';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import BookingStat from '../models/BookingStat.js';
import { getChatResponse } from '../services/llmService.js';
import { generateQRCode } from '../services/qrService.js';
import { sendNotification } from '../services/notificationService.js';

const router = express.Router();

// @route   GET /api/widget/:hotelId/config
// @desc    Get hotel configuration for widget
// @access  Public
router.get('/:hotelId/config', async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel || !hotel.isActive) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const rooms = await Room.find({ hotelId, isActive: true });

    res.json({
      success: true,
      config: {
        hotelId: hotel._id,
        hotelName: hotel.hotelName,
        logoUrl: hotel.logoUrl,
        contactPhone: hotel.contactPhone,
        contactEmail: hotel.contactEmail,
        rooms: rooms.map(room => ({
          id: room._id,
          type: room.roomType,
          description: room.description,
          rate: room.rate,
          available: room.availableCount
        })),
        wallets: hotel.wallets,
        widgetSettings: hotel.widgetSettings
      }
    });
  } catch (error) {
    console.error('Get widget config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/widget/:hotelId/chat
// @desc    Handle chat conversation with Bitsy AI
// @access  Public
router.post('/:hotelId/chat', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { message, sessionId, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const rooms = await Room.find({ hotelId, isActive: true });

    // Get AI response
    const response = await getChatResponse({
      message,
      sessionId,
      hotelName: hotel.hotelName,
      rooms,
      conversationHistory: conversationHistory || []
    });

    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Server error processing chat' });
  }
});

// @route   POST /api/widget/:hotelId/book
// @desc    Submit booking (creates stat record and sends notification)
// @access  Public
router.post('/:hotelId/book', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { bookingDetails } = req.body;

    if (!bookingDetails) {
      return res.status(400).json({ error: 'Booking details are required' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Validate required fields
    const required = ['check_in', 'check_out', 'room_type', 'nights', 'total_usd', 'guest_name', 'guest_email', 'guest_phone', 'crypto_choice'];
    for (const field of required) {
      if (!bookingDetails[field]) {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }

    // Generate booking reference
    const bookingRef = `BIT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Create booking stat record (NO GUEST PII)
    const bookingStat = new BookingStat({
      hotelId,
      bookingRef,
      date: new Date(),
      checkIn: bookingDetails.check_in,
      checkOut: bookingDetails.check_out,
      roomType: bookingDetails.room_type,
      nights: bookingDetails.nights,
      totalUsd: bookingDetails.total_usd,
      cryptoType: bookingDetails.crypto_choice
    });

    await bookingStat.save();

    // Get wallet address for selected crypto
    const walletAddress = hotel.wallets[bookingDetails.crypto_choice];

    // Generate QR code
    const qrCode = await generateQRCode({
      address: walletAddress,
      chain: bookingDetails.crypto_choice,
      amount: bookingDetails.total_usd
    });

    // Send notification (console + Telegram if configured)
    await sendNotification({
      hotel,
      bookingRef,
      bookingDetails,
      walletAddress
    });

    res.json({
      success: true,
      bookingRef,
      qrCode,
      walletAddress,
      message: 'Booking submitted successfully. Hotel has been notified.'
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Server error processing booking' });
  }
});

export default router;
