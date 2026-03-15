# plan.md — Bitsy: Payment Flexibility + Guest Dashboard + Crypto Marketplace (UPDATED)

## 1) Objectives
- ✅ Ship a **crypto-first** booking system where **crypto is the default** payment method.
- ✅ Add optional **pay-at-property** payment method (hotel-controlled) with **guest-initiated confirmation** (guest must call hotel) to prevent spam.
- ✅ Implement a full **booking status lifecycle** including confirmation deadlines and transfer/marketplace states.
- ✅ Ship a **Guest Dashboard** (email + phone lookup) to view/cancel/manage bookings without requiring an account.
- ✅ Ship a **secondary marketplace** (**crypto bookings only**, **zero commission**) to list/transfer bookings with on-chain-verifiable payment proof.
- ✅ Implement **auto-cancel** for unconfirmed pay-at-property bookings at **exactly 48 hours before check-in**, plus marketplace listing expiry cleanup.
- ✅ Self-host the **demo video** (remove HeyGen dependency / monthly fee).

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

**Optional future enhancements (not required for MVP, recommended next)**
- Add email templates for:
  - booking created, booking confirmed, booking cancelled, booking transferred, deadline reminders.
- Add countdown timer UI badges for:
  - guest booking confirmation deadline
  - hotel dashboard pending confirmations
- Add pagination + stronger filtering on bookings and marketplace.
- Add marketplace listing detail page `/marketplace/:listingId` purchase UX (current backend supports details endpoint).

---

## 3) Next Actions (Immediate)
1. ✅ Deploy to AWS using `/app/DEPLOYMENT_AWS.md` (Emergent native deployment is incompatible with Node + Web3).
2. ⚠️ Add production-grade email delivery (SES/Resend) for booking + marketplace notifications.
3. ⚠️ Add the billing/plan enforcement logic for the “Pay What You Save” model (free $5k, then 2–4%).

---

## 4) Success Criteria ✅ Achieved
- ✅ Hotels can toggle pay-at-property; crypto remains default.
- ✅ Pay-at-property bookings show exact 48h confirmation deadline; auto-cancel works.
- ✅ Guests can lookup bookings via email+phone, cancel eligible bookings, and list crypto bookings.
- ✅ Marketplace supports crypto-only listings with on-chain proof and reliable transfer.
- ✅ Demo video is self-hosted and working.
- ✅ No regressions detected in existing hotel dashboard or widget core flows (frontend builds cleanly; backend running with cron jobs).
