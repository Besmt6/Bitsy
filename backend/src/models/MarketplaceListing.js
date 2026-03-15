import mongoose from 'mongoose';

const marketplaceListingSchema = new mongoose.Schema({
  bookingRef: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookingStat',
    required: true,
    index: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
    index: true
  },
  sellerGuestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true,
    index: true
  },
  // Seller's receiving wallet address
  sellerWalletAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  // Original booking details (cached for browse UX)
  hotelName: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    required: true
  },
  checkIn: {
    type: String,
    required: true
  },
  checkOut: {
    type: String,
    required: true
  },
  nights: {
    type: Number,
    required: true
  },
  // Pricing
  originalPriceUsd: {
    type: Number,
    required: true
  },
  listingPriceUsd: {
    type: Number,
    required: true
  },
  savingsPercent: {
    type: Number // Calculated: ((original - listing) / original) * 100
  },
  // Original payment proof
  originalPaymentTxHash: {
    type: String,
    required: true
  },
  originalPaymentChain: {
    type: String,
    required: true,
    enum: ['bitcoin', 'ethereum', 'polygon', 'solana', 'tron', 'base', 'arbitrum', 'optimism', 'bsc']
  },
  // Transfer details
  buyerGuestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest'
  },
  transferPaymentTxHash: {
    type: String
  },
  transferPaymentChain: {
    type: String
  },
  transferVerifiedAt: {
    type: Date
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'pending_transfer', 'completed', 'cancelled', 'expired'],
    default: 'active',
    index: true
  },
  // Metadata
  listedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date, // Auto-expire listing if check-in date passes
    index: true
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  }
});

// Compound indexes for marketplace queries
marketplaceListingSchema.index({ status: 1, expiresAt: 1 }); // Active listings
marketplaceListingSchema.index({ hotelId: 1, status: 1 }); // Filter by hotel
marketplaceListingSchema.index({ listingPriceUsd: 1, status: 1 }); // Sort by price

// Calculate savings percentage before saving
marketplaceListingSchema.pre('save', function(next) {
  if (this.originalPriceUsd && this.listingPriceUsd) {
    this.savingsPercent = Math.round(((this.originalPriceUsd - this.listingPriceUsd) / this.originalPriceUsd) * 100);
  }
  next();
});

export default mongoose.model('MarketplaceListing', marketplaceListingSchema);
