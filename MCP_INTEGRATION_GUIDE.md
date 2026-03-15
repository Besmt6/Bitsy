# Bitsy MCP Integration Guide
**How to make your hotels discoverable in ChatGPT, Claude, and Perplexity**

---

## What is MCP?

**Model Context Protocol (MCP)** is an open standard that allows AI assistants to access external data sources. When properly configured:

- User asks ChatGPT: "Find me crypto-friendly hotels in Miami"
- ChatGPT queries Bitsy's MCP endpoint
- Bitsy returns matching hotels with real-time data
- User sees your hotel directly in ChatGPT's response

**Result**: Direct bookings from AI conversations (no OTA needed).

---

## For Hotels: You're Already Discoverable! ✅

If you've completed the onboarding:
1. ✅ Added rooms with availability > 0
2. ✅ Configured at least one crypto wallet
3. ✅ Hotel status is active

**You're automatically discoverable!** No extra configuration needed.

**Track your discoveries**: Check the **"AI Discovery"** page in your dashboard to see how many times AIs found your hotel.

---

## For Developers: Integrating Bitsy MCP

### MCP Endpoint

**Base URL**: `https://getbitsy.ai/api/mcp`

**Protocol**: MCP 1.0 compliant

---

### Tool 1: search_hotels

Search for hotels matching criteria.

**Request:**
```json
POST /api/mcp/tools/search_hotels

{
  "location": "Miami Beach",
  "checkIn": "2026-04-01",
  "checkOut": "2026-04-03",
  "blockchain": "ethereum",
  "maxPrice": 300,
  "paymentMethod": "crypto"
}
```

**Parameters:**
- `location` (string, optional): City, neighborhood, or hotel name
- `checkIn` (string, optional): ISO date format (YYYY-MM-DD)
- `checkOut` (string, optional): ISO date format
- `blockchain` (string, optional): bitcoin|ethereum|polygon|base|arbitrum|optimism|solana|tron|any
- `maxPrice` (number, optional): Maximum nightly rate in USD
- `paymentMethod` (string, optional): crypto|fiat|any

**Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Found 3 hotel(s) accepting cryptocurrency...\n\n1. Beach Paradise Resort\n   Location: Miami Beach\n   Rooms: Deluxe Suite ($199/night)...\n   Accepts: Ethereum, Polygon, Base\n   Book: https://getbitsy.ai/widget?hotel=abc123"
    },
    {
      "type": "resource",
      "resource": {
        "uri": "bitsy://search/1234567890",
        "mimeType": "application/json",
        "text": "[{\"hotelName\":\"Beach Paradise Resort\", ...}]"
      }
    }
  ]
}
```

---

### Tool 2: get_hotel_details

Get full details for a specific hotel.

**Request:**
```json
POST /api/mcp/tools/get_hotel_details

{
  "hotelId": "abc123"
}
```

**Response**: Detailed hotel information including all rooms, rates, photos, and wallet addresses.

---

### Tool 3: get_supported_chains

Get list of supported blockchains.

**Request:**
```json
POST /api/mcp/tools/get_supported_chains
{}
```

**Response**: List of 6 blockchains with chain IDs, native currencies, and supported tokens.

---

## Configure MCP in Claude Desktop

### Step 1: Edit Claude Config

**Mac/Linux:**
```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```
C:\Users\YourName\AppData\Roaming\Claude\claude_desktop_config.json
```

### Step 2: Add Bitsy MCP Server

```json
{
  "mcpServers": {
    "bitsy-hotels": {
      "url": "https://getbitsy.ai/api/mcp",
      "transport": "http"
    }
  }
}
```

### Step 3: Restart Claude Desktop

### Step 4: Test

Ask Claude: "Find me hotels that accept cryptocurrency"

Claude will use Bitsy's MCP endpoint to search.

---

## Configure MCP in ChatGPT

### Option 1: ChatGPT Plus (Web)

1. Go to ChatGPT settings
2. Beta Features → Enable "MCP Support"
3. Add MCP server: `https://getbitsy.ai/api/mcp`
4. Test: "Search for crypto hotels"

### Option 2: ChatGPT Desktop App

Similar to Claude configuration above.

---

## How Bitsy MCP Works

```
┌─────────────┐
│  Traveler   │ "Find crypto hotels in Miami"
└──────┬──────┘
       │
       v
┌─────────────────┐
│ ChatGPT/Claude  │
└──────┬──────────┘
       │ MCP Query
       v
┌──────────────────────┐
│ Bitsy MCP Endpoint   │ Searches ALL hotels in database
│ /api/mcp/tools/...   │ Filters by: location, price, blockchain
└──────┬───────────────┘
       │ Returns matching hotels
       v
┌─────────────────┐
│ ChatGPT/Claude  │ Formats results for user
└──────┬──────────┘
       │
       v
┌─────────────┐
│  Traveler   │ Sees hotel + booking link
└─────────────┘
```

**Logged in Analytics**: Every search that includes your hotel is tracked and visible in your "AI Discovery" dashboard.

---

## MCP Benefits for Hotels

1. **New Discovery Channel**: Reach travelers where they already search (AI chats)
2. **Zero Marketing Cost**: No ad spend to appear in AI results
3. **Direct Bookings**: Links go straight to your widget (no OTA)
4. **Analytics**: Track how often AIs recommend your hotel
5. **First-Mover Advantage**: Most hotels not MCP-enabled yet (2026)

---

## Testing Your MCP Integration

### Manual Test (cURL)

```bash
curl -X POST https://getbitsy.ai/api/mcp/tools/search_hotels \
  -H "Content-Type: application/json" \
  -d '{"location": "YOUR_CITY"}'
```

You should see your hotel in results if you match criteria.

### Test in Claude Desktop

1. Configure MCP (steps above)
2. Ask: "Find hotels in [YOUR_CITY] that accept crypto"
3. Claude should return your hotel

---

## Troubleshooting

**Problem**: "My hotel doesn't appear in AI searches"  
**Solutions**:
- Check you have rooms with `availableCount > 0`
- Verify at least one wallet address is configured
- Ensure hotel status is active (default)
- Try searching by exact hotel name first

**Problem**: "MCP endpoint returns empty results"  
**Solution**: Ensure search location matches your hotel's city/name

**Problem**: "Claude/ChatGPT not using Bitsy MCP"  
**Solution**: 
- Verify MCP config file is correct
- Restart AI application
- Check MCP is enabled in settings

---

## For AI Platforms

Want to integrate Bitsy's hotel inventory?

**Contact**: hello@getbitsy.ai  
**MCP Spec**: https://getbitsy.ai/api/mcp  
**Rate Limits**: 500 requests/hour  
**Response Time**: <200ms average

**Available data**: 100+ hotels, real-time availability, multi-chain crypto payments

---

**Welcome to the future of hotel discovery!** 🤖✨
