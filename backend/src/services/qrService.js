import QRCode from 'qrcode';

export const generateQRCode = async ({ address, chain, amount }) => {
  try {
    // Generate payment URI based on chain
    let paymentUri = address;

    switch (chain.toLowerCase()) {
      case 'bitcoin':
        paymentUri = `bitcoin:${address}?amount=${amount}`;
        break;
      case 'ethereum':
      case 'polygon':
        paymentUri = `ethereum:${address}?value=${amount}`;
        break;
      case 'solana':
        paymentUri = `solana:${address}?amount=${amount}`;
        break;
      case 'tron':
        paymentUri = `tron:${address}?amount=${amount}`;
        break;
      default:
        paymentUri = address;
    }

    // Generate QR code as base64 data URL
    const qrCodeDataUrl = await QRCode.toDataURL(paymentUri, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return {
      dataUrl: qrCodeDataUrl,
      uri: paymentUri,
      address,
      chain,
      amount
    };
  } catch (error) {
    console.error('QR Code Generation Error:', error);
    throw new Error('Failed to generate QR code');
  }
};
