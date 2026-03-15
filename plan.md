# plan.md — Bitsy: Payment Flexibility + Guest Dashboard + Crypto Marketplace + Billing Enforcement + Multi-Wallet UX (UPDATED)

## 1) Objectives
- ✅ Ship a **crypto-first** booking system where **crypto is the default** payment method.
- ✅ Add optional **pay-at-property** payment method (hotel-controlled) with **guest-initiated confirmation** (guest must call hotel) to prevent spam.
- ✅ Implement a full **booking status lifecycle** including confirmation deadlines and transfer/marketplace states.
- ✅ Ship a **Guest Dashboard** (email + phone lookup) to view/cancel/manage bookings without requiring an account.
- ✅ Ship a **secondary marketplace** (**crypto bookings only**, **zero commission**) to list/transfer bookings with on-chain-verifiable payment proof.
- ✅ Implement **auto-cancel** for unconfirmed pay-at-property bookings at **exactly 48 hours before check-in**, plus marketplace listing expiry cleanup.
- ✅ Self-host the **demo video** (remove HeyGen dependency / monthly fee).
- ✅ Security/UX hardening: **remove external wallet download links** (avoid phishing/spam links); direct users to official app stores and avoid spam URLs.
- ✅ **Monetization**: Implement **“Pay What You Save” billing enforcement** (free $5,000, then commission) with trial tracking, grace period, and booking blocking after grace.
- ✅ **Spam prevention**: Add **hotel location verification** (address submission + status tracking) to reduce fake/spam hotel listings.
- ✅ **Wallet UX clarification**: Ensure hotels/guests understand modern wallets (MetaMask 2026) support multiple networks; document address-format differences and reduce setup mistakes.
- ⚠️ (In progress) **Multi-wallet guest UX**: Improve the widget so guests can seamlessly use **MetaMask + Phantom** (and other injected providers) where possible while keeping the QR flow as the universal fallback.

---

## 2) Implementation Steps

### Phase 1 — Core POC (Isolation): Transfer + Verification + 48h Cancellation ✅ COMPLETED
> Core risk = multi-step state machine + on-chain verification + scheduled auto-cancel.

**User stories (POC)**
1. ✅ As a guest, I can list a *crypto-paid* booking for transfer and it becomes locked.
2. ✅ As a buyer, I can submit a payment tx hash and Bitsy verifies it on-chain.
3. ✅ As the system, I can transfer booking ownership to the buyer after verification.
4. ✅ As a guest, I can see a clear “non-refundable crypto” warning and transfer alternative.
5. ✅ As the system, I auto-cancel pay-at-property bookings exactly 48h before check-in if still unconfirmed.

**Delivered (POC)**
- ✅ Updated `BookingStat` model fields for status + payment method + transfer lifecycle.
- ✅ Added `MarketplaceListing` model.
- ✅ Built marketplace endpoints:
  - `POST /api/marketplace/list`
  - `POST /api/marketplace/submit-proof`
  - `GET /api/marketplace/listings`
  - `GET /api/marketplace/listings/:listingId`
  - `POST /api/marketplace/unlist`
- ✅ Created auto-cancel job script: `backend/scripts/auto-cancel-bookings.js`.
- ✅ Added cron service (hourly auto-cancel + daily marketplace cleanup).

**Exit criteria (POC) — Met**
- ✅ Listing lock prevents cancellation/double-listing.
- ✅ Proof verification rejects invalid tx and accepts valid tx.
- ✅ Ownership transfer updates booking guest ownership.
- ✅ Auto-cancel transitions status correctly at 48h cutoff.

---

### Phase 2 — V1 App Development (MVP): Booking Status + Hotel Booking Mgmt + Widget Payment Choice ✅ COMPLETED

**User stories**
1. ✅ As a hotel, I can enable/disable **pay at property** while crypto remains default.
2. ✅ As a guest, I can choose **crypto (recommended)** or pay-at-property (if enabled).
3. ✅ As a hotel, I can see all bookings and confirm pay-at-property after guest calls.
4. ✅ As a guest, I can clearly see the 48h confirmation deadline on pay-at-property bookings.
5. ✅ As a hotel, I receive notifications for all new bookings (console + existing notification hooks; email templates are future polish).

**Backend — Delivered**
- ✅ Updated `Hotel` model:
  - `paymentSettings: { cryptoEnabled: true, payAtPropertyEnabled: boolean }`
