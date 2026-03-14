(function() {
  'use strict';
  
  // Get hotel ID from script tag
  const currentScript = document.currentScript || document.querySelector('script[data-hotel-id]');
  const HOTEL_ID = currentScript ? currentScript.getAttribute('data-hotel-id') : null;
  
  if (!HOTEL_ID) {
    console.error('Bitsy Widget: No hotel ID provided');
    return;
  }
  
  const API_URL = currentScript.src.replace('/widget/bitsy-widget.js', '');
  
  // Widget state
  let widgetState = {
    isOpen: false,
    hotelConfig: null,
    conversation: [],
    bookingDetails: null,
    returningGuest: null
  };
  
  // Create widget button
  function createWidgetButton() {
    const button = document.createElement('button');
    button.id = 'bitsy-widget-button';
    button.setAttribute('data-testid', 'widget-floating-chat-button');
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
    
    button.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #0e7490;
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.10);
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    `;
    
    button.onmouseover = () => {
      button.style.boxShadow = '0 14px 34px rgba(15, 23, 42, 0.18)';
      button.style.transform = 'scale(1.05)';
    };
    
    button.onmouseout = () => {
      button.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.10)';
      button.style.transform = 'scale(1)';
    };
    
    button.onclick = toggleWidget;
    
    document.body.appendChild(button);
  }
  
  // Create widget container
  function createWidgetContainer() {
    const container = document.createElement('div');
    container.id = 'bitsy-widget-container';
    container.setAttribute('data-testid', 'widget-chat-container');
    container.style.cssText = `
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      max-height: 600px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(15, 23, 42, 0.15);
      z-index: 999999;
      display: none;
      flex-direction: column;
      overflow: hidden;
    `;
    
    container.innerHTML = `
      <div style="padding: 16px; border-bottom: 1px solid #e5e7eb; background: #0e7490; color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 600;">Chat with Bitsy</h3>
          <button id="bitsy-close-btn" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 24px; line-height: 1; padding: 0;">×</button>
        </div>
      </div>
      
      <div id="bitsy-messages" data-testid="widget-message-list" style="flex: 1; overflow-y: auto; padding: 16px; max-height: 400px; min-height: 300px;"></div>
      
      <div style="padding: 16px; border-top: 1px solid #e5e7eb;">
        <div style="display: flex; gap: 8px;">
          <input 
            id="bitsy-input" 
            data-testid="widget-message-composer"
            placeholder="Type your message..." 
            style="flex: 1; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 14px;"
          />
          <button id="bitsy-send-btn" style="padding: 8px 16px; background: #0e7490; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Send</button>
        </div>
        <div style="margin-top: 8px; font-size: 11px; color: #6b7280; text-align: center;">
          ⚠️ All crypto bookings are non-refundable
        </div>
      </div>
    `;
    
    document.body.appendChild(container);
    
    // Event listeners
    document.getElementById('bitsy-close-btn').onclick = toggleWidget;
    document.getElementById('bitsy-send-btn').onclick = sendMessage;
    document.getElementById('bitsy-input').onkeypress = (e) => {
      if (e.key === 'Enter') sendMessage();
    };
  }
  
  // Toggle widget
  function toggleWidget() {
    widgetState.isOpen = !widgetState.isOpen;
    const container = document.getElementById('bitsy-widget-container');
    
    if (widgetState.isOpen) {
      container.style.display = 'flex';
      if (!widgetState.hotelConfig) {
        fetchHotelConfig();
      }
      if (widgetState.conversation.length === 0) {
        addMessage('assistant', widgetState.hotelConfig?.widgetSettings?.greetingMessage || \"Hi! I'm Bitsy. Looking to book a room?\");
      }
    } else {
      container.style.display = 'none';
    }
  }
  
  // Fetch hotel config
  async function fetchHotelConfig() {
    try {
      const response = await fetch(`${API_URL}/api/widget/${HOTEL_ID}/config`);
      const data = await response.json();
      widgetState.hotelConfig = data.config;
    } catch (error) {
      console.error('Failed to fetch hotel config:', error);
      addMessage('assistant', 'Sorry, I\\'m having trouble connecting. Please try again later.');
    }
  }
  
  // Send message
  async function sendMessage() {
    const input = document.getElementById('bitsy-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessage('user', message);
    input.value = '';
    
    // Show typing indicator
    const typingId = Date.now();
    addTypingIndicator(typingId);
    
    try {
      const response = await fetch(`${API_URL}/api/widget/${HOTEL_ID}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId: HOTEL_ID,
          conversationHistory: widgetState.conversation.slice(-10).map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.text
          }))
        })
      });
      
      const data = await response.json();
      removeTypingIndicator(typingId);
      
      if (data.response) {
        addMessage('assistant', data.response);
        
        // Check if response contains booking details
        if (data.response.includes('\"action\": \"generate_payment\"')) {
          try {
            const jsonMatch = data.response.match(/\\{[\\s\\S]*\\}/);
            if (jsonMatch) {
              const bookingData = JSON.parse(jsonMatch[0]);
              widgetState.bookingDetails = bookingData.booking_details;
              showNonRefundableWarning();
            }
          } catch (e) {
            // Not JSON, continue
          }
        }
      }
    } catch (error) {
      removeTypingIndicator(typingId);
      console.error('Failed to send message:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    }
  }
  
  // Add message to chat
  function addMessage(role, text) {
    const messagesContainer = document.getElementById('bitsy-messages');
    const messageDiv = document.createElement('div');
    
    const isUser = role === 'user';
    messageDiv.style.cssText = `
      margin-bottom: 12px;
      display: flex;
      justify-content: ${isUser ? 'flex-end' : 'flex-start'};
    `;
    
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 16px;
      ${isUser ? 'border-top-right-radius: 4px;' : 'border-top-left-radius: 4px;'}
      background: ${isUser ? '#0e7490' : '#f3f4f6'};
      color: ${isUser ? 'white' : '#111827'};
      font-size: 14px;
      line-height: 1.5;
      font-family: 'Inter', sans-serif;
      word-wrap: break-word;
    `;
    bubble.textContent = text;
    
    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    widgetState.conversation.push({ role, text });
  }
  
  // Typing indicator
  function addTypingIndicator(id) {
    const messagesContainer = document.getElementById('bitsy-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = `typing-${id}`;
    typingDiv.style.cssText = 'margin-bottom: 12px; display: flex;';
    typingDiv.innerHTML = `
      <div style="background: #f3f4f6; padding: 10px 14px; border-radius: 16px; border-top-left-radius: 4px;">
        <span style="font-size: 14px;">●●●</span>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  function removeTypingIndicator(id) {
    const typing = document.getElementById(`typing-${id}`);
    if (typing) typing.remove();
  }
  
  // Show non-refundable warning
  function showNonRefundableWarning() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;
    
    overlay.innerHTML = `
      <div data-testid="widget-nonrefundable-dialog" style="background: white; border-radius: 16px; padding: 24px; max-width: 400px; width: 100%;">
        <div style="background: #f59e0b; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #000;">⚠️ Non-Refundable Booking</h3>
        </div>
        
        <ul style="margin: 16px 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li>Crypto payments can't be reversed.</li>
          <li>No refunds or chargebacks after payment.</li>
          <li>Confirm dates and room type before paying.</li>
        </ul>
        
        <label style="display: flex; align-items: center; gap: 8px; margin: 16px 0; cursor: pointer;">
          <input type="checkbox" id="policy-checkbox" data-testid="widget-nonrefundable-checkbox" style="width: 18px; height: 18px;" />
          <span style="font-size: 14px;">I understand this booking is non-refundable</span>
        </label>
        
        <div style="display: flex; gap: 8px; margin-top: 20px;">
          <button id="cancel-booking" style="flex: 1; padding: 10px; background: #e5e7eb; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Cancel</button>
          <button id="continue-booking" data-testid="widget-nonrefundable-continue-button" style="flex: 1; padding: 10px; background: #0e7490; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Continue to payment</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('cancel-booking').onclick = () => overlay.remove();
    document.getElementById('continue-booking').onclick = () => {
      const checkbox = document.getElementById('policy-checkbox');
      if (!checkbox.checked) {
        alert('Please accept the non-refundable policy to continue');
        return;
      }
      overlay.remove();
      submitBooking();
    };
  }
  
  // Submit booking
  async function submitBooking() {
    try {
      addMessage('assistant', 'Processing your booking...');
      
      const response = await fetch(`${API_URL}/api/widget/${HOTEL_ID}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingDetails: widgetState.bookingDetails
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showPaymentQR(data);
      } else {
        addMessage('assistant', 'Sorry, there was an error processing your booking. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      addMessage('assistant', 'Sorry, there was an error. Please try again.');
    }
  }
  
  // Show payment QR
  function showPaymentQR(data) {
    const messagesContainer = document.getElementById('bitsy-messages');
    const qrDiv = document.createElement('div');
    qrDiv.style.cssText = 'margin-bottom: 12px;';
    
    qrDiv.innerHTML = `
      <div data-testid="widget-payment-qr" style="background: white; border: 1px solid #e5e7eb; padding: 16px; border-radius: 12px;">
        <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Payment QR Code</h4>
        <img src="${data.qrCode.dataUrl}" alt="Payment QR Code" style="width: 100%; max-width: 250px; display: block; margin: 0 auto;" />
        <div data-testid="widget-payment-amount" style="margin-top: 12px; text-align: center;">
          <div style="font-size: 24px; font-weight: 700; color: #0e7490;">$${widgetState.bookingDetails.total_usd}</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${widgetState.bookingDetails.crypto_choice.toUpperCase()}</div>
        </div>
        <div style="margin-top: 12px; padding: 8px; background: #f3f4f6; border-radius: 6px; font-family: monospace; font-size: 11px; word-break: break-all;">${data.walletAddress}</div>
        <button data-testid="widget-payment-address-copy" onclick="navigator.clipboard.writeText('${data.walletAddress}'); alert('Address copied!');" style="width: 100%; margin-top: 8px; padding: 8px; background: #e5e7eb; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">Copy Address</button>
        <div style="margin-top: 16px; padding: 12px; background: #dcfce7; border-radius: 6px; font-size: 12px; line-height: 1.6;">
          <strong>Booking Reference:</strong> ${data.bookingRef}<br/>
          Check your email for confirmation details.
        </div>
      </div>
    `;
    
    messagesContainer.appendChild(qrDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    addMessage('assistant', 'Thank you! Your booking has been submitted. Please send the payment to the wallet address shown above. The hotel will confirm once payment is received.');
  }
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    createWidgetButton();
    createWidgetContainer();
  }
})();
