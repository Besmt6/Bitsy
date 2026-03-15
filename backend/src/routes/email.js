import express from 'express';
import { protect } from '../middleware/auth.js';
import emailService from '../services/emailService.js';
import logger from '../config/logger.js';

const router = express.Router();

// @route   POST /api/email/test
// @desc    Test email delivery (protected - hotel owners only)
// @access  Private
router.post('/test', protect, async (req, res) => {
  try {
    const { emailType, testRecipient } = req.body;

    if (!emailService.isConfigured()) {
      return res.status(503).json({
        error: 'Email service not configured',
        message: 'Please set BREVO_API_KEY and BREVO_SENDER_EMAIL in environment variables'
      });
    }

    const recipient = testRecipient || req.hotel.email;

    // Test data
    const testData = {
      booking: {
        bookingRef: 'TEST-' + Date.now(),
        roomType: 'Deluxe Suite',
        checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        nights: 3,
        totalAmount: 450,
        paymentMethod: 'ethereum',
        hotelName: req.hotel.hotelName
      },
      guest: {
        email: recipient,
        name: 'Test Guest',
        phone: '+1234567890'
      },
      hotel: {
        email: req.hotel.email,
        hotelName: req.hotel.hotelName,
        contactPhone: req.hotel.contactPhone || '+1234567890',
        contactEmail: req.hotel.contactEmail
      },
      billingData: {
        trialRevenue: 6500,
        commissionOwed: 130,
        graceEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        daysRemaining: 5
      }
    };

    let result;

    switch (emailType) {
      case 'booking_confirmation':
        result = await emailService.sendBookingConfirmation(
          testData.booking,
          testData.guest,
          testData.hotel
        );
        break;

      case 'new_booking_alert':
        result = await emailService.sendNewBookingAlert(
          testData.booking,
          testData.guest,
          testData.hotel
        );
        break;

      case 'password_reset':
        result = await emailService.sendPasswordReset(
          recipient,
          req.hotel.hotelName,
          'TEST-TOKEN-123'
        );
        break;

      case 'grace_period':
        result = await emailService.sendGracePeriodAlert(
          testData.hotel,
          testData.billingData
        );
        break;

      case 'account_blocked':
        result = await emailService.sendAccountBlockedAlert(
          testData.hotel,
          testData.billingData
        );
        break;

      default:
        return res.status(400).json({
          error: 'Invalid email type',
          validTypes: [
            'booking_confirmation',
            'new_booking_alert',
            'password_reset',
            'grace_period',
            'account_blocked'
          ]
        });
    }

    logger.info(`📧 Test email sent`, {
      emailType,
      recipient,
      messageId: result.messageId
    });

    res.json({
      success: true,
      message: `Test ${emailType} email sent to ${recipient}`,
      messageId: result.messageId
    });

  } catch (error) {
    logger.error('Email test failed', { error: error.message });
    res.status(500).json({
      error: 'Failed to send test email',
      details: error.message
    });
  }
});

// @route   GET /api/email/status
// @desc    Check email service configuration status
// @access  Public
router.get('/status', (req, res) => {
  const isConfigured = emailService.isConfigured();
  
  res.json({
    configured: isConfigured,
    service: 'Brevo',
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'Not configured',
    senderName: process.env.BREVO_SENDER_NAME || 'Bitsy',
    apiKeyPresent: !!process.env.BREVO_API_KEY,
    message: isConfigured 
      ? 'Email service is ready' 
      : 'Email service not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL.'
  });
});

export default router;
