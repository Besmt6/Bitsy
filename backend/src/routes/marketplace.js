import express from 'express';
import BookingStat from '../models/BookingStat.js';
import MarketplaceListing from '../models/MarketplaceListing.js';
import Guest from '../models/Guest.js';
import Hotel from '../models/Hotel.js';
import { getWeb3Service } from '../services/web3Service.js';

const router = express.Router();

// @route   POST /api/marketplace/list
// @desc    List a crypto booking for transfer
// @access  Guest (email + phone verified)
router.post('/list', async (req, res) => {
  try {
    const { bookingRef, guestEmail, guestPhone, listingPriceUsd, sellerWalletAddress } = req.body;

    // Validate required fields
    if (!bookingRef || !guestEmail || !guestPhone || !listingPriceUsd || !sellerWalletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find booking
    const booking = await BookingStat.findOne({ bookingRef });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify guest owns the booking
    const guest = await Guest.findById(booking.guestId);
    if (!guest || guest.email.toLowerCase() !== guestEmail.toLowerCase() || guest.phone !== guestPhone) {
      return res.status(403).json({ error: 'Guest verification failed' });
    }

    // Check eligibility for listing
    if (booking.paymentMethod !== 'crypto') {
      return res.status(400).json({ error: 'Only crypto-paid bookings can be listed on marketplace' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot list a cancelled booking' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot list a completed booking' });
    }

    if (booking.listedForTransfer) {
      return res.status(400).json({ error: 'Booking is already listed' });
    }

    // Check if check-in date has passed
    const checkInDate = new Date(booking.checkIn);
    if (checkInDate <= new Date()) {
      return res.status(400).json({ error: 'Cannot list past bookings' });
    }

    // Validate listing price
    if (listingPriceUsd <= 0 || listingPriceUsd > booking.totalUsd) {
      return res.status(400).json({ error: 'Invalid listing price' });
    }

    // Get hotel details
    const hotel = await Hotel.findById(booking.hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Create marketplace listing
    const listing = new MarketplaceListing({
      bookingRef: booking.bookingRef,
      bookingId: booking._id,
      hotelId: booking.hotelId,
      sellerGuestId: guest._id,
      sellerWalletAddress: sellerWalletAddress.toLowerCase(),
      hotelName: hotel.hotelName,
      roomType: booking.roomType,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      originalPriceUsd: booking.totalUsd,
      listingPriceUsd: listingPriceUsd,
      originalPaymentTxHash: booking.web3Data?.txHash || '',
      originalPaymentChain: booking.cryptoType,
      expiresAt: checkInDate, // Listing expires at check-in
      status: 'active'
    });

    await listing.save();

    // Lock the booking (mark as listed)
    booking.listedForTransfer = true;
    booking.status = 'listed_for_transfer';
    booking.originalGuestId = guest._id; // Track original owner
    await booking.save();

    res.json({
      success: true,
      listing: {
        id: listing._id,
        bookingRef: listing.bookingRef,
        listingPriceUsd: listing.listingPriceUsd,
        savingsPercent: listing.savingsPercent,
        status: listing.status,
        message: 'Booking listed successfully. It is now locked and cannot be cancelled.'
      }
    });
  } catch (error) {
    console.error('List booking error:', error);
    res.status(500).json({ error: 'Server error listing booking' });
  }
});

// @route   GET /api/marketplace/listings
// @desc    Browse marketplace listings (public)
// @access  Public
router.get('/listings', async (req, res) => {
  try {
    const { status = 'active', minPrice, maxPrice, hotelId, sortBy = 'savings' } = req.query;

    // Build query
    const query = { status };
    
    if (minPrice || maxPrice) {
      query.listingPriceUsd = {};
      if (minPrice) query.listingPriceUsd.$gte = parseFloat(minPrice);
      if (maxPrice) query.listingPriceUsd.$lte = parseFloat(maxPrice);
    }

    if (hotelId) {
      query.hotelId = hotelId;
    }

    // Filter out expired listings
    query.expiresAt = { $gt: new Date() };

    // Sort options
    let sort = {};
    if (sortBy === 'savings') {
      sort.savingsPercent = -1; // Highest savings first
    } else if (sortBy === 'price_low') {
      sort.listingPriceUsd = 1;
    } else if (sortBy === 'price_high') {
      sort.listingPriceUsd = -1;
    } else if (sortBy === 'newest') {
      sort.listedAt = -1;
    }

    const listings = await MarketplaceListing.find(query)
      .sort(sort)
      .limit(50)
      .populate('hotelId', 'hotelName logoUrl photos contactPhone contactEmail')
      .lean();

    res.json({
      success: true,
      count: listings.length,
      listings
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Server error fetching listings' });
  }
});

// @route   GET /api/marketplace/listings/:listingId
// @desc    Get single listing details
// @access  Public
router.get('/listings/:listingId', async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.listingId)
      .populate('hotelId', 'hotelName logoUrl photos videoUrl contactPhone contactEmail')
      .populate('bookingId')
      .lean();

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ error: 'Listing is no longer available' });
    }

    res.json({
      success: true,
      listing
    });
  } catch (error) {
    console.error('Get listing details error:', error);
    res.status(500).json({ error: 'Server error fetching listing details' });
  }
});

