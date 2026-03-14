#!/usr/bin/env python3
"""
Bitsy SaaS - Core POC Test Script
Tests all critical functionalities before building the full application:
1. OpenAI conversation flow for booking extraction
2. Non-refundable policy acknowledgment
3. QR code generation for crypto payments
4. Notification system (console + Telegram)
"""

import asyncio
import os
import sys
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import qrcode
from io import BytesIO
import base64

# Load environment variables
load_dotenv('/app/backend/.env')

# Add backend to path for emergentintegrations
sys.path.insert(0, '/app/backend')

from emergentintegrations.llm.chat import LlmChat, UserMessage

# Configuration
EMERGENT_LLM_KEY = "sk-emergent-27d7167Cb35D3AdC5E"

# Mock hotel configuration for testing
HOTEL_CONFIG = {
    "hotel_name": "Beach Paradise Resort",
    "rooms": [
        {"type": "Single", "rate": 89.00, "description": "Cozy single room with city view"},
        {"type": "Double", "rate": 129.00, "description": "Spacious double room with ocean view"},
        {"type": "Suite", "rate": 249.00, "description": "Luxury suite with balcony"}
    ],
    "wallets": {
        "bitcoin": "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
        "ethereum": "0x742d35Cc6634C0532925a3b844Bc9e7595f42aE5",
        "polygon": "0x742d35Cc6634C0532925a3b844Bc9e7595f42aE5",
        "solana": "11111111111111111111111111111112",
        "tron": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
    },
    "telegram_bot_token": None,  # Will be set if user provides
    "telegram_chat_id": None
}

# System prompt for Bitsy AI
BITSY_SYSTEM_PROMPT = """You are Bitsy, a friendly AI booking assistant for {hotel_name}. 

Your job is to help guests book rooms using cryptocurrency payments. You must:

1. GREETING: Warmly greet guests and ask if they'd like to book a room
2. COLLECT INFORMATION in natural conversation:
   - Check-in date (format: YYYY-MM-DD)
   - Check-out date (format: YYYY-MM-DD)
   - Room preference (Single, Double, or Suite)
   - Guest name (full name)
   - Email address
   - Phone number
   - Preferred cryptocurrency (Bitcoin, Ethereum, Polygon USDC, Solana, or Tron USDT)

3. AVAILABLE ROOMS:
{rooms_info}

4. CONVERSATION STYLE:
   - Be friendly and conversational
   - Ask ONE question at a time
   - Validate dates (check-in must be today or later, check-out must be after check-in)
   - Calculate total: (check-out - check-in) * room_rate
   - Confirm all details before finalizing

5. NON-REFUNDABLE POLICY:
   - Before showing payment details, CLEARLY state: "Important: All crypto bookings are final and non-refundable. No cancellations or refunds are possible."
   - Ask: "Do you understand and accept this policy? (yes/no)"
   - Only proceed if guest explicitly says yes

6. FINAL STEP:
   Once all info is collected and policy accepted, provide structured JSON:
   {{
     "action": "generate_payment",
     "booking_details": {{
       "check_in": "YYYY-MM-DD",
       "check_out": "YYYY-MM-DD",
       "room_type": "Single|Double|Suite",
       "nights": <number>,
       "rate_per_night": <number>,
       "total_usd": <number>,
       "guest_name": "Full Name",
       "guest_email": "email@example.com",
       "guest_phone": "+1234567890",
       "crypto_choice": "bitcoin|ethereum|polygon|solana|tron",
       "policy_accepted": true
     }}
   }}

Current date: {current_date}

Be helpful, friendly, and ensure all information is collected accurately!
"""


