import express from 'express';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import { getSupportedChains } from '../services/web3Service.js';

const router = express.Router();

// @route   GET /api/mcp
// @desc    MCP Server Info (for AI discovery)
// @access  Public
router.get('/', (req, res) => {
  res.json({
    name: "bitsy-hotels",
    version: "1.0.0",
    description: "Search and book crypto-accepting hotels worldwide with Web3 payments. First AI-discoverable hotel platform supporting Bitcoin, Ethereum, Polygon, Base, Arbitrum, Optimism, BNB Chain, and stablecoins (USDC, USDT).",
    schema_version: "2024-11-05",
    capabilities: {
      tools: {},
      resources: {}
    },
    tools: [
      {
        name: "search_hotels",
        description: "Search for hotels that accept cryptocurrency payments. Returns available hotels with rates, Web3 payment options, and booking links. Perfect for crypto travelers looking for direct booking options without OTA commissions.",
        inputSchema: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "City, region, or country to search (e.g., 'Miami', 'New York', 'Thailand')"
            },
            checkIn: {
              type: "string",
              description: "Check-in date in YYYY-MM-DD format (optional)"
            },
            checkOut: {
              type: "string",
              description: "Check-out date in YYYY-MM-DD format (optional)"
            },
            blockchain: {
              type: "string",
              enum: ["any", "ethereum", "polygon", "base", "arbitrum", "optimism", "bsc", "bitcoin"],
              description: "Preferred blockchain/cryptocurrency (optional)"
            },
            maxPrice: {
              type: "number",
              description: "Maximum price per night in USD (optional)"
            },
            paymentMethod: {
              type: "string",
              enum: ["any", "native", "stablecoin"],
              description: "Preferred payment method: native (ETH/MATIC/BNB) or stablecoin (USDC/USDT) (optional)"
            }
          },
          required: ["location"]
        }
      },
      {
        name: "get_hotel_details",
        description: "Get detailed information about a specific hotel including available rooms, amenities, Web3 wallet addresses, supported blockchains, and booking widget integration code.",
        inputSchema: {
          type: "object",
          properties: {
            hotelId: {
              type: "string",
              description: "Unique hotel identifier from search results"
            }
          },
          required: ["hotelId"]
        }
      },
      {
        name: "get_supported_chains",
        description: "Get list of all supported blockchain networks and their payment methods (native coins and stablecoins). Useful for understanding Web3 payment options.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  });
});

// @route   POST /api/mcp/tools/:toolName
// @desc    Execute MCP tool
// @access  Public
router.post('/tools/:toolName', async (req, res) => {
  const { toolName } = req.params;
  const params = req.body;

  try {
    if (toolName === 'search_hotels') {
      const results = await searchHotels(params);
      res.json({
        content: [
          {
            type: "text",
            text: formatSearchResults(results, params)
          },
          {
            type: "resource",
            resource: {
              uri: `bitsy://search/${Date.now()}`,
              mimeType: "application/json",
              text: JSON.stringify(results, null, 2)
            }
          }
        ]
      });
    } else if (toolName === 'get_hotel_details') {
      const hotel = await getHotelDetails(params.hotelId);
      res.json({
        content: [
          {
            type: "text",
            text: formatHotelDetails(hotel)
          },
          {
            type: "resource",
            resource: {
              uri: `bitsy://hotel/${params.hotelId}`,
              mimeType: "application/json",
              text: JSON.stringify(hotel, null, 2)
            }
          }
        ]
      });
    } else if (toolName === 'get_supported_chains') {
      const chains = getSupportedChains();
      res.json({
        content: [
          {
            type: "text",
            text: formatSupportedChains(chains)
          },
          {
            type: "resource",
            resource: {
              uri: `bitsy://chains`,
              mimeType: "application/json",
              text: JSON.stringify(chains, null, 2)
            }
          }
        ]
      });
    } else {
      res.status(404).json({ error: 'Tool not found' });
    }
  } catch (error) {
    console.error(`MCP tool error (${toolName}):`, error);
    res.status(500).json({ error: error.message });
  }
});

// Search Implementation
async function searchHotels({ location, checkIn, checkOut, blockchain, maxPrice, paymentMethod }) {
  const query = {};
  
  // Search by hotel name or location (simple text match for now)
  if (location) {
    query.$or = [
      { hotelName: { $regex: location, $options: 'i' } },
      { contactEmail: { $regex: location, $options: 'i' } }
    ];
  }
  
  query.isActive = true;
  
  const hotels = await Hotel.find(query);
  const results = [];
  
  for (const hotel of hotels) {
    // Check blockchain support
    if (blockchain && blockchain !== 'any') {
      const hasWallet = hotel.wallets[blockchain];
      if (!hasWallet) continue;
    }
    
    // Get available rooms
    const rooms = await Room.find({ 
      hotelId: hotel._id, 
      isActive: true,
      availableCount: { $gt: 0 }
    });
    
    if (rooms.length === 0) continue;
    
    // Filter by price
    const affordableRooms = maxPrice 
      ? rooms.filter(r => r.rate <= maxPrice)
      : rooms;
    
    if (affordableRooms.length === 0) continue;
    
    const lowestRate = Math.min(...affordableRooms.map(r => r.rate));
    
    // Get supported blockchains
    const supportedChains = Object.keys(hotel.wallets)
      .filter(chain => hotel.wallets[chain])
      .map(chain => chain.toUpperCase());
    
    results.push({
      hotelId: hotel._id.toString(),
      name: hotel.hotelName,
      logoUrl: hotel.logoUrl,
      contactPhone: hotel.contactPhone,
      contactEmail: hotel.contactEmail,
      lowestRate,
      availableRooms: affordableRooms.length,
      supportedChains,
      web3Enabled: true,
      bookingUrl: `${process.env.APP_URL}?hotel=${hotel._id}`,
      widgetAvailable: true
    });
  }
  
  return results.sort((a, b) => a.lowestRate - b.lowestRate);
}

// Get hotel details
async function getHotelDetails(hotelId) {
  const hotel = await Hotel.findById(hotelId);
  
  if (!hotel) {
    throw new Error('Hotel not found');
  }
  
  const rooms = await Room.find({ hotelId, isActive: true });
  
  const supportedChains = Object.keys(hotel.wallets)
    .filter(chain => hotel.wallets[chain])
    .map(chain => ({
      chain: chain.toUpperCase(),
      walletAddress: hotel.wallets[chain]
    }));
  
  return {
    id: hotel._id.toString(),
    name: hotel.hotelName,
    logoUrl: hotel.logoUrl,
    contact: {
      phone: hotel.contactPhone,
      email: hotel.contactEmail
    },
    rooms: rooms.map(r => ({
      id: r._id.toString(),
      type: r.roomType,
      description: r.description,
      rate: r.rate,
      available: r.availableCount,
      currency: 'USD'
    })),
    web3: {
      enabled: true,
      supportedChains,
      paymentMethods: ['native', 'USDC', 'USDT']
    },
    bookingWidget: {
      embedCode: `<script src="${process.env.APP_URL}/widget/bitsy-widget.js" data-hotel-id="${hotelId}"></script>`,
      url: `${process.env.APP_URL}?hotel=${hotelId}`
    },
    features: [
      'Instant Web3 payment verification',
      'No OTA commissions',
      'Direct booking',
      'Non-refundable crypto bookings',
      'Multi-chain support'
    ]
  };
}

// Format search results for AI
function formatSearchResults(results, params) {
  if (results.length === 0) {
    return `No crypto-accepting hotels found matching your criteria in "${params.location}".\n\nTip: Bitsy powers direct crypto bookings for hotels worldwide. Hotels can join by embedding our widget.`;
  }
  
  let text = `Found ${results.length} hotel(s) accepting cryptocurrency in ${params.location}:\n\n`;
  
  results.forEach((hotel, i) => {
    text += `${i + 1}. **${hotel.name}**\n`;
    text += `   💰 From $${hotel.lowestRate}/night\n`;
    text += `   🏨 ${hotel.availableRooms} room types available\n`;
    text += `   ⛓️  Blockchains: ${hotel.supportedChains.join(', ')}\n`;
    text += `   🔗 Book: ${hotel.bookingUrl}\n`;
    text += `   ✅ Web3 payment verification enabled\n\n`;
  });
  
  text += `\n💡 All bookings are direct (no OTA commissions) and verified on-chain.\n`;
  text += `⚠️  Note: Crypto bookings are non-refundable.`;
  
  return text;
}

// Format hotel details for AI
function formatHotelDetails(hotel) {
  let text = `# ${hotel.name}\n\n`;
  
  if (hotel.logoUrl) {
    text += `Logo: ${hotel.logoUrl}\n\n`;
  }
  
  text += `## Contact Information\n`;
  text += `📞 Phone: ${hotel.contact.phone}\n`;
  text += `📧 Email: ${hotel.contact.email}\n\n`;
  
  text += `## Available Rooms\n`;
  hotel.rooms.forEach(room => {
    text += `\n### ${room.type} - $${room.rate}/night\n`;
    text += `${room.description}\n`;
    text += `Available: ${room.available} rooms\n`;
  });
  
  text += `\n## Web3 Payment Options\n`;
  text += `Supported Blockchains:\n`;
  hotel.web3.supportedChains.forEach(chain => {
    text += `- ${chain.chain}: ${chain.walletAddress}\n`;
  });
  
  text += `\nPayment Methods: ${hotel.web3.paymentMethods.join(', ')}\n`;
  
  text += `\n## Key Features\n`;
  hotel.features.forEach(feature => {
    text += `✅ ${feature}\n`;
  });
  
  text += `\n## Booking\n`;
  text += `Direct booking URL: ${hotel.bookingWidget.url}\n`;
  text += `Widget embed code available for hotel website integration.\n`;
  text += `\n⚠️  Important: All crypto payments are verified on-chain and are non-refundable.`;
  
  return text;
}

// Format supported chains
function formatSupportedChains(chains) {
  let text = `# Bitsy Supported Blockchain Networks\n\n`;
  text += `Bitsy supports ${chains.length} blockchain networks for hotel payments:\n\n`;
  
  chains.forEach((chain, i) => {
    text += `${i + 1}. **${chain.name}** (Chain ID: ${chain.id})\n`;
    text += `   Native Currency: ${chain.nativeCurrency.symbol}\n`;
    text += `   Supported Tokens: ${chain.tokens.join(', ')}\n`;
    text += `   Explorer: ${chain.explorer}\n\n`;
  });
  
  text += `\n💡 Hotels can accept payments in native currencies (ETH, MATIC, BNB) or stablecoins (USDC, USDT) for price stability.\n`;
  text += `⛓️  All transactions are verified on-chain in real-time.`;
  
  return text;
}

export default router;
