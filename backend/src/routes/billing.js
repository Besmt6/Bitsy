import express from 'express';
import { protect } from '../middleware/auth.js';
import { getBillingDashboard, updateBillingStatus } from '../services/billingService.js';
import Hotel from '../models/Hotel.js';
import logger from '../config/logger.js';

const router = express.Router();

// @route   GET /api/billing/status
// @desc    Get current billing status and trial usage for hotel
// @access  Private (Hotel owner)
router.get('/status', protect, async (req, res) => {
  try {
    const billingInfo = await getBillingDashboard(req.hotel._id);
    
    res.json({
      success: true,
      billing: billingInfo
    });
  } catch (error) {
    console.error('Get billing status error:', error);
    res.status(500).json({ error: 'Server error fetching billing status' });
  }
});

// @route   POST /api/billing/refresh
// @desc    Manually refresh billing status (recalculate trial revenue)
// @access  Private (Hotel owner)
router.post('/refresh', protect, async (req, res) => {
  try {
    const billingInfo = await updateBillingStatus(req.hotel);
    
    res.json({
      success: true,
      message: 'Billing status refreshed',
      billing: {
        trialUsedUsd: billingInfo.trialUsedUsd,
        trialLimitUsd: billingInfo.trialLimitUsd,
        billingStatus: billingInfo.billingStatus,
        graceDaysRemaining: billingInfo.graceDaysRemaining
      }
    });
  } catch (error) {
    console.error('Refresh billing error:', error);
    res.status(500).json({ error: 'Server error refreshing billing status' });
  }
});

// @route   POST /api/billing/payment
// @desc    Submit commission payment proof (crypto tx hash)
// @access  Private (Hotel owner)
router.post('/payment', protect, async (req, res) => {
  try {
    const { txHash, amount, chain } = req.body;
    
    if (!txHash || !amount || !chain) {
      return res.status(400).json({ 
        error: 'Transaction hash, amount, and blockchain are required' 
      });
    }

    // Import web3 service for verification
    const { verifyPayment } = await import('../services/web3Service.js');
    
    // Get Bitsy's receiving address for the specified chain
    // TODO: Replace with actual production addresses from env variables
    const bitsyAddresses = {
      ethereum: process.env.BITSY_ETH_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      polygon: process.env.BITSY_POLYGON_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      base: process.env.BITSY_BASE_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      arbitrum: process.env.BITSY_ARBITRUM_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      optimism: process.env.BITSY_OPTIMISM_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      avalanche: process.env.BITSY_AVALANCHE_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      bsc: process.env.BITSY_BSC_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      // Add Solana, Bitcoin, Tron when ready
    };

    const expectedRecipient = bitsyAddresses[chain.toLowerCase()];
    
    if (!expectedRecipient) {
      return res.status(400).json({ 
        error: `Chain '${chain}' not supported for commission payments yet. Please use: ${Object.keys(bitsyAddresses).join(', ')}` 
      });
    }

    logger.info('💰 Verifying commission payment', {
      hotel: req.hotel.hotelName,
      hotelId: req.hotel._id,
      txHash,
      amount,
      chain
    });

    // Verify transaction on-chain
    const verification = await verifyPayment(
      txHash,
      expectedRecipient,
      amount,
      chain
    );

    if (!verification.isValid) {
      logger.warn('❌ Invalid commission payment submitted', {
        hotel: req.hotel.hotelName,
        txHash,
        reason: verification.error,
        chain
      });

      return res.status(400).json({
        error: 'Payment verification failed',
        details: verification.error,
        verified: false
      });
    }

    // Payment verified successfully
    logger.info('✅ Commission payment verified on-chain', {
      hotel: req.hotel.hotelName,
      txHash,
      amount: verification.amount,
      chain
    });

    // Update hotel billing status
    const hotel = await Hotel.findById(req.hotel._id);
    hotel.billing.lastPaymentReceivedAt = new Date();
    
    // Reactivate account if blocked or in grace
    if (hotel.billing.billingStatus === 'blocked' || hotel.billing.billingStatus === 'grace') {
      hotel.billing.billingStatus = 'active';
      logger.info(`✅ Hotel ${hotel.hotelName} reactivated after verified payment`);
    }
    
    await hotel.save();

    res.json({
      success: true,
      verified: true,
      message: 'Payment verified on-chain. Your account has been reactivated.',
      verification: {
        txHash: verification.txHash,
        amount: verification.amount,
        from: verification.from,
        to: verification.to,
        chain: chain,
        timestamp: verification.timestamp
      },
      billing: {
        billingStatus: hotel.billing.billingStatus,
        lastPaymentReceivedAt: hotel.billing.lastPaymentReceivedAt
      }
    });
  } catch (error) {
    logger.error('Submit payment error', { 
      error: error.message,
      hotelId: req.hotel._id 
    });
    res.status(500).json({ error: 'Server error processing payment' });
  }
});

// @route   POST /api/billing/verify-location
// @desc    Submit hotel location for verification
// @access  Private (Hotel owner)
router.post('/verify-location', protect, async (req, res) => {
  try {
    const { address, city, state, country, postalCode } = req.body;
    
    if (!address || !city || !country) {
      return res.status(400).json({ error: 'Address, city, and country are required' });
    }

    const hotel = await Hotel.findById(req.hotel._id);
    
    // Update location info
    hotel.locationVerification = {
      address,
      city,
      state: state || '',
      country,
      postalCode: postalCode || '',
      verificationStatus: 'pending',
      verificationNotes: 'Submitted for review'
    };
    
    await hotel.save();
    
    console.log(`📍 Location verification submitted for ${hotel.hotelName}:`, { address, city, country });

    res.json({
      success: true,
      message: 'Location submitted for verification. Our team will review within 24-48 hours.',
      location: hotel.locationVerification
    });
  } catch (error) {
    console.error('Location verification error:', error);
    res.status(500).json({ error: 'Server error submitting location' });
  }
});

// @route   GET /api/billing/payment-instructions
// @desc    Get Bitsy crypto wallet addresses for commission payment
// @access  Private (Hotel owner)
router.get('/payment-instructions', protect, async (req, res) => {
  try {
    // Bitsy receiving addresses (replace with actual addresses)
    const bitsyWallets = {
      ethereum: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      polygon: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      base: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
    };

    const billingInfo = await getBillingDashboard(req.hotel._id);
    const commissionOwed = (billingInfo.trial.usedUsd - billingInfo.trial.limitUsd) * (billingInfo.commissionRate / 100);

    res.json({
      success: true,
      bitsyWallets,
      commissionOwed: Math.max(0, commissionOwed).toFixed(2),
      commissionRate: billingInfo.commissionRate,
      instructions: {
        step1: 'Choose your preferred crypto chain from the addresses above',
        step2: `Send commission payment to the corresponding Bitsy wallet address`,
        step3: 'Include your hotel email or ID in the transaction memo (if supported)',
        step4: 'Submit the transaction hash in the Settings page under "Billing"'
      },
      hotelReference: `Hotel ID: ${req.hotel._id} | Email: ${req.hotel.email}`
    });
  } catch (error) {
    console.error('Get payment instructions error:', error);
    res.status(500).json({ error: 'Server error fetching payment instructions' });
  }
});

export default router;
