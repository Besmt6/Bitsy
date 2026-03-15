import { BrevoClient } from '@getbrevo/brevo';
import logger from '../config/logger.js';

class EmailService {
  constructor() {
    // Initialize Brevo client with API key
    const apiKey = process.env.BREVO_API_KEY;
    
    this.client = apiKey ? new BrevoClient({ apiKey }) : null;
    
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@getbitsy.ai';
    this.senderName = process.env.BREVO_SENDER_NAME || 'Bitsy';
    
    this.maxRetries = 3;
    this.retryDelayMs = 1000;
  }

  /**
   * Send email with retry logic
   */
  async sendWithRetry(emailData, emailType, attempt = 1) {
    try {
      // Check if client is initialized
      if (!this.client) {
        logger.warn(`⚠️ Brevo API key not configured, skipping ${emailType} email`);
        return {
          success: false,
          error: 'Email service not configured',
          emailType
        };
      }

      logger.info(`📧 Sending ${emailType} email`, {
        attempt,
        recipient: emailData.to[0].email
      });

      const result = await this.client.transactionalEmails.sendTransacEmail(emailData);

      logger.info(`✅ ${emailType} email sent successfully`, {
        messageId: result.messageId,
        recipient: emailData.to[0].email
      });

      return {
        success: true,
        messageId: result.messageId,
        emailType
      };
    } catch (error) {
      logger.error(`❌ Failed to send ${emailType} email`, {
        attempt,
        error: error.message,
        recipient: emailData.to[0].email
      });

      // Retry logic
      if (attempt < this.maxRetries && this.isRetryableError(error)) {
        const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
        logger.info(`🔄 Retrying in ${delay}ms...`);
        await this.sleep(delay);
        return this.sendWithRetry(emailData, emailType, attempt + 1);
      }

      throw new Error(`Failed to send ${emailType} email after ${attempt} attempts: ${error.message}`);
    }
  }

