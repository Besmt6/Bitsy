# plan.md — Bitsy: Payment Flexibility + Guest Dashboard + Crypto Marketplace

## 1) Objectives
- Add **crypto-first** payments with optional **pay-at-property** (hotel-controlled).
- Introduce a **booking status lifecycle** + hotel confirmation workflow (guest calls hotel).
- Ship a **Guest Dashboard** (email + phone lookup) to view/cancel/manage bookings.
- Ship a **secondary marketplace** (crypto bookings only) to list/transfer bookings with on-chain proof.
- Add **auto-cancel** for unconfirmed pay-at-property bookings at **48h before check-in** + notifications.

---

## 2) Implementation Steps

### Phase 1 — Core POC (Isolation): Transfer + Verification + 48h Cancellation
> Core risk = multi-step state machine + on-chain verification + scheduled auto-cancel.

**User stories (POC)**
1. As a guest, I can list a *crypto-paid* booking for transfer and it becomes locked.
2. As a buyer, I can submit a payment tx hash and Bitsy verifies it on-chain.
3. As the system, I can transfer booking ownership to the buyer after verification.
4. As a guest, I can see a clear “non-refundable crypto” warning and transfer alternative.
5. As the system, I auto-cancel pay-at-property bookings exactly 48h before check-in if still unconfirmed.

**Steps**
- Web search: best practices for **Node cron reliability** (node-cron vs external scheduler) + **ethers.js tx verification** patterns.
- Add minimal DB fields for POC:
  - `BookingStat`: `status`, `paymentMethod`, `confirmationDeadlineAt`, `listedForTransfer`, `originalPaymentTxHash`, `transferTxHash`.
  - New `MarketplaceListing`: `bookingRef`, `hotelId`, `sellerGuestId`, `priceUsd`, `receiveAddress`, `status`.
- Build isolated API endpoints (no UI yet):
  - `POST /api/marketplace/list` (locks booking + creates listing)
  - `POST /api/marketplace/submit-proof` (verify tx → transfer)
  - `POST /api/bookings/cron/auto-cancel` (callable endpoint to run job in preview)
- Create a **Node script** (in `backend/scripts/`) to simulate:
  - listing → proof submission → verification → transfer
  - pay-at-property booking reaching deadline → auto-cancel
- Stop and fix until the POC passes end-to-end in logs + DB.

**Exit criteria (POC)**
- Listing lock prevents cancellation/double-listing.
- Proof verification rejects wrong recipient/amount/chain and accepts valid tx.
- Ownership transfer updates guest fields + emits notifications (console/email stub).
- Auto-cancel transitions status correctly at 48h cutoff.

---

### Phase 2 — V1 App Development (MVP): Booking Status + Hotel Booking Mgmt + Widget Payment Choice

**User stories**
1. As a hotel, I can enable/disable **pay at property** while crypto remains default.
2. As a guest, I can choose **crypto (recommended)** or pay-at-property (if enabled).
3. As a hotel, I can see all bookings and confirm pay-at-property after guest calls.
4. As a guest, I can clearly see the 48h confirmation deadline on pay-at-property bookings.
5. As a hotel, I receive notifications for all new bookings.

**Backend**
- Update `Hotel` model: `paymentSettings: { cryptoEnabled: true (implicit), payAtPropertyEnabled: boolean }`.
- Update `BookingStat` model:
  - `paymentMethod: 'crypto' | 'pay_at_property'`
  - `status: 'pending' | 'pending_confirmation' | 'confirmed' | 'cancelled' | 'listed' | 'transferred' | 'completed'`
  - `confirmationDeadlineAt`, `confirmedAt`, `cancelledAt`, `cancellationReason`
- Update booking endpoint `POST /api/widget/:hotelId/book`:
  - If `crypto`: keep existing QR/web3 flow.
  - If `pay_at_property`: create booking with `pending_confirmation` and set `confirmationDeadlineAt = checkInAt - 48h`.
- Add hotel actions:
  - `POST /api/hotel/bookings/:bookingRef/confirm`
  - `POST /api/hotel/bookings/:bookingRef/reject`
  - `GET /api/hotel/bookings?filters…`

