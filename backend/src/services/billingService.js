import BookingStat from '../models/BookingStat.js';
import Hotel from '../models/Hotel.js';

/**
 * Calculate total confirmed booking revenue for a hotel
 * Counts:
 * - All crypto bookings (auto-confirmed)
 * - Pay-at-property bookings that have been confirmed by hotel
 */
export const calculateTrialRevenue = async (hotelId) => {
  try {
    const result = await BookingStat.aggregate([
      {
        $match: {
          hotelId: hotelId,
          status: 'confirmed' // Only count confirmed bookings
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalUsd' }
        }
      }
    ]);

    return result.length > 0 ? result[0].totalRevenue : 0;
  } catch (error) {
    console.error('Error calculating trial revenue:', error);
    throw error;
  }
};

/**
 * Update hotel billing status based on current revenue
 * State machine:
 * - trial: under $5k
 * - grace: >= $5k, within 7 days
 * - blocked: >= $5k, grace period expired
 * - active: payment received (future)
 */
export const updateBillingStatus = async (hotel) => {
  try {
    // Calculate current trial revenue
    const trialRevenue = await calculateTrialRevenue(hotel._id);
    
    // Update cached value
    hotel.billing.trialUsedUsd = trialRevenue;
    
    const now = new Date();
    const GRACE_PERIOD_DAYS = 7;

    // State transitions
    if (trialRevenue < hotel.billing.trialLimitUsd) {
      // Still in trial
      hotel.billing.billingStatus = 'trial';
      hotel.billing.trialExceededAt = null;
      hotel.billing.graceEndsAt = null;
    } else {
      // Trial limit exceeded
      if (!hotel.billing.trialExceededAt) {
        // First time exceeding - start grace period
        hotel.billing.trialExceededAt = now;
        hotel.billing.graceEndsAt = new Date(now.getTime() + (GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000));
        hotel.billing.billingStatus = 'grace';
        
        console.log(`⚠️ Hotel ${hotel.hotelName} exceeded trial limit. Grace period until: ${hotel.billing.graceEndsAt}`);
      } else if (hotel.billing.billingStatus !== 'active') {
        // Already exceeded - check if grace period expired
        if (now > hotel.billing.graceEndsAt) {
          hotel.billing.billingStatus = 'blocked';
          console.log(`🚫 Hotel ${hotel.hotelName} grace period expired. Blocking new bookings.`);
        } else {
          hotel.billing.billingStatus = 'grace';
        }
      }
    }

    await hotel.save();
    
    return {
      trialUsedUsd: hotel.billing.trialUsedUsd,
      trialLimitUsd: hotel.billing.trialLimitUsd,
      billingStatus: hotel.billing.billingStatus,
      trialExceededAt: hotel.billing.trialExceededAt,
      graceEndsAt: hotel.billing.graceEndsAt,
      graceDaysRemaining: hotel.billing.graceEndsAt 
        ? Math.ceil((hotel.billing.graceEndsAt - now) / (24 * 60 * 60 * 1000))
        : null
    };
  } catch (error) {
    console.error('Error updating billing status:', error);
    throw error;
  }
};

/**
 * Check if a hotel can accept new bookings
 * Returns: { allowed: boolean, reason: string }
 */
export const canAcceptBookings = async (hotelId) => {
  try {
    const hotel = await Hotel.findById(hotelId);
    
    if (!hotel) {
      return { allowed: false, reason: 'Hotel not found' };
    }

    if (!hotel.isActive) {
      return { allowed: false, reason: 'Hotel account is inactive' };
    }

    if (hotel.billing.billingStatus === 'blocked') {
      const graceDaysAgo = Math.floor((new Date() - hotel.billing.graceEndsAt) / (24 * 60 * 60 * 1000));
      return { 
        allowed: false, 
        reason: `Your free trial ($5,000 booking limit) has ended and the 7-day grace period expired ${graceDaysAgo} days ago. Please contact support to reactivate your account.`,
        billingStatus: 'blocked',
        trialUsedUsd: hotel.billing.trialUsedUsd
      };
    }

    // In grace period - allow but warn
    if (hotel.billing.billingStatus === 'grace') {
      const daysRemaining = Math.ceil((hotel.billing.graceEndsAt - new Date()) / (24 * 60 * 60 * 1000));
      return {
        allowed: true,
        reason: null,
        warning: `You've exceeded your $5,000 free trial. You have ${daysRemaining} days remaining in your grace period to send commission payment.`,
        billingStatus: 'grace',
        graceDaysRemaining: daysRemaining
      };
    }

    return { allowed: true, reason: null };
  } catch (error) {
    console.error('Error checking booking eligibility:', error);
    return { allowed: false, reason: 'Error checking billing status' };
  }
};

/**
 * Get billing dashboard data for a hotel
 */
export const getBillingDashboard = async (hotelId) => {
  try {
    const hotel = await Hotel.findById(hotelId);
    
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Refresh billing status
    const billingInfo = await updateBillingStatus(hotel);
    
    // Calculate metrics
    const percentUsed = (billingInfo.trialUsedUsd / billingInfo.trialLimitUsd) * 100;
    const remaining = billingInfo.trialLimitUsd - billingInfo.trialUsedUsd;

    return {
      tier: hotel.tier,
      billingStatus: billingInfo.billingStatus,
      trial: {
        limitUsd: billingInfo.trialLimitUsd,
        usedUsd: billingInfo.trialUsedUsd,
        remainingUsd: remaining > 0 ? remaining : 0,
        percentUsed: Math.min(percentUsed, 100).toFixed(1)
      },
      grace: {
        isActive: billingInfo.billingStatus === 'grace',
        endsAt: billingInfo.graceEndsAt,
        daysRemaining: billingInfo.graceDaysRemaining
      },
      commissionRate: hotel.billing.commissionRateBps / 100, // Convert to percentage
      isBlocked: billingInfo.billingStatus === 'blocked'
    };
  } catch (error) {
    console.error('Error getting billing dashboard:', error);
    throw error;
  }
};
