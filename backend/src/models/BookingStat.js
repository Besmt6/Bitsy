import mongoose from 'mongoose';

const bookingStatSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
    index: true
  },
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true,
    index: true
  },
  bookingRef: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  checkIn: {
    type: String,
    required: true
  },
  checkOut: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    required: true
  },
  nights: {
    type: Number,
    required: true
  },
  totalUsd: {
    type: Number,
    required: true
  },
  cryptoType: {
    type: String,
    required: false, // Optional now - only for crypto payments
    enum: ['bitcoin', 'ethereum', 'polygon', 'solana', 'tron', 'base', 'arbitrum', 'optimism', 'bsc']
  },
  paymentMethod: {
    type: String,
    enum: ['crypto', 'pay_at_property'], // Simplified: crypto or pay at property
    required: true,
    default: 'crypto'
  },
  status: {
    type: String,
    enum: ['pending_confirmation', 'confirmed', 'cancelled', 'listed_for_transfer', 'completed'],
    default: 'pending_confirmation',
    index: true
  },
  confirmationDeadlineAt: {
    type: Date,
    index: true // For auto-cancel job queries
  },
  confirmedAt: {
    type: Date
  },
  confirmedBy: {
    type: String, // 'hotel', 'auto' (for crypto), 'guest'
    enum: ['hotel', 'auto', 'guest']
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: String, // 'guest', 'hotel', 'system'
    enum: ['guest', 'hotel', 'system']
  },
  cancellationReason: {
    type: String
  },
  listedForTransfer: {
    type: Boolean,
    default: false,
    index: true
  },
  originalGuestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest' // Track original guest if booking is transferred
  },
  transferredAt: {
    type: Date
  },
  web3Data: {
    txHash: String,
    chain: String,
    paymentType: String, // 'native', 'USDC', 'USDT', etc.
    blockNumber: Number,
    explorerUrl: String,
    from: String,
    verifiedAt: Date
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient querying
bookingStatSchema.index({ hotelId: 1, date: -1 });
bookingStatSchema.index({ hotelId: 1, status: 1, confirmationDeadlineAt: 1 }); // For auto-cancel queries
bookingStatSchema.index({ guestId: 1, status: 1 }); // For guest dashboard

export default mongoose.model('BookingStat', bookingStatSchema);
