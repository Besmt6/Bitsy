import mongoose from 'mongoose';

const mcpSearchLogSchema = new mongoose.Schema({
  searchId: {
    type: String,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  searchParams: {
    location: String,
    checkIn: String,
    checkOut: String,
    blockchain: String,
    maxPrice: Number,
    paymentMethod: String
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  hotelIdsReturned: [{
    type: String
  }],
  userAgent: String,
  source: {
    type: String,
    enum: ['chatgpt', 'claude', 'perplexity', 'api', 'unknown'],
    default: 'unknown'
  }
}, {
  timestamps: true
});

// Indexes for efficient analytics queries
mcpSearchLogSchema.index({ 'hotelIdsReturned': 1, 'timestamp': -1 });
mcpSearchLogSchema.index({ 'searchParams.location': 1, 'timestamp': -1 });

const MCPSearchLog = mongoose.model('MCPSearchLog', mcpSearchLogSchema);

export default MCPSearchLog;
