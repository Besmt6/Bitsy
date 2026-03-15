# How to View Errors in Your Sentry Dashboard

## Step-by-Step Guide

### 1. Access Your Sentry Dashboard

Go to: **https://sentry.io**

If not already logged in, sign in with your account.

---

### 2. View Backend Errors

1. **Click "Projects"** in the left sidebar
2. **Select "bitsy-backend"** (Node.js project)
3. You should see the **Issues** page

**What to look for:**
- Error: `🧪 Test error for Sentry verification - this is intentional!`
- This error was triggered 2 times from the curl command

**Click on the error to see:**
- Full stack trace
- Request URL: `/api/test-sentry`
- Environment: `development`
- Timestamp
- Server details

---

### 3. View Frontend Errors

1. **Click "Projects"** in the left sidebar
2. **Select "bitsy-frontend"** (React project)
3. You should see the **Issues** page

**What to look for:**
- Error: `🧪 Frontend test error - this is intentional!`
- Message: `🧪 Test message from Bitsy frontend`

**Click on an error to see:**
- Full JavaScript stack trace
- Browser information (Chrome, version, OS)
- Breadcrumbs (user actions before error)
- **Session Replay** (watch the last 60 seconds before the error!)

---

### 4. If You Don't See Errors

**Wait 30-60 seconds** - Sentry batches events and may take a moment to process.

**Then try:**

#### Option A: Visit the test page in your browser
1. Go to: https://bitsy-tools.preview.emergentagent.com/test-sentry
2. Click all three test buttons:
   - "Test Error Capture" (blue)
   - "Test Message" (green)
   - "Test Error Boundary" (red - this will show error UI)
3. Wait 30 seconds
4. Refresh your Sentry dashboard

#### Option B: Trigger backend error via curl
```bash
curl https://bitsy-tools.preview.emergentagent.com/api/test-sentry
```

Run this 2-3 times, then check Sentry.

---

### 5. Troubleshooting

**Q: I see "No issues found" in Sentry**

**A:** Check these:

1. **Verify DSN is correct:**
   - Go to Sentry → Settings → Projects → bitsy-backend → Client Keys (DSN)
   - Compare with what's in `/app/backend/.env`

2. **Check project is active:**
   - Some Sentry accounts require email verification
   - Check your email for verification link from Sentry

3. **Verify services restarted:**
   ```bash
   supervisorctl status
   ```
   Both should show RUNNING

4. **Check initialization logs:**
   ```bash
   tail -n 50 /var/log/supervisor/backend.out.log | grep Sentry
   tail -n 50 /var/log/supervisor/frontend.err.log | grep Sentry
   ```
   
   Should show: `✅ Sentry initialized for development`

---

### 6. Understanding Sentry Dashboard

Once errors appear, here's what you'll see:

#### Issues Page (Main View)
- List of all errors grouped by type
- Frequency graph (how often each error occurs)
- Last seen timestamp
- Number of users affected

#### Individual Error View
Click any error to see:
- **Stack Trace**: Exact line of code that caused the error
- **Breadcrumbs**: User actions leading up to error
- **Tags**: Environment, browser, OS, URL
- **Context**: Request data, user info
- **Session Replay** (frontend only): Video playback of user's session

#### Performance (if enabled)
- API endpoint response times
- Page load metrics
- Transaction traces

---

### 7. Current Test Errors

You should see these errors in your dashboard right now:

**Backend (bitsy-backend project):**
```
Error: 🧪 Test error for Sentry verification - this is intentional!
File: server.js:169
Endpoint: GET /api/test-sentry
Count: 2+ events
```

**Frontend (bitsy-frontend project):**
```
Error: 🧪 Frontend test error - this is intentional!
Component: TestSentry.js
Count: 1+ events

Message: 🧪 Test message from Bitsy frontend
Type: Info
Count: 1+ events
```

---

### 8. Production Setup

Before deploying to AWS, you should:

1. **Create separate projects for production:**
   - `bitsy-backend-prod`
   - `bitsy-frontend-prod`

2. **Keep development projects:**
   - `bitsy-backend` (for staging/dev)
   - `bitsy-frontend` (for staging/dev)

3. **Set up alerts:**
   - Go to Alerts → Create Alert Rule
   - Trigger: "When error occurs more than X times in Y minutes"
   - Action: Send email/Slack notification

---

### 9. Quick Links

- **Sentry Dashboard**: https://sentry.io
- **Test Page**: https://bitsy-tools.preview.emergentagent.com/test-sentry
- **Backend Test Endpoint**: `curl https://bitsy-tools.preview.emergentagent.com/api/test-sentry`

---

**Still not seeing errors?** Let me know and I'll help debug the Sentry configuration.
