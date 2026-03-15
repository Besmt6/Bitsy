import express from 'express';
import axios from 'axios';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import logger from '../config/logger.js';

const router = express.Router();

// @route   POST /api/chat
// @desc    AI-powered chat for hotel search and booking
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build conversation context for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are Bitsy, an AI hotel booking assistant. You help guests find and book crypto-accepting hotels worldwide.

Your capabilities:
- Search hotels by location, price, amenities
- Show hotel details, photos, and availability
- Guide booking process
- Answer questions about crypto payments
- Provide personalized recommendations

Guidelines:
- Be friendly, helpful, and concise
- Ask clarifying questions if needed (location, dates, budget, preferences)
- When you have enough info, search and show matching hotels
- Explain crypto payment options clearly
- Guide guests through booking step-by-step

When showing hotels, use this format:
[SEARCH_HOTELS: location="Miami", checkIn="2026-03-20", checkOut="2026-03-22", maxPrice=300]

Current date: ${new Date().toISOString().split('T')[0]}`
      },
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Call OpenAI API
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = openaiResponse.data.choices[0].message.content;

    // Check if AI wants to search hotels
    const searchMatch = aiResponse.match(/\[SEARCH_HOTELS:(.*?)\]/);
    let hotels = [];

    if (searchMatch) {
      // Parse search parameters
      const params = searchMatch[1];
      const locationMatch = params.match(/location="([^"]+)"/);
      const maxPriceMatch = params.match(/maxPrice=(\d+)/);

      if (locationMatch) {
        const location = locationMatch[1];
        
        // Search hotels in database
        const query = {
          isActive: true,
          $or: [
            { hotelName: { $regex: location, $options: 'i' } },
            { 'locationVerification.city': { $regex: location, $options: 'i' } },
            { 'locationVerification.country': { $regex: location, $options: 'i' } }
          ]
        };

        const foundHotels = await Hotel.find(query).limit(5);

        // Get room info for each hotel
        hotels = await Promise.all(
          foundHotels.map(async (hotel) => {
            const rooms = await Room.find({ hotelId: hotel._id, isActive: true });
            const lowestRate = rooms.length > 0 
              ? Math.min(...rooms.map(r => r.basePrice))
              : 0;

            return {
              id: hotel._id,
              name: hotel.hotelName,
              location: `${hotel.locationVerification?.city || 'Unknown'}, ${hotel.locationVerification?.country || ''}`.trim(),
              price: lowestRate,
              rooms: rooms.length,
              image: rooms[0]?.photos?.[0] || null,
              description: `${rooms.length} room types available. Accepts crypto payments.`,
              amenities: ['WiFi', 'Crypto Payments', 'AI Booking'],
              photos: rooms.flatMap(r => r.photos || []).slice(0, 6)
            };
          })
        );
      }

      // Remove the search command from AI response
      const cleanResponse = aiResponse.replace(/\[SEARCH_HOTELS:.*?\]/g, '').trim();

      logger.info('Chat AI search', { 
        query: message, 
        hotelsFound: hotels.length,
        location: locationMatch?.[1]
      });

      return res.json({
        success: true,
        response: cleanResponse || `I found ${hotels.length} hotels for you!`,
        hotels
      });
    }

    // Regular response without hotel search
    logger.info('Chat AI response', { query: message });

    res.json({
      success: true,
      response: aiResponse,
      hotels: []
    });

  } catch (error) {
    logger.error('Chat API error', { error: error.message });
    
    // Fallback response if OpenAI fails
    res.json({
      success: true,
      response: "I'm having trouble connecting right now. Could you please rephrase your request?",
      hotels: []
    });
  }
});

export default router;