**Frontend (Hotel dashboard)**
- Add `/dashboard/bookings` page (table + filters + confirm/reject actions).

**Widget**
- Add payment method RadioGroup step:
  - Default selection: **Crypto (Recommended)**.
  - Show pay-at-property only if hotel enabled it.
  - Confirmation screen copy:
    - Crypto: “Payment confirmed / proceed to pay via wallet/QR.”
    - Pay-at-property: “Call hotel to confirm; auto-cancels at deadline.”

**Phase-end testing**
- Run testing agent: booking creation (both methods), hotel confirm/reject, UI states.

---

### Phase 3 — Guest Dashboard (Email + Phone Lookup) + Booking Management

**User stories**
1. As a guest, I can find all my bookings using **email + phone**.
2. As a guest, I can view booking details (status, dates, hotel contact).
3. As a guest, I can cancel pay-at-property bookings anytime.
4. As a guest, I see crypto bookings are non-refundable but transferable.
5. As a guest, I can start a marketplace listing for eligible crypto bookings.

**Backend**
- Add guest lookup endpoints:
  - `POST /api/guest/lookup` → returns a short-lived token/session
  - `GET /api/guest/bookings` (by token)
  - `POST /api/guest/bookings/:bookingRef/cancel`
- Ensure `Guest` model stores normalized `email`, `phone` and booking references.

**Frontend (Guest theme)**
- Add routes:
  - `/guest` (lookup)
  - `/guest/bookings`
  - `/guest/bookings/:ref`
- Apply `[data-theme='guest']` wrapper + tokens in `index.css`.

**Phase-end testing**
- Testing agent: guest lookup, booking list/details, cancel flows, deadline display.

---

### Phase 4 — Marketplace (Crypto-only): List + Browse + Transfer

**User stories**
1. As a guest, I can list a crypto booking with any price and understand it locks.
2. As a buyer, I can browse listings with trust indicators and filters.
3. As a buyer, I can submit tx proof and receive the booking.
4. As a hotel, I am notified when booking guest details change.
5. As a guest, I can unlist a booking if it hasn’t transferred.

**Backend**
- Implement `MarketplaceListing` CRUD + statuses: `active | sold | cancelled`.
- Enforce rules:
  - Only `paymentMethod='crypto'` and `status in confirmed/pending` can be listed.
  - While listed: booking cannot be cancelled; prevent double listing.
- Transfer endpoint verifies tx with `web3Service` and updates booking guest.

**Frontend (Marketplace theme)**
- Add `/marketplace` browse + `/marketplace/:listingId` detail.
- Apply `[data-theme='marketplace']` wrapper.

**Phase-end testing**
- Testing agent: listing creation, browse filters, proof submission, transfer + notifications.

---

### Phase 5 — Auto-Cancel + Notifications + Polish

**User stories**
1. As a guest, I get notified before my pay-at-property booking expires.
2. As a hotel, I see a countdown for pending confirmations.
3. As a hotel, I receive cancellation/transfer notifications.
4. As a guest, I can’t accidentally cancel a listed booking.
5. As an admin/operator, I can run the cancellation job manually if needed.

**Steps**
- Implement `node-cron` job (hourly) + safe idempotency.
- Add email templates (basic) for: created, confirmed, cancelled, transferred, deadline reminder.
- Add UI countdown badges in hotel bookings table + guest booking details.
- Performance pass: pagination for bookings/listings.
- Update docs: widget embed instructions + marketplace rules.

---

## 3) Next Actions (Immediate)
1. Implement Phase 1 POC endpoints + scripts for transfer verification + 48h auto-cancel.
2. Confirm POC passes, then proceed to Phase 2 (widget + hotel bookings page).
3. After Phase 2 demo, proceed to guest dashboard and marketplace phases.

---

## 4) Success Criteria
- Hotels can toggle pay-at-property; crypto remains default.
- Pay-at-property bookings show exact 48h confirmation deadline; auto-cancel works.
- Guests can lookup bookings via email+phone, cancel eligible bookings, and list crypto bookings.
- Marketplace supports crypto-only listings with on-chain proof and reliable transfer.
- No regressions in existing hotel dashboard, widget chat, or crypto booking flow.
