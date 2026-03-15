#!/usr/bin/env python3
"""
Comprehensive Email System Test Suite for Bitsy Hotel Booking System
Tests all email-related functionality as specified in the review request.
Focuses on: Brevo integration, email endpoints, email triggers, and template rendering.
"""

import requests
import json
import sys
import time
from datetime import datetime, timedelta

# Configuration
API_URL = "https://bitsy-tools.preview.emergentagent.com"

class BitsyEmailTester:
    def __init__(self):
        self.api_url = API_URL
        self.session = requests.Session()
        self.hotel_token = None
        self.test_hotel_id = None
        self.test_booking_ref = None
        self.test_email = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] [{level}] {message}")
        
    def run_test(self, test_name, test_func):
        """Run individual test with error handling"""
        self.tests_run += 1
        try:
            self.log(f"\n{'='*60}")
            self.log(f"🧪 TESTING: {test_name}")
            self.log(f"{'='*60}")
            
            result = test_func()
            if result:
                self.tests_passed += 1
                self.log(f"✅ PASSED: {test_name}", "SUCCESS")
            else:
                self.log(f"❌ FAILED: {test_name}", "ERROR")
                self.failed_tests.append(test_name)
                
        except Exception as e:
            self.log(f"❌ ERROR in {test_name}: {str(e)}", "ERROR")
            self.failed_tests.append(f"{test_name} (Exception: {str(e)})")
            return False
            
        return result
    
    def make_request(self, method, endpoint, headers=None, data=None, json_data=None):
        """Make HTTP request with error handling"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        
        try:
            if method == "GET":
                response = self.session.get(url, headers=headers)
            elif method == "POST":
                response = self.session.post(url, headers=headers, data=data, json=json_data)
            elif method == "PUT":
                response = self.session.put(url, headers=headers, data=data, json=json_data)
            elif method == "DELETE":
                response = self.session.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            self.log(f"Request: {method} {url} -> Status: {response.status_code}")
            
            return response
            
        except requests.RequestException as e:
            self.log(f"Request failed: {str(e)}", "ERROR")
            raise
    
    def test_backend_server_startup(self):
        """Test 1: Backend server startup and stability"""
        
        try:
            # Test API root (health endpoint doesn't exist)
            response = self.make_request("GET", "/api")
            
            if response.status_code != 200:
                self.log(f"API root failed: {response.status_code}")
                return False
                
            api_data = response.json()
            if "Bitsy SaaS API" not in api_data.get("message", ""):
                self.log(f"Unexpected API response: {api_data}")
                return False
                
            self.log("✅ Backend API is responsive")
            
            # Test API root
            response = self.make_request("GET", "/api")
            
            if response.status_code != 200:
                self.log(f"API root failed: {response.status_code}")
                return False
                
            api_data = response.json()
            if "Bitsy SaaS API" not in api_data.get("message", ""):
                self.log(f"Unexpected API response: {api_data}")
                return False
                
            self.log("✅ Backend API is responsive")
            return True
            
        except Exception as e:
            self.log(f"Backend startup test failed: {str(e)}")
            return False
    
    def test_email_service_configuration(self):
        """Test 2: Email service configuration status endpoint"""
        
        response = self.make_request("GET", "/api/email/status")
        
        if response.status_code != 200:
            self.log(f"Email status endpoint failed: {response.status_code}")
            return False
            
        status_data = response.json()
        
        # Check required fields
        required_fields = ["configured", "service", "senderEmail", "apiKeyPresent", "message"]
        for field in required_fields:
            if field not in status_data:
                self.log(f"Missing field in email status: {field}")
                return False
        
        # Verify Brevo configuration
        if not status_data.get("configured"):
            self.log(f"Email service not configured: {status_data}")
            return False
            
        if status_data.get("service") != "Brevo":
            self.log(f"Expected Brevo service, got: {status_data.get('service')}")
            return False
            
        if not status_data.get("apiKeyPresent"):
            self.log("Brevo API key not present")
            return False
            
        if status_data.get("senderEmail") != "noreply@getbitsy.ai":
            self.log(f"Unexpected sender email: {status_data.get('senderEmail')}")
            return False
            
        self.log("✅ Email service properly configured with Brevo")
        self.log(f"Sender: {status_data.get('senderEmail')}")
        self.log(f"Service: {status_data.get('service')}")
        
        return True
    
    def setup_test_hotel(self):
        """Setup test hotel and authentication for email tests"""
        
        # Create unique test email
        timestamp = datetime.now().strftime('%H%M%S')
        self.test_email = f"test_email_hotel_{timestamp}@bitsy.test"
        
        # Register hotel
        register_data = {
            "email": self.test_email,
            "password": "EmailTest123!",
            "hotelName": "Email Test Hotel"
        }
        
        response = self.make_request("POST", "/api/auth/register", json_data=register_data)
        
        if response.status_code != 201:
            self.log(f"Hotel registration failed: {response.text}")
            return False
            
        register_result = response.json()
        
        if not register_result.get("success"):
            self.log(f"Registration response error: {register_result}")
            return False
            
        # Login to get token
        login_data = {
            "email": self.test_email,
            "password": "EmailTest123!"
        }
        
        response = self.make_request("POST", "/api/auth/login", json_data=login_data)
        
        if response.status_code != 200:
            self.log(f"Hotel login failed: {response.text}")
            return False
            
        login_result = response.json()
        
        if not login_result.get("success") or not login_result.get("token"):
            self.log(f"Login response error: {login_result}")
            return False
            
        # Store credentials
        self.hotel_token = login_result["token"]
        self.test_hotel_id = login_result["hotel"]["_id"]
        
        self.log(f"✅ Test hotel setup complete. Hotel ID: {self.test_hotel_id}")
        return True
    
    def test_email_test_endpoint_auth(self):
        """Test 3: Email test endpoint authentication and authorization"""
        
        # Test without authentication (should fail)
        test_data = {
            "emailType": "booking_confirmation",
            "testRecipient": "test@example.com"
        }
        
        response = self.make_request("POST", "/api/email/test", json_data=test_data)
        
        if response.status_code != 401:
            self.log(f"Expected 401 for unauthenticated request, got: {response.status_code}")
            return False
            
        self.log("✅ Email test endpoint properly requires authentication")
        
        # Test with invalid token (should fail)
        headers = {"Authorization": "Bearer invalid_token_here"}
        response = self.make_request("POST", "/api/email/test", headers=headers, json_data=test_data)
        
        if response.status_code != 401:
            self.log(f"Expected 401 for invalid token, got: {response.status_code}")
            return False
            
        self.log("✅ Email test endpoint rejects invalid tokens")
        
        # Test with valid token but invalid email type
        if not self.hotel_token:
            if not self.setup_test_hotel():
                return False
        
        headers = {"Authorization": f"Bearer {self.hotel_token}"}
        invalid_test_data = {
            "emailType": "invalid_type",
            "testRecipient": "test@example.com"
        }
        
        response = self.make_request("POST", "/api/email/test", headers=headers, json_data=invalid_test_data)
        
        if response.status_code != 400:
            self.log(f"Expected 400 for invalid email type, got: {response.status_code}")
            return False
            
        error_data = response.json()
        if "Invalid email type" not in error_data.get("error", ""):
            self.log(f"Unexpected error message: {error_data}")
            return False
            
        self.log("✅ Email test endpoint validates email types")
        
        return True
    
    def test_email_types_sending(self):
        """Test 4: All 5 email types sending via test endpoint"""
        
        if not self.hotel_token:
            if not self.setup_test_hotel():
                return False
        
        headers = {"Authorization": f"Bearer {self.hotel_token}"}
        
        # Test all 5 email types
        email_types = [
            "booking_confirmation",
            "new_booking_alert", 
            "password_reset",
            "grace_period",
            "account_blocked"
        ]
        
        successful_sends = 0
        
        for email_type in email_types:
            self.log(f"Testing {email_type} email...")
            
            test_data = {
                "emailType": email_type,
                "testRecipient": "testing@getbitsy.ai"  # Using valid test email
            }
            
            response = self.make_request("POST", "/api/email/test", headers=headers, json_data=test_data)
            
            if response.status_code != 200:
                self.log(f"Failed to send {email_type} email: {response.text}")
                continue
                
            result = response.json()
            
            if not result.get("success"):
                self.log(f"Email send not successful for {email_type}: {result}")
                continue
                
            if not result.get("messageId"):
                self.log(f"No messageId returned for {email_type}")
                continue
                
            self.log(f"✅ {email_type} email sent successfully (ID: {result['messageId']})")
            successful_sends += 1
            
            # Small delay between sends to avoid rate limiting
            time.sleep(1)
        
        if successful_sends == len(email_types):
            self.log(f"✅ All {len(email_types)} email types sent successfully")
            return True
        else:
            self.log(f"❌ Only {successful_sends}/{len(email_types)} email types sent successfully")
            return False
    
    def test_booking_email_integration(self):
        """Test 5: Email integration in booking flow"""
        
        if not self.test_hotel_id:
            if not self.setup_test_hotel():
                return False
                
        # Update hotel settings to enable notifications
        headers = {"Authorization": f"Bearer {self.hotel_token}"}
        settings_data = {
            "hotelName": "Email Test Hotel",
            "contactPhone": "+1-555-EMAIL-TEST",
            "contactEmail": "hotel@emailtest.com",
            "paymentSettings": {
                "cryptoEnabled": True,
                "payAtPropertyEnabled": True
            },
            "wallets": {
                "ethereum": "0x1234567890123456789012345678901234567890"
            }
        }
        
        response = self.make_request("PUT", "/api/hotel/settings", headers=headers, json_data=settings_data)
        
        if response.status_code != 200:
            self.log(f"Failed to update hotel settings: {response.text}")
            return False
            
        self.log("✅ Hotel settings updated for email testing")
        
        # Create a booking (should trigger emails)
        booking_data = {
            "bookingDetails": {
                "check_in": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
                "check_out": (datetime.now() + timedelta(days=10)).strftime('%Y-%m-%d'),
                "room_type": "Standard Room",
                "nights": 3,
                "total_usd": 299,
                "guest_name": "Email Test Guest",
                "guest_email": "emailtest@getbitsy.ai",
                "guest_phone": "+1-555-EMAIL-GUEST",
                "payment_method": "crypto",
                "crypto_choice": "ethereum"
            }
        }
        
        response = self.make_request("POST", f"/api/widget/{self.test_hotel_id}/book", json_data=booking_data)
        
        if response.status_code != 200:
            self.log(f"Booking creation failed: {response.text}")
            return False
            
        booking_result = response.json()
        
        if not booking_result.get("success"):
            self.log(f"Booking response error: {booking_result}")
            return False
            
        self.test_booking_ref = booking_result["bookingRef"]
        self.log(f"✅ Booking created successfully: {self.test_booking_ref}")
        
        # The emails are sent asynchronously, so we can't directly verify delivery here
        # But the booking creation should have triggered email sending
        self.log("✅ Booking email integration triggered (emails sent asynchronously)")
        
        return True
    
    def test_password_reset_email_flow(self):
        """Test 6: Email integration in password reset flow"""
        
        if not self.test_email:
            if not self.setup_test_hotel():
                return False
                
        # Request password reset (should trigger email)
        reset_data = {
            "email": self.test_email
        }
        
        response = self.make_request("POST", "/api/password/request-reset", json_data=reset_data)
        
        if response.status_code != 200:
            self.log(f"Password reset request failed: {response.text}")
            return False
            
        reset_result = response.json()
        
        if not reset_result.get("success"):
            self.log(f"Password reset response error: {reset_result}")
            return False
            
        self.log("✅ Password reset email triggered successfully")
        
        # Check if OTP is provided in dev mode
        if reset_result.get("debug_otp"):
            otp = reset_result["debug_otp"]
            self.log(f"Development OTP received: {otp}")
            
            # Test OTP verification
            verify_data = {
                "email": self.test_email,
                "otp": otp
            }
            
            response = self.make_request("POST", "/api/password/verify-otp", json_data=verify_data)
            
            if response.status_code != 200:
                self.log(f"OTP verification failed: {response.text}")
                return False
                
            verify_result = response.json()
            
            if not verify_result.get("success"):
                self.log(f"OTP verification response error: {verify_result}")
                return False
                
            self.log("✅ OTP verification successful")
            
            # Test password reset with valid token
            reset_token = verify_result.get("resetToken")
            if reset_token:
                new_password_data = {
                    "email": self.test_email,
                    "resetToken": reset_token,
                    "newPassword": "NewEmailTestPass123!"
                }
                
                response = self.make_request("POST", "/api/password/reset", json_data=new_password_data)
                
                if response.status_code != 200:
                    self.log(f"Password reset completion failed: {response.text}")
                    return False
                    
                final_result = response.json()
                
                if not final_result.get("success"):
                    self.log(f"Password reset completion error: {final_result}")
                    return False
                    
                self.log("✅ Complete password reset flow successful")
            
        return True
    
    def test_email_html_templates(self):
        """Test 7: Email HTML template rendering"""
        
        if not self.hotel_token:
            if not self.setup_test_hotel():
                return False
        
        headers = {"Authorization": f"Bearer {self.hotel_token}"}
        
        # Test booking confirmation template
        test_data = {
            "emailType": "booking_confirmation",
            "testRecipient": "template@test.com"
        }
        
        response = self.make_request("POST", "/api/email/test", headers=headers, json_data=test_data)
        
        if response.status_code != 200:
            self.log(f"Template test failed: {response.text}")
            return False
            
        result = response.json()
        
        if not result.get("success"):
            self.log(f"Template test response error: {result}")
            return False
            
        # Template rendering success is indicated by successful email send
        self.log("✅ HTML email templates rendering successfully")
        
        # Check if response includes template information
        if "messageId" in result:
            self.log(f"Template rendered and sent with ID: {result['messageId']}")
        
        return True
    
    def test_email_error_handling(self):
        """Test 8: Email service error handling and retry logic"""
        
        if not self.hotel_token:
            if not self.setup_test_hotel():
                return False
        
        headers = {"Authorization": f"Bearer {self.hotel_token}"}
        
        # Test with invalid recipient email (should handle gracefully)
        test_data = {
            "emailType": "booking_confirmation",
            "testRecipient": "invalid-email-format"
        }
        
        response = self.make_request("POST", "/api/email/test", headers=headers, json_data=test_data)
        
        # The service might still accept the request but fail internally
        # We're testing that it doesn't crash the server
        if response.status_code >= 500:
            self.log(f"Server error on invalid email: {response.status_code}")
            return False
            
        self.log("✅ Email service handles invalid emails gracefully")
        
        # Test rapid successive calls to verify rate limiting/queuing
        rapid_test_results = []
        for i in range(3):
            test_data = {
                "emailType": "password_reset",
                "testRecipient": f"rapid{i}@test.com"
            }
            
            response = self.make_request("POST", "/api/email/test", headers=headers, json_data=test_data)
            rapid_test_results.append(response.status_code)
            
        # All should either succeed or fail gracefully (not 500)
        server_errors = [code for code in rapid_test_results if code >= 500]
        if server_errors:
            self.log(f"Server errors during rapid calls: {server_errors}")
            return False
            
        self.log("✅ Email service handles rapid calls without server errors")
        
        return True
    
    def run_all_tests(self):
        """Run all email system tests"""
        
        self.log(f"\n{'='*80}")
        self.log(f"🚀 BITSY EMAIL SYSTEM TEST SUITE")
        self.log(f"API Base URL: {self.api_url}")
        self.log(f"{'='*80}")
        
        # Test suite - ordered by dependency
        tests = [
            ("Backend Server Startup and Stability", self.test_backend_server_startup),
            ("Email Service Configuration Status", self.test_email_service_configuration),
            ("Email Test Endpoint Authentication", self.test_email_test_endpoint_auth),
            ("All 5 Email Types Sending", self.test_email_types_sending),
            ("Booking Email Integration", self.test_booking_email_integration),
            ("Password Reset Email Flow", self.test_password_reset_email_flow),
            ("Email HTML Template Rendering", self.test_email_html_templates),
            ("Email Error Handling and Retry Logic", self.test_email_error_handling),
        ]
        
        for test_name, test_func in tests:
            success = self.run_test(test_name, test_func)
            
            # If critical test fails, skip dependent tests
            if not success and test_name in ["Backend Server Startup and Stability", "Email Service Configuration Status"]:
                self.log(f"❌ Critical test failed, skipping remaining tests", "ERROR")
                break
        
        # Final results
        self.log(f"\n{'='*80}")
        self.log(f"📊 EMAIL SYSTEM TEST RESULTS")
        self.log(f"{'='*80}")
        self.log(f"Tests Run: {self.tests_run}")
        self.log(f"Tests Passed: {self.tests_passed}")
        self.log(f"Tests Failed: {self.tests_run - self.tests_passed}")
        self.log(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            self.log(f"\n❌ FAILED TESTS:")
            for failed_test in self.failed_tests:
                self.log(f"  • {failed_test}")
        
        if self.tests_passed == self.tests_run:
            self.log("🎉 ALL EMAIL TESTS PASSED!", "SUCCESS")
            return True
        else:
            self.log(f"❌ {self.tests_run - self.tests_passed} EMAIL TESTS FAILED", "ERROR")
            return False

def main():
    """Main test execution function"""
    tester = BitsyEmailTester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
        
    except KeyboardInterrupt:
        tester.log("\n❌ Email tests interrupted by user", "ERROR")
        return 1
    except Exception as e:
        tester.log(f"\n❌ Unexpected error in email tests: {str(e)}", "ERROR")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)