import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const hotelSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  hotelName: {
    type: String,
    required: true,
    trim: true
  },
  publicSlug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  logoUrl: {
    type: String,
    default: ''
  },
  photos: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  videoUrl: {
    type: String,
    default: ''
  },
  contactPhone: {
    type: String,
    default: ''
  },
  contactEmail: {
    type: String,
    default: ''
  },
  notificationEmail: {
    type: String,
    default: ''
  },
  telegramBotToken: {
    type: String,
    default: ''
  },
  telegramChatId: {
    type: String,
    default: ''
  },
  wallets: {
    bitcoin: { type: String, default: '' },
    ethereum: { type: String, default: '' },
    polygon: { type: String, default: '' },
    solana: { type: String, default: '' },
    tron: { type: String, default: '' },
    base: { type: String, default: '' },
    arbitrum: { type: String, default: '' },
    optimism: { type: String, default: '' },
    bsc: { type: String, default: '' }
  },
  paymentSettings: {
    cryptoEnabled: { type: Boolean, default: true }, // Always true (core feature)
    payAtPropertyEnabled: { type: Boolean, default: false } // Optional feature
  },
  widgetSettings: {
    theme: { type: String, default: 'light' },
    primaryColor: { type: String, default: '#0e7490' },
    position: { type: String, default: 'bottom-right' },
    greetingMessage: { type: String, default: "Hi! I'm Bitsy. Looking to book a room?" }
  },
  // Billing & Plan
  tier: {
    type: String,
    enum: ['starter', 'growth', 'enterprise'],
    default: 'starter'
  },
  billing: {
    trialLimitUsd: { type: Number, default: 5000 },
    trialUsedUsd: { type: Number, default: 0 }, // Cached/computed value
    trialExceededAt: { type: Date, default: null },
    graceEndsAt: { type: Date, default: null },
    billingStatus: {
      type: String,
      enum: ['trial', 'grace', 'blocked', 'active'],
      default: 'trial'
    },
    commissionRateBps: { type: Number, default: 200 }, // 2% = 200 basis points
    lastPaymentReceivedAt: { type: Date, default: null }
  },
  // Location Verification (Anti-spam)
  locationVerification: {
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified'
    },
    verificationNotes: { type: String, default: '' }
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

// Generate public slug from hotel name
hotelSchema.pre('save', async function(next) {
  // Generate slug if not exists or hotel name changed
  if (!this.publicSlug || this.isModified('hotelName')) {
    let baseSlug = this.hotelName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Handle collisions
    let slug = baseSlug;
    let counter = 1;
    while (await mongoose.model('Hotel').findOne({ publicSlug: slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.publicSlug = slug;
  }
  
  next();
});

// Hash password before saving
hotelSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
hotelSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Serialize helper to remove sensitive data
hotelSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('Hotel', hotelSchema);
