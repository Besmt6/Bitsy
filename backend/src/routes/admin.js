import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Hotel from '../models/Hotel.js';
import BookingStat from '../models/BookingStat.js';
import MarketplaceListing from '../models/MarketplaceListing.js';
import logger from '../config/logger.js';

const router = express.Router();

// Admin auth middleware
const adminProtect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select('-password');

    if (!req.admin || !req.admin.isActive) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    next();
  } catch (error) {
    logger.error('Admin auth error', { error: error.message });
    res.status(401).json({ error: 'Not authorized, invalid token' });
  }
};

// @route   POST /api/admin/auth/login
// @desc    Admin login
// @access  Public
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info('Admin logged in', { adminId: admin._id, email: admin.email });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    logger.error('Admin login error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/admin/platform/stats
// @desc    Get platform-wide statistics
// @access  Private (Admin)
router.get('/platform/stats', adminProtect, async (req, res) => {
  try {
    const [hotels, bookings, activeListings] = await Promise.all([
      Hotel.countDocuments(),
      BookingStat.countDocuments(),
      MarketplaceListing.countDocuments({ status: 'available' })
    ]);

    const activeHotels = await Hotel.countDocuments({ isActive: true });
    const blockedHotels = await Hotel.countDocuments({ 'billing.billingStatus': 'blocked' });
    const graceHotels = await Hotel.countDocuments({ 'billing.billingStatus': 'grace' });

    // Calculate total revenue and commissions
    const allBookings = await BookingStat.find();
    const totalRevenue = allBookings.reduce((sum, b) => sum + (b.totalUsd || 0), 0);
    const totalCommission = totalRevenue * 0.02; // 2% commission

    // Get hotels owing commission (exceeded trial, not paid)
    const hotelsOwingCommission = await Hotel.find({
      'billing.billingStatus': { $in: ['grace', 'blocked'] }
    }).select('hotelName email billing');

    const commissionsOwed = hotelsOwingCommission.map(hotel => {
      const revenue = hotel.billing.trialUsedUsd || 0;
      const commission = Math.round(revenue * 0.02 * 100) / 100;
      return {
        hotelId: hotel._id,
        hotelName: hotel.hotelName,
        email: hotel.email,
        revenue,
        commissionOwed: commission,
        status: hotel.billing.billingStatus,
        graceEndsAt: hotel.billing.graceEndsAt
      };
    });

    const totalOwed = commissionsOwed.reduce((sum, c) => sum + c.commissionOwed, 0);

    // Recent activity (last 10 bookings)
    const recentBookings = await BookingStat.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('hotelId', 'hotelName');

    logger.info('Admin fetched platform stats', { adminId: req.admin._id });

    res.json({
      success: true,
      stats: {
        hotels: {
          total: hotels,
          active: activeHotels,
          grace: graceHotels,
          blocked: blockedHotels
        },
        bookings: {
          total: bookings,
          revenue: Math.round(totalRevenue * 100) / 100
        },
        marketplace: {
          activeListings
        },
        commissions: {
          totalCommission: Math.round(totalCommission * 100) / 100,
          totalOwed: Math.round(totalOwed * 100) / 100,
          hotelsOwing: commissionsOwed.length
        }
      },
      commissionsOwed,
      recentActivity: recentBookings.map(b => ({
        id: b._id,
        bookingRef: b.bookingRef,
        hotelName: b.hotelId?.hotelName || 'Unknown',
        guestName: b.guestInfo?.name || 'Guest',
        totalUsd: b.totalUsd,
        status: b.bookingStatus,
        createdAt: b.createdAt
      }))
    });
  } catch (error) {
    logger.error('Platform stats error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/admin/hotels
// @desc    Get all hotels with filters
// @access  Private (Admin)
router.get('/hotels', adminProtect, async (req, res) => {
  try {
    const { status, billingStatus, search } = req.query;

    let query = {};

    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (billingStatus) query['billing.billingStatus'] = billingStatus;
    if (search) {
      query.$or = [
        { hotelName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const hotels = await Hotel.find(query).sort({ createdAt: -1 });

    // Get booking counts for each hotel
    const hotelsWithStats = await Promise.all(
      hotels.map(async (hotel) => {
        const bookingCount = await BookingStat.countDocuments({ hotelId: hotel._id });
        const revenue = hotel.billing.trialUsedUsd || 0;
        const commission = Math.round(revenue * 0.02 * 100) / 100;

        return {
          id: hotel._id,
          hotelName: hotel.hotelName,
          email: hotel.email,
          isActive: hotel.isActive,
          tier: hotel.tier,
          billingStatus: hotel.billing.billingStatus,
          revenue,
          commission,
          bookingCount,
          graceEndsAt: hotel.billing.graceEndsAt,
          createdAt: hotel.createdAt,
          lastPaymentAt: hotel.billing.lastPaymentReceivedAt
        };
      })
    );

    logger.info('Admin fetched hotels list', { 
      adminId: req.admin._id, 
      count: hotels.length 
    });

    res.json({
      success: true,
      count: hotels.length,
      hotels: hotelsWithStats
    });
  } catch (error) {
    logger.error('Admin hotels list error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/admin/hotels/:hotelId
// @desc    Get detailed hotel analytics
// @access  Private (Admin)
router.get('/hotels/:hotelId', adminProtect, async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const bookings = await BookingStat.find({ hotelId }).sort({ createdAt: -1 });

    const analytics = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalUsd || 0), 0),
      avgBookingValue: bookings.length > 0 
        ? bookings.reduce((sum, b) => sum + (b.totalUsd || 0), 0) / bookings.length 
        : 0,
      paymentMethods: {
        crypto: bookings.filter(b => b.cryptoPayment?.confirmed).length,
        payAtProperty: bookings.filter(b => !b.cryptoPayment?.confirmed).length
      },
      recentBookings: bookings.slice(0, 20)
    };

    logger.info('Admin fetched hotel details', { 
      adminId: req.admin._id, 
      hotelId 
    });

    res.json({
      success: true,
      hotel: {
        id: hotel._id,
        hotelName: hotel.hotelName,
        email: hotel.email,
        isActive: hotel.isActive,
        tier: hotel.tier,
        billing: hotel.billing,
        createdAt: hotel.createdAt,
        locationVerification: hotel.locationVerification,
        wallets: hotel.wallets
      },
      analytics
    });
  } catch (error) {
    logger.error('Admin hotel details error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PATCH /api/admin/hotels/:hotelId/status
// @desc    Suspend or activate hotel
// @access  Private (Admin)
router.patch('/hotels/:hotelId/status', adminProtect, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be true or false' });
    }

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    hotel.isActive = isActive;
    await hotel.save();

    logger.info('Admin updated hotel status', {
      adminId: req.admin._id,
      hotelId,
      hotelName: hotel.hotelName,
      newStatus: isActive ? 'active' : 'suspended'
    });

    res.json({
      success: true,
      message: `Hotel ${isActive ? 'activated' : 'suspended'} successfully`,
      hotel: {
        id: hotel._id,
        hotelName: hotel.hotelName,
        isActive: hotel.isActive
      }
    });
  } catch (error) {
    logger.error('Admin hotel status update error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PATCH /api/admin/hotels/:hotelId/commission
// @desc    Mark commission as paid
// @access  Private (Admin)
router.patch('/hotels/:hotelId/commission', adminProtect, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { txHash, amount, chain } = req.body;

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Update billing status
    hotel.billing.billingStatus = 'active';
    hotel.billing.lastPaymentReceivedAt = new Date();
    hotel.billing.graceEndsAt = null;
    hotel.billing.trialExceededAt = null;

    // Reset trial usage for next cycle
    hotel.billing.trialUsedUsd = 0;

    await hotel.save();

    logger.info('Admin marked commission as paid', {
      adminId: req.admin._id,
      hotelId,
      hotelName: hotel.hotelName,
      amount,
      txHash,
      chain
    });

    res.json({
      success: true,
      message: 'Commission marked as paid',
      hotel: {
        id: hotel._id,
        hotelName: hotel.hotelName,
        billingStatus: hotel.billing.billingStatus
      }
    });
  } catch (error) {
    logger.error('Admin commission update error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/admin/commissions
// @desc    Get all hotels with commission status
// @access  Private (Admin)
router.get('/commissions', adminProtect, async (req, res) => {
  try {
    const hotels = await Hotel.find().select('hotelName email billing isActive createdAt');

    const commissionsData = await Promise.all(
      hotels.map(async (hotel) => {
        const bookings = await BookingStat.find({ hotelId: hotel._id });
        const revenue = bookings.reduce((sum, b) => sum + (b.totalUsd || 0), 0);
        const commission = Math.round(revenue * 0.02 * 100) / 100;
        const isPaid = hotel.billing.billingStatus === 'active';
        const isOverdue = hotel.billing.billingStatus === 'blocked';

        return {
          hotelId: hotel._id,
          hotelName: hotel.hotelName,
          email: hotel.email,
          isActive: hotel.isActive,
          revenue: Math.round(revenue * 100) / 100,
          commission,
          billingStatus: hotel.billing.billingStatus,
          isPaid,
          isOverdue,
          graceEndsAt: hotel.billing.graceEndsAt,
          lastPaymentAt: hotel.billing.lastPaymentReceivedAt,
          createdAt: hotel.createdAt
        };
      })
    );

    // Sort by commission owed (highest first)
    commissionsData.sort((a, b) => b.commission - a.commission);

    logger.info('Admin fetched commissions', { adminId: req.admin._id });

    res.json({
      success: true,
      commissions: commissionsData
    });
  } catch (error) {
    logger.error('Admin commissions error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/admin/billing/alerts
// @desc    Get hotels in grace period or blocked
// @access  Private (Admin)
router.get('/billing/alerts', adminProtect, async (req, res) => {
  try {
    const graceHotels = await Hotel.find({ 
      'billing.billingStatus': 'grace' 
    }).select('hotelName email billing');

    const blockedHotels = await Hotel.find({ 
      'billing.billingStatus': 'blocked' 
    }).select('hotelName email billing');

    const graceAlerts = await Promise.all(
      graceHotels.map(async (hotel) => {
        const revenue = hotel.billing.trialUsedUsd || 0;
        const commission = Math.round(revenue * 0.02 * 100) / 100;
        const daysRemaining = hotel.billing.graceEndsAt 
          ? Math.ceil((hotel.billing.graceEndsAt - new Date()) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          hotelId: hotel._id,
          hotelName: hotel.hotelName,
          email: hotel.email,
          revenue,
          commission,
          graceEndsAt: hotel.billing.graceEndsAt,
          daysRemaining,
          severity: daysRemaining <= 2 ? 'high' : 'medium'
        };
      })
    );

    const blockedAlerts = await Promise.all(
      blockedHotels.map(async (hotel) => {
        const revenue = hotel.billing.trialUsedUsd || 0;
        const commission = Math.round(revenue * 0.02 * 100) / 100;

        return {
          hotelId: hotel._id,
          hotelName: hotel.hotelName,
          email: hotel.email,
          revenue,
          commission,
          blockedSince: hotel.billing.graceEndsAt,
          severity: 'critical'
        };
      })
    );

    logger.info('Admin fetched billing alerts', { adminId: req.admin._id });

    res.json({
      success: true,
      grace: graceAlerts,
      blocked: blockedAlerts,
      totalAlerts: graceAlerts.length + blockedAlerts.length
    });
  } catch (error) {
    logger.error('Admin billing alerts error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/admin/activity
// @desc    Get recent platform activity
// @access  Private (Admin)
router.get('/activity', adminProtect, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const recentBookings = await BookingStat.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('hotelId', 'hotelName email');

    const activity = recentBookings.map(b => ({
      id: b._id,
      type: 'booking',
      bookingRef: b.bookingRef,
      hotel: {
        id: b.hotelId?._id,
        name: b.hotelId?.hotelName || 'Unknown',
        email: b.hotelId?.email
      },
      guest: {
        name: b.guestInfo?.name || 'Guest',
        email: b.guestInfo?.email
      },
      amount: b.totalUsd,
      status: b.bookingStatus,
      paymentMethod: b.cryptoPayment?.confirmed ? 'crypto' : 'pay_at_property',
      createdAt: b.createdAt
    }));

    logger.info('Admin fetched activity', { adminId: req.admin._id });

    res.json({
      success: true,
      activity
    });
  } catch (error) {
    logger.error('Admin activity error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
