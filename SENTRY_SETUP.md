# Sentry Integration Guide

## Overview

Sentry error monitoring is **pre-installed and configured** in both frontend and backend. It will automatically activate when you provide your DSN keys.

## Quick Setup (5 minutes)

### 1. Create Sentry Account

1. Go to https://sentry.io
2. Click **"Start Free"** (5,000 errors/month free)
3. Sign up with your email

### 2. Create Projects

#### Backend Project
1. Click **"Create Project"**
2. Platform: Select **Node.js / Express**
3. Alert frequency: **Alert me on every new issue**
4. Project name: `bitsy-backend`
5. Click **"Create Project"**
6. **📋 Copy the DSN** (format: `https://<key>@<region>.ingest.sentry.io/<project-id>`)

#### Frontend Project
1. Click **"Projects"** → **"Create Project"**
2. Platform: Select **React**
3. Project name: `bitsy-frontend`
4. Click **"Create Project"**
5. **📋 Copy this DSN** (will be different from backend)

### 3. Add DSN Keys to Environment

#### Backend (.env)
```bash
cd /app/backend
nano .env

# Add this line (uncomment and replace with your actual DSN):
SENTRY_DSN_BACKEND=https://your-backend-key@sentry.io/your-project-id
```

#### Frontend (.env)
```bash
cd /app/frontend
nano .env

# Add this line (uncomment and replace with your actual DSN):
REACT_APP_SENTRY_DSN=https://your-frontend-key@sentry.io/your-project-id
```

### 4. Restart Services

```bash
supervisorctl restart backend
supervisorctl restart frontend
```

### 5. Verify Activation

Check the logs - you should see:
```
✅ Sentry initialized for production
```

Instead of:
```
ℹ️  Sentry: Skipped (no DSN or test environment)
```

## What's Already Configured

✅ **Backend Monitoring:**
- All HTTP requests traced
- Express route instrumentation
- MongoDB query monitoring
- Performance profiling
- Automatic error capture for 5xx errors
- Sensitive data filtering (passwords, auth tokens)

✅ **Frontend Monitoring:**
- Browser error tracking
- React error boundaries with fallback UI
- Session replay on errors
- Performance monitoring
- User interaction breadcrumbs

## Testing Sentry (After Setup)

### Backend Test
```bash
curl -X POST https://bitsy-tools.preview.emergentagent.com/api/test-error \
  -H "Content-Type: application/json"
```

Then check your Sentry dashboard - you should see the error appear within seconds.

### Frontend Test
1. Open the app in browser
2. Open DevTools console
3. Type: `throw new Error("Test Sentry")`
4. Check Sentry dashboard for the error + session replay

## Sentry Dashboard

After errors are captured, you can:
- View error stack traces with source maps
- See user sessions leading to errors
- Get alerts via email/Slack
- Track error frequency and trends
- Replay user sessions (frontend only)

## Production Best Practices

1. **Separate Projects**: Keep staging and production in separate Sentry projects
2. **Alerts**: Configure alerts for critical errors in Sentry dashboard
3. **Releases**: Tag releases with version numbers for better tracking
4. **Source Maps**: Ensure source maps are uploaded for production builds

## Troubleshooting

**Q: I don't see "✅ Sentry initialized" in logs**
A: Double-check your DSN is uncommented in .env files and services were restarted

**Q: Errors not appearing in Sentry**
A: Verify the DSN is correct, check Sentry project is active, ensure network access to sentry.io

**Q: Too many errors being captured**
A: Adjust sample rates in `/app/backend/src/config/sentry.js` and `/app/frontend/src/config/sentry.js`

## Cost Management

- Free tier: 5,000 errors/month
- Exceeding quota: Sentry will stop accepting new errors but won't break your app
- To reduce costs: Lower `tracesSampleRate` in production (currently 0.1 = 10%)

## Files Reference

- Backend config: `/app/backend/src/config/sentry.js`
- Frontend config: `/app/frontend/src/config/sentry.js`
- Error boundary UI: `/app/frontend/src/components/ErrorBoundary.js`
- Backend integration: `/app/backend/src/server.js` (lines 11, 48-50, 204)
- Frontend integration: `/app/frontend/src/index.js`

---

**Status**: ✅ Fully integrated, awaiting DSN keys to activate
