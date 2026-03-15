import express from 'express';
import BookingStat from '../models/BookingStat.js';
import Guest from '../models/Guest.js';
import Hotel from '../models/Hotel.js';
import { protect } from '../middleware/auth.js';
import { updateBillingStatus } from '../services/billingService.js';

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get all bookings for a hotel with filters
// @access  Private (Hotel owner)
router.get('/', protect, async (req, res) => {
  try {
    const hotelId = req.hotel._id;
    const { status, paymentMethod, startDate, endDate, search } = req.query;

    // Build query
    const query = { hotelId };

    if (status) {
      query.status = status;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.checkIn = {};
      if (startDate) query.checkIn.$gte = startDate;
      if (endDate) query.checkIn.$lte = endDate;
    }

    // Get bookings with guest details
    let bookings = await BookingStat.find(query)
      .populate('guestId', 'name email phone totalBookings')
      .populate('originalGuestId', 'name email') // For transferred bookings
      .sort({ date: -1 })
      .limit(100)
      .lean();

    // Search filter (if provided)
    if (search) {
      const searchLower = search.toLowerCase();
      bookings = bookings.filter(b => 
        b.bookingRef.toLowerCase().includes(searchLower) ||
        b.guestId?.name.toLowerCase().includes(searchLower) ||
        b.guestId?.email.toLowerCase().includes(searchLower) ||
        b.roomType.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Server error fetching bookings' });
  }
});

// @route   GET /api/bookings/:bookingRef
// @desc    Get single booking details
// @access  Private (Hotel owner)
router.get('/:bookingRef', protect, async (req, res) => {
  try {
    const booking = await BookingStat.findOne({ 
      bookingRef: req.params.bookingRef,
      hotelId: req.hotel._id 
    })
      .populate('guestId')
      .populate('originalGuestId')
      .lean();

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
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

// @route   POST /api/bookings/:bookingRef/confirm
// @desc    Confirm a pay-at-property booking (after guest calls)
// @access  Private (Hotel owner)
router.post('/:bookingRef/confirm', protect, async (req, res) => {
  try {
    const booking = await BookingStat.findOne({
      bookingRef: req.params.bookingRef,
      hotelId: req.hotel._id
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.paymentMethod !== 'pay_at_property') {
      return res.status(400).json({ error: 'Only pay-at-property bookings can be confirmed' });
    }

    if (booking.status !== 'pending_confirmation') {
      return res.status(400).json({ error: 'Booking is not pending confirmation' });
    }

    // Update booking status
    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
    booking.confirmedBy = 'hotel';
    await booking.save();

    // Recalculate and update hotel billing status
    try {
      const billingInfo = await updateBillingStatus(req.hotel);
      console.log(`✅ Booking confirmed: ${booking.bookingRef} | Trial usage: $${billingInfo.trialUsedUsd}/$${billingInfo.trialLimitUsd} (${billingInfo.billingStatus})`);
    } catch (billingError) {
      console.error('Error updating billing status:', billingError);
      // Don't fail the confirmation if billing update fails
    }

    // TODO: Send confirmation email to guest

    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: {
        bookingRef: booking.bookingRef,
        status: booking.status,
        confirmedAt: booking.confirmedAt
      }
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({ error: 'Server error confirming booking' });
  }
});

// @route   POST /api/bookings/:bookingRef/reject
// @desc    Reject a booking
// @access  Private (Hotel owner)
router.post('/:bookingRef/reject', protect, async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await BookingStat.findOne({
      bookingRef: req.params.bookingRef,
      hotelId: req.hotel._id
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot reject a completed booking' });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = 'hotel';
    booking.cancellationReason = reason || 'Rejected by hotel';
    await booking.save();

    // TODO: Send rejection email to guest

    console.log(`❌ Booking rejected: ${booking.bookingRef}`);

    res.json({
      success: true,
      message: 'Booking rejected successfully'
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ error: 'Server error rejecting booking' });
  }
});

// @route   GET /api/bookings/stats/summary
// @desc    Get booking statistics summary for dashboard
// @access  Private (Hotel owner)
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const hotelId = req.hotel._id;

    const [
      totalBookings,
      pendingConfirmation,
      confirmedBookings,
      cancelledBookings,
      listedBookings
    ] = await Promise.all([
      BookingStat.countDocuments({ hotelId }),
      BookingStat.countDocuments({ hotelId, status: 'pending_confirmation' }),
      BookingStat.countDocuments({ hotelId, status: 'confirmed' }),
      BookingStat.countDocuments({ hotelId, status: 'cancelled' }),
      BookingStat.countDocuments({ hotelId, status: 'listed_for_transfer' })
    ]);

    res.json({
      success: true,
      summary: {
        total: totalBookings,
        pending: pendingConfirmation,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        listed: listedBookings
      }
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

export default router;
