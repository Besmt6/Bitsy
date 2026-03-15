import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Admin from '../models/Admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'bitsy_saas';

async function createAdmin() {
  try {
    await mongoose.connect(`${MONGO_URL}/${DB_NAME}`);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'hello@getbitsy.ai' });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists:', existingAdmin.email);
      console.log('Password: bitsy-admin-2026');
      process.exit(0);
    }

    // Create admin
    const admin = new Admin({
      email: 'hello@getbitsy.ai',
      password: 'bitsy-admin-2026',
      name: 'Bitsy Admin',
      role: 'super_admin'
    });

    await admin.save();

    console.log('✅ Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email: hello@getbitsy.ai');
    console.log('Password: bitsy-admin-2026');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  CHANGE PASSWORD IMMEDIATELY IN PRODUCTION');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
