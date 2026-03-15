import Hotel from '../models/Hotel.js';

/**
 * Middleware to check if a hotel can accept new bookings
 * Blocks if billing status is 'blocked'
 * Attaches warning if in 'grace' period
 */
export const checkBillingStatus = async (req, res, next) => {
  try {
    // This middleware expects hotelId to be in req.params or req.body
    const hotelId = req.params.hotelId || req.body.hotelId;
    
    if (!hotelId) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }

    const hotel = await Hotel.findById(hotelId);
    
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Check billing status
    if (hotel.billing.billingStatus === 'blocked') {
      const graceDaysAgo = Math.floor((new Date() - hotel.billing.graceEndsAt) / (24 * 60 * 60 * 1000));
      
      return res.status(403).json({ 
        error: 'Booking unavailable',
        message: `This hotel has exceeded its free trial limit ($${hotel.billing.trialLimitUsd.toLocaleString()}) and the grace period has expired. New bookings are temporarily disabled.`,
        billingStatus: 'blocked',
        contactSupport: true
      });
    }

    // Attach hotel to request for downstream use
    req.hotelForBooking = hotel;

    // If in grace period, attach warning (but allow booking)
    if (hotel.billing.billingStatus === 'grace') {
      const daysRemaining = Math.ceil((hotel.billing.graceEndsAt - new Date()) / (24 * 60 * 60 * 1000));
      req.billingWarning = {
        message: `This hotel is in a grace period. Bookings will be disabled in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} unless payment is received.`,
        graceDaysRemaining: daysRemaining
      };
    }

    next();
  } catch (error) {
    console.error('Billing status check error:', error);
    return res.status(500).json({ error: 'Error checking billing status' });
  }
};
