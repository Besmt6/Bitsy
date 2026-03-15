import express from 'express';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import BookingStat from '../models/BookingStat.js';
import Guest from '../models/Guest.js';
import { getChatResponse } from '../services/llmService.js';
import { generateQRCode } from '../services/qrService.js';
import { sendNotification } from '../services/notificationService.js';
import { getWeb3Service, getSupportedChains } from '../services/web3Service.js';
import { updateBillingStatus } from '../services/billingService.js';

const router = express.Router();

// @route   GET /api/widget/:hotelId/config
// @desc    Get hotel configuration for widget
// @access  Public
router.get('/:hotelId/config', async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel || !hotel.isActive) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const rooms = await Room.find({ hotelId, isActive: true });

    res.json({
      success: true,
      config: {
        hotelId: hotel._id,
        hotelName: hotel.hotelName,
        logoUrl: hotel.logoUrl,
        photos: hotel.photos || [],
        videoUrl: hotel.videoUrl,
        contactPhone: hotel.contactPhone,
        contactEmail: hotel.contactEmail,
        rooms: rooms.map(room => ({
          id: room._id,
          type: room.roomType,
          description: room.description,
          rate: room.rate,
          available: room.availableCount,
          photos: room.photos || [],
          amenities: room.amenities || []
        })),
        wallets: hotel.wallets,
        paymentSettings: hotel.paymentSettings || { cryptoEnabled: true, payAtPropertyEnabled: false },
        widgetSettings: hotel.widgetSettings
      }
    });
  } catch (error) {
    console.error('Get widget config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/widget/:hotelId/chat
// @desc    Handle chat conversation with Bitsy AI
// @access  Public
router.post('/:hotelId/chat', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { message, sessionId, conversationHistory, language = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const rooms = await Room.find({ hotelId, isActive: true });

    // Get AI response
    const response = await getChatResponse({
      message,
      sessionId,
      hotelName: hotel.hotelName,
      rooms,
      conversationHistory: conversationHistory || [],
      language
    });

    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Server error processing chat' });
  }
});

// @route   POST /api/widget/:hotelId/book
// @desc    Submit booking (saves guest data and creates booking record)
// @access  Public
router.post('/:hotelId/book', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { bookingDetails } = req.body;

    if (!bookingDetails) {
      return res.status(400).json({ error: 'Booking details are required' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // 🚨 CHECK BILLING STATUS - Block if hotel is blocked
    if (hotel.billing.billingStatus === 'blocked') {
      const graceDaysAgo = Math.floor((new Date() - hotel.billing.graceEndsAt) / (24 * 60 * 60 * 1000));
      
      return res.status(403).json({ 
        error: 'Bookings temporarily unavailable',
        message: `This property is currently unavailable for new bookings. Please check back later or contact the hotel directly.`,
        billingBlocked: true
      });
    }

    // Validate payment method
    const paymentMethod = bookingDetails.payment_method || 'crypto';
    
    if (paymentMethod === 'pay_at_property' && !hotel.paymentSettings?.payAtPropertyEnabled) {
      return res.status(400).json({ error: 'Pay at property option is not available for this hotel' });
    }

    // Validate required fields (crypto_choice only required for crypto payments)
    const baseRequired = ['check_in', 'check_out', 'room_type', 'nights', 'total_usd', 'guest_name', 'guest_email', 'guest_phone'];
    for (const field of baseRequired) {
      if (!bookingDetails[field]) {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }

    if (paymentMethod === 'crypto' && !bookingDetails.crypto_choice) {
      return res.status(400).json({ error: 'Crypto type is required for crypto payments' });
    }

    // Generate booking reference
    const bookingRef = `BIT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Find or create guest
    let guest = await Guest.findOne({ 
      hotelId, 
      email: bookingDetails.guest_email.toLowerCase() 
    });

    if (guest) {
      // Update existing guest
      guest.name = bookingDetails.guest_name;
      guest.phone = bookingDetails.guest_phone || guest.phone;
      guest.totalBookings += 1;
      guest.totalSpent += bookingDetails.total_usd;
      guest.lastBookingDate = new Date();
      await guest.save();
    } else {
      // Create new guest
      guest = new Guest({
        hotelId,
        name: bookingDetails.guest_name,
        email: bookingDetails.guest_email.toLowerCase(),
        phone: bookingDetails.guest_phone || '',
        totalBookings: 1,
        totalSpent: bookingDetails.total_usd,
        lastBookingDate: new Date()
      });
      await guest.save();
    }

    // Calculate confirmation deadline (48 hours before check-in)
    let confirmationDeadline = null;
    let bookingStatus = 'confirmed'; // Default for crypto

    if (paymentMethod === 'pay_at_property') {
      const checkInDate = new Date(bookingDetails.check_in);
      confirmationDeadline = new Date(checkInDate.getTime() - (48 * 60 * 60 * 1000));
      bookingStatus = 'pending_confirmation';
    }

    // Create booking stat record
    const bookingStat = new BookingStat({
      hotelId,
      guestId: guest._id,
      bookingRef,
      date: new Date(),
      checkIn: bookingDetails.check_in,
      checkOut: bookingDetails.check_out,
      roomType: bookingDetails.room_type,
      nights: bookingDetails.nights,
      totalUsd: bookingDetails.total_usd,
      paymentMethod: paymentMethod,
      cryptoType: bookingDetails.crypto_choice || null,
      status: bookingStatus,
      confirmationDeadlineAt: confirmationDeadline,
      confirmedAt: paymentMethod === 'crypto' ? new Date() : null,
      confirmedBy: paymentMethod === 'crypto' ? 'auto' : null
    });

    await bookingStat.save();

    // 🧮 Update billing status for crypto bookings (auto-confirmed)
    if (paymentMethod === 'crypto') {
      try {
        await updateBillingStatus(hotel);
      } catch (billingError) {
        console.error('Error updating billing after crypto booking:', billingError);
        // Don't fail the booking
      }
    }

    // Prepare response based on payment method
    let response = {
      success: true,
      bookingRef,
      isReturningGuest: guest.totalBookings > 1,
      totalBookings: guest.totalBookings,
      paymentMethod: paymentMethod
    };

    if (paymentMethod === 'crypto') {
      // Get wallet address for selected crypto
      const walletAddress = hotel.wallets[bookingDetails.crypto_choice];

      // Generate QR code
      const qrCode = await generateQRCode({
        address: walletAddress,
        chain: bookingDetails.crypto_choice,
        amount: bookingDetails.total_usd
      });

      response.qrCode = qrCode;
      response.walletAddress = walletAddress;
      response.cryptoType = bookingDetails.crypto_choice;
      response.message = 'Booking confirmed! Complete payment to secure your reservation.';
    } else {
      // Pay at property
      response.confirmationDeadline = confirmationDeadline.toISOString();
      response.hotelPhone = hotel.contactPhone;
      response.message = `Booking submitted! Please call ${hotel.contactPhone} to confirm. Booking will auto-cancel if not confirmed by ${confirmationDeadline.toLocaleString()}.`;
    }

    // Send notification (console + Telegram if configured)
    await sendNotification({
      hotel,
      bookingRef,
      bookingDetails: { ...bookingDetails, payment_method: paymentMethod },
      walletAddress: paymentMethod === 'crypto' ? hotel.wallets[bookingDetails.crypto_choice] : null,
      isReturningGuest: guest.totalBookings > 1
    });

    // Add grace period warning if applicable
    if (hotel.billing.billingStatus === 'grace') {
      const daysRemaining = Math.ceil((hotel.billing.graceEndsAt - new Date()) / (24 * 60 * 60 * 1000));
      response.billingWarning = {
        message: `Note: This hotel is in a grace period. Service may be interrupted in ${daysRemaining} days.`,
        graceDaysRemaining: daysRemaining
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Server error processing booking' });
  }
});

// @route   POST /api/widget/:hotelId/check-guest
// @desc    Check if guest exists (for returning guest functionality)
// @access  Public
router.post('/:hotelId/check-guest', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const guest = await Guest.findOne({ 
      hotelId, 
      email: email.toLowerCase() 
    });

    if (guest) {
      res.json({
        success: true,
        isReturningGuest: true,
        guest: {
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          totalBookings: guest.totalBookings
        }
      });
    } else {
      res.json({
        success: true,
        isReturningGuest: false
      });
    }
  } catch (error) {
    console.error('Check guest error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/widget/:hotelId/web3-chains
// @desc    Get supported Web3 chains and payment methods
// @access  Public
router.get('/:hotelId/web3-chains', async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const chains = getSupportedChains();
    
    // Filter chains where hotel has configured wallet
    const availableChains = chains.map(chain => {
      const walletAddress = hotel.wallets[chain.key];
      const service = getWeb3Service(chain.key);
      const paymentMethods = service.getPaymentMethods();
      
      return {
        ...chain,
        enabled: !!walletAddress,
        walletAddress: walletAddress || null,
        paymentMethods
      };
    }).filter(chain => chain.enabled);

    res.json({
      success: true,
      chains: availableChains,
      totalChains: availableChains.length
    });
  } catch (error) {
    console.error('Get Web3 chains error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/widget/:hotelId/verify-web3-payment
// @desc    Verify Web3 transaction on blockchain
// @access  Public
router.post('/:hotelId/verify-web3-payment', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { txHash, chain, paymentType, bookingDetails } = req.body;

    console.log(`🔍 Web3 Payment Verification Request:`, {
      hotelId,
      chain,
      paymentType,
      txHash
    });

    // Validate inputs
    if (!txHash || !chain || !paymentType || !bookingDetails) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Get hotel's wallet address for this chain
    const recipientAddress = hotel.wallets[chain];
    
    if (!recipientAddress) {
      return res.status(400).json({ 
        error: `Hotel has not configured ${chain} wallet address` 
      });
    }

    // Get Web3 service for the chain
    const web3Service = getWeb3Service(chain);

    // Verify transaction based on payment type
    let verification;

    if (paymentType === 'native') {
      // Native currency (ETH, MATIC, BNB, etc.)
      verification = await web3Service.verifyNativeTransaction(
        txHash,
        bookingDetails.total_usd,
        recipientAddress
      );
    } else {
      // Token payment (USDC, USDT, DAI, etc.)
      verification = await web3Service.verifyTokenTransaction(
        txHash,
        paymentType,
        bookingDetails.total_usd,
        recipientAddress
      );
    }

    if (!verification.verified) {
      console.error('❌ Payment verification failed:', verification.error);
      return res.status(400).json({ 
        success: false, 
        error: verification.error 
      });
    }

    console.log('✅ Payment verified on blockchain!');

    // Payment verified! Create booking
    const bookingRef = `BIT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Find or create guest
    let guest = await Guest.findOne({ 
      hotelId, 
      email: bookingDetails.guest_email.toLowerCase() 
    });

    if (guest) {
      guest.name = bookingDetails.guest_name;
      guest.phone = bookingDetails.guest_phone || guest.phone;
      guest.totalBookings += 1;
      guest.totalSpent += bookingDetails.total_usd;
      guest.lastBookingDate = new Date();
      await guest.save();
    } else {
      guest = new Guest({
        hotelId,
        name: bookingDetails.guest_name,
        email: bookingDetails.guest_email.toLowerCase(),
        phone: bookingDetails.guest_phone || '',
        totalBookings: 1,
        totalSpent: bookingDetails.total_usd
      });
      await guest.save();
    }

    // Create booking with Web3 verification data
    const bookingStat = new BookingStat({
      hotelId,
      guestId: guest._id,
      bookingRef,
      date: new Date(),
      checkIn: bookingDetails.check_in,
      checkOut: bookingDetails.check_out,
      roomType: bookingDetails.room_type,
      nights: bookingDetails.nights,
      totalUsd: bookingDetails.total_usd,
      cryptoType: chain,
      paymentMethod: 'web3',
      web3Data: {
        txHash: verification.txHash,
        chain,
        paymentType,
        blockNumber: verification.blockNumber,
        explorerUrl: verification.explorerUrl,
        from: verification.from,
        verifiedAt: new Date()
      }
    });

    await bookingStat.save();

    // Send notification with Web3 details
    await sendNotification({
      hotel,
      bookingRef,
      bookingDetails: {
        ...bookingDetails,
        txHash: verification.txHash,
        explorerUrl: verification.explorerUrl,
        paymentAmount: `${verification.amount} ${verification.currency}`,
        chain: chain.toUpperCase()
      },
      walletAddress: recipientAddress,
      isReturningGuest: guest.totalBookings > 1,
      web3Verified: true
    });

    console.log(`🎉 Booking created: ${bookingRef}`);

    res.json({
      success: true,
      bookingRef,
      verification: {
        txHash: verification.txHash,
        explorerUrl: verification.explorerUrl,
        amount: verification.amount,
        currency: verification.currency,
        blockNumber: verification.blockNumber
      },
      message: 'Payment verified on blockchain! Booking confirmed.'
    });
  } catch (error) {
    console.error('❌ Web3 verification error:', error);
    res.status(500).json({ 
      error: 'Payment verification failed', 
      details: error.message 
    });
  }
});

export default router;