// @route   POST /api/marketplace/submit-proof
// @desc    Submit payment proof to transfer booking
// @access  Public (buyer provides new guest details)
router.post('/submit-proof', async (req, res) => {
  try {
    const { 
      listingId, 
      buyerTxHash, 
      buyerChain,
      newGuestName, 
      newGuestEmail, 
      newGuestPhone 
    } = req.body;

    // Validate required fields
    if (!listingId || !buyerTxHash || !buyerChain || !newGuestName || !newGuestEmail || !newGuestPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find listing
    const listing = await MarketplaceListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ error: 'Listing is no longer available' });
    }

    // Verify payment on-chain using web3Service
    const web3Service = getWeb3Service();
    let verificationResult;

    try {
      verificationResult = await web3Service.verifyTransaction({
        txHash: buyerTxHash,
        chain: buyerChain,
        expectedRecipient: listing.sellerWalletAddress,
        expectedAmountUsd: listing.listingPriceUsd
      });

      if (!verificationResult.isValid) {
        return res.status(400).json({ 
          error: 'Payment verification failed', 
          details: verificationResult.reason 
        });
      }
    } catch (error) {
      console.error('Web3 verification error:', error);
      return res.status(400).json({ 
        error: 'Unable to verify payment on-chain',
        details: error.message 
      });
    }

    // Find or create new guest
    const booking = await BookingStat.findById(listing.bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    let newGuest = await Guest.findOne({ 
      hotelId: booking.hotelId, 
      email: newGuestEmail.toLowerCase() 
    });

    if (newGuest) {
      // Update existing guest
      newGuest.name = newGuestName;
      newGuest.phone = newGuestPhone;
      newGuest.totalBookings += 1;
      newGuest.totalSpent += listing.listingPriceUsd;
      newGuest.lastBookingDate = new Date();
      await newGuest.save();
    } else {
      // Create new guest
      newGuest = new Guest({
        hotelId: booking.hotelId,
        name: newGuestName,
        email: newGuestEmail.toLowerCase(),
        phone: newGuestPhone,
        totalBookings: 1,
        totalSpent: listing.listingPriceUsd,
        lastBookingDate: new Date()
      });
      await newGuest.save();
    }

    // Transfer booking to new guest
    booking.guestId = newGuest._id;
    booking.status = 'confirmed';
    booking.listedForTransfer = false;
    booking.transferredAt = new Date();
    await booking.save();

    // Update listing status
    listing.status = 'completed';
    listing.buyerGuestId = newGuest._id;
    listing.transferPaymentTxHash = buyerTxHash;
    listing.transferPaymentChain = buyerChain;
    listing.transferVerifiedAt = new Date();
    listing.completedAt = new Date();
    await listing.save();

    // Get hotel for notification
    const hotel = await Hotel.findById(booking.hotelId);

    // TODO: Send notifications to all parties
    console.log('✅ Booking transferred successfully');
    console.log(`   Original guest: ${listing.sellerWalletAddress}`);
    console.log(`   New guest: ${newGuestEmail}`);
    console.log(`   Hotel: ${hotel.hotelName}`);

    res.json({
      success: true,
      message: 'Booking transferred successfully',
      bookingRef: booking.bookingRef,
      newGuestName: newGuestName
    });
  } catch (error) {
    console.error('Submit proof error:', error);
    res.status(500).json({ error: 'Server error processing transfer' });
  }
});

// @route   POST /api/marketplace/unlist
// @desc    Remove listing (seller cancels listing)
// @access  Guest (verified)
router.post('/unlist', async (req, res) => {
  try {
    const { listingId, guestEmail, guestPhone } = req.body;

    if (!listingId || !guestEmail || !guestPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const listing = await MarketplaceListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Verify guest owns the listing
    const guest = await Guest.findById(listing.sellerGuestId);
    if (!guest || guest.email.toLowerCase() !== guestEmail.toLowerCase() || guest.phone !== guestPhone) {
      return res.status(403).json({ error: 'Guest verification failed' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ error: 'Listing cannot be unlisted' });
    }

    // Unlock booking
    const booking = await BookingStat.findById(listing.bookingId);
    if (booking) {
      booking.listedForTransfer = false;
      booking.status = 'confirmed'; // Return to confirmed status
      await booking.save();
    }

    // Cancel listing
    listing.status = 'cancelled';
    listing.cancelledAt = new Date();
    await listing.save();

    res.json({
      success: true,
      message: 'Listing removed successfully. Booking is now available for cancellation.'
    });
  } catch (error) {
    console.error('Unlist booking error:', error);
    res.status(500).json({ error: 'Server error unlisting booking' });
  }
});

export default router;
