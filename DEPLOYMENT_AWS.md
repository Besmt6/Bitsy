# Bitsy AWS Deployment Guide

Complete guide to deploying Bitsy on Amazon Web Services (AWS) from GitHub.

---

## Prerequisites

- ✅ GitHub account with Bitsy repository
- ✅ AWS account (free tier eligible)
- ✅ Domain: getbitsy.ai (DNS managed via Porkbun or Route53)
- ✅ MongoDB Atlas cluster (free tier: 512MB)

---

## Part 1: MongoDB Atlas Setup (5 minutes)

### 1.1 Create Atlas Cluster

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up / Log in
3. Click **"Create"** → **"Shared"** (Free tier)
4. Choose:
   - Provider: **AWS**
   - Region: **us-east-1** (same as your app)
   - Cluster Name: `bitsy-production`
5. Click **"Create Cluster"** (takes 3-5 minutes)

### 1.2 Configure Network Access

1. In Atlas: **"Network Access"** → **"Add IP Address"**
2. Click **"Allow Access from Anywhere"** → `0.0.0.0/0`
3. Save (Note: For production, restrict to AWS VPC IPs later)

### 1.3 Create Database User

1. **"Database Access"** → **"Add New Database User"**
2. Username: `bitsy-app`
3. Password: Generate strong password (save it!)
4. Database User Privileges: **"Read and write to any database"**
5. Click **"Add User"**

### 1.4 Get Connection String

1. **"Clusters"** → **"Connect"** → **"Connect your application"**
2. Driver: **Node.js**, Version: **5.5 or later**
3. Copy connection string:
   ```
   mongodb+srv://bitsy-app:<password>@bitsy-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your database password
5. Add database name: `mongodb+srv://...mongodb.net/bitsy?retryWrites=true`

---

## Part 2: Prepare GitHub Repository

### 2.1 Push to GitHub

```bash
cd /app
git init
git add .
git commit -m "Initial commit - Bitsy hotel booking platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bitsy.git
git push -u origin main
```

### 2.2 Verify .gitignore

Ensure these are NOT committed:
- ❌ `.env` files (contains secrets)
- ❌ `node_modules/` (installed during deployment)
- ❌ `/backend/public/uploads/` (user uploads)
- ❌ Test files and logs

---

## Part 3: AWS Deployment Options

Choose one based on your needs:

---

## Option A: AWS App Runner (Easiest - Recommended)

**Cost**: ~$25/month | **Setup**: 10 minutes | **Scaling**: Automatic

### Step 1: Prepare Dockerfile

Create `/app/Dockerfile`:

```dockerfile
FROM node:20-alpine

# Install dependencies
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Expose port
EXPOSE 8001

# Start script
CMD ["node", "backend/src/server.js"]
```

### Step 2: Create App Runner Service

1. Go to: **AWS App Runner Console**
2. Click **"Create service"**
3. Source: **"Source code repository"**
4. Connect GitHub → Select `bitsy` repo
5. Build settings:
   - Runtime: **Node.js 20**
   - Build command: `npm install`
   - Start command: `node backend/src/server.js`
6. Configure service:
   - Port: **8001**
   - Environment variables (click "Add environment variable"):
     ```
     MONGO_URL=mongodb+srv://bitsy-app:PASSWORD@bitsy-production.xxxxx.mongodb.net/bitsy
     OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
     JWT_SECRET=your-super-secret-jwt-key-min-32-characters
     ```
7. Click **"Create & Deploy"**
8. Wait 5-10 minutes → You'll get a URL like: `https://xxxxx.us-east-1.awsapprunner.com`

### Step 3: Custom Domain

1. In App Runner service → **"Custom domains"**
2. Add domain: `getbitsy.ai` and `www.getbitsy.ai`
3. Copy the CNAME validation records
4. Add to Porkbun DNS:
   - Type: `CNAME`
   - Host: `_verify.getbitsy.ai`
   - Value: `xxxxx.awsapprunner.com`
5. Wait for validation (2-60 minutes)

---

## Option B: AWS EC2 (Full Control)

**Cost**: ~$15/month (t3.micro) | **Setup**: 30 minutes | **Scaling**: Manual

