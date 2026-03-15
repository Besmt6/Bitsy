import express from 'express';
import { protect } from '../middleware/auth.js';
import MCPSearchLog from '../models/MCPSearchLog.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

const router = express.Router();

// @route   GET /api/analytics/mcp-discovery
// @desc    Get MCP search analytics for the authenticated hotel
// @access  Private
router.get('/mcp-discovery', protect, async (req, res) => {
  try {
    const hotelId = req.hotel._id.toString();
    
    // Get date range (default: last 30 days)
    const daysAgo = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    // Find all searches where this hotel appeared
    const searches = await MCPSearchLog.find({
      hotelIdsReturned: hotelId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 });
    
    // Total appearances
    const totalAppearances = searches.length;
    
    // Group by source
    const bySource = searches.reduce((acc, search) => {
      acc[search.source] = (acc[search.source] || 0) + 1;
      return acc;
    }, {});
    
    // Top search locations
    const locationCounts = searches.reduce((acc, search) => {
      const loc = search.searchParams.location || 'Unknown';
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {});
    
    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
    
    // Appearances by day (last 30 days)
    const dailyStats = {};
    for (let i = 0; i < daysAgo; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyStats[dateKey] = 0;
    }
    
    searches.forEach(search => {
      const dateKey = search.timestamp.toISOString().split('T')[0];
      if (dailyStats.hasOwnProperty(dateKey)) {
        dailyStats[dateKey]++;
      }
    });
    
    const dailyAppearances = Object.entries(dailyStats)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));
    
    // Recent searches (last 10)
    const recentSearches = searches.slice(0, 10).map(s => ({
      date: s.timestamp,
      location: s.searchParams.location,
      blockchain: s.searchParams.blockchain,
      source: s.source,
      totalResults: s.resultsCount
    }));
    
    // Overall stats for this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthSearches = await MCPSearchLog.countDocuments({
      hotelIdsReturned: hotelId,
      timestamp: { $gte: thisMonth }
    });
    
    res.json({
      success: true,
      analytics: {
        period: {
          days: daysAgo,
          startDate,
          endDate: new Date()
        },
        summary: {
          totalAppearances,
          thisMonth: thisMonthSearches,
          averagePerDay: (totalAppearances / daysAgo).toFixed(1)
        },
        bySource,
        topLocations,
        dailyAppearances,
        recentSearches
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics' 
    });
  }
});

// @route   GET /api/analytics/overview
// @desc    Get overall platform analytics (for future admin dashboard)
// @access  Private
router.get('/overview', protect, async (req, res) => {
  try {
    const hotelId = req.hotel._id.toString();
    const hotel = await Hotel.findById(hotelId);
    
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    // This can be expanded with more metrics later
    res.json({
      success: true,
      overview: {
        hotelName: hotel.hotelName,
        createdAt: hotel.createdAt,
        activeRooms: await Room.countDocuments({ hotelId, isActive: true }),
        totalWallets: Object.values(hotel.wallets).filter(w => w).length
      }
    });
  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

export default router;
