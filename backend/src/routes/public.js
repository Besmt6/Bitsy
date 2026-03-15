import express from 'express';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

const router = express.Router();

// @route   GET /api/public/hotels/search
// @desc    Search hotels by city/name (public)
// @access  Public
router.get('/hotels/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchQuery = {
      isActive: true,
      $or: [
        { hotelName: { $regex: query, $options: 'i' } },
        { 'locationVerification.city': { $regex: query, $options: 'i' } },
        { 'locationVerification.country': { $regex: query, $options: 'i' } },
        { 'locationVerification.state': { $regex: query, $options: 'i' } }
      ]
    };

    const hotels = await Hotel.find(searchQuery).select(
      'hotelName publicSlug logoUrl photos locationVerification.city locationVerification.country'
    );

    // Get lowest rate for each hotel
    const results = await Promise.all(
      hotels.map(async (hotel) => {
        const rooms = await Room.find({
          hotelId: hotel._id,
          isActive: true,
          availableCount: { $gt: 0 }
        }).select('rate');

        const lowestRate = rooms.length > 0 
          ? Math.min(...rooms.map(r => r.rate))
          : null;

        const primaryPhoto = hotel.photos?.find(p => p.isPrimary)?.url || hotel.photos?.[0]?.url || null;

        return {
          id: hotel._id.toString(),
          name: hotel.hotelName,
          slug: hotel.publicSlug,
          logoUrl: hotel.logoUrl,
          primaryPhoto,
          location: {
            city: hotel.locationVerification?.city || null,
            country: hotel.locationVerification?.country || null
          },
          lowestRate,
          availableRooms: rooms.length
        };
      })
    );

    // Filter out hotels with no rooms
    const availableHotels = results.filter(h => h.availableRooms > 0);

    res.json({
      success: true,
      count: availableHotels.length,
      hotels: availableHotels
    });
  } catch (error) {
    console.error('Public hotel search error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/public/hotels/:identifier
// @desc    Get hotel profile by slug or ID (public)
// @access  Public
router.get('/hotels/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    // Try to find by slug first, then by ID
    let hotel = await Hotel.findOne({ publicSlug: identifier, isActive: true });
    
    if (!hotel) {
      // Try by MongoDB ID
      hotel = await Hotel.findOne({ _id: identifier, isActive: true });
    }

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Get all active rooms
    const rooms = await Room.find({
      hotelId: hotel._id,
      isActive: true
    }).select('roomType description photos amenities rate availableCount');

    const response = {
      success: true,
      hotel: {
        id: hotel._id.toString(),
        name: hotel.hotelName,
        slug: hotel.publicSlug,
        logoUrl: hotel.logoUrl,
        photos: hotel.photos || [],
        videoUrl: hotel.videoUrl || null,
        contact: {
          phone: hotel.contactPhone || null,
          email: hotel.contactEmail || null
        },
        location: {
          city: hotel.locationVerification?.city || null,
          state: hotel.locationVerification?.state || null,
          country: hotel.locationVerification?.country || null
        },
        rooms: rooms.map(r => ({
          id: r._id.toString(),
          type: r.roomType,
          description: r.description || '',
          photos: r.photos || [],
          amenities: r.amenities || [],
          rate: r.rate,
          available: r.availableCount
        })),
        supportedChains: Object.keys(hotel.wallets)
          .filter(chain => hotel.wallets[chain])
          .map(chain => chain.toUpperCase())
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Public hotel details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