### Step 1: Launch EC2 Instance

1. **AWS EC2 Console** → **"Launch Instance"**
2. Name: `bitsy-production`
3. AMI: **Ubuntu Server 22.04 LTS**
4. Instance type: **t3.small** (2GB RAM recommended)
5. Key pair: Create new → Download `.pem` file
6. Security group: Allow ports **22** (SSH), **80** (HTTP), **443** (HTTPS)
7. Storage: **20 GB gp3**
8. Click **"Launch Instance"**

### Step 2: SSH and Setup

```bash
# SSH into server
ssh -i bitsy-key.pem ubuntu@YOUR_EC2_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Clone your repo
git clone https://github.com/YOUR_USERNAME/bitsy.git
cd bitsy

# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && npm run build && cd ..
```

### Step 3: Configure Environment

```bash
# Create backend .env
nano backend/.env
```

Add:
```env
MONGO_URL=mongodb+srv://bitsy-app:PASSWORD@bitsy-production.xxxxx.mongodb.net/bitsy
OPENAI_API_KEY=sk-proj-YOUR_KEY
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
PORT=8001
NODE_ENV=production
```

### Step 4: Start Services

```bash
# Start backend with PM2
cd backend
pm2 start src/server.js --name bitsy-backend
pm2 save
pm2 startup

# Serve frontend with Nginx
sudo nano /etc/nginx/sites-available/bitsy
```

Add Nginx config:
```nginx
server {
    listen 80;
    server_name getbitsy.ai www.getbitsy.ai;

    # Frontend
    location / {
        root /home/ubuntu/bitsy/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/bitsy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: SSL Certificate (Free)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d getbitsy.ai -d www.getbitsy.ai
```

---

## Option C: AWS ECS + Fargate (Production Scale)

**Cost**: ~$40/month | **Setup**: 45 minutes | **Scaling**: Automatic

(Detailed steps available if you choose this option)

---

## Environment Variables Reference

### Backend (.env)
```env
# Database
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/bitsy

# Authentication
JWT_SECRET=minimum-32-character-secret-key-here

# AI
OPENAI_API_KEY=sk-proj-your-key-here

# Server
PORT=8001
NODE_ENV=production

# Optional: Telegram Notifications
TELEGRAM_BOT_TOKEN=your-bot-token
```

### Frontend (.env)
```env
# Backend API URL (update to your production domain)
REACT_APP_BACKEND_URL=https://getbitsy.ai
```

---

## Post-Deployment Checklist

- [ ] Test user registration/login
- [ ] Test AI chat widget on production
- [ ] Test MetaMask wallet connection (testnet first)
- [ ] Test photo uploads
- [ ] Test MCP endpoint: `curl https://getbitsy.ai/api/mcp`
- [ ] Verify analytics tracking
- [ ] Test from mobile devices
- [ ] Setup monitoring (AWS CloudWatch or UptimeRobot)
- [ ] Configure backups (MongoDB Atlas auto-backup)
- [ ] Update DNS: Point getbitsy.ai to AWS server

---

## Monitoring & Maintenance

**Logs:**
```bash
# Backend logs
pm2 logs bitsy-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Updates:**
```bash
cd ~/bitsy
git pull origin main
cd backend && npm install && pm2 restart bitsy-backend
cd ../frontend && npm install && npm run build
```

---

## Cost Estimate (Monthly)

| Service | Option | Cost |
|---------|--------|------|
| MongoDB Atlas | Free Tier (512MB) | $0 |
| AWS App Runner | 1 service | $25 |
| AWS EC2 | t3.small | $15 |
| AWS ECS Fargate | 0.5 vCPU, 1GB RAM | $40 |
| Domain (getbitsy.ai) | Porkbun | $10/year |
| SSL Certificate | Let's Encrypt | $0 |
| **Total (Cheapest)** | **EC2** | **~$15/month** |

---

## Need Help?

- AWS Issues: Check CloudWatch logs
- Database Issues: Check MongoDB Atlas metrics
- SSL Issues: `sudo certbot renew --dry-run`

**Ready to deploy!** 🚀
