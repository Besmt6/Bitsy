import axios from 'axios';

export const sendNotification = async ({ hotel, bookingRef, bookingDetails, walletAddress, isReturningGuest = false, web3Verified = false }) => {
  try {
    const returningBadge = isReturningGuest ? '🔁 RETURNING GUEST' : '🆕 NEW GUEST';
    const web3Badge = web3Verified ? '⛓️  WEB3 VERIFIED ON-CHAIN' : '';
    
    // Format console notification
    const consoleNotification = `
${'='.repeat(60)}
🔔 NEW BITSY BOOKING
${'='.repeat(60)}

📋 Reference: ${bookingRef}
🏨 Hotel: ${hotel.hotelName}
${returningBadge}
${web3Badge}

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
   ${bookingDetails.paymentAmount || bookingDetails.crypto_choice?.toUpperCase() || 'Crypto'}
   ${bookingDetails.chain ? `Chain: ${bookingDetails.chain}` : ''}
   ${web3Verified ? `✅ Verified on blockchain` : 'Status: Guest confirmed payment sent'}
   ${bookingDetails.txHash ? `Tx: ${bookingDetails.txHash}` : ''}
   ${bookingDetails.explorerUrl ? `Explorer: ${bookingDetails.explorerUrl}` : ''}
   Wallet: ${walletAddress}

${web3Verified ? '✅ Payment automatically verified on-chain' : '⚠️  IMPORTANT: Verify payment in your wallet'}

${'='.repeat(60)}
`;

    console.log(consoleNotification);

    // Send Telegram notification if configured
    if (hotel.telegramBotToken && hotel.telegramChatId) {
      try {
        const telegramMessage = `🔔 NEW BITSY BOOKING
${isReturningGuest ? '🔁 RETURNING GUEST' : '🆕 NEW GUEST'}
${web3Verified ? '⛓️  WEB3 VERIFIED' : ''}

📋 Ref: ${bookingRef}
👤 ${bookingDetails.guest_name}
📱 ${bookingDetails.guest_phone}
📧 ${bookingDetails.guest_email}
📅 ${bookingDetails.check_in} to ${bookingDetails.check_out} (${bookingDetails.nights} nights)
🛏️ ${bookingDetails.room_type} Room
💰 $${bookingDetails.total_usd} ${bookingDetails.paymentAmount || bookingDetails.crypto_choice?.toUpperCase() || ''}

${web3Verified ? '✅ Verified on-chain' : '⚠️ Verify payment in wallet:'}
${bookingDetails.explorerUrl || walletAddress}`;


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
