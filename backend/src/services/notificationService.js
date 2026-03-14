import axios from 'axios';

export const sendNotification = async ({ hotel, bookingRef, bookingDetails, walletAddress, isReturningGuest = false }) => {
  try {
    const returningBadge = isReturningGuest ? '🔁 RETURNING GUEST' : '🆕 NEW GUEST';
    
    // Format console notification
    const consoleNotification = `
${'='.repeat(60)}
🔔 NEW BITSY BOOKING
${'='.repeat(60)}

📋 Reference: ${bookingRef}
🏨 Hotel: ${hotel.hotelName}
${returningBadge}

👤 Guest Details:
   Name: ${bookingDetails.guest_name}
   Email: ${bookingDetails.guest_email}
   Phone: ${bookingDetails.guest_phone}

📅 Booking Details:
   Check-in: ${bookingDetails.check_in}
   Check-out: ${bookingDetails.check_out}
   Room Type: ${bookingDetails.room_type}
   Nights: ${bookingDetails.nights}
   Rate: $${bookingDetails.rate_per_night || 0}/night

💰 Payment:
   Total: $${bookingDetails.total_usd}
   Crypto: ${bookingDetails.crypto_choice.toUpperCase()}
   Wallet: ${walletAddress}
   Status: Guest confirmed payment sent

⚠️  IMPORTANT: Verify payment in your ${bookingDetails.crypto_choice.toUpperCase()} wallet

${'='.repeat(60)}
`;

    console.log(consoleNotification);

    // Send Telegram notification if configured
    if (hotel.telegramBotToken && hotel.telegramChatId) {
      try {
        const telegramMessage = `🔔 NEW BITSY BOOKING
${isReturningGuest ? '🔁 RETURNING GUEST' : '🆕 NEW GUEST'}

📋 Ref: ${bookingRef}
👤 ${bookingDetails.guest_name}
📱 ${bookingDetails.guest_phone}
📧 ${bookingDetails.guest_email}
📅 ${bookingDetails.check_in} to ${bookingDetails.check_out} (${bookingDetails.nights} nights)
🛏️ ${bookingDetails.room_type} Room
💰 $${bookingDetails.total_usd} ${bookingDetails.crypto_choice.toUpperCase()}

⚠️ Verify payment in wallet:
${walletAddress}`;

        const telegramUrl = `https://api.telegram.org/bot${hotel.telegramBotToken}/sendMessage`;
        
        await axios.post(telegramUrl, {
          chat_id: hotel.telegramChatId,
          text: telegramMessage,
          parse_mode: 'HTML'
        }, {
          timeout: 10000
        });

        console.log('✅ Telegram notification sent');
      } catch (telegramError) {
        console.error('⚠️  Telegram notification failed:', telegramError.message);
      }
    } else {
      console.log('⚠️  Telegram not configured');
    }

    return true;
  } catch (error) {
    console.error('Notification Error:', error);
    return false;
  }
};