class BitsyPOCTester:
    """POC tester for Bitsy's core functionality"""
    
    def __init__(self):
        self.test_results = []
        self.conversation_history = []
    
    def log_result(self, test_name, status, details=""):
        """Log test result"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        emoji = "✅" if status == "PASS" else "❌"
        print(f"\n{emoji} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")
    
    async def test_openai_conversation(self):
        """Test 1: OpenAI conversation flow for booking extraction"""
        print("\n" + "="*60)
        print("TEST 1: OpenAI Conversation Flow")
        print("="*60)
        
        try:
            # Prepare system prompt
            rooms_info = "\n".join([
                f"- {room['type']}: ${room['rate']}/night - {room['description']}"
                for room in HOTEL_CONFIG["rooms"]
            ])
            
            system_prompt = BITSY_SYSTEM_PROMPT.format(
                hotel_name=HOTEL_CONFIG["hotel_name"],
                rooms_info=rooms_info,
                current_date=datetime.now().strftime("%Y-%m-%d")
            )
            
            # Initialize chat
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"test-session-{datetime.now().timestamp()}",
                system_message=system_prompt
            ).with_model("openai", "gpt-5.2")
            
            # Simulate guest conversation
            guest_messages = [
                "Hi, I'd like to book a room",
                "I want to check in on 2026-04-15",
                "Check out on 2026-04-17",
                "I prefer a Double room",
                "My name is John Smith",
                "john.smith@email.com",
                "+1-555-123-4567",
                "I'll pay with Bitcoin",
                "Yes, I understand and accept the non-refundable policy"
            ]
            
            booking_data = None
            
            for i, message in enumerate(guest_messages):
                print(f"\n👤 Guest: {message}")
                self.conversation_history.append({"role": "guest", "message": message})
                
                user_msg = UserMessage(text=message)
                response = await chat.send_message(user_msg)
                
                print(f"🤖 Bitsy: {response}")
                self.conversation_history.append({"role": "bitsy", "message": response})
                
                # Check if response contains JSON booking data
                if "generate_payment" in response or "booking_details" in response:
                    try:
                        # Extract JSON from response
                        json_start = response.find("{")
                        json_end = response.rfind("}") + 1
                        if json_start != -1 and json_end > json_start:
                            json_str = response[json_start:json_end]
                            booking_data = json.loads(json_str)
                            print("\n📋 Booking data extracted:")
                            print(json.dumps(booking_data, indent=2))
                            break
                    except json.JSONDecodeError as e:
                        print(f"   Warning: Could not parse JSON: {e}")
                        continue
            
            # Validate booking extraction
            if booking_data and "booking_details" in booking_data:
                details = booking_data["booking_details"]
                required_fields = [
                    "check_in", "check_out", "room_type", "nights", 
                    "total_usd", "guest_name", "guest_email", "guest_phone",
                    "crypto_choice", "policy_accepted"
                ]
                
                missing_fields = [f for f in required_fields if f not in details]
                
                if not missing_fields and details.get("policy_accepted") == True:
                    self.log_result(
                        "OpenAI Conversation Flow",
                        "PASS",
                        f"Successfully extracted all booking details. Total: ${details['total_usd']}"
                    )
                    return details
                else:
                    self.log_result(
                        "OpenAI Conversation Flow",
                        "FAIL",
                        f"Missing fields: {missing_fields}" if missing_fields else "Policy not accepted"
                    )
                    return None
            else:
                self.log_result(
                    "OpenAI Conversation Flow",
                    "FAIL",
                    "Could not extract booking data from conversation"
                )
                return None
                
        except Exception as e:
            self.log_result("OpenAI Conversation Flow", "FAIL", str(e))
            return None
    
    def test_qr_generation(self, booking_details):
        """Test 2: QR code generation for crypto payments"""
        print("\n" + "="*60)
        print("TEST 2: QR Code Generation")
        print("="*60)
        
        if not booking_details:
            self.log_result("QR Code Generation", "SKIP", "No booking details available")
            return None
        
        try:
            crypto_choice = booking_details.get("crypto_choice", "bitcoin").lower()
            wallet_address = HOTEL_CONFIG["wallets"].get(crypto_choice)
            
            if not wallet_address:
                self.log_result("QR Code Generation", "FAIL", f"No wallet for {crypto_choice}")
                return None
            
            # Generate payment URI
            amount = booking_details.get("total_usd")
            
            if crypto_choice == "bitcoin":
                payment_uri = f"bitcoin:{wallet_address}?amount={amount}"
            elif crypto_choice in ["ethereum", "polygon"]:
                payment_uri = f"ethereum:{wallet_address}?value={amount}"
            elif crypto_choice == "solana":
                payment_uri = f"solana:{wallet_address}?amount={amount}"
            elif crypto_choice == "tron":
                payment_uri = f"tron:{wallet_address}?amount={amount}"
            else:
                payment_uri = wallet_address
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_H,
                box_size=10,
                border=2,
            )
            qr.add_data(payment_uri)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            img_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            print(f"\n💳 Payment QR Code Generated:")
            print(f"   Crypto: {crypto_choice.upper()}")
            print(f"   Wallet: {wallet_address}")
            print(f"   Amount: ${amount} USD")
            print(f"   URI: {payment_uri}")
            print(f"   QR Data (base64): {img_base64[:50]}...")
            
            self.log_result(
                "QR Code Generation",
                "PASS",
                f"Generated QR for {crypto_choice} payment of ${amount}"
            )
            
            return {
                "crypto": crypto_choice,
                "wallet": wallet_address,
                "amount": amount,
                "uri": payment_uri,
                "qr_base64": f"data:image/png;base64,{img_base64}"
            }
            
        except Exception as e:
            self.log_result("QR Code Generation", "FAIL", str(e))
            return None
    
    def test_notification_system(self, booking_details):
        """Test 3: Notification system (console + Telegram)"""
        print("\n" + "="*60)
        print("TEST 3: Notification System")
        print("="*60)
        
        if not booking_details:
            self.log_result("Notification System", "SKIP", "No booking details available")
            return False
        
        try:
            # Generate booking reference
            booking_ref = f"BIT-{datetime.now().strftime('%Y%m%d')}-{datetime.now().timestamp() % 10000:.0f}"
            
            # Format console notification
            console_notification = f"""
{'='*60}
🔔 NEW BITSY BOOKING
{'='*60}