  isRetryableError(error) {
    const retryableCodes = ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'];
    const retryableStatus = [429, 500, 502, 503, 504];

    return (
      retryableCodes.includes(error.code) ||
      (error.response && retryableStatus.includes(error.response.status))
    );
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 1. BOOKING CONFIRMATION (Guest)
   */
  async sendBookingConfirmation(booking, guest, hotel) {
    const emailData = {
      subject: `✅ Booking Confirmed: ${hotel.hotelName}`,
      sender: { name: this.senderName, email: this.senderEmail },
      to: [{ email: guest.email, name: guest.name }],
      htmlContent: this.generateBookingConfirmationHTML(booking, guest, hotel),
      tags: ['booking_confirmation', 'guest']
    };

    return this.sendWithRetry(emailData, 'booking_confirmation');
  }

  generateBookingConfirmationHTML(booking, guest, hotel) {
    const { bookingRef, roomType, checkIn, checkOut, nights, totalAmount, paymentMethod } = booking;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, hsl(202, 88%, 36%) 0%, hsl(202, 88%, 46%) 100%);
      color: white;
      padding: 40px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 32px 24px;
    }
    .booking-ref {
      background-color: hsl(36, 45%, 97%);
      border: 2px dashed hsl(202, 88%, 36%);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      margin: 24px 0;
    }
    .booking-ref-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .booking-ref-code {
      font-size: 24px;
      font-weight: 700;
      color: hsl(202, 88%, 36%);
      font-family: 'Courier New', monospace;
      margin-top: 4px;
    }
    .details-card {
      background-color: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #666;
      font-size: 14px;
    }
    .detail-value {
      color: #000;
      font-weight: 600;
      font-size: 14px;
    }
    .total-row {
      background-color: hsl(202, 88%, 36%);
      color: white;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-label {
      font-size: 16px;
      font-weight: 600;
    }
    .total-amount {
      font-size: 24px;
      font-weight: 700;
    }
    .cta-button {
      display: inline-block;
      background-color: hsl(24, 90%, 55%);
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 24px 0;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 24px;
      text-align: center;
      color: #666;
      font-size: 13px;
      border-top: 1px solid #e9ecef;
    }
    .crypto-badge {
      background-color: hsl(171, 100%, 88%);
      color: hsl(171, 80%, 25%);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Booking Confirmed!</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.95;">Your crypto payment has been verified</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; color: #000;">Hi ${guest.name},</p>
      <p style="color: #666; line-height: 1.6;">
        Great news! Your booking at <strong>${hotel.hotelName}</strong> has been confirmed and your payment has been verified on-chain.
      </p>
      
      <div class="booking-ref">
        <div class="booking-ref-label">Your Booking Reference</div>
        <div class="booking-ref-code">${bookingRef}</div>
      </div>
      
      <div class="details-card">
        <h3 style="margin: 0 0 16px 0; font-size: 18px;">Booking Details</h3>
        
        <div class="detail-row">
          <span class="detail-label">Hotel</span>
          <span class="detail-value">${hotel.hotelName}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Room Type</span>
          <span class="detail-value">${roomType}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Check-in</span>
          <span class="detail-value">${checkIn}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Check-out</span>
          <span class="detail-value">${checkOut}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Number of Nights</span>
          <span class="detail-value">${nights} ${nights === 1 ? 'night' : 'nights'}</span>
        </div>
        
        ${hotel.contactPhone ? `
        <div class="detail-row">
          <span class="detail-label">Hotel Contact</span>
          <span class="detail-value">${hotel.contactPhone}</span>
        </div>
        ` : ''}
      </div>
      
      <div class="total-row">
        <span class="total-label">Total Paid</span>
        <span class="total-amount">$${totalAmount}</span>
      </div>
      
      <div class="crypto-badge">
        ✅ Payment verified on ${paymentMethod} blockchain
      </div>
      
      <div style="text-align: center; margin-top: 32px;">
        <a href="https://bitsy-tools.preview.emergentagent.com/guest" class="cta-button" style="color: white;">
          View Booking Details
        </a>
      </div>
      
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin-top: 24px; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #856404;">
          <strong>⚠️ Important:</strong> Crypto bookings are non-refundable. If you need to cancel, you can list your booking on our marketplace.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 8px 0;"><strong>Bitsy</strong> • Crypto-native hotel bookings</p>
      <p style="margin: 0; font-size: 12px;">
        Questions? Contact us at support@getbitsy.ai
      </p>
      <p style="margin: 16px 0 0 0; font-size: 11px; color: #999;">
        Booking Reference: ${bookingRef}
      </p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 2. NEW BOOKING ALERT (Hotel)
   */
  async sendNewBookingAlert(booking, guest, hotel) {
    const emailData = {
      subject: `🔔 New Booking: ${guest.name} at ${hotel.hotelName}`,
      sender: { name: this.senderName, email: this.senderEmail },
      to: [{ email: hotel.email, name: hotel.hotelName }],
      htmlContent: this.generateNewBookingAlertHTML(booking, guest, hotel),
      tags: ['new_booking_alert', 'hotel'],
      replyTo: { email: guest.email, name: guest.name }
    };

    return this.sendWithRetry(emailData, 'new_booking_alert');
  }

  generateNewBookingAlertHTML(booking, guest, hotel) {
    const { bookingRef, roomType, checkIn, checkOut, nights, totalAmount, paymentMethod } = booking;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, sans-serif; background: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: hsl(202, 88%, 36%); color: white; padding: 32px 24px; }
    .content { padding: 24px; }
    .badge { background: hsl(24, 90%, 55%); color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; display: inline-block; }
    .info-box { background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
    .info-row:last-child { border-bottom: none; }
    .cta { display: inline-block; background: hsl(202, 88%, 36%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; font-weight: 600; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">💼 New Booking Alert</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">A guest has booked a room at your property</p>
    </div>
    
    <div class="content">
      <div class="badge">NEW BOOKING</div>
      
      <h2 style="margin: 20px 0 8px 0; font-size: 20px;">Guest Information</h2>
      <div class="info-box">
        <div class="info-row">
          <span style="color: #666;">Name</span>
          <strong>${guest.name}</strong>
        </div>
        <div class="info-row">
          <span style="color: #666;">Email</span>
          <strong>${guest.email}</strong>
        </div>
        ${guest.phone ? `
        <div class="info-row">
          <span style="color: #666;">Phone</span>
          <strong>${guest.phone}</strong>
        </div>
        ` : ''}
      </div>
      
      <h2 style="margin: 24px 0 8px 0; font-size: 20px;">Booking Details</h2>
      <div class="info-box">
        <div class="info-row">
          <span style="color: #666;">Booking Ref</span>
          <strong style="font-family: monospace; color: hsl(202, 88%, 36%);">${bookingRef}</strong>
        </div>
        <div class="info-row">
          <span style="color: #666;">Room Type</span>
          <strong>${roomType}</strong>
        </div>
        <div class="info-row">
          <span style="color: #666;">Check-in</span>
          <strong>${checkIn}</strong>
        </div>
        <div class="info-row">
          <span style="color: #666;">Check-out</span>
          <strong>${checkOut}</strong>
        </div>
        <div class="info-row">
          <span style="color: #666;">Nights</span>
          <strong>${nights}</strong>
        </div>
        <div class="info-row">
          <span style="color: #666;">Amount Paid</span>
          <strong style="color: hsl(142, 71%, 45%); font-size: 18px;">$${totalAmount}</strong>
        </div>
        <div class="info-row">
          <span style="color: #666;">Payment Method</span>
          <strong>${paymentMethod} (Crypto)</strong>
        </div>
      </div>
      
      <div style="background: hsl(142, 76%, 96%); border-left: 4px solid hsl(142, 71%, 45%); padding: 16px; border-radius: 4px; margin-top: 20px;">
        <p style="margin: 0; font-size: 14px; color: hsl(142, 71%, 25%);">
          ✅ Payment has been verified on-chain. No action needed from you.
        </p>
      </div>
      
      <div style="text-align: center;">
        <a href="https://bitsy-tools.preview.emergentagent.com/dashboard/bookings" class="cta" style="color: white;">
          View in Dashboard
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0;"><strong>Bitsy</strong> • Hotel Management Dashboard</p>
      <p style="margin: 8px 0 0 0; font-size: 12px;">This is an automated notification from your booking system</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 3. PASSWORD RESET
   */
  async sendPasswordReset(email, name, resetToken) {
    const resetLink = `${process.env.APP_URL || 'https://bitsy-tools.preview.emergentagent.com'}/reset-password?token=${resetToken}`;
    
    const emailData = {
      subject: '🔐 Password Reset Request - Bitsy',
      sender: { name: this.senderName, email: this.senderEmail },
      to: [{ email, name }],
      htmlContent: this.generatePasswordResetHTML(name, resetLink),
      tags: ['password_reset']
    };

    return this.sendWithRetry(emailData, 'password_reset');
  }

  generatePasswordResetHTML(name, resetLink) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, sans-serif; background: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: hsl(202, 88%, 36%); color: white; padding: 32px 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .cta { display: inline-block; background: hsl(24, 90%, 55%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; border-radius: 4px; margin-top: 24px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">🔐 Password Reset Request</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 16px;">Hi ${name},</p>
      <p style="color: #666; line-height: 1.6;">
        We received a request to reset your Bitsy account password. Click the button below to create a new password:
      </p>
      
      <div style="text-align: center;">
        <a href="${resetLink}" class="cta" style="color: white;">Reset My Password</a>
      </div>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 24px;">
        Or copy and paste this link into your browser:<br>
        <code style="background: #f8f9fa; padding: 8px; display: block; margin-top: 8px; border-radius: 4px; font-size: 12px; word-break: break-all;">${resetLink}</code>
      </p>
      
      <div class="warning">
        <p style="margin: 0; font-size: 14px; color: #856404;">
          <strong>⏰ This link expires in 24 hours</strong><br>
          If you didn't request this reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0;"><strong>Bitsy</strong> • Crypto-native hotel bookings</p>
      <p style="margin: 8px 0 0 0; font-size: 12px;">
        Need help? Contact support@getbitsy.ai
      </p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 4. BILLING ALERT - GRACE PERIOD
   */
  async sendGracePeriodAlert(hotel, billingData) {
    const emailData = {
      subject: `⚠️ Payment Required: ${hotel.hotelName} - Grace Period Active`,
      sender: { name: 'Bitsy Billing', email: this.senderEmail },
      to: [{ email: hotel.email, name: hotel.hotelName }],
      htmlContent: this.generateGracePeriodHTML(hotel, billingData),
      tags: ['billing_alert', 'grace_period']
    };

    return this.sendWithRetry(emailData, 'grace_period_alert');
  }

  generateGracePeriodHTML(hotel, billingData) {
    const { trialRevenue, commissionOwed, graceEndsAt, daysRemaining } = billingData;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, sans-serif; background: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: hsl(38, 92%, 50%); color: white; padding: 32px 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .urgent-box { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .amount-box { background: hsl(202, 88%, 96%); padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .cta { display: inline-block; background: hsl(0, 84%, 60%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">⚠️ Grace Period Active</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.95;">Action required to keep your account active</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px;">Hi ${hotel.hotelName} team,</p>
      
      <div class="urgent-box">
        <h3 style="margin: 0 0 12px 0; color: #856404;">⏰ ${daysRemaining} Days Remaining</h3>
        <p style="margin: 0; color: #856404; line-height: 1.6;">
          Your free trial has ended and you're now in a <strong>7-day grace period</strong>. 
          Please submit your commission payment by <strong>${new Date(graceEndsAt).toLocaleDateString()}</strong> 
          to avoid account suspension.
        </p>
      </div>
      
      <h3 style="margin: 24px 0 12px 0;">Your Trial Summary</h3>
      <div class="amount-box">
        <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Total Revenue During Trial</div>
        <div style="font-size: 36px; font-weight: 700; color: hsl(202, 88%, 36%);">$${trialRevenue}</div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px dashed #dee2e6;">
          <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Commission Owed (2%)</div>
          <div style="font-size: 28px; font-weight: 700; color: hsl(0, 84%, 60%);">$${commissionOwed}</div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://bitsy-tools.preview.emergentagent.com/dashboard/settings" class="cta" style="color: white;">
          Pay Now
        </a>
      </div>
      
      <div style="background: #e7f3ff; border-left: 4px solid #0277bd; padding: 16px; margin-top: 24px; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px;">
          <strong>💡 How to Pay:</strong><br>
          Go to Settings → Commission Payment → Submit your crypto transaction hash after sending payment to our wallet.
        </p>
      </div>
      
      <div style="background: #ffebee; border-left: 4px solid #c62828; padding: 16px; margin-top: 16px; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #c62828;">
          <strong>⚠️ After ${daysRemaining} days:</strong> New bookings will be blocked until payment is received.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0;"><strong>Bitsy Billing</strong></p>
      <p style="margin: 8px 0 0 0;">Questions? Contact billing@getbitsy.ai</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 5. BILLING ALERT - ACCOUNT BLOCKED
   */
  async sendAccountBlockedAlert(hotel, billingData) {
    const emailData = {
      subject: `🚨 URGENT: ${hotel.hotelName} Account Blocked`,
      sender: { name: 'Bitsy Billing', email: this.senderEmail },
      to: [{ email: hotel.email, name: hotel.hotelName }],
      htmlContent: this.generateAccountBlockedHTML(hotel, billingData),
      tags: ['billing_alert', 'account_blocked']
    };

    return this.sendWithRetry(emailData, 'account_blocked_alert');
  }

  generateAccountBlockedHTML(hotel, billingData) {
    const { commissionOwed } = billingData;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, sans-serif; background: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: hsl(0, 84%, 60%); color: white; padding: 32px 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .blocked-box { background: #ffebee; border: 3px solid hsl(0, 84%, 60%); padding: 24px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .cta { display: inline-block; background: hsl(0, 84%, 60%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">🚨 Account Blocked</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.95;">Immediate action required</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px;">Hi ${hotel.hotelName} team,</p>
      
      <div class="blocked-box">
        <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
        <h2 style="margin: 0 0 12px 0; color: hsl(0, 84%, 40%);">Your Account Has Been Blocked</h2>
        <p style="margin: 0; color: #666;">
          New bookings are currently disabled due to unpaid commission balance.
        </p>
      </div>
      
      <div style="background: #fff; border: 2px solid #dee2e6; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
        <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Outstanding Balance</div>
        <div style="font-size: 42px; font-weight: 700; color: hsl(0, 84%, 60%);">$${commissionOwed}</div>
      </div>
      
      <p style="color: #666; line-height: 1.6;">
        Your grace period has ended. To reactivate your account and resume accepting bookings:
      </p>
      
      <ol style="color: #666; line-height: 1.8;">
        <li>Go to your Bitsy dashboard</li>
        <li>Navigate to Settings → Commission Payment</li>
        <li>Send $${commissionOwed} in crypto to our wallet</li>
        <li>Submit the transaction hash</li>
        <li>Your account will be reactivated immediately upon verification</li>
      </ol>
      
      <div style="text-align: center; margin-top: 32px;">
        <a href="https://bitsy-tools.preview.emergentagent.com/dashboard/settings" class="cta" style="color: white;">
          Pay Now to Reactivate
        </a>
      </div>
      
      <div style="background: #e7f3ff; padding: 16px; margin-top: 24px; border-radius: 4px; font-size: 14px;">
        <p style="margin: 0; color: #0277bd;">
          <strong>💡 Need help?</strong> Contact our billing team at billing@getbitsy.ai
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0;"><strong>Bitsy Billing Department</strong></p>
      <p style="margin: 8px 0 0 0; font-size: 12px;">billing@getbitsy.ai</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 6. MARKETPLACE TRANSFER NOTIFICATION (Buyer)
   */
  async sendTransferConfirmation(transfer, buyer, seller, booking) {
    const emailData = {
      subject: `✅ Booking Transfer Complete: ${booking.hotelName}`,
      sender: { name: this.senderName, email: this.senderEmail },
      to: [{ email: buyer.email, name: buyer.name }],
      htmlContent: this.generateTransferConfirmationHTML(transfer, buyer, seller, booking),
      tags: ['marketplace_transfer', 'buyer']
    };

    return this.sendWithRetry(emailData, 'transfer_confirmation');
  }

  generateTransferConfirmationHTML(transfer, buyer, seller, booking) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, sans-serif; background: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: hsl(171, 80%, 40%); color: white; padding: 32px 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .success-box { background: hsl(142, 76%, 96%); border: 2px solid hsl(142, 71%, 45%); padding: 20px; border-radius: 8px; margin: 20px 0; }
    .info-box { background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .cta { display: inline-block; background: hsl(202, 88%, 36%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">🎉 Transfer Complete!</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.95;">Your marketplace purchase is confirmed</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px;">Hi ${buyer.name},</p>
      
      <div class="success-box">
        <h3 style="margin: 0 0 8px 0; color: hsl(142, 71%, 35%);">✅ Payment Verified On-Chain</h3>
        <p style="margin: 0; color: #666;">
          Your payment of <strong>$${transfer.amount}</strong> has been verified and the booking has been transferred to you.
        </p>
      </div>
      
      <h3 style="margin: 24px 0 12px 0;">Your New Booking</h3>
      <div class="info-box">
        <div class="info-row">
          <span style="color: #666;">Hotel</span>
          <strong>${booking.hotelName}</strong>
        </div>
        <div class="info-row">
          <span style="color: #666;">Booking Ref</span>
          <strong style="font-family: monospace;">${booking.bookingRef}</strong>
        </div>
        <div class="info-row">
          <span style="color: #666;">Check-in</span>
          <strong>${booking.checkIn}</strong>
        </div>
        <div class="info-row">
          <span style="color: #666;">Check-out</span>
          <strong>${booking.checkOut}</strong>
        </div>
        <div class="info-row">
          <span style="color: #666;">Room Type</span>
          <strong>${booking.roomType}</strong>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://bitsy-tools.preview.emergentagent.com/guest" class="cta" style="color: white;">
          View Your Booking
        </a>
      </div>
      
      <div style="background: #e7f3ff; padding: 16px; margin-top: 24px; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px;">
          <strong>📱 Important:</strong> Save your booking reference <code>${booking.bookingRef}</code> and present it at check-in.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0;"><strong>Bitsy Marketplace</strong></p>
      <p style="margin: 8px 0 0 0; font-size: 12px;">marketplace@getbitsy.ai</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 7. BOOKING CANCELLATION (Guest)
   */
  async sendCancellationConfirmation(booking, guest, hotel, refundInfo = null) {
    const emailData = {
      subject: `Booking Cancelled: ${hotel.hotelName}`,
      sender: { name: this.senderName, email: this.senderEmail },
      to: [{ email: guest.email, name: guest.name }],
      htmlContent: this.generateCancellationHTML(booking, guest, hotel, refundInfo),
      tags: ['booking_cancellation', 'guest']
    };

    return this.sendWithRetry(emailData, 'cancellation_confirmation');
  }

  generateCancellationHTML(booking, guest, hotel, refundInfo) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, sans-serif; background: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: hsl(0, 0%, 40%); color: white; padding: 32px 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .info-box { background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Booking Cancelled</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 16px;">Hi ${guest.name},</p>
      <p style="color: #666; line-height: 1.6;">
        Your booking at <strong>${hotel.hotelName}</strong> has been cancelled.
      </p>
      
      <div class="info-box">
        <div style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">
          <span style="color: #666;">Booking Reference:</span>
          <strong style="float: right; font-family: monospace;">${booking.bookingRef}</strong>
        </div>
        <div style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">
          <span style="color: #666;">Hotel:</span>
          <strong style="float: right;">${hotel.hotelName}</strong>
        </div>
        <div style="padding: 8px 0;">
          <span style="color: #666;">Original Dates:</span>
          <strong style="float: right;">${booking.checkIn} to ${booking.checkOut}</strong>
        </div>
      </div>
      
      ${refundInfo ? `
      <div style="background: #e7f3ff; padding: 16px; margin-top: 20px; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px;">
          <strong>💰 Refund Information:</strong><br>
          ${refundInfo.message}
        </p>
      </div>
      ` : `
      <div style="background: #fff3cd; padding: 16px; margin-top: 20px; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #856404;">
          <strong>ℹ️ Note:</strong> Crypto bookings are non-refundable. Consider listing on our marketplace if you want to recover your payment.
        </p>
      </div>
      `}
      
      <p style="color: #666; margin-top: 24px;">
        If you have questions about this cancellation, please contact support.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0;"><strong>Bitsy</strong></p>
      <p style="margin: 8px 0 0 0;">support@getbitsy.ai</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 8. PAY-AT-PROPERTY REMINDER (48h deadline)
   */
  async sendPayAtPropertyReminder(booking, guest, hotel, hoursRemaining) {
    const emailData = {
      subject: `⏰ Reminder: Confirm Your Booking at ${hotel.hotelName}`,
      sender: { name: this.senderName, email: this.senderEmail },
      to: [{ email: guest.email, name: guest.name }],
      htmlContent: this.generatePayAtPropertyReminderHTML(booking, guest, hotel, hoursRemaining),
      tags: ['pay_at_property_reminder', 'guest']
    };

    return this.sendWithRetry(emailData, 'pay_at_property_reminder');
  }

  generatePayAtPropertyReminderHTML(booking, guest, hotel, hoursRemaining) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, sans-serif; background: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: hsl(38, 92%, 50%); color: white; padding: 32px 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .countdown { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .cta { display: inline-block; background: hsl(202, 88%, 36%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">⏰ Action Required</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 16px;">Hi ${guest.name},</p>
      
      <div class="countdown">
        <div style="font-size: 48px; font-weight: 700; color: #856404; margin-bottom: 8px;">${hoursRemaining}h</div>
        <p style="margin: 0; color: #856404;">
          <strong>Time remaining to confirm your booking</strong>
        </p>
      </div>
      
      <p style="color: #666; line-height: 1.6;">
        You selected <strong>"Pay at Property"</strong> for your booking at ${hotel.hotelName}. 
        Please call the hotel to confirm your reservation within the next ${hoursRemaining} hours, 
        or your booking will be automatically cancelled.
      </p>
      
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600;">Hotel Contact:</p>
        <p style="margin: 0; color: #666;">📞 ${hotel.contactPhone}</p>
        ${hotel.contactEmail ? `<p style="margin: 8px 0 0 0; color: #666;">📧 ${hotel.contactEmail}</p>` : ''}
      </div>
      
      <div style="background: #ffebee; padding: 16px; border-radius: 4px; margin-top: 20px;">
        <p style="margin: 0; font-size: 14px; color: #c62828;">
          <strong>⚠️ Important:</strong> If not confirmed, your booking (${booking.bookingRef}) will be cancelled automatically after 48 hours.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0;"><strong>Bitsy</strong></p>
      <p style="margin: 8px 0 0 0;">support@getbitsy.ai</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Utility: Check if Brevo is configured
   */
  isConfigured() {
    return !!process.env.BREVO_API_KEY && !!this.senderEmail;
  }
}

export default new EmailService();
