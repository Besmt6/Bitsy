# Bitsy SaaS — Complete Development Plan

## Objectives
- Prove the **core workflow** works end-to-end: AI chat → structured booking fields → pricing → non‑refundable gate → payment QR payload → booking submission → notification + stats (no guest PII stored).
- Build an MVP SaaS with **Node.js/Express + MongoDB + React dashboard + embeddable vanilla JS widget**.
- Enforce **privacy-first** rules and the **non-refundable** policy in UX and API.

---

## Phase 1 — Core POC (Isolation): LLM Booking Flow + Extraction

### User Stories (POC)
1. As a guest, I can chat naturally and Bitsy asks only for what’s needed to book.
2. As a guest, I can provide dates/room preference and get a computed total.
3. As a guest, I must acknowledge the non-refundable policy before seeing payment details.
4. As a guest, I can select a crypto option and see a QR payload (address + amount).
5. As a hotel owner, I receive a booking notification containing guest details without Bitsy storing them.

### Implementation Steps
1. **Web search / best practice quick pass**: OpenAI structured outputs / function calling patterns for reliably extracting booking fields.
2. Create a minimal **Node POC script** (or tiny Express endpoint) using Emergent LLM key:
   - System prompt + tool schema for `extractBookingIntent` (check-in/out, room type, contact fields, crypto choice).
   - Validate robust parsing with multiple sample conversations.
3. Implement deterministic **pricing calculator**:
   - Nights = date diff; room rate from fixture config; total USD.
4. Implement non-refundable **state machine** (pure JS):
   - states: `collecting` → `quoted` → `policy_ack_required` → `payment_ready` → `submitted`.
5. Generate **booking reference** + create a **booking_stats** record (no PII).
6. Implement **notification stub**:
   - Console log formatted message.
   - Telegram sender function behind feature flag (token/chatId required).

### Next Actions
- Write and run the POC script with 5–10 varied conversation transcripts.
- Iterate prompt/schema until extraction is stable.

### Success Criteria
- ≥90% correct extraction across test transcripts.
- Non-refundable gate cannot be bypassed.
- Booking submission logs notification and stores only stats fields.

---

## Phase 2 — V1 App Development (Widget + Public APIs first, No Auth yet)

### User Stories (V1 core)
1. As a guest, I can open a floating widget and complete the full booking flow in a modal.
2. As a guest, I can see available room types and prices pulled from the hotel config.
3. As a guest, I can choose a crypto rail and see a QR code for the hotel wallet.
4. As a hotel owner, I can create a hotel profile (seeded/adminless for V1) and configure rooms/wallets.
5. As a hotel owner, I can see booking stats update after each booking.

### Implementation Steps
1. **Backend (Express)**
   - Project structure: `src/app.ts`, `src/routes/*`, `src/controllers/*`, `src/services/*`, `src/models/*`, `src/middleware/*`.
   - Public widget APIs:
     - `GET /api/widget/:hotelId/config`
     - `POST /api/widget/:hotelId/chat`
     - `POST /api/widget/:hotelId/book`
   - Mongo models: `Hotel`, `Room`, `BookingStat`.
   - Services:
     - `llmService` (POC-proven)
     - `pricingService`
     - `notificationService` (console + optional telegram)
     - `qrService` (returns data; widget renders QR)
   - Hard privacy guardrails: request logging scrubber; ensure booking payload never written to DB.
2. **Widget (Vanilla JS served by backend)**
   - Serve `GET /widget.js` (reads `data-hotel-id`).
   - Modal UI: chat messages, quick replies, room list, date inputs fallback.
   - Non-refundable popup gating before payment.
   - QR generation (client-side lib) from server response (address + amount + network).
3. **Hotel Dashboard (React)**
   - Pages: Settings, Rooms, Wallets, Widget.
   - For V1 (no auth): allow selecting a hotelId from seeded list or single default hotel.
   - Widget page shows embed code + live preview.
4. **Seed/dev tooling**
   - Seed one demo hotel with rooms + wallets.
   - Environment config for Emergent LLM key.

### Next Actions
- Implement backend + widget in one pass, then dashboard.
- Run one full manual E2E: widget booking creates stats + logs notification.

### Success Criteria
- Widget can be embedded and completes flow.
- Booking creates `booking_stats` only (verify DB).
- Dashboard can configure rooms/wallets and immediately affects widget config.

---

## Phase 3 — Add Auth + Owner Experience (JWT) + Telegram Config

### User Stories (Owner)
1. As a hotel owner, I can register and log in securely.
2. As a hotel owner, I can only access my own hotel data.
3. As a hotel owner, I can upload a logo and see it in the widget.
4. As a hotel owner, I can add Telegram bot token/chat id and receive booking alerts.
5. As a hotel owner, I can view stats (count + revenue) without guest details stored.

### Implementation Steps
1. Implement auth endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
2. Add JWT middleware + multi-tenant enforcement by `hotel_id`.
3. Wire dashboard to auth flow.
4. Implement logo upload endpoint `POST /api/hotel/logo` (store URL or local file for MVP).
5. Add Telegram config fields to settings; send message if configured.

### Next Actions
- Migrate V1 dashboard routes to authenticated versions.
- Validate tenant isolation with 2 seeded accounts.

### Success Criteria
- Unauthorized requests rejected; owner sees only their rooms/wallets/settings.
- Telegram message sent on booking when configured.

---

## Phase 4 — Testing, Hardening, UX Polish

### User Stories (Quality)
1. As a guest, I get clear errors if dates are invalid or room unavailable.
2. As a guest, I can restart the chat without reloading the page.
3. As a hotel owner, I can safely delete rooms without breaking the widget.
4. As a hotel owner, I can preview widget theme changes instantly.
5. As an admin/dev, I can run automated tests to ensure privacy constraints remain intact.

### Implementation Steps
1. Add backend validation (Zod/Joi) for all endpoints.
2. Add unit tests for pricing, state machine, privacy guard.
3. Add E2E smoke tests: config fetch, chat, booking submission, stats update.
4. UI polish: loading states, retries, offline handling.
5. Security hardening: rate limiting on public widget endpoints, CORS, helmet.

### Next Actions
- Run tests + one more E2E pass.
- Fix until stable.

### Success Criteria
- All tests green; no guest PII persisted.
- Widget is stable and embeddable across simple HTML pages.
