import express from 'express';
import { protect } from '../middleware/auth.js';
import Hotel from '../models/Hotel.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   GET /api/hotel/settings
// @desc    Get hotel settings
// @access  Private
router.get('/settings', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      settings: req.hotel.toJSON()
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/hotel/settings
// @desc    Update hotel settings
// @access  Private
router.put('/settings', protect, async (req, res) => {
  try {
    const {
      hotelName,
      logoUrl,
      contactPhone,
      contactEmail,
      notificationEmail,
      telegramBotToken,
      telegramChatId,
      paymentSettings
    } = req.body;

    const updateFields = {};
    if (hotelName !== undefined) updateFields.hotelName = hotelName;
    if (logoUrl !== undefined) updateFields.logoUrl = logoUrl;
    if (contactPhone !== undefined) updateFields.contactPhone = contactPhone;
    if (contactEmail !== undefined) updateFields.contactEmail = contactEmail;
    if (notificationEmail !== undefined) updateFields.notificationEmail = notificationEmail;
    if (telegramBotToken !== undefined) updateFields.telegramBotToken = telegramBotToken;
    if (telegramChatId !== undefined) updateFields.telegramChatId = telegramChatId;
    if (paymentSettings !== undefined) updateFields.paymentSettings = paymentSettings;

    const hotel = await Hotel.findByIdAndUpdate(
      req.hotel._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      settings: hotel.toJSON()
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/hotel/widget-settings
// @desc    Update widget customization settings
// @access  Private
router.put('/widget-settings', protect, async (req, res) => {
  try {
    const { theme, primaryColor, position, greetingMessage } = req.body;

    const updateFields = {};
    if (theme) updateFields['widgetSettings.theme'] = theme;
    if (primaryColor) updateFields['widgetSettings.primaryColor'] = primaryColor;
    if (position) updateFields['widgetSettings.position'] = position;
    if (greetingMessage) updateFields['widgetSettings.greetingMessage'] = greetingMessage;

    const hotel = await Hotel.findByIdAndUpdate(
      req.hotel._id,
      { $set: updateFields },
      { new: true }
    );

    res.json({
      success: true,
      widgetSettings: hotel.widgetSettings
    });
  } catch (error) {
    console.error('Update widget settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/hotel/widget-code
// @desc    Get widget embed code
// @access  Private
router.get('/widget-code', protect, async (req, res) => {
  try {
    const hotelId = req.hotel._id;
    const widgetUrl = process.env.WIDGET_URL || `${req.protocol}://${req.get('host')}`;
    
    const embedCode = `<script src="${widgetUrl}/widget/bitsy-widget.js" data-hotel-id="${hotelId}"></script>`;

    res.json({
      success: true,
      embedCode,
      hotelId: hotelId.toString()
    });
  } catch (error) {
    console.error('Get widget code error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
