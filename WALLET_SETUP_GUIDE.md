# 🦊 MetaMask Multi-Chain Wallet Setup Guide for Hotels

## Overview
As of 2026, **MetaMask supports ALL the chains Bitsy uses** in one wallet! You can manage Ethereum, Polygon, Base, Arbitrum, Optimism, BSC, **Solana**, **Bitcoin**, and **Tron** all from a single MetaMask app.

---

## ✅ Step 1: Install & Set Up MetaMask

1. Download MetaMask from official sources:
   - **Desktop**: [metamask.io](https://metamask.io) → Browser extension
   - **Mobile**: iOS App Store or Google Play (search "MetaMask")

2. Create a new wallet or import existing
   - **CRITICAL**: Write down your 12-word recovery phrase and store it safely
   - Never share your recovery phrase with anyone!

---

## 🔗 Step 2: Get Your Wallet Addresses

MetaMask provides **DIFFERENT addresses** for different chain types:

### **A. EVM Chains (Same Address for All)** ✅
These chains all use the **SAME address** (starts with `0x...`):
- Ethereum
- Polygon  
- Base
- Arbitrum
- Optimism
- BNB Chain (BSC)

**How to get it:**
1. Open MetaMask
2. Click on your wallet name at the top
3. Your address shows as `0x742d...` 
4. Click to copy
5. Paste this SAME address for all EVM chains in Bitsy dashboard

### **B. Solana (Different Address)** ◎
1. In MetaMask, click network dropdown (top left)
2. Select **"Solana"**
3. Your Solana address will be different (NOT starting with 0x)
4. Copy the Solana address
5. Paste in Bitsy dashboard under "Solana"

### **C. Bitcoin (Different Address)** ₿
1. In MetaMask, select **"Bitcoin"** network
2. Your Bitcoin address will be different (starts with `bc1...` or `3...`)
3. Copy the Bitcoin address  
4. Paste in Bitsy dashboard under "Bitcoin"

### **D. Tron (Different Address)** TRX
1. In MetaMask, select **"Tron"** network (if available)
2. Your Tron address will be different (starts with `T...`)
3. Copy the Tron address
4. Paste in Bitsy dashboard under "Tron"

---

## 📝 Step 3: Enter Addresses in Bitsy Dashboard

1. Login to your Bitsy hotel dashboard
2. Go to **Dashboard → Wallets**
3. Enter your addresses:

```
Ethereum: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb  ← From MetaMask ETH network
Polygon:  0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb  ← SAME as Ethereum!
Base:     0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb  ← SAME as Ethereum!
Arbitrum: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb  ← SAME as Ethereum!
Optimism: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb  ← SAME as Ethereum!

Bitcoin:  bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh  ← DIFFERENT! From Bitcoin network
Solana:   9WzDXwBbYgcDqDgjgz98FH4WVdSbxXzhT5h3YKLmN8P2  ← DIFFERENT! From Solana network
Tron:     TKBHx1pS8pJkFZqKxT9KZhGqK8ZqK8ZqK8          ← DIFFERENT! From Tron network
```

4. Click **"Save Wallets"**

---

## ✅ Step 4: Verify Setup

After saving, go to your hotel's booking widget and test:
- Select different payment chains in the widget
- Verify each chain shows the correct address format
- **EVM chains** should all show the same `0x...` address
- **Solana** should show Solana format address
- **Bitcoin** should show Bitcoin format address

---

## 🔐 Security Best Practices

✅ **DO:**
- Use MetaMask from official sources only
- Write down your recovery phrase on paper (not digitally)
- Enable biometric lock (Face ID/fingerprint) on mobile
- Double-check addresses when entering in Bitsy

❌ **DON'T:**
- Share your recovery phrase or private keys with anyone
- Click wallet download links from messages or ads
- Enter your recovery phrase on websites
- Use the same simple password everywhere

---

## 💡 Pro Tips

1. **Test with small amounts first**: When you first set up, ask a friend to send $1 on each chain to verify addresses work

2. **Backup your recovery phrase**: Store it in multiple secure locations (safe, safe deposit box)

3. **Monitor your wallets**: Add your addresses to a portfolio tracker to see all chains in one view

4. **Guest flexibility**: Guests can pay using ANY wallet (Phantom, Coinbase, Trust Wallet) as long as they send to your address on the correct chain

---

## 🆘 Troubleshooting

**Q: I don't see Bitcoin/Solana/Tron in my MetaMask**
- A: Update MetaMask to the latest version (2026). These networks were added recently.

**Q: Can guests with Phantom wallet pay to my MetaMask Solana address?**
- A: YES! Solana addresses work the same regardless of which wallet created them.

**Q: Do I need a separate wallet for each chain?**
- A: NO! One MetaMask handles all chains (but gives you different addresses for Bitcoin/Solana/Tron vs EVM chains).

**Q: What if I already have a Phantom wallet for Solana?**
- A: You can:
  - Import your Phantom wallet into MetaMask (using recovery phrase)
  - OR just enter your Phantom Solana address in Bitsy (works fine!)
  - Payments go to the same Solana address either way

---

## 📞 Support

Need help? Contact Bitsy support or check the [MetaMask Help Center](https://support.metamask.io)
