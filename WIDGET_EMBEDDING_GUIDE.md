# Bitsy Widget Embedding Guide
**Add AI booking assistant to any website in 60 seconds**

---

## Quick Start

### Step 1: Get Your Embed Code

1. Log into Bitsy dashboard
2. Go to **"Widget"** page
3. Copy the embed code (looks like this):

```html
<script 
  src="https://getbitsy.ai/widget/bitsy-widget.js" 
  data-hotel-id="YOUR_HOTEL_ID"
></script>
```

### Step 2: Add to Your Website

Paste the code **before the closing `</body>` tag** on every page where you want the chat button to appear.

### Step 3: Publish

Save and publish your website. The Bitsy chat button will appear in the bottom-right corner.

✅ **Done!** Your AI booking assistant is live.

---

## Platform-Specific Instructions

### WordPress

**Method 1: Theme Editor (Recommended)**
1. Dashboard → **Appearance** → **Theme File Editor**
2. Select **"footer.php"** (or "theme footer")
3. Find `</body>` tag
4. Paste Bitsy embed code above it
5. Click **"Update File"**

**Method 2: Plugin**
1. Install plugin: "Insert Headers and Footers" or "Code Snippets"
2. Paste Bitsy code in "Footer Scripts" section
3. Save

---

### Wix

1. Dashboard → **Settings**
2. **Custom Code** (under Advanced)
3. Click **"+ Add Custom Code"**
4. Paste Bitsy embed code
5. Choose:
   - Code Type: **JavaScript**
   - Load Code: **Body - end**
   - Apply to: **All pages**
6. Click **"Apply"**

---

### Squarespace

1. Dashboard → **Settings**
2. **Advanced** → **Code Injection**
3. Paste Bitsy code in **"Footer"** section
4. Click **"Save"**

---

### Shopify

1. **Online Store** → **Themes**
2. **Actions** → **Edit Code**
3. Open **"theme.liquid"** file
4. Find `</body>` tag (near bottom)
5. Paste Bitsy code above it
6. Click **"Save"**

---

### Webflow

1. Project Settings → **Custom Code**
2. Paste in **"Footer Code"** section
3. Click **"Save Changes"**
4. Publish site

---

### Custom HTML Website

1. Open your HTML file in editor
2. Find `</body>` tag
3. Paste Bitsy code above it:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Hotel</title>
</head>
<body>
  
  <!-- Your website content -->
  <h1>Welcome to Beach Paradise Resort</h1>
  
  <!-- Bitsy Widget (paste here, before </body>) -->
  <script 
    src="https://getbitsy.ai/widget/bitsy-widget.js" 
    data-hotel-id="YOUR_HOTEL_ID"
  ></script>
  
</body>
</html>
```

4. Upload to your server

---

## Widget Features

### What Guests See

1. **Chat Button**: Circular button in bottom-right with "B" logo
2. **Click to Open**: Chat window slides up
3. **AI Conversation**: 
   - "What rooms do you have?"
   - "I need a room for 2 nights"
   - "What's available on March 15th?"
4. **Booking Flow**: AI collects details (name, email, dates)
5. **Payment Options**:
   - **MetaMask**: Connect wallet → Select chain → Pay
   - **QR Code**: Scan with mobile wallet → Send payment
6. **Confirmation**: Booking reference + email confirmation

---

## Widget Customization

### Current Customization (via Dashboard Settings)

- Hotel name (appears in widget header)
- Logo (shown in widget)
- Contact email/phone (AI provides if asked)
- Room types and pricing
- Available blockchains (based on wallet config)

### Advanced Customization (Enterprise Plan)

- Custom brand colors
- Custom welcome message
- White-label (remove "Powered by Bitsy")
- Custom domain

Email hello@getbitsy.ai for Enterprise features.

---

## Testing Your Widget

### Step 1: Open Your Website

Visit your site in a browser.

### Step 2: Click Chat Button

Look for the circular "B" button in bottom-right corner.

### Step 3: Test Conversation

**Try these queries:**
- "What rooms do you have?"
- "I want to book a room for 2 nights"
- "What's your cheapest room?"
- "Do you accept Bitcoin?"

### Step 4: Test Booking (Optional)

Complete a test booking:
1. Provide fake details (test@example.com)
2. See payment QR code or MetaMask option
3. Check your dashboard → Stats for the booking

**Note**: Test bookings are real! Cancel them in your dashboard if needed.

---

## Widget Performance

- **Load time**: <500ms
- **File size**: ~45KB (minified)
- **Dependencies**: None (vanilla JavaScript)
- **Mobile**: Fully responsive
- **Accessibility**: Keyboard navigable, ARIA labels

---

## Troubleshooting

### Widget Not Appearing

**Check:**
1. Embed code is **before `</body>` tag**
2. Hotel ID in embed code is correct
3. No JavaScript errors in browser console (F12)
4. Website uses HTTPS (widget requires secure context)

### Widget Shows Error

**"Hotel not found"**
- Verify your hotel ID matches dashboard
- Check hotel is active

**"No rooms available"**
- Add rooms in dashboard → Rooms page
- Ensure `availableCount > 0`

**"Payment method not configured"**
- Add at least one wallet address in dashboard → Wallets

### Chat Doesn't Respond

**Check:**
1. OpenAI API key is configured (backend .env)
2. Backend server is running
3. Browser console for errors
4. Try refreshing page

---

## Mobile Experience

 The widget is fully mobile-optimized:
- Chat button: 56x56px touch target
- Chat window: Full-screen on mobile
- QR codes: Scannable from camera
- MetaMask: Opens mobile wallet app automatically

---

## Privacy & Data

**What Bitsy Stores:**
- ✅ Guest name, email, phone (for booking)
- ✅ Booking details (dates, room, price)
- ✅ Return guest data (for personalization)

**What Bitsy NEVER Stores:**
- ❌ Credit card numbers
- ❌ Private keys or wallet passwords
- ❌ Crypto transaction details (only payment confirmation)

**Compliance**: GDPR-friendly (guests can request data deletion)

---

## Advanced: Multiple Widgets

Want different widgets for different properties?

**On your multi-property website:**
```html
<!-- Property 1 page -->
<script 
  src="https://getbitsy.ai/widget/bitsy-widget.js" 
  data-hotel-id="PROPERTY_1_ID"
></script>

<!-- Property 2 page -->
<script 
  src="https://getbitsy.ai/widget/bitsy-widget.js" 
  data-hotel-id="PROPERTY_2_ID"
></script>
```

Each page loads the widget for that specific property.

---

## Widget Update Policy

- **Auto-updates**: Widget script is always the latest version
- **No re-deployment needed**: Updates apply automatically
- **Backward compatible**: Old embed codes keep working
- **Changelog**: Check dashboard for new features

---

## Need Help?

- **Email**: hello@getbitsy.ai
- **Check Widget Tab**: In dashboard for troubleshooting tips
- **View Demo**: https://getbitsy.ai (see widget in action)

**Your AI booking assistant is ready!** 🤖✨
