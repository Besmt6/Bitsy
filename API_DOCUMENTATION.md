# Bitsy API Documentation

Complete reference for Bitsy's REST API and MCP endpoints.

**Base URL**: `https://getbitsy.ai/api`  
**Authentication**: JWT Bearer token in `Authorization` header

---

## Authentication

### POST /api/auth/register
Register a new hotel account.

**Request Body:**
```json
{
  "email": "hotel@example.com",
  "password": "securepass123",
  "hotelName": "Beach Paradise Resort"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "hotel": {
    "_id": "abc123",
    "email": "hotel@example.com",
    "hotelName": "Beach Paradise Resort",
    "createdAt": "2026-03-15T10:00:00.000Z"
  }
}
```

### POST /api/auth/login
Login to existing account.

**Request Body:**
```json
{
  "email": "hotel@example.com",
  "password": "securepass123"
}
```

**Response**: Same as registration.

---

## Hotel Management

### GET /api/hotel/settings
Get current hotel settings.

**Headers**: `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "hotel": {
    "_id": "abc123",
    "hotelName": "Beach Paradise Resort",
    "logoUrl": "https://...",
    "photos": [{"url": "https://...", "caption": "Pool area"}],
    "contactPhone": "+1-555-0123",
    "contactEmail": "info@hotel.com",
    "wallets": {
      "ethereum": "0x742d35...",
      "bitcoin": "1A1zP1..."
    }
  }
}
```

### PUT /api/hotel/settings
Update hotel settings.

**Headers**: `Authorization: Bearer {token}`

**Request Body**: Any fields from settings object

---

## Room Management

### GET /api/rooms
Get all rooms for authenticated hotel.

**Headers**: `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "rooms": [
    {
      "_id": "room123",
      "roomType": "Deluxe Suite",
      "description": "Ocean view with king bed",
      "rate": 199,
      "availableCount": 5,
      "photos": [{"url": "https://...", "caption": "Suite interior"}],
      "isActive": true
    }
  ]
}
```

### POST /api/rooms
Create new room.

**Headers**: `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "roomType": "Ocean View Suite",
  "description": "Panoramic ocean views",
  "rate": 299,
  "availableCount": 3,
  "photos": []
}
```

### PUT /api/rooms/:roomId
Update existing room.

### DELETE /api/rooms/:roomId
Delete room.

---

## Wallet Management

### GET /api/wallets
Get configured crypto wallets.

**Headers**: `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "wallets": {
    "bitcoin": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "ethereum": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    "polygon": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"
  }
}
```

### PUT /api/wallets
Update wallet addresses.

**Request Body:**
```json
{
  "ethereum": "0xNEW_ADDRESS",
  "polygon": "0xNEW_ADDRESS"
}
```

---

## Widget Endpoints (Public)

### GET /api/widget/:hotelId/config
Get widget configuration (public endpoint).

**Response:**
```json
{
  "success": true,
  "config": {
    "hotelName": "Beach Paradise Resort",
    "rooms": [...],
    "supportedChains": ["ethereum", "polygon", "base"]
  }
}
```

### POST /api/widget/:hotelId/chat
Send message to AI assistant.

**Request Body:**
```json
{
  "message": "What rooms do you have?",
  "sessionId": "unique-session-id",
  "guestName": "John Doe" // optional for returning guests
}
```

**Response:**
```json
{
  "success": true,
  "response": "We have 3 room types available: Deluxe Suite ($199/night)..."
}
```

### POST /api/widget/:hotelId/book
Submit booking request.

**Request Body:**
```json
{
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "+1-555-0123",
  "check_in": "2026-04-01",
  "check_out": "2026-04-03",
  "room_type": "Deluxe Suite",
  "total_nights": 2,
  "total_usd": 398,
  "crypto_choice": "ethereum"
}
```

**Response:**
```json
{
  "success": true,
  "bookingRef": "BTS-K9M2X",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "qrCode": {
    "dataUrl": "data:image/png;base64,..."
  }
}
```

---

## Web3 Verification

### POST /api/:hotelId/verify-web3-payment
Verify on-chain crypto payment.

**Request Body:**
```json
{
  "signature": "0xabc123...",
  "message": "{...booking details...}",
  "walletAddress": "0x742d35...",
  "chainId": 1,
  "bookingRef": "BTS-K9M2X"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "chainName": "Ethereum",
  "transactionHash": "0xdef456..."
}
```

---

## Analytics

### GET /api/analytics/mcp-discovery?days=30
Get AI discovery analytics.

**Headers**: `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "analytics": {
    "summary": {
      "totalAppearances": 47,
      "thisMonth": 22,
      "averagePerDay": "1.6"
    },
    "bySource": {
      "chatgpt": 28,
      "claude": 19
    },
    "topLocations": [
      {"location": "Miami Beach", "count": 15},
      {"location": "Florida hotels", "count": 12}
    ]
  }
}
```

---

## Model Context Protocol (MCP)

### GET /api/mcp
MCP server manifest (for AI discovery).

**Response**: MCP protocol metadata

### POST /api/mcp/tools/search_hotels
Search hotels by criteria.

**Request:**
```json
{
  "location": "Miami Beach",
  "checkIn": "2026-04-01",
  "checkOut": "2026-04-03",
  "blockchain": "ethereum",
  "maxPrice": 300
}
```

**Response**: MCP-formatted hotel results

### POST /api/mcp/tools/get_hotel_details
Get specific hotel details.

**Request:**
```json
{
  "hotelId": "abc123"
}
```

**Response**: Full hotel details in MCP format

---

## File Upload

### POST /api/upload/image
Upload hotel/room image.

**Headers**: 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Form Data:**
- `image`: File (max 5MB, jpg/png/webp)

**Response:**
```json
{
  "success": true,
  "url": "https://getbitsy.ai/uploads/abc123-hotel-photo.jpg"
}
```

---

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Server Error

---

## Rate Limits

- **Authenticated endpoints**: 1000 requests/hour per hotel
- **Widget endpoints**: 100 requests/hour per IP
- **MCP endpoints**: 500 requests/hour (for AI platforms)

---

## Webhooks (Coming Soon)

Future feature: Get notified when:
- New booking received
- Payment verified on-chain
- AI search includes your hotel

**Ready to integrate!** 🚀
