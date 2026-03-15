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
  const REOWN_PROJECT_ID = '8303063b1790537186dbfba7e31b625c';
  
  // Widget state
  let widgetState = {
    isOpen: false,
    language: detectLanguage(),
    hotelConfig: null,
    conversation: [],
    bookingDetails: null,
    returningGuest: null,
    datePickerMode: null, // 'checkin' | 'checkout' | null
    selectedDates: {
      checkIn: null,
      checkOut: null
    },
    web3: {
      connected: false,
      address: null,
      chainId: null,
      provider: null
    }
  };

  // Translations for multi-language support
  const translations = {
    en: {
      send: 'Send',
      typeMessage: 'Type a message...',
      bookNow: 'Book Now',
      payWithCrypto: 'Pay with Crypto Wallet',
      payWithQR: 'Pay with QR Code',
      cancel: 'Cancel',
      confirmBooking: 'Confirm Booking',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      selectDate: 'Select Date',
      pickDates: '📅 Pick dates from calendar',
      typeDates: '💬 Type my dates',
      showCalendar: 'Show me a calendar',
      greeting: "Hi! I'm Bitsy. Looking to book a room?",
      calendarPrompt: 'Perfect! Let' + "'" + 's start with your check-in date.',
      typePrompt: 'Great! Just tell me your check-in and check-out dates, like "March 20-23" or "next weekend".',
      days: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    es: {
      send: 'Enviar',
      typeMessage: 'Escribe un mensaje...',
      bookNow: 'Reservar Ahora',
      payWithCrypto: 'Pagar con Cripto',
      payWithQR: 'Pagar con Código QR',
      cancel: 'Cancelar',
      confirmBooking: 'Confirmar Reserva',
      checkIn: 'Entrada',
      checkOut: 'Salida',
      selectDate: 'Seleccionar Fecha',
      pickDates: '📅 Elegir fechas del calendario',
      typeDates: '💬 Escribir mis fechas',
      showCalendar: 'Mostrar calendario',
      greeting: '¡Hola! Soy Bitsy. ¿Buscas reservar una habitación?',
      calendarPrompt: '¡Perfecto! Comencemos con tu fecha de entrada.',
      typePrompt: '¡Genial! Solo dime tus fechas de entrada y salida, como "20-23 de marzo" o "el próximo fin de semana".',
      days: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
      months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    },
    fr: {
      send: 'Envoyer',
      typeMessage: 'Tapez un message...',
      bookNow: 'Réserver',
      payWithCrypto: 'Payer avec Crypto',
      payWithQR: 'Payer avec QR',
      cancel: 'Annuler',
      confirmBooking: 'Confirmer la Réservation',
      checkIn: 'Arrivée',
      checkOut: 'Départ',
      selectDate: 'Sélectionner la Date',
      pickDates: '📅 Choisir les dates du calendrier',
      typeDates: '💬 Taper mes dates',
      showCalendar: 'Afficher le calendrier',
      greeting: 'Bonjour! Je suis Bitsy. Vous cherchez à réserver une chambre?',
      calendarPrompt: 'Parfait! Commençons par votre date d' + "'" + 'arrivée.',
      typePrompt: 'Super! Dites-moi vos dates d' + "'" + 'arrivée et de départ, comme "20-23 mars".',
      days: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
      months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    },
    de: {
      send: 'Senden',
      typeMessage: 'Nachricht eingeben...',
      bookNow: 'Jetzt Buchen',
      payWithCrypto: 'Mit Krypto Bezahlen',
      payWithQR: 'Mit QR-Code Bezahlen',
      cancel: 'Abbrechen',
      confirmBooking: 'Buchung Bestätigen',
      checkIn: 'Anreise',
      checkOut: 'Abreise',
      selectDate: 'Datum Wählen',
      pickDates: '📅 Daten aus Kalender wählen',
      typeDates: '💬 Daten eingeben',
      showCalendar: 'Kalender anzeigen',
      greeting: 'Hallo! Ich bin Bitsy. Möchten Sie ein Zimmer buchen?',
      calendarPrompt: 'Perfekt! Beginnen wir mit Ihrem Anreisedatum.',
      typePrompt: 'Großartig! Sagen Sie mir einfach Ihre An- und Abreisedaten.',
      days: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
      months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
    },
    ja: {
      send: '送信',
      typeMessage: 'メッセージを入力...',
      bookNow: '今すぐ予約',
      payWithCrypto: '暗号通貨で支払う',
      payWithQR: 'QRコードで支払う',
      cancel: 'キャンセル',
      confirmBooking: '予約を確認',
      checkIn: 'チェックイン',
      checkOut: 'チェックアウト',
      selectDate: '日付を選択',
      pickDates: '📅 カレンダーから日付を選択',
      typeDates: '💬 日付を入力',
      showCalendar: 'カレンダーを表示',
      greeting: 'こんにちは！Bitsyです。お部屋の予約をお探しですか？',
      calendarPrompt: '完璧です！チェックイン日から始めましょう。',
      typePrompt: '素晴らしい！「3月20-23日」のようにチェックインとチェックアウトの日付を教えてください。',
      days: ['日', '月', '火', '水', '木', '金', '土'],
      months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    zh: {
      send: '发送',
      typeMessage: '输入消息...',
      bookNow: '立即预订',
      payWithCrypto: '加密货币支付',
      payWithQR: '二维码支付',
      cancel: '取消',
      confirmBooking: '确认预订',
      checkIn: '入住',
      checkOut: '退房',
      selectDate: '选择日期',
      pickDates: '📅 从日历选择日期',
      typeDates: '💬 输入日期',
      showCalendar: '显示日历',
      greeting: '你好！我是Bitsy。想预订房间吗？',
      calendarPrompt: '完美！让我们从入住日期开始。',
      typePrompt: '太好了！告诉我入住和退房日期，比如"3月20-23日"。',
      days: ['日', '一', '二', '三', '四', '五', '六'],
      months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    },
    pt: {
      send: 'Enviar',
      typeMessage: 'Digite uma mensagem...',
      bookNow: 'Reservar Agora',
      payWithCrypto: 'Pagar com Cripto',
      payWithQR: 'Pagar com QR',
      cancel: 'Cancelar',
      confirmBooking: 'Confirmar Reserva',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      selectDate: 'Selecionar Data',
      pickDates: '📅 Escolher datas do calendário',
      typeDates: '💬 Digitar minhas datas',
      showCalendar: 'Mostrar calendário',
      greeting: 'Oi! Eu sou Bitsy. Procura reservar um quarto?',
      calendarPrompt: 'Perfeito! Vamos começar com a data de check-in.',
      typePrompt: 'Ótimo! Me diga as datas de check-in e check-out, como "20-23 de março".',
      days: ['Do', 'Se', 'Te', 'Qa', 'Qi', 'Se', 'Sa'],
      months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    },
    it: {
      send: 'Invia',
      typeMessage: 'Scrivi un messaggio...',
      bookNow: 'Prenota Ora',
      payWithCrypto: 'Paga con Cripto',
      payWithQR: 'Paga con QR',
      cancel: 'Annulla',
      confirmBooking: 'Conferma Prenotazione',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      selectDate: 'Seleziona Data',
      pickDates: '📅 Scegli date dal calendario',
      typeDates: '💬 Digita le mie date',
      showCalendar: 'Mostra calendario',
      greeting: 'Ciao! Sono Bitsy. Cerchi di prenotare una camera?',
      calendarPrompt: 'Perfetto! Iniziamo con la data di check-in.',
      typePrompt: 'Ottimo! Dimmi le date di check-in e check-out, come "20-23 marzo".',
      days: ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'],
      months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
    }
  };
  
  // Detect browser language
  function detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0].toLowerCase();
    return translations[langCode] ? langCode : 'en';
  }
  
  // Get translation
  function t(key) {
    const lang = widgetState.language || 'en';
    return translations[lang]?.[key] || translations.en[key] || key;
  }

  
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
          <div style="display: flex; align-items: center; gap: 12px;">
            <select 
              id="bitsy-language-selector" 
              style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 500;"
              data-testid="widget-language-selector"
            >
              <option value="en" ${widgetState.language === 'en' ? 'selected' : ''}>🇺🇸 EN</option>
              <option value="es" ${widgetState.language === 'es' ? 'selected' : ''}>🇪🇸 ES</option>
              <option value="fr" ${widgetState.language === 'fr' ? 'selected' : ''}>🇫🇷 FR</option>
              <option value="de" ${widgetState.language === 'de' ? 'selected' : ''}>🇩🇪 DE</option>
              <option value="ja" ${widgetState.language === 'ja' ? 'selected' : ''}>🇯🇵 JA</option>
              <option value="zh" ${widgetState.language === 'zh' ? 'selected' : ''}>🇨🇳 ZH</option>
              <option value="pt" ${widgetState.language === 'pt' ? 'selected' : ''}>🇵🇹 PT</option>
              <option value="it" ${widgetState.language === 'it' ? 'selected' : ''}>🇮🇹 IT</option>
            </select>
            <button id="bitsy-close-btn" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 24px; line-height: 1; padding: 0;">×</button>
          </div>
        </div>
      </div>
      
      <div id="bitsy-messages" data-testid="widget-message-list" style="flex: 1; overflow-y: auto; padding: 16px; max-height: 400px; min-height: 300px;"></div>
      
      <div style="padding: 16px; border-top: 1px solid #e5e7eb;">
        <div style="display: flex; gap: 8px;">
          <input 
            id="bitsy-input" 
            data-testid="widget-message-composer"
            placeholder="${t('typeMessage')}" 
            style="flex: 1; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 14px;"
          />
          <button id="bitsy-send-btn" data-testid="widget-send-button" style="padding: 8px 16px; background: #0e7490; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">${t('send')}</button>
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
    
    // Language selector
    document.getElementById('bitsy-language-selector').onchange = (e) => {
      widgetState.language = e.target.value;
      // Refresh widget with new language
      const messagesContainer = document.getElementById('bitsy-messages');
      messagesContainer.innerHTML = '';
      widgetState.conversation = [];
      addMessage('assistant', t('greeting'));
      
      // Re-add quick actions in new language
      setTimeout(() => {
        addQuickActions([
          {
            label: t('pickDates'),
            onClick: () => {
              addMessage('user', t('showCalendar'));
              setTimeout(() => {
                addMessage('assistant', t('calendarPrompt'));
                showDatePicker('checkin');
              }, 500);
            }
          },
          {
            label: t('typeDates'),
            onClick: () => {
              addMessage('user', t('typeDates'));
              setTimeout(() => {
                addMessage('assistant', t('typePrompt'));
              }, 500);
            }
          }
        ]);
      }, 800);
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
        addMessage('assistant', widgetState.hotelConfig?.widgetSettings?.greetingMessage || t('greeting'));
        
        // Add quick action buttons after greeting
        setTimeout(() => {
          addQuickActions([
            {
              label: t('pickDates'),
              onClick: () => {
                addMessage('user', t('showCalendar'));
                setTimeout(() => {
                  addMessage('assistant', t('calendarPrompt'));
                  showDatePicker('checkin');
                }, 500);
              }
            },
            {
              label: t('typeDates'),
              onClick: () => {
                addMessage('user', t('typeDates'));
                setTimeout(() => {
                  addMessage('assistant', t('typePrompt'));
                }, 500);
              }
            }
          ]);
        }, 800);
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
      addMessage('assistant', 'Sorry, I' + "'" + 'm having trouble connecting. Please try again later.');
    }
  }
  
  
  // Date picker component
  function showDatePicker(mode = 'checkin') {
    widgetState.datePickerMode = mode;
    
    const messagesContainer = document.getElementById('bitsy-messages');
    const calendarDiv = document.createElement('div');
    calendarDiv.id = 'bitsy-date-picker';
    calendarDiv.setAttribute('data-testid', 'widget-date-picker');
    calendarDiv.style.cssText = `
      margin-bottom: 12px;
      display: flex;
      justify-content: flex-start;
    `;
    
    const today = new Date();
    const minDate = mode === 'checkin' ? today : widgetState.selectedDates.checkIn ? new Date(widgetState.selectedDates.checkIn) : today;
    minDate.setHours(0, 0, 0, 0);
    
    const calendarCard = document.createElement('div');
    calendarCard.style.cssText = `
      background: white;
      border: 2px solid #0e7490;
      border-radius: 12px;
      padding: 16px;
      max-width: 90%;
      box-shadow: 0 4px 12px rgba(14, 116, 144, 0.15);
    `;
    
    const title = mode === 'checkin' ? `${t('checkIn')} Date` : `${t('checkOut')} Date`;
    
    calendarCard.innerHTML = `
      <div style="margin-bottom: 12px; font-weight: 600; font-size: 14px; color: #0e7490; font-family: 'Space Grotesk', sans-serif;">
        📅 ${title}
      </div>
      <div id="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 12px;">
        <!-- Calendar will be rendered here -->
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="calendar-cancel" style="padding: 6px 12px; background: #e5e7eb; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">
          ${t('cancel')}
        </button>
      </div>
    `;
    
    calendarDiv.appendChild(calendarCard);
    messagesContainer.appendChild(calendarDiv);
    
    // Render calendar
    renderCalendar(minDate);
    
    // Event listeners
    document.getElementById('calendar-cancel').onclick = () => {
      calendarDiv.remove();
      widgetState.datePickerMode = null;
      addMessage('assistant', 'No problem! You can also just type your dates like "March 20-23" or "next weekend".');
    };
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  function renderCalendar(minDate) {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Days of week header
    const daysOfWeek = t('days');
    daysOfWeek.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.textContent = day;
      dayHeader.style.cssText = `
        text-align: center;
        font-size: 11px;
        font-weight: 600;
        color: #6b7280;
        padding: 4px;
      `;
      grid.appendChild(dayHeader);
    });
    
    // Calculate first day of month and total days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      grid.appendChild(document.createElement('div'));
    }
    
    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      date.setHours(0, 0, 0, 0);
      
      const dayCell = document.createElement('button');
      dayCell.textContent = day;
      dayCell.setAttribute('data-date', date.toISOString().split('T')[0]);
      
      const isPast = date < minDate;
      const isToday = date.toDateString() === now.toDateString();
      
      dayCell.style.cssText = `
        padding: 8px;
        border: 1px solid ${isToday ? '#0e7490' : '#e5e7eb'};
        border-radius: 6px;
        background: ${isPast ? '#f9fafb' : 'white'};
        cursor: ${isPast ? 'not-allowed' : 'pointer'};
        font-size: 13px;
        font-weight: ${isToday ? '600' : '400'};
        color: ${isPast ? '#d1d5db' : '#111827'};
        transition: all 0.15s ease;
      `;
      
      if (!isPast) {
        dayCell.onmouseover = () => {
          dayCell.style.background = '#0e7490';
          dayCell.style.color = 'white';
          dayCell.style.transform = 'scale(1.05)';
        };
        dayCell.onmouseout = () => {
          dayCell.style.background = 'white';
          dayCell.style.color = '#111827';
          dayCell.style.transform = 'scale(1)';
        };
        dayCell.onclick = () => selectDate(date);
      } else {
        dayCell.disabled = true;
      }
      
      grid.appendChild(dayCell);
    }
  }
  
  function selectDate(date) {
    const mode = widgetState.datePickerMode;
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    if (mode === 'checkin') {
      widgetState.selectedDates.checkIn = date;
      
      // Remove calendar
      const picker = document.getElementById('bitsy-date-picker');
      if (picker) picker.remove();
      
      // Add confirmation message
      addMessage('user', `Check-in: ${formattedDate}`);
      
      // Ask for check-out
      setTimeout(() => {
        addMessage('assistant', 'Great! Now when would you like to check out?');
        showDatePicker('checkout');
      }, 500);
      
    } else if (mode === 'checkout') {
      const checkInDate = widgetState.selectedDates.checkIn;
      
      // Validate check-out is after check-in
      if (date <= checkInDate) {
        alert('Check-out date must be after check-in date');
        return;
      }
      
      widgetState.selectedDates.checkOut = date;
      
      // Remove calendar
      const picker = document.getElementById('bitsy-date-picker');
      if (picker) picker.remove();
      
      // Calculate nights
      const nights = Math.ceil((date - checkInDate) / (1000 * 60 * 60 * 24));
      
      // Add confirmation message
      const checkInFormatted = checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const checkOutFormatted = formattedDate;
      addMessage('user', `Check-out: ${checkOutFormatted}`);
      
      // Send to AI for room options
      setTimeout(() => {
        const dateMessage = `I need a room from ${checkInFormatted} to ${checkOutFormatted} (${nights} night${nights > 1 ? 's' : ''})`;
        sendMessageToAI(dateMessage);
      }, 800);
      
      widgetState.datePickerMode = null;
    }
  }
  
  // Helper to send message without user typing
  async function sendMessageToAI(messageText) {
    const typingId = Date.now();
    addTypingIndicator(typingId);
    
    try {
      const response = await fetch(`${API_URL}/api/widget/${HOTEL_ID}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          sessionId: HOTEL_ID,
          language: widgetState.language,
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
        if (data.response.includes('"action": "generate_payment"')) {
          try {
            const jsonMatch = data.response.match(/\{[\s\S]*\}/);
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

  // Send message
  async function sendMessage() {
    const input = document.getElementById('bitsy-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Check for calendar triggers
    const calendarTriggers = ['show calendar', 'pick dates', 'open calendar', 'calendar', 'date picker'];
    if (calendarTriggers.some(trigger => message.toLowerCase().includes(trigger))) {
      addMessage('user', message);
      input.value = '';
      
      setTimeout(() => {
        addMessage('assistant', 'Sure! Let me show you a calendar. When would you like to check in?');
        showDatePicker('checkin');
      }, 500);
      return;
    }
    
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
          language: widgetState.language,
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

  // Add quick action buttons (including calendar trigger)
  function addQuickActions(actions) {
    const messagesContainer = document.getElementById('bitsy-messages');
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'bitsy-quick-actions';
    actionsDiv.style.cssText = `
      margin-bottom: 12px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      padding-left: 0;
    `;
    
    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.textContent = action.label;
      btn.setAttribute('data-testid', `quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`);
      btn.style.cssText = `
        padding: 8px 14px;
        background: white;
        border: 1.5px solid #0e7490;
        color: #0e7490;
        border-radius: 20px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s ease;
        font-family: 'Inter', sans-serif;
      `;
      
      btn.onmouseover = () => {
        btn.style.background = '#0e7490';
        btn.style.color = 'white';
        btn.style.transform = 'translateY(-2px)';
      };
      btn.onmouseout = () => {
        btn.style.background = 'white';
        btn.style.color = '#0e7490';
        btn.style.transform = 'translateY(0)';
      };
      
      btn.onclick = () => {
        // Remove all quick actions after clicking one
        document.querySelectorAll('.bitsy-quick-actions').forEach(el => el.remove());
        action.onClick();
      };
      
      actionsDiv.appendChild(btn);
    });
    
    messagesContainer.appendChild(actionsDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  
  // Add message to chat
  function addMessage(role, text, images = []) {
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
    
    // Add images if provided
    if (images && images.length > 0 && !isUser) {
      const imagesContainer = document.createElement('div');
      imagesContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 8px;
        margin-top: 8px;
        max-width: 80%;
      `;
      
      images.forEach(imageUrl => {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.cssText = `
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          cursor: pointer;
        `;
        img.onclick = () => window.open(imageUrl, '_blank');
        imagesContainer.appendChild(img);
      });
      
      messageDiv.appendChild(imagesContainer);
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    widgetState.conversation.push({ role, text, images });
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
      <div data-testid="widget-payment-options" style="background: white; border: 1px solid #e5e7eb; padding: 16px; border-radius: 12px;">
        <h4 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Choose Payment Method</h4>
        
        <!-- Web3 Wallet Option -->
        <div style="margin-bottom: 16px;">
          <button id="bitsy-web3-pay-btn" data-testid="widget-web3-pay-button" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <path d="M2 10h20"/>
            </svg>
            <span>${t('payWithCrypto')}</span>
          </button>
          <p style="margin: 6px 0 0 0; font-size: 11px; color: #6b7280; text-align: center;">MetaMask, Coinbase, WalletConnect</p>
        </div>
        
        <!-- QR Code Option -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
          <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 500; color: #6b7280; text-align: center;">Or scan QR code</p>
          <img src="${data.qrCode.dataUrl}" alt="Payment QR Code" style="width: 100%; max-width: 200px; display: block; margin: 0 auto;" />
          <div data-testid="widget-payment-amount" style="margin-top: 12px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #0e7490;">$${widgetState.bookingDetails.total_usd}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${widgetState.bookingDetails.crypto_choice.toUpperCase()}</div>
          </div>
          <div style="margin-top: 12px; padding: 8px; background: #f3f4f6; border-radius: 6px; font-family: monospace; font-size: 11px; word-break: break-all;">${data.walletAddress}</div>
          <button data-testid="widget-payment-address-copy" onclick="navigator.clipboard.writeText('${data.walletAddress}'); alert('Address copied!');" style="width: 100%; margin-top: 8px; padding: 8px; background: #e5e7eb; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">Copy Address</button>
        </div>
        
        <div style="margin-top: 16px; padding: 12px; background: #dcfce7; border-radius: 6px; font-size: 12px; line-height: 1.6;">
          <strong>Booking Reference:</strong> ${data.bookingRef}<br/>
          Check your email for confirmation details.
        </div>
      </div>
    `;
    
    messagesContainer.appendChild(qrDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add Web3 wallet connection handler
    const web3PayBtn = document.getElementById('bitsy-web3-pay-btn');
    if (web3PayBtn) {
      web3PayBtn.onclick = () => initiateWeb3Payment(data);
    }
    
    addMessage('assistant', 'Thank you! Your booking has been submitted. Please choose your payment method above.');
  }
  
  // Web3 Payment Flow
  async function initiateWeb3Payment(bookingData) {
    try {
      // Check if MetaMask or any Web3 provider exists
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask or another Web3 wallet to use this payment method.\n\nAlternatively, you can use the QR code to pay from your mobile wallet.');
        return;
      }
      
      addMessage('assistant', 'Connecting to your wallet...');
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        addMessage('assistant', 'Wallet connection cancelled. Please use the QR code option instead.');
        return;
      }
      
      widgetState.web3.address = accounts[0];
      widgetState.web3.connected = true;
      
      // Get current chain
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      widgetState.web3.chainId = parseInt(chainId, 16);
      
      addMessage('assistant', `✅ Wallet connected: ${widgetState.web3.address.substring(0, 8)}...${widgetState.web3.address.substring(38)}`);
      
      // Show chain selector and payment button
      showWeb3PaymentUI(bookingData);
      
    } catch (error) {
      console.error('Web3 connection error:', error);
      addMessage('assistant', `Connection failed: ${error.message}. Please try the QR code option.`);
    }
  }
  
  function showWeb3PaymentUI(bookingData) {
    const messagesContainer = document.getElementById('bitsy-messages');
    const paymentUI = document.createElement('div');
    paymentUI.style.cssText = 'margin-bottom: 12px;';
    
    const chains = [
      { id: 1, name: 'Ethereum', symbol: 'ETH' },
      { id: 137, name: 'Polygon', symbol: 'MATIC' },
      { id: 8453, name: 'Base', symbol: 'ETH' },
      { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
      { id: 10, name: 'Optimism', symbol: 'ETH' }
    ];
    
    const chainOptions = chains.map(c => 
      `<option value="${c.id}" ${c.id === widgetState.web3.chainId ? 'selected' : ''}>${c.name} (${c.symbol})</option>`
    ).join('');
    
    paymentUI.innerHTML = `
      <div style="background: #f9fafb; border: 2px solid #10b981; padding: 16px; border-radius: 12px;">
        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #374151;">Select Chain:</label>
          <select id="bitsy-chain-select" data-testid="widget-chain-selector" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; cursor: pointer;">
            ${chainOptions}
          </select>
        </div>
        
        <div style="margin-bottom: 12px; padding: 12px; background: white; border-radius: 8px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Amount to Pay:</div>
          <div style="font-size: 20px; font-weight: 700; color: #0e7490;">$${widgetState.bookingDetails.total_usd}</div>
        </div>
        
        <button id="bitsy-send-payment-btn" data-testid="widget-send-payment-button" style="width: 100%; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">
          Send Payment
        </button>
      </div>
    `;
    
    messagesContainer.appendChild(paymentUI);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add event listeners
    document.getElementById('bitsy-chain-select').onchange = async (e) => {
      await switchChain(parseInt(e.target.value));
    };
    
    document.getElementById('bitsy-send-payment-btn').onclick = async () => {
      await sendWeb3Payment(bookingData);
    };
  }
  
  async function switchChain(targetChainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }]
      });
      
      widgetState.web3.chainId = targetChainId;
      addMessage('assistant', `✅ Switched to chain ${targetChainId}`);
    } catch (error) {
      if (error.code === 4902) {
        addMessage('assistant', `Please add this network to your wallet first.`);
      } else {
        console.error('Chain switch error:', error);
        addMessage('assistant', `Chain switch failed: ${error.message}`);
      }
    }
  }
  
  async function sendWeb3Payment(bookingData) {
    try {
      const payBtn = document.getElementById('bitsy-send-payment-btn');
      payBtn.disabled = true;
      payBtn.textContent = 'Processing...';
      
      addMessage('assistant', 'Please sign the transaction in your wallet...');
      
      // Create payment message
      const paymentMessage = JSON.stringify({
        action: 'booking_payment',
        hotelId: HOTEL_ID,
        bookingRef: bookingData.bookingRef,
        amount: widgetState.bookingDetails.total_usd,
        wallet: widgetState.web3.address,
        chainId: widgetState.web3.chainId,
        timestamp: Math.floor(Date.now() / 1000)
      });
      
      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [paymentMessage, widgetState.web3.address]
      });
      
      addMessage('assistant', 'Verifying payment on blockchain...');
      
      // Verify signature with backend
      const verifyResponse = await fetch(`${API_URL}/api/${HOTEL_ID}/verify-web3-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature: signature,
          message: paymentMessage,
          walletAddress: widgetState.web3.address,
          chainId: widgetState.web3.chainId,
          bookingRef: bookingData.bookingRef
        })
      });
      
      const verifyData = await verifyResponse.json();
      
      if (verifyData.success) {
        addMessage('assistant', `🎉 Payment verified successfully on ${verifyData.chainName}! Your booking is confirmed. Confirmation sent to ${widgetState.bookingDetails.guest_email}`);
        payBtn.textContent = '✅ Payment Confirmed';
        payBtn.style.background = '#10b981';
      } else {
        throw new Error(verifyData.error || 'Verification failed');
      }
      
    } catch (error) {
      console.error('Web3 payment error:', error);
      addMessage('assistant', `Payment failed: ${error.message}. Please try the QR code option instead.`);
      
      const payBtn = document.getElementById('bitsy-send-payment-btn');
      if (payBtn) {
        payBtn.disabled = false;
        payBtn.textContent = 'Retry Payment';
      }
    }
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
