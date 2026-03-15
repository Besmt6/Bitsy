import express from 'express';
import bcrypt from 'bcryptjs';
import Hotel from '../models/Hotel.js';
import OTP from '../models/OTP.js';

const router = express.Router();

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// @route   POST /api/password/request-reset
// @desc    Request password reset OTP
// @access  Public
router.post('/request-reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if hotel exists
    const hotel = await Hotel.findOne({ email: email.toLowerCase() });
    if (!hotel) {
      // Don't reveal if email exists (security best practice)
      return res.json({ 
        success: true, 
        message: 'If an account exists, an OTP has been sent to your email' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase(), type: 'password_reset' });

    // Save new OTP
    const otpRecord = new OTP({
      email: email.toLowerCase(),
      otp,
      type: 'password_reset',
      expiresAt
    });

    await otpRecord.save();

    // TODO: Send email with OTP (for now, log it)
    console.log(`🔐 Password reset OTP for ${email}: ${otp} (expires in 10 min)`);

    // In production, send via email service:
    // await sendEmail({
    //   to: email,
    //   subject: 'Bitsy Password Reset',
    //   text: `Your password reset code is: ${otp}. Valid for 10 minutes.`
    // });

    res.json({ 
      success: true, 
      message: 'If an account exists, an OTP has been sent to your email',
      debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined // Only in dev
    });
  } catch (error) {
    console.error('Request reset error:', error);
    res.status(500).json({ error: 'Server error requesting password reset' });
  }
});

// @route   POST /api/password/verify-otp
// @desc    Verify OTP code
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp: otp,
      type: 'password_reset',
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark as verified
    otpRecord.verified = true;
    otpRecord.verifiedAt = new Date();
    await otpRecord.save();

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken: otpRecord._id.toString() // Use OTP ID as temp reset token
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error verifying OTP' });
  }
});

// @route   POST /api/password/reset
// @desc    Reset password after OTP verification
// @access  Public (with verified OTP token)
router.post('/reset', async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ error: 'Email, reset token, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify reset token (must be verified OTP)
    const otpRecord = await OTP.findOne({
      _id: resetToken,
      email: email.toLowerCase(),
      type: 'password_reset',
      verified: true,
      expiresAt: { $gt: new Date(Date.now() - 15 * 60 * 1000) } // Allow 15 min after verification
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Find hotel
    const hotel = await Hotel.findOne({ email: email.toLowerCase() });
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    hotel.password = hashedPassword;
    await hotel.save();

    // Delete all OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    console.log(`✅ Password reset successful for ${email}`);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error resetting password' });
  }
});

export default router;
