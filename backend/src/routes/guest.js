import express from 'express';
import BookingStat from '../models/BookingStat.js';
import Guest from '../models/Guest.js';
import Hotel from '../models/Hotel.js';

const router = express.Router();

// @route   POST /api/guest/verify
// @desc    Verify guest credentials and check if they have bookings
// @access  Public
router.post('/verify', async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ error: 'Email and phone are required' });
    }

    // Find guest across all hotels
    const guests = await Guest.find({ 
      email: email.toLowerCase(),
      phone: phone
    });

    if (guests.length === 0) {
      return res.status(404).json({ error: 'No bookings found for this email and phone combination' });
    }

    res.json({
      success: true,
      guestCount: guests.length,
      message: 'Guest verified successfully'
    });
  } catch (error) {
    console.error('Guest verify error:', error);
    res.status(500).json({ error: 'Server error verifying guest' });
  }
});

// @route   POST /api/guest/bookings
// @desc    Get all bookings for a guest (across all hotels)
// @access  Public (verified by email + phone)
router.post('/bookings', async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ error: 'Email and phone are required' });
    }

    // Find all guests matching this email/phone
    const guests = await Guest.find({ 
      email: email.toLowerCase(),
      phone: phone
    });

    if (guests.length === 0) {
      return res.json({
        success: true,
        count: 0,
        bookings: []
      });
    }

    // Get all bookings for these guests
    const guestIds = guests.map(g => g._id);
    const bookings = await BookingStat.find({
      guestId: { $in: guestIds }
    })
      .populate('hotelId', 'hotelName logoUrl contactPhone contactEmail')
      .populate('guestId', 'name email phone')
      .sort({ date: -1 })
      .lean();

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get guest bookings error:', error);
    res.status(500).json({ error: 'Server error fetching bookings' });
  }
});

// @route   POST /api/guest/bookings/:bookingRef
// @desc    Get single booking details for guest
// @access  Public (verified by email + phone)
router.post('/bookings/:bookingRef', async (req, res) => {
  try {
    const { email, phone } = req.body;
    const { bookingRef } = req.params;

    if (!email || !phone) {
      return res.status(400).json({ error: 'Email and phone are required' });
    }

    const booking = await BookingStat.findOne({ bookingRef })
      .populate('hotelId', 'hotelName logoUrl contactPhone contactEmail')
      .populate('guestId', 'name email phone')
      .populate('originalGuestId', 'name email')
      .lean();

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify guest owns this booking
    if (booking.guestId.email.toLowerCase() !== email.toLowerCase() || 
        booking.guestId.phone !== phone) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({ error: 'Server error fetching booking' });
  }
});

// @route   POST /api/guest/bookings/:bookingRef/cancel
// @desc    Cancel a booking (guest-initiated)
// @access  Public (verified by email + phone)
router.post('/bookings/:bookingRef/cancel', async (req, res) => {
  try {
    const { email, phone, reason } = req.body;
    const { bookingRef } = req.params;

    if (!email || !phone) {
      return res.status(400).json({ error: 'Email and phone are required' });
    }

    const booking = await BookingStat.findOne({ bookingRef })
      .populate('guestId')
      .populate('hotelId');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify guest owns this booking
    if (booking.guestId.email.toLowerCase() !== email.toLowerCase() || 
        booking.guestId.phone !== phone) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed booking' });
    }

    if (booking.listedForTransfer) {
      return res.status(400).json({ error: 'Cannot cancel a booking that is listed on marketplace. Please unlist it first.' });
    }

    // Cancel the booking
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = 'guest';
    booking.cancellationReason = reason || 'Cancelled by guest';
    await booking.save();

    // TODO: Send cancellation notification to hotel

    console.log(`❌ Booking cancelled by guest: ${bookingRef}`);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      refundNote: booking.paymentMethod === 'crypto' 
        ? 'Crypto payments are non-refundable. You may have been able to list this on marketplace for transfer.'
        : 'No payment was made. Your cancellation is complete.'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Server error cancelling booking' });
  }
});

export default router;
