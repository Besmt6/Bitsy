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
    required: true,
    enum: ['bitcoin', 'ethereum', 'polygon', 'solana', 'tron']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create index for efficient querying
bookingStatSchema.index({ hotelId: 1, date: -1 });

export default mongoose.model('BookingStat', bookingStatSchema);
