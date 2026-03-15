# Production URL Structure for getbitsy.ai

## Overview
This document defines the complete URL structure for the Bitsy platform when deployed to the production domain `getbitsy.ai`.

---

## 🏠 Guest (Public) URLs

These are publicly accessible pages for travelers looking to book hotels.

| Purpose | URL | Description |
|---------|-----|-------------|
| **Landing Page** | `https://getbitsy.ai` | Main homepage with hero, features, demo video |
| **AI Chat** | `https://getbitsy.ai/chat` | Primary booking interface - AI-powered hotel search and booking |
| **Browse Hotels** | `https://getbitsy.ai/browse` | Traditional search interface with filters |
| **Hotel Details** | `https://getbitsy.ai/book/:slug` | Individual hotel booking page (e.g., `/book/miami-beach-resort`) |
| **Guest Dashboard** | `https://getbitsy.ai/guest` | Booking lookup and management (email + phone auth) |
| **Marketplace** | `https://getbitsy.ai/marketplace` | Crypto-only hotel listings with on-chain verification |

**Primary CTA Flow**: Landing Page → `/chat` (AI-first experience)

---

## 🏨 Hotel Owner URLs

These pages are for hotel partners managing their properties and bookings.

| Purpose | URL | Description |
|---------|-----|-------------|
| **Login** | `https://getbitsy.ai/login` | Hotel owner authentication |
| **Signup/Registration** | `https://getbitsy.ai/register` | New hotel account creation |
| **Dashboard Home** | `https://getbitsy.ai/dashboard` | Main hotel dashboard with metrics |
| **Manage Rooms** | `https://getbitsy.ai/dashboard/rooms` | Room inventory and pricing |
| **Bookings** | `https://getbitsy.ai/dashboard/bookings` | All bookings (upcoming, past, pending) |
| **Wallet Settings** | `https://getbitsy.ai/dashboard/wallets` | Crypto wallet configuration (EVM chains) |
| **Profile Settings** | `https://getbitsy.ai/dashboard/settings` | Hotel profile, photos, amenities |
| **Analytics** | `https://getbitsy.ai/dashboard/analytics` | Revenue, occupancy, and performance metrics |
| **Billing** | `https://getbitsy.ai/dashboard/billing` | Trial usage, commission payments |

**Protected Routes**: All `/dashboard/*` routes require JWT authentication

---

## 👑 Admin (Platform) URLs

These are internal pages for Bitsy platform administrators only.

| Purpose | URL | Description |
|---------|-----|-------------|
| **Admin Login** | `https://getbitsy.ai/admin/login` | Admin authentication (separate from hotel login) |
| **Admin Dashboard** | `https://getbitsy.ai/admin/dashboard` | Platform overview with key metrics |
| **Hotel Management** | `https://getbitsy.ai/admin/hotels` | View, verify, and manage all hotels |
| **Hotel Details** | `https://getbitsy.ai/admin/hotels/:id` | Individual hotel admin view |
| **Commissions** | `https://getbitsy.ai/admin/commissions` | Track commission payments across platform |
| **Billing Alerts** | `https://getbitsy.ai/admin/billing` | Hotels approaching trial limits |
| **Platform Activity** | `https://getbitsy.ai/admin/activity` | Real-time bookings, user activity |

**Security**: 
- Admin routes protected by separate JWT system
- Login credentials: `hello@getbitsy.ai` / `bitsy-admin-2026`
- Change default password in production!

---

## 🔧 API Endpoints

All API routes are prefixed with `/api` and handled by the backend.

### Public APIs (No Auth Required)
```
GET  /api/public/hotels/search?query=Miami
GET  /api/public/hotels/:slug
GET  /api/public/marketplace
```

### Guest APIs
```
POST /api/guest/lookup
POST /api/guest/bookings/:id/cancel
```

### Hotel APIs (Requires JWT)
```
POST /api/auth/login
POST /api/auth/register
GET  /api/hotel/profile
POST /api/hotel/update
GET  /api/bookings
POST /api/bookings/:id/confirm
GET  /api/stats
GET  /api/wallet
POST /api/wallet/update
```

### Admin APIs (Requires Admin JWT)
```
POST /api/admin/auth/login
GET  /api/admin/platform/stats
GET  /api/admin/hotels
GET  /api/admin/commissions
GET  /api/admin/billing/alerts
```

### AI & Chat
```
POST /api/chat
```

### Payment Verification
```
POST /api/billing/verify-payment
GET  /api/billing/pending
```

---

## 🎨 Widget Embed URLs

Hotels can embed the Bitsy booking widget on their own websites.

### Widget Script
```html
<script src="https://getbitsy.ai/widget.js"></script>
<div id="bitsy-widget" data-hotel-id="YOUR_HOTEL_ID"></div>
```

### Widget API
```
GET /api/widget/config/:hotelId
```

---

## 🔐 Authentication Flow

### Guest (Passwordless)
1. Visit `/guest`
2. Enter email + phone
3. System sends verification code
4. Access bookings

### Hotel Owner
1. Visit `/register` → Create account with email/password
2. Visit `/login` → Authenticate with email/password
3. Redirected to `/dashboard`
4. JWT stored in localStorage

### Admin
1. Visit `/admin/login` → Authenticate with admin credentials
2. Redirected to `/admin/dashboard`
3. Separate admin JWT

---

## 🚀 Deployment Notes

### Current Preview
```
https://bitsy-tools.preview.emergentagent.com
```

### Production (After AWS Deployment)
```
Frontend: https://getbitsy.ai (Nginx → React app)
Backend:  https://getbitsy.ai/api/* (Nginx → Node.js/Express)
```

### Staging (Recommended)
```
Frontend: https://staging.getbitsy.ai
Backend:  https://staging.getbitsy.ai/api/*
```

---

## 📱 Mobile Responsiveness

All URLs are fully responsive and mobile-optimized:
- Touch-friendly interactive elements (44x44px minimum)
- Mobile-first design with progressive enhancement
- Works on iOS Safari, Chrome, Firefox mobile

---

## 🔗 External Integrations

### Blockchain Explorers
When a transaction is verified, users get explorer links:
- Ethereum: `https://etherscan.io/tx/{txHash}`
- Polygon: `https://polygonscan.com/tx/{txHash}`
- Base: `https://basescan.org/tx/{txHash}`
- etc.

### Email Links
All transactional emails include deep links back to the app:
- Booking confirmation → `/guest` with pre-filled lookup
- Hotel notifications → `/dashboard/bookings/:id`
- Admin alerts → `/admin/billing`

---

## 🎯 SEO & Canonical URLs

### Public Pages (Crawlable)
```
https://getbitsy.ai (homepage)
https://getbitsy.ai/browse
https://getbitsy.ai/book/:slug
https://getbitsy.ai/marketplace
```

### Protected Pages (No-index)
All dashboard and admin routes include `<meta name="robots" content="noindex">` to prevent indexing.

---

## 📊 Analytics & Tracking

Consider adding:
- Google Analytics 4
- Facebook Pixel
- Plausible/Fathom for privacy-friendly analytics

URL structure is clean and SEO-friendly with no query parameters required for routing.

---

**Last Updated**: March 15, 2026
**Status**: Ready for production deployment to getbitsy.ai