📋 Reference: {booking_ref}
🏨 Hotel: {HOTEL_CONFIG['hotel_name']}

👤 Guest Details:
   Name: {booking_details.get('guest_name')}
   Email: {booking_details.get('guest_email')}
   Phone: {booking_details.get('guest_phone')}

📅 Booking Details:
   Check-in: {booking_details.get('check_in')}
   Check-out: {booking_details.get('check_out')}
   Room Type: {booking_details.get('room_type')}
   Nights: {booking_details.get('nights')}
   Rate: ${booking_details.get('rate_per_night', 0)}/night

💰 Payment:
   Total: ${booking_details.get('total_usd')}
   Crypto: {booking_details.get('crypto_choice', '').upper()}
   Status: Guest confirmed payment sent

⚠️  IMPORTANT: Verify payment in your {booking_details.get('crypto_choice', '').upper()} wallet

{'='*60}
            """
            
            print(console_notification)
            
            # Format Telegram notification
            telegram_message = f"""🔔 NEW BITSY BOOKING

📋 Ref: {booking_ref}
👤 {booking_details.get('guest_name')}
📱 {booking_details.get('guest_phone')}
📅 {booking_details.get('check_in')} to {booking_details.get('check_out')} ({booking_details.get('nights')} nights)
🛏️ {booking_details.get('room_type')} Room
💰 ${booking_details.get('total_usd')} {booking_details.get('crypto_choice', '').upper()}

