# GitHub Actions CI/CD Pipeline Setup

## Overview

Your Bitsy application now has a complete CI/CD pipeline that automatically:
- ✅ Runs 19 tests on every push (12 backend + 7 frontend)
- ✅ Builds the application to catch compilation errors
- ✅ Blocks merges if tests fail
- ✅ Prepares for automated AWS deployments (activated in Phase 10.5)

## Pipeline Architecture

### Workflows Created

1. **`ci-cd.yml`** - Main pipeline (runs on push to main)
   - Backend tests (Jest)
   - Frontend tests (Playwright)
   - Build verification
   - Staging deployment (ready to activate)
   - Production deployment (ready to activate)

2. **`pr-checks.yml`** - Pull request validation
   - Runs all tests on PRs
   - Blocks merge if tests fail
   - Auto-comments on PR with results

---

## Step-by-Step Setup

### Step 1: Push Code to GitHub

If you haven't already created a GitHub repository:

```bash
# Initialize git (if not already done)
cd /app
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Bitsy hotel booking platform with viem, tests, and Sentry"

# Create GitHub repo (via GitHub web UI or gh CLI)
# Then add remote:
git remote add origin https://github.com/YOUR_USERNAME/bitsy.git

# Push to GitHub
git push -u origin main
```

**⚠️ IMPORTANT:** Before pushing, create a `.gitignore` file to exclude sensitive data!

### Step 2: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

#### Required for CI/CD (Now):

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `REACT_APP_BACKEND_URL` | Your backend URL | For production builds |
| `REACT_APP_SENTRY_DSN` | `https://ae46d1d...@sentry.io/...` | Frontend Sentry DSN |
| `SENTRY_DSN_BACKEND` | `https://a0a13ba...@sentry.io/...` | Backend Sentry DSN |

#### Required for AWS Deployment (Phase 10.5):

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AWS_SSH_KEY_STAGING` | SSH private key | For deploying to staging server |
| `AWS_SSH_KEY_PRODUCTION` | SSH private key | For deploying to production server |
| `AWS_HOST_STAGING` | Staging server IP | E.g., `54.123.45.67` |
| `AWS_HOST_PRODUCTION` | Production server IP | E.g., `54.123.45.68` |
| `AWS_USER` | SSH username | Usually `ubuntu` or `ec2-user` |
| `MONGO_URL_STAGING` | MongoDB connection | For staging database |
| `MONGO_URL_PRODUCTION` | MongoDB connection | For production database |
| `JWT_SECRET` | Random secret string | For JWT token signing |
| `BREVO_API_KEY` | Your Brevo API key | For transactional emails |
| `OPENAI_API_KEY` | OpenAI key or Emergent key | For AI chat feature |

### Step 3: Test the Pipeline

1. **Make a small change** to any file (e.g., add a comment)
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Test CI/CD pipeline"
   git push origin main
   ```
3. **Watch the workflow:**
   - Go to GitHub → Actions tab
   - You'll see the "CI/CD Pipeline" running
   - Click on it to see real-time logs

### Step 4: Verify Tests Pass

You should see:
- ✅ Backend Tests: 12/12 passing
- ✅ Frontend Tests: 7/7 passing
- ✅ Build: Successful

If any test fails, the pipeline will stop and notify you.

---

## Workflow Details

### What Runs on Every Push:

```
1. Backend Tests (Jest)
   → 12 tests covering Web3Service and API endpoints
   → ~10-15 seconds

2. Frontend Tests (Playwright)
   → 7 E2E tests covering critical user flows
   → ~30-40 seconds

3. Build Verification
   → Ensures frontend compiles without errors
   → Creates production build artifacts
   → ~20-30 seconds

Total pipeline time: ~1-2 minutes
```

### What Runs on Pull Requests:

- Same tests as above
- Auto-comments on PR with results
- Prevents merge if tests fail

### Deployment Jobs (Phase 10.5):

Currently configured but **not active**. Will be enabled after AWS setup:
- `deploy-staging`: Auto-deploys to staging on push to main
- `deploy-production`: Requires manual approval, deploys to production

---

## Branch Protection Rules (Recommended)

After pipeline is working, add these rules:

1. Go to **Settings** → **Branches** → **Add rule**
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass (select: `backend-test`, `frontend-test`, `build`)
   - ✅ Require conversation resolution before merging

This prevents anyone (including you) from pushing broken code to main.

---

## Monitoring & Notifications

### GitHub Actions Notifications:

By default, GitHub will email you when:
- A workflow fails
- A workflow succeeds after previously failing

### Slack Integration (Optional):

Add this step to your workflow for Slack notifications:

```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "❌ Build failed on ${{ github.ref }}"
      }
```

---

## Local Testing (Before Push)

Always run tests locally before pushing:

```bash
# Backend tests
cd /app/backend && yarn test

# Frontend tests
cd /app/frontend && yarn test:e2e

# Both pass? Safe to push!
git push origin main
```

---

## Troubleshooting

### "Tests failed in CI but pass locally"

**Cause:** Environment differences (missing env vars, different Node version)

**Fix:**
1. Check GitHub Actions logs for the specific error
2. Ensure all required secrets are configured
3. Verify Node.js version matches (20.x)

### "Playwright tests timeout"

**Cause:** Preview URL may be slow or unavailable

**Fix:**
1. Increase timeout in playwright.config.js
2. Or test against a faster staging environment after AWS setup

### "Build fails with 'REACT_APP_BACKEND_URL is not defined'"

**Cause:** Missing GitHub secret

**Fix:**
1. Add `REACT_APP_BACKEND_URL` to GitHub Secrets
2. Re-run the workflow

---

## Cost & Performance

### GitHub Actions Free Tier:
- **2,000 minutes/month** for private repos
- **Unlimited** for public repos
- Current pipeline: ~2 min per run
- **~1,000 pushes/month** within free tier

### Optimization Tips:
- Cache dependencies (already configured ✅)
- Run jobs in parallel (already configured ✅)
- Skip E2E tests for draft PRs (optional)

---

## Next Steps (Phase 10.5)

After AWS deployment is complete:
1. Update `deploy-staging` job with actual SSH commands
2. Update `deploy-production` job with actual SSH commands
3. Add AWS secrets to GitHub
4. Enable automatic deployments

Then every push to `main` will:
1. Run tests ✅
2. Build app ✅
3. Deploy to staging automatically 🚀
4. Deploy to production (with manual approval) 🎯

---

## Files Reference

- Main workflow: `/.github/workflows/ci-cd.yml`
- PR checks: `/.github/workflows/pr-checks.yml`
- Test configs: `/backend/jest.config.js`, `/frontend/playwright.config.js`

---

**Status:** ✅ CI/CD pipeline ready - push to GitHub to activate
**Next:** Phase 10.5 - AWS Deployment