- ✅ Updated booking endpoint `POST /api/widget/:hotelId/book`:
  - Crypto → `confirmed` automatically + QR/payment flow
  - Pay-at-property → `pending_confirmation` + `confirmationDeadlineAt = checkIn - 48h`
- ✅ Widget config endpoint includes `paymentSettings`.
- ✅ Hotel settings endpoint now saves `paymentSettings`.
- ✅ Hotel bookings API:
  - `GET /api/bookings`
  - `POST /api/bookings/:bookingRef/confirm`
  - `POST /api/bookings/:bookingRef/reject`
  - `GET /api/bookings/stats/summary`

**Frontend (Hotel dashboard) — Delivered**
- ✅ Added `/dashboard/bookings` page with confirm/reject actions.
- ✅ Added Payment Methods section to `/dashboard/settings`:
  - Crypto enabled (locked ON, recommended)
  - Pay-at-property toggle

**Widget — Delivered**
- ✅ Payment method selection dialog when hotel enables pay-at-property.
- ✅ Crypto path:
  - Non-refundable warning
  - QR/payment instructions
- ✅ Pay-at-property path:
  - Confirmation-required dialog
  - Guest must call hotel
  - Booking auto-cancels if not confirmed by deadline

**Phase-end testing — Met**
- ✅ Backend APIs functioning.
- ✅ Frontend pages compile and render.

---

### Phase 3 — Guest Dashboard (Email + Phone Lookup) + Booking Management ✅ COMPLETED

**User stories**
1. ✅ As a guest, I can find all my bookings using **email + phone**.
2. ✅ As a guest, I can view booking details (status, dates, hotel contact).
3. ✅ As a guest, I can cancel bookings any time (with rules).
4. ✅ As a guest, I see crypto bookings are non-refundable but transferable.
5. ✅ As a guest, I can start a marketplace listing for eligible crypto bookings.

**Backend — Delivered**
- ✅ Guest routes:
  - `POST /api/guest/verify`
  - `POST /api/guest/bookings`
  - `POST /api/guest/bookings/:bookingRef`
  - `POST /api/guest/bookings/:bookingRef/cancel`

**Frontend (Guest theme) — Delivered**
- ✅ Guest routes:
  - `/guest` (lookup)
  - `/guest/bookings`
  - `/guest/bookings/:ref`
- ✅ Guest theme tokens via `[data-theme='guest']`.
- ✅ Guest pages connected to real APIs (removed mock data).

**Cancellation rules implemented**
- ✅ Pay-at-property: cancellable by guest.
- ✅ Crypto: cancellable in UI (with explicit non-refundable warning) but not refundable; marketplace is recommended.
- ✅ Listed bookings cannot be cancelled until unlisted.

---

### Phase 4 — Marketplace (Crypto-only): List + Browse + Transfer ✅ COMPLETED

**User stories**
1. ✅ As a guest, I can list a crypto booking with any price and understand it locks.
2. ✅ As a buyer, I can browse listings with trust indicators and filters.
3. ✅ As a buyer, I can submit tx proof and receive the booking.
4. ✅ As a hotel, I is notified when booking guest details change (hook points exist; messaging templates are future polish).
5. ✅ As a guest, I can unlist a booking if it hasn’t transferred.

**Backend — Delivered**
- ✅ `MarketplaceListing` supports: active → completed/cancelled/expired.
- ✅ Enforced rules:
  - Only crypto bookings can be listed.
  - Listings lock bookings (`listed_for_transfer`).
  - Transfer requires on-chain-verifiable payment proof to seller’s wallet.
- ✅ Marketplace cleanup job expires listings after `expiresAt`.

**Frontend (Marketplace theme) — Delivered**
- ✅ `/marketplace` browse page with search and sorting.
- ✅ Marketplace theme tokens via `[data-theme='marketplace']`.
- ✅ Marketplace page connected to real API.

---

### Phase 5 — Auto-Cancel + Notifications + Polish ✅ COMPLETED (Core) / ⚠️ OPTIONAL (Enhancements)

**Delivered (Core)**
- ✅ Cron service initialized on backend boot:
  - Hourly auto-cancel checks
  - Daily listing expiry cleanup
- ✅ Auto-cancel script functional and manually runnable.
- ✅ All pages rendering correctly; frontend builds cleanly.
- ✅ Demo video self-hosted:
  - Video stored at `backend/public/videos/bitsy-demo.mp4`
  - Served at `/videos/bitsy-demo.mp4`
- ✅ Security: Removed external wallet download links from landing FAQ and wallets page; updated copy to recommend official app stores and warn about suspicious links.

