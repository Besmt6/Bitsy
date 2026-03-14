import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  totalBookings: {
    type: Number,
    default: 1
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  lastBookingDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for quick lookup of returning guests
guestSchema.index({ hotelId: 1, email: 1 }, { unique: true });

export default mongoose.model('Guest', guestSchema);
