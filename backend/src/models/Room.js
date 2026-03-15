import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
    index: true
  },
  roomType: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  photos: [{
    url: String,
    caption: String
  }],
  amenities: [String],
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  availableCount: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Room', roomSchema);