**Optional future enhancements (not required for MVP, recommended next)**
- Add email templates for:
  - booking created, booking confirmed, booking cancelled, booking transferred, deadline reminders.
- Add countdown timer UI badges for:
  - guest booking confirmation deadline
  - hotel dashboard pending confirmations
- Add pagination + stronger filtering on bookings and marketplace.
- Add marketplace listing detail page `/marketplace/:listingId` purchase UX (current backend supports details endpoint).

---

### Phase 6 — Billing Enforcement System (“Pay What You Save”) + Anti-Spam Hotel Verification ✅ COMPLETED

#### 6.1 Billing model decisions (confirmed)
- **Trial allowance**: $5,000 gross booking volume.
- **What counts**:
  - ✅ Crypto bookings count (auto-confirmed).
  - ✅ Pay-at-property bookings count **only when confirmed by hotel**.
- **Post-trial commission**: Hotels that accept crypto will be asked to pay Bitsy in **crypto**.
- **Grace period**: 7 days after crossing $5,000.
- **Enforcement**: Do not block immediately at $5,000; block only after grace period ends.
- **Starter tier limit**: **One hotel per email** (already enforced by unique email constraint).

#### 6.2 Data model changes ✅ Delivered
- **Hotel**
  - Added `tier: starter | growth | enterprise` (default `starter`).
  - Added `billing`:
    - `trialLimitUsd` (default `5000`)
    - `trialUsedUsd` (cached)
    - `trialExceededAt`
    - `graceEndsAt`
    - `billingStatus: trial | grace | blocked | active`
    - `commissionRateBps` (default `200` = 2%)
    - `lastPaymentReceivedAt`
  - Added `locationVerification`:
    - address fields + `verificationStatus` + `isVerified` + timestamps.

#### 6.3 Billing calculation + state machine ✅ Delivered
- Implemented `backend/src/services/billingService.js`:
  - Aggregates confirmed bookings to compute `trialUsedUsd`.
  - State machine:
    - `trial` → `grace` at $5k crossing (sets `trialExceededAt` + `graceEndsAt = +7d`)
    - `grace` → `blocked` after `graceEndsAt`
    - `blocked/grace` → `active` when payment is submitted

#### 6.4 Server-side enforcement points ✅ Delivered
- **Widget booking** (`POST /api/widget/:hotelId/book`):
  - If `billingStatus === 'blocked'` → returns **403** with a guest-safe message.
  - Crypto bookings auto-refresh billing status.
  - In grace period → booking is allowed; response includes `billingWarning`.
- **Pay-at-property confirmation** (`POST /api/bookings/:bookingRef/confirm`):
  - On confirmation, recalculates trial usage and updates billing state.

#### 6.5 Billing API ✅ Delivered
- Added `backend/src/routes/billing.js` and registered in `server.js`:
  - `GET /api/billing/status`
  - `POST /api/billing/refresh`
  - `POST /api/billing/payment` (submit tx hash; currently reactivates account without on-chain verification)
  - `GET /api/billing/payment-instructions` (provides Bitsy addresses; placeholders until real addresses added)
  - `POST /api/billing/verify-location`

#### 6.6 Dashboard UX ✅ Delivered
- Added `BillingStatusCard` shown at top of `/dashboard/stats`:
  - Progress bar `$used / $5,000`
  - Status badges: Trial | Grace | Blocked | Active
  - Commission owed calculation for grace state
  - Clear copy about 7-day grace period

#### 6.7 Settings UX (Location Verification + Payment Due UI) ✅ Delivered
- Added Location Verification form to `/dashboard/settings`:
  - Address + city + state + country + postal code
  - Status badge: unverified/pending/verified/rejected
  - Submits to `/api/billing/verify-location` → marks pending
- Added commission payment due panel (shows in grace/blocked):
  - Trial limit / bookings total / commission owed
  - Tx hash submission calls `/api/billing/payment`

#### 6.8 Testing / exit criteria ✅ Met
- Verified full lifecycle works:
  - `trial → grace → blocked → active`
  - Booking API blocks in `blocked` state (403)
  - UI indicators render correctly for trial/grace/blocked/active

---

### Phase 7 — Wallet UX: Multi-Chain Address Guidance + Multi-Wallet Guest Discovery ✅ PARTIALLY COMPLETED

#### 7.1 Key product clarification (confirmed)
- **Modern MetaMask (2026) supports multiple networks**, including:
  - EVM chains (Ethereum/L2s)
  - Bitcoin
  - Solana
  - Tron
