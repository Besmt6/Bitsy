# Bitsy Environment Variables Guide

Complete reference for all environment variables used in Bitsy.

---

## Backend Environment Variables

### Required (App won't start without these)

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/bitsy` | MongoDB Atlas dashboard |
| `JWT_SECRET` | Secret key for JWT tokens (32+ chars) | `your-random-32-char-secret` | Generate: `openssl rand -base64 32` |
| `OPENAI_API_KEY` | OpenAI API key for chat | `sk-proj-ABC123...` | platform.openai.com/api-keys |

### Optional (Feature-specific)

| Variable | Description | Default | Required For |
|----------|-------------|---------|--------------|
| `PORT` | Backend server port | `8001` | Custom port configuration |
| `NODE_ENV` | Environment mode | `development` | Production optimizations |
| `TELEGRAM_BOT_TOKEN` | Telegram bot for notifications | - | Telegram notifications |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID | - | Telegram notifications |
| `ETHEREUM_RPC_URL` | Ethereum RPC endpoint | Emergent default | Custom blockchain node |
| `POLYGON_RPC_URL` | Polygon RPC endpoint | Emergent default | Custom blockchain node |
| `BASE_RPC_URL` | Base RPC endpoint | Emergent default | Custom blockchain node |
| `ARBITRUM_RPC_URL` | Arbitrum RPC endpoint | Emergent default | Custom blockchain node |
| `OPTIMISM_RPC_URL` | Optimism RPC endpoint | Emergent default | Custom blockchain node |

---

## Frontend Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_BACKEND_URL` | Backend API base URL | `https://getbitsy.ai` |

**Important Notes:**
- ✅ No trailing slash
- ✅ Must match your backend domain
- ✅ Backend must have CORS configured for this domain
- ❌ Never use `localhost` in production

---

## How to Set Environment Variables

### Development (Local)

Create `.env` files:
```bash
# Backend
cp backend/.env.example backend/.env
nano backend/.env  # Edit with your values

# Frontend
cp frontend/.env.example frontend/.env
nano frontend/.env  # Edit with your values
```

### Production (AWS App Runner)

1. Go to your App Runner service
2. **Configuration** → **Environment variables**
3. Add each variable manually in the UI

### Production (AWS EC2)

```bash
# SSH into server
ssh -i key.pem ubuntu@YOUR_IP

# Create backend .env
cd ~/bitsy/backend
nano .env  # Paste values

# Create frontend .env (before build)
cd ~/bitsy/frontend
nano .env  # Paste values
npm run build  # Rebuild with new env vars
```

### Production (Docker)

In your `docker-compose.yml`:
```yaml
services:
  backend:
    environment:
      - MONGO_URL=${MONGO_URL}
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
```

Then create `.env` file in project root with values.

---

## Security Best Practices

### ✅ DO:
- Use strong, random JWT_SECRET (32+ characters)
- Use environment-specific .env files
- Rotate secrets periodically
- Use MongoDB Atlas IP allowlist in production
- Enable AWS Secrets Manager for production secrets

### ❌ DON'T:
- Never commit .env files to Git
- Never hardcode secrets in code
- Never use weak JWT secrets like "secret" or "12345"
- Never share API keys in public forums
- Never log sensitive values

---

## Testing Environment Variables

### Backend Test
```bash
node -e "
require('dotenv').config({ path: './backend/.env' });
console.log('✅ MONGO_URL:', process.env.MONGO_URL ? 'Set' : '❌ Missing');
console.log('✅ JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : '❌ Missing');
console.log('✅ OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : '❌ Missing');
"
```

### Frontend Test
```bash
cd frontend
npm start
# Check browser console for: console.log(process.env.REACT_APP_BACKEND_URL)
```

---

## Troubleshooting

**Problem**: "JWT_SECRET is not set"  
**Solution**: Ensure `.env` file exists in backend/ folder and contains JWT_SECRET

**Problem**: "Cannot connect to MongoDB"  
**Solution**: Check MONGO_URL format, verify Atlas IP allowlist includes 0.0.0.0/0 or your server IP

**Problem**: "OpenAI API error: 401 Unauthorized"  
**Solution**: Verify OPENAI_API_KEY is correct and has credits

**Problem**: "Frontend can't reach backend"  
**Solution**: Verify REACT_APP_BACKEND_URL matches your backend domain, check CORS settings

**Problem**: "Module not found" errors  
**Solution**: Run `npm install` in both backend/ and frontend/ directories

---

## Quick Reference

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

**Test Backend Connection:**
```bash
curl https://your-domain.com/api/mcp
```

**Check if variables are loaded:**
```bash
# In backend
node -p "process.env.MONGO_URL ? 'OK' : 'Missing'"
```

**Ready for deployment!** 🚀