⚠️ Verify payment in wallet"""
            
            print("\n📱 Telegram Message Format:")
            print(telegram_message)
            
            # Test Telegram sending (if configured)
            telegram_sent = False
            if HOTEL_CONFIG.get("telegram_bot_token") and HOTEL_CONFIG.get("telegram_chat_id"):
                try:
                    import httpx
                    url = f"https://api.telegram.org/bot{HOTEL_CONFIG['telegram_bot_token']}/sendMessage"
                    payload = {
                        "chat_id": HOTEL_CONFIG["telegram_chat_id"],
                        "text": telegram_message,
                        "parse_mode": "HTML"
                    }
                    response = httpx.post(url, json=payload, timeout=10)
                    if response.status_code == 200:
                        telegram_sent = True
                        print("\n✅ Telegram notification sent successfully!")
                    else:
                        print(f"\n⚠️  Telegram send failed: {response.status_code}")
                except Exception as e:
                    print(f"\n⚠️  Telegram error: {e}")
            else:
                print("\n⚠️  Telegram not configured (will be configurable in dashboard)")
            
            self.log_result(
                "Notification System",
                "PASS",
                f"Console notification formatted. Telegram: {'sent' if telegram_sent else 'not configured'}"
            )
            
            return True
            
        except Exception as e:
            self.log_result("Notification System", "FAIL", str(e))
            return False
    
    def test_non_refundable_policy(self):
        """Test 4: Non-refundable policy enforcement"""
        print("\n" + "="*60)
        print("TEST 4: Non-Refundable Policy Enforcement")
        print("="*60)
        
        try:
            # Check if policy was acknowledged in conversation
            policy_mentioned = False
            policy_accepted = False
            
            for entry in self.conversation_history:
                if entry["role"] == "bitsy":
                    if "non-refundable" in entry["message"].lower() or "no refund" in entry["message"].lower():
                        policy_mentioned = True
                        print("✅ Policy warning found in conversation")
                        break
            
            # Check final booking data
            if self.test_results:
                for result in self.test_results:
                    if result["test"] == "OpenAI Conversation Flow" and result["status"] == "PASS":
                        policy_accepted = True
                        print("✅ Policy acceptance confirmed in booking data")
                        break
            
            if policy_mentioned and policy_accepted:
                self.log_result(
                    "Non-Refundable Policy",
                    "PASS",
                    "Policy was clearly communicated and accepted"
                )
                return True
            else:
                missing = []
                if not policy_mentioned:
                    missing.append("policy not mentioned")
                if not policy_accepted:
                    missing.append("policy not accepted")
                
                self.log_result(
                    "Non-Refundable Policy",
                    "FAIL",
                    f"Issues: {', '.join(missing)}"
                )
                return False
                
        except Exception as e:
            self.log_result("Non-Refundable Policy", "FAIL", str(e))
            return False
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("POC TEST SUMMARY")
        print("="*60)
        
        total = len(self.test_results)
        passed = sum(1 for r in self.test_results if r["status"] == "PASS")
        failed = sum(1 for r in self.test_results if r["status"] == "FAIL")
        skipped = sum(1 for r in self.test_results if r["status"] == "SKIP")
        
        print(f"\nTotal Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⏭️  Skipped: {skipped}")
        
        print("\nDetailed Results:")
        for result in self.test_results:
            emoji = "✅" if result["status"] == "PASS" else "❌" if result["status"] == "FAIL" else "⏭️"
            print(f"{emoji} {result['test']}: {result['status']}")
            if result["details"]:
                print(f"   {result['details']}")
        
        success_rate = (passed / total * 100) if total > 0 else 0
        print(f"\n📊 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 75:
            print("\n🎉 POC SUCCESSFUL! Ready to build the full application.")
            return True
        else:
            print("\n⚠️  POC NEEDS IMPROVEMENT. Please fix failing tests before proceeding.")
            return False


async def main():
    """Run all POC tests"""
    print("="*60)
    print("BITSY SAAS - CORE POC TEST")
    print("="*60)
    print(f"Testing critical functionality before building full application")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tester = BitsyPOCTester()
    
    # Test 1: OpenAI Conversation Flow
    booking_details = await tester.test_openai_conversation()
    
    # Test 2: QR Code Generation
    qr_data = tester.test_qr_generation(booking_details)
    
    # Test 3: Notification System
    tester.test_notification_system(booking_details)
    
    # Test 4: Non-Refundable Policy
    tester.test_non_refundable_policy()
    
    # Print summary
    success = tester.print_summary()
    
    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    return success


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
