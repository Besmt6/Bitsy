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
  logoUrl: {
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
    tron: { type: String, default: '' }
  },
  widgetSettings: {
    theme: { type: String, default: 'light' },
    primaryColor: { type: String, default: '#0e7490' },
    position: { type: String, default: 'bottom-right' },
    greetingMessage: { type: String, default: "Hi! I'm Bitsy. Looking to book a room?" }
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
