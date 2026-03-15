/**
 * Auto-cancel bookings script
 * 
 * This script auto-cancels pay-at-property bookings that are unconfirmed
 * and reach their confirmation deadline (48 hours before check-in).
 * 
 * Run manually: node scripts/auto-cancel-bookings.js
 * Run via cron: Schedule this to run every hour
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import BookingStat from '../src/models/BookingStat.js';
import Guest from '../src/models/Guest.js';
import Hotel from '../src/models/Hotel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'bitsy_saas';

async function autoCancelBookings() {
  try {
    console.log('🔍 Checking for bookings to auto-cancel...');
    console.log(`   Current time: ${new Date().toISOString()}`);

    const now = new Date();

    // Find pay-at-property bookings that:
    // 1. Status is 'pending_confirmation'
    // 2. confirmationDeadlineAt has passed
    const bookingsToCancel = await BookingStat.find({
      paymentMethod: 'pay_at_property',
      status: 'pending_confirmation',
      confirmationDeadlineAt: { $lte: now }
    }).populate('guestId').populate('hotelId');

    if (bookingsToCancel.length === 0) {
      console.log('✅ No bookings to auto-cancel');
      return { cancelled: 0 };
    }

    console.log(`📋 Found ${bookingsToCancel.length} booking(s) to cancel`);

    const cancelResults = [];

    for (const booking of bookingsToCancel) {
      try {
        // Update booking status
        booking.status = 'cancelled';
        booking.cancelledAt = now;
        booking.cancelledBy = 'system';
        booking.cancellationReason = 'Auto-cancelled: Hotel confirmation not received within 48 hours of check-in';
        await booking.save();

        console.log(`   ❌ Cancelled: ${booking.bookingRef}`);
        console.log(`      Guest: ${booking.guestId?.name || 'Unknown'} (${booking.guestId?.email})`);
        console.log(`      Hotel: ${booking.hotelId?.hotelName || 'Unknown'}`);
        console.log(`      Check-in was: ${booking.checkIn}`);
        console.log(`      Deadline was: ${booking.confirmationDeadlineAt?.toISOString()}`);

        // TODO: Send cancellation email to guest
        // TODO: Send notification to hotel

        cancelResults.push({
          bookingRef: booking.bookingRef,
          guestEmail: booking.guestId?.email,
          hotelName: booking.hotelId?.hotelName,
          success: true
        });
      } catch (error) {
        console.error(`   ⚠️  Failed to cancel ${booking.bookingRef}:`, error.message);
        cancelResults.push({
          bookingRef: booking.bookingRef,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = cancelResults.filter(r => r.success).length;
    console.log(`\n✅ Auto-cancel complete: ${successCount}/${bookingsToCancel.length} bookings cancelled`);

    return {
      cancelled: successCount,
      failed: bookingsToCancel.length - successCount,
      results: cancelResults
    };
  } catch (error) {
    console.error('❌ Auto-cancel error:', error);
    throw error;
  }
}

// If running directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting auto-cancel job...\n');
  
  mongoose.connect(`${MONGO_URL}/${DB_NAME}`)
    .then(async () => {
      console.log('✅ Connected to MongoDB\n');
      
      const result = await autoCancelBookings();
      
      console.log('\n📊 Summary:', result);
      
      await mongoose.connection.close();
      console.log('\n✅ MongoDB connection closed');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}

export default autoCancelBookings;