- **Address formats differ by chain type**:
  - ✅ EVM chains share **same `0x...` address**
  - ✅ Solana uses **Solana address format** (e.g., `9Wz...`)
  - ✅ Bitcoin uses **Bitcoin address format** (e.g., `bc1...`)
  - ✅ Tron uses **Tron address format** (e.g., `T...`)
- **Guest wallets are compatible across providers**:
  - A guest can pay from **Phantom** to a **MetaMask-derived Solana address** (same Solana chain), as long as the chain and address format match.

#### 7.2 Delivered ✅
- ✅ Verified booking endpoint always selects `hotel.wallets[crypto_choice]` to generate QR codes.
- ✅ Verified QR codes show the **correct chain-specific address** for each crypto choice.
- ✅ Updated **Wallets page UI** to explicitly explain:
  - One MetaMask can cover all chains
  - EVM address reuse vs Solana/Bitcoin differences
  - Guests can use Phantom/Coinbase/Trust as long as they pay to the correct chain
- ✅ Added hotel-facing documentation:
  - `app/WALLET_SETUP_GUIDE.md` — MetaMask multi-chain wallet setup guide

#### 7.3 In progress / next improvements ⚠️
- ⚠️ **Guest widget multi-wallet connect**:
  - Align widget “Pay with Crypto Wallet” with actual supported behaviors (avoid implying it sends on-chain transfers unless implemented).
  - Add clear wallet detection and routing for:
    - MetaMask (`window.ethereum`) for EVM (and potentially other networks if supported)
    - Phantom (`window.phantom.solana`) for Solana
  - Keep QR as the universal fallback for all chains.
- ⚠️ Decide whether to integrate **Reown AppKit** (WalletConnect) for:
  - Wallet discovery across desktop/mobile
  - Standardized wallet modal + deep links
  - Solana/Bitcoin support via appropriate adapters

**Exit criteria (Phase 7)**
- Guests can connect via MetaMask or Phantom when available, OR easily fall back to QR.
- Widget copy no longer claims “on-chain verification” unless it actually verifies tx hashes.
- Hotels have clear guidance to avoid pasting wrong-chain addresses.

---

## 3) Next Actions (Immediate)
1. ✅ Billing enforcement + location verification are live (Phase 6 complete).
2. ✅ Wallet setup clarity shipped (Wallets page + `WALLET_SETUP_GUIDE.md`).
3. ⚠️ Finalize widget wallet-connect UX (Phase 7.3):
   - Decide between (A) Reown AppKit integration or (B) lightweight injected-provider detection.
   - Ensure the widget does not mislead users about automatic payment sending.
4. ⚠️ Replace placeholder Bitsy receiving addresses with real production wallets and decide commission payment verification workflow.
5. ⚠️ Add production-grade email delivery (SES/Resend) for booking + marketplace notifications.
6. ✅ Deploy to AWS using `/app/DEPLOYMENT_AWS.md` (Emergent native deployment is incompatible with Node + Web3).

---

## 4) Success Criteria

**Achieved**
- ✅ Hotels can toggle pay-at-property; crypto remains default.
- ✅ Pay-at-property bookings show exact 48h confirmation deadline; auto-cancel works.
- ✅ Guests can lookup bookings via email+phone, cancel eligible bookings, and list crypto bookings.
- ✅ Marketplace supports crypto-only listings with on-chain proof and reliable transfer.
- ✅ Demo video is self-hosted and working.
- ✅ Trial usage accurately tracked ($5k) across crypto + confirmed pay-at-property.
- ✅ Grace period begins at $5k and lasts 7 days.
- ✅ Bookings blocked only after grace period ends (not immediately).
- ✅ Dashboard shows clear trial/grace/blocked/active state + progress indicator.
- ✅ Location verification UI and status tracking implemented to reduce spam hotel listings.
- ✅ Wallet UX clarified: Hotels understand EVM vs Solana/Bitcoin address formats; Wallets page guidance updated; setup doc created.

**Remaining / Future**
- ⚠️ Automated commission reconciliation (on-chain verification of billing payment tx hash; admin review workflow).
- ⚠️ Policy decisions: whether to restrict widget activation or marketplace visibility until hotel location is verified.
- ⚠️ Finalize multi-wallet guest connect UX in widget (MetaMask + Phantom + QR fallback).
- ⚠️ Full AWS production deployment + environment hardening.
