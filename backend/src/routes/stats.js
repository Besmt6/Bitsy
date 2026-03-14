import express from 'express';
import { protect } from '../middleware/auth.js';
import BookingStat from '../models/BookingStat.js';

const router = express.Router();

// @route   GET /api/stats
// @desc    Get booking statistics
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get all bookings for the period
    const bookings = await BookingStat.find({
      hotelId: req.hotel._id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    // Calculate stats
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalUsd, 0);
    const avgStay = bookings.length > 0 
      ? bookings.reduce((sum, b) => sum + b.nights, 0) / bookings.length 
      : 0;

    // Group by crypto type
    const byCrypto = bookings.reduce((acc, b) => {
      if (!acc[b.cryptoType]) {
        acc[b.cryptoType] = { count: 0, revenue: 0 };
      }
      acc[b.cryptoType].count++;
      acc[b.cryptoType].revenue += b.totalUsd;
      return acc;
    }, {});

    // Group by date for chart data
    const byDate = {};
    bookings.forEach(b => {
      const dateKey = b.date.toISOString().split('T')[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = { date: dateKey, bookings: 0, revenue: 0 };
      }
      byDate[dateKey].bookings++;
      byDate[dateKey].revenue += b.totalUsd;
    });

    const chartData = Object.values(byDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Recent bookings (last 10)
    const recentBookings = bookings.slice(0, 10).map(b => ({
      bookingRef: b.bookingRef,
      date: b.date,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      roomType: b.roomType,
      nights: b.nights,
      total: b.totalUsd,
      crypto: b.cryptoType
    }));

    res.json({
      success: true,
      stats: {
        period,
        totalBookings,
        totalRevenue: totalRevenue.toFixed(2),
        avgStay: avgStay.toFixed(1),
        byCrypto,
        chartData,
        recentBookings
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
