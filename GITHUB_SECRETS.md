# GitHub Secrets Configuration

## Required Secrets for CI/CD Pipeline

Add these secrets in GitHub: **Repository Settings** → **Secrets and variables** → **Actions** → **New repository secret**

---

## 1. Current Phase (CI/CD Testing) - Required Now

### Frontend Environment

**`REACT_APP_BACKEND_URL`**
```
Value: https://bitsy-tools.preview.emergentagent.com
Description: Backend API URL for production builds
When: Required for frontend build job
```

**`REACT_APP_SENTRY_DSN`**
```
Value: https://ae46d1dee6581feede6760572fa895c3@o4511050888577024.ingest.us.sentry.io/4511050916888576
Description: Frontend Sentry error monitoring
When: Optional but recommended for build job
```

### Backend Environment

**`SENTRY_DSN_BACKEND`**
```
Value: https://a0a13ba3168b5b1d3c915ce01d7b9363@o4511050888577024.ingest.us.sentry.io/4511050938449920
Description: Backend Sentry error monitoring
When: Optional but recommended for deploy jobs
```

---

## 2. Next Phase (AWS Deployment) - Required for Phase 10.5

### AWS SSH Access (Staging)

**`AWS_SSH_KEY_STAGING`**
```
Value: -----BEGIN RSA PRIVATE KEY-----
       [Your staging server SSH private key]
       -----END RSA PRIVATE KEY-----
Description: SSH private key for accessing staging EC2 instance
When: Required to activate deploy-staging job
```

**`AWS_HOST_STAGING`**
```
Value: 54.123.45.67 (example)
Description: Public IP address of staging EC2 instance
When: Required to activate deploy-staging job
```

### AWS SSH Access (Production)

**`AWS_SSH_KEY_PRODUCTION`**
```
Value: -----BEGIN RSA PRIVATE KEY-----
       [Your production server SSH private key]
       -----END RSA PRIVATE KEY-----
Description: SSH private key for accessing production EC2 instance
When: Required to activate deploy-production job
```

**`AWS_HOST_PRODUCTION`**
```
Value: 54.123.45.68 (example)
Description: Public IP address of production EC2 instance
When: Required to activate deploy-production job
```

**`AWS_USER`**
```
Value: ubuntu
Description: SSH username for EC2 instances (usually 'ubuntu' for Ubuntu, 'ec2-user' for Amazon Linux)
When: Required for both staging and production deploy jobs
```

---

## 3. Application Secrets (For AWS Deployment)

These will be added to your AWS servers' `.env` files during Phase 10.5:

### Database

**`MONGO_URL_STAGING`**
```
Value: mongodb+srv://username:password@cluster.mongodb.net/bitsy_staging
Description: MongoDB Atlas connection string for staging
```

**`MONGO_URL_PRODUCTION`**
```
Value: mongodb+srv://username:password@cluster.mongodb.net/bitsy_production
Description: MongoDB Atlas connection string for production
```

### Authentication

**`JWT_SECRET`**
```
Value: [Generate a random 64-character string]
Command to generate: openssl rand -base64 64
Description: Secret for signing JWT tokens
⚠️ Use DIFFERENT secrets for staging and production!
```

### Email Service

**`BREVO_API_KEY`**
```
Value: xkeysib-[your-key-here]
Description: Brevo API key for transactional emails
Note: You already have this - same key for both environments
```

### AI Chat

**`OPENAI_API_KEY`** (or use Emergent LLM Key)
```
Value: sk-proj-[your-key-here]
Description: OpenAI API key for chat functionality
Note: You're currently using Emergent LLM key - this is optional
```

### Blockchain RPC Endpoints (Optional - Use Free Public RPCs)

```
ETHEREUM_RPC=https://eth.llamarpc.com
POLYGON_RPC=https://polygon-rpc.com
BASE_RPC=https://mainnet.base.org
ARBITRUM_RPC=https://arb1.arbitrum.io/rpc
OPTIMISM_RPC=https://mainnet.optimism.io
BSC_RPC=https://bsc-dataseed.binance.org
```

---

## How to Add Secrets to GitHub

### Via Web UI:
1. Go to your repo: `https://github.com/YOUR_USERNAME/bitsy`
2. Click **Settings** (top right)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret** (green button)
5. Enter **Name** and **Value**
6. Click **Add secret**

### Via GitHub CLI:
```bash
gh secret set REACT_APP_BACKEND_URL --body "https://getbitsy.ai"
gh secret set REACT_APP_SENTRY_DSN --body "https://ae46d1d..."
```

---

## Security Best Practices

### ✅ DO:
- Use different SSH keys for staging and production
- Use different JWT secrets for each environment
- Rotate secrets every 90 days
- Use GitHub environment secrets for production (requires manual approval)
- Keep backup copies of secrets in a password manager (1Password, LastPass)

### ❌ DON'T:
- Never commit `.env` files to Git (already in .gitignore ✅)
- Never share secrets in Slack/email (use encrypted channels)
- Never use the same secrets across environments
- Never log secrets in your application code

---

## Verification Checklist

Before activating deployment jobs:

- [ ] All test secrets added (`REACT_APP_*`, `SENTRY_DSN_*`)
- [ ] Pipeline runs successfully on test push
- [ ] All 19 tests pass in GitHub Actions
- [ ] Build artifacts are created
- [ ] AWS EC2 instances created and accessible via SSH
- [ ] AWS deployment secrets added (`AWS_SSH_KEY_*`, `AWS_HOST_*`, etc.)
- [ ] MongoDB Atlas configured for both staging and production
- [ ] Domain DNS configured to point to production server

---

## Quick Reference: Secret Categories

| Category | Secrets | When Needed |
|----------|---------|-------------|
| **CI/CD Testing** | REACT_APP_BACKEND_URL, Sentry DSNs | ✅ Now (Phase 10.4) |
| **AWS Access** | SSH keys, hosts, user | Phase 10.5 |
| **Application** | MONGO_URL, JWT_SECRET, API keys | Phase 10.5 |
| **Optional** | Slack webhooks, RPC endpoints | After production |

---

## Current Status

✅ **Pipeline Created**: Workflows ready in `.github/workflows/`  
⚠️ **Secrets Pending**: Add test secrets to activate CI  
⚠️ **Deployment Pending**: Will be activated in Phase 10.5

---

## Next Steps

1. **Create GitHub repository** (if not done)
2. **Add current phase secrets** (REACT_APP_BACKEND_URL, Sentry DSNs)
3. **Push code to GitHub**
4. **Verify pipeline runs** (should see green checkmarks)
5. **Proceed to Phase 10.5** (AWS deployment)

---

**Questions?** Check the workflow files directly:
- `.github/workflows/ci-cd.yml` (main pipeline)
- `.github/workflows/pr-checks.yml` (PR validation)
