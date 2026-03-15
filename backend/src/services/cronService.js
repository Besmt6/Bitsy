/**
 * Cron Service - Background Jobs
 * 
 * Handles scheduled tasks:
 * - Auto-cancel unconfirmed pay-at-property bookings (every hour)
 * - Expire old marketplace listings (daily)
 */

import cron from 'node-cron';
import autoCancelBookings from '../../scripts/auto-cancel-bookings.js';
import MarketplaceListing from '../models/MarketplaceListing.js';

export function initializeCronJobs() {
  console.log('⏰ Initializing cron jobs...');

  // Auto-cancel bookings every hour at :00
  cron.schedule('0 * * * *', async () => {
    console.log('\n🔄 Running auto-cancel job...');
    try {
      const result = await autoCancelBookings();
      console.log(`✅ Auto-cancel complete: ${result.cancelled} cancelled, ${result.failed || 0} failed\n`);
    } catch (error) {
      console.error('❌ Auto-cancel job failed:', error);
    }
  }, {
    timezone: 'UTC'
  });

  // Expire old marketplace listings daily at 2 AM UTC
  cron.schedule('0 2 * * *', async () => {
    console.log('\n🔄 Running marketplace cleanup job...');
    try {
      const now = new Date();
      const result = await MarketplaceListing.updateMany(
        { 
          status: 'active',
          expiresAt: { $lte: now }
        },
        {
          $set: {
            status: 'expired',
            cancelledAt: now
          }
        }
      );
      console.log(`✅ Expired ${result.modifiedCount} old listings\n`);
    } catch (error) {
      console.error('❌ Marketplace cleanup failed:', error);
    }
  }, {
    timezone: 'UTC'
  });

  console.log('✅ Cron jobs initialized');
  console.log('   - Auto-cancel: Every hour at :00');
  console.log('   - Marketplace cleanup: Daily at 2 AM UTC\n');
}
