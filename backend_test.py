#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite for Bitsy Hotel Booking System
Tests all API endpoints and functionality as specified in the review request.
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Configuration
API_URL = "https://bitsy-tools.preview.emergentagent.com"

class BitsyAPITester:
    def __init__(self):
        self.api_url = API_URL
        self.session = requests.Session()
        self.hotel_token = None
        self.test_hotel_id = None
        self.test_booking_ref = None
        self.tests_run = 0
        self.tests_passed = 0
        
    def log(self, message, level="INFO"):
        print(f"[{level}] {message}")
        
    def run_test(self, test_name, test_func):
        """Run individual test with error handling"""
        self.tests_run += 1
        try:
            self.log(f"\n{'='*50}")
            self.log(f"🧪 TESTING: {test_name}")
            self.log(f"{'='*50}")
            
            result = test_func()
            if result:
                self.tests_passed += 1
                self.log(f"✅ PASSED: {test_name}", "SUCCESS")
            else:
                self.log(f"❌ FAILED: {test_name}", "ERROR")
                
        except Exception as e:
            self.log(f"❌ ERROR in {test_name}: {str(e)}", "ERROR")
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
    
    def test_hotel_registration_and_auth(self):
        """Test hotel registration and authentication"""
        
        # Test registration
        test_email = f"test_hotel_{datetime.now().strftime('%H%M%S')}@bitsy.test"
        register_data = {
            "email": test_email,
            "password": "TestPassword123!",
            "hotelName": "Test Hotel API"
        }
        
        response = self.make_request("POST", "/api/auth/register", json_data=register_data)
        
        if response.status_code != 201:
            self.log(f"Registration failed: {response.text}")
            return False
            
        register_result = response.json()
        
        if not register_result.get("success"):
            self.log(f"Registration response error: {register_result}")
            return False
            
        self.log("✅ Hotel registration successful")
        
        # Test login
        login_data = {
            "email": test_email,
            "password": "TestPassword123!"
        }
        
        response = self.make_request("POST", "/api/auth/login", json_data=login_data)
        
        if response.status_code != 200:
            self.log(f"Login failed: {response.text}")
            return False
            
        login_result = response.json()
        
        if not login_result.get("success") or not login_result.get("token"):
            self.log(f"Login response error: {login_result}")
            return False
            
        # Store token and hotel ID for subsequent tests
        self.hotel_token = login_result["token"]
        self.test_hotel_id = login_result["hotel"]["_id"]
        
        self.log("✅ Hotel login successful")
        self.log(f"Hotel ID: {self.test_hotel_id}")
        
        return True
    
    def test_hotel_settings_update(self):
        """Test updating hotel settings including payment settings"""
        
        if not self.hotel_token:
            self.log("No hotel token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.hotel_token}", "Content-Type": "application/json"}
        
        # Test updating payment settings
        settings_data = {
            "hotelName": "Updated Test Hotel",
            "contactPhone": "+1-555-123-4567",
            "contactEmail": "contact@testhotel.com",
            "paymentSettings": {
                "cryptoEnabled": True,
                "payAtPropertyEnabled": True
            }
        }
        
        response = self.make_request("PUT", "/api/hotel/settings", headers=headers, json_data=settings_data)
        
        if response.status_code != 200:
            self.log(f"Settings update failed: {response.text}")
            return False
            
        result = response.json()
        
        if not result.get("success"):
            self.log(f"Settings update response error: {result}")
            return False
            
        # Verify payment settings were saved
        updated_settings = result.get("settings", {})
        payment_settings = updated_settings.get("paymentSettings", {})
        
        if not (payment_settings.get("cryptoEnabled") and payment_settings.get("payAtPropertyEnabled")):
            self.log(f"Payment settings not saved correctly: {payment_settings}")
            return False
            
        self.log("✅ Payment settings updated successfully")
        self.log(f"Crypto enabled: {payment_settings['cryptoEnabled']}")
        self.log(f"Pay at property enabled: {payment_settings['payAtPropertyEnabled']}")
        
        return True
    
    def test_widget_booking_flow(self):
        """Test widget booking with both payment methods"""
        
        if not self.test_hotel_id:
            self.log("No hotel ID available")
            return False
            
        # Test crypto booking
        crypto_booking_data = {
            "bookingDetails": {
                "check_in": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
                "check_out": (datetime.now() + timedelta(days=10)).strftime('%Y-%m-%d'),
                "room_type": "Standard Room",
                "nights": 3,
                "total_usd": 299,
                "guest_name": "Test Guest Crypto",
                "guest_email": "testguest@crypto.com",
                "guest_phone": "+1-555-987-6543",
                "payment_method": "crypto",
                "crypto_choice": "ethereum"
            }
        }
        
        response = self.make_request("POST", f"/api/widget/{self.test_hotel_id}/book", json_data=crypto_booking_data)
        
        if response.status_code != 200:
            self.log(f"Crypto booking failed: {response.text}")
            return False
            
        crypto_result = response.json()
        
        if not crypto_result.get("success"):
            self.log(f"Crypto booking response error: {crypto_result}")
            return False
            
        self.log("✅ Crypto booking created successfully")
        self.log(f"Booking ref: {crypto_result['bookingRef']}")
        
        # Test pay-at-property booking
        property_booking_data = {
            "bookingDetails": {
                "check_in": (datetime.now() + timedelta(days=14)).strftime('%Y-%m-%d'),
                "check_out": (datetime.now() + timedelta(days=17)).strftime('%Y-%m-%d'),
                "room_type": "Standard Room",
                "nights": 3,
                "total_usd": 299,
                "guest_name": "Test Guest Property",
                "guest_email": "testguest@property.com",
                "guest_phone": "+1-555-876-5432",
                "payment_method": "pay_at_property"
            }
        }
        
        response = self.make_request("POST", f"/api/widget/{self.test_hotel_id}/book", json_data=property_booking_data)
        
        if response.status_code != 200:
            self.log(f"Pay-at-property booking failed: {response.text}")
            return False
            
        property_result = response.json()
        
        if not property_result.get("success"):
            self.log(f"Pay-at-property booking response error: {property_result}")
            return False
            
        self.test_booking_ref = property_result["bookingRef"]
        self.log("✅ Pay-at-property booking created successfully")
        self.log(f"Booking ref: {property_result['bookingRef']}")
        
        return True
    
    def test_hotel_bookings_api(self):
        """Test hotel bookings management APIs"""
        
        if not self.hotel_token:
            self.log("No hotel token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.hotel_token}"}
        
        # Test get all bookings
        response = self.make_request("GET", "/api/bookings", headers=headers)
        
        if response.status_code != 200:
            self.log(f"Get bookings failed: {response.text}")
            return False
            
        bookings_result = response.json()
        
        if not bookings_result.get("success"):
            self.log(f"Get bookings response error: {bookings_result}")
            return False
            
        bookings = bookings_result.get("bookings", [])
        self.log(f"✅ Retrieved {len(bookings)} bookings")
        
        # Find a pending confirmation booking for testing
        pending_booking = None
        for booking in bookings:
            if booking.get("status") == "pending_confirmation":
                pending_booking = booking
                break
        
        if pending_booking:
            booking_ref = pending_booking["bookingRef"]
            
            # Test confirm booking
            response = self.make_request("POST", f"/api/bookings/{booking_ref}/confirm", headers=headers)
            
            if response.status_code == 200:
                confirm_result = response.json()
                if confirm_result.get("success"):
                    self.log(f"✅ Booking {booking_ref} confirmed successfully")
                else:
                    self.log(f"Confirm booking response error: {confirm_result}")
                    return False
            else:
                self.log(f"Confirm booking failed: {response.text}")
                return False
        else:
            self.log("No pending bookings found for testing confirmation")
            
        return True
    
    def test_guest_dashboard_apis(self):
        """Test guest dashboard APIs"""
        
        # Test guest lookup with invalid credentials
        invalid_guest_data = {
            "email": "nonexistent@guest.com",
            "phone": "+1-555-000-0000"
        }
        
        response = self.make_request("POST", "/api/guest/verify", json_data=invalid_guest_data)
        
        if response.status_code != 404:
            self.log("Expected 404 for invalid guest, got: {response.status_code}")
            return False
            
        self.log("✅ Invalid guest lookup returns 404 correctly")
        
        # Test guest lookup with valid test guest
        valid_guest_data = {
            "email": "testguest@property.com",
            "phone": "+1-555-876-5432"
        }
        
        response = self.make_request("POST", "/api/guest/verify", json_data=valid_guest_data)
        
        if response.status_code != 200:
            self.log(f"Valid guest lookup failed: {response.text}")
            return False
            
        verify_result = response.json()
        
        if not verify_result.get("success"):
            self.log(f"Guest verify response error: {verify_result}")
            return False
            
        self.log("✅ Guest verification successful")
        
        # Test get guest bookings
        response = self.make_request("POST", "/api/guest/bookings", json_data=valid_guest_data)
        
        if response.status_code != 200:
            self.log(f"Get guest bookings failed: {response.text}")
            return False
            
        bookings_result = response.json()
        
        if not bookings_result.get("success"):
            self.log(f"Guest bookings response error: {bookings_result}")
            return False
            
        guest_bookings = bookings_result.get("bookings", [])
        self.log(f"✅ Retrieved {len(guest_bookings)} guest bookings")
        
        return True
    
    def test_marketplace_apis(self):
        """Test marketplace APIs"""
        
        # Test get marketplace listings
        response = self.make_request("GET", "/api/marketplace/listings")
        
        if response.status_code != 200:
            self.log(f"Get marketplace listings failed: {response.text}")
            return False
            
        listings_result = response.json()
        
        if not listings_result.get("success"):
            self.log(f"Marketplace listings response error: {listings_result}")
            return False
            
        listings = listings_result.get("listings", [])
        self.log(f"✅ Retrieved {len(listings)} marketplace listings")
        
        # Test marketplace with filters
        response = self.make_request("GET", "/api/marketplace/listings?sortBy=price_low&status=active")
        
        if response.status_code != 200:
            self.log(f"Get filtered marketplace listings failed: {response.text}")
            return False
            
        filtered_result = response.json()
        
        if not filtered_result.get("success"):
            self.log(f"Filtered marketplace response error: {filtered_result}")
            return False
            
        self.log("✅ Marketplace filtering working correctly")
        
        return True
    
    def test_auto_cancel_script(self):
        """Test auto-cancel booking script execution"""
        
        try:
            # Try to run the auto-cancel script
            import subprocess
            result = subprocess.run(
                ['node', '/app/backend/scripts/auto-cancel-bookings.js'], 
                capture_output=True, 
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                self.log("✅ Auto-cancel script executed successfully")
                self.log(f"Script output: {result.stdout}")
                return True
            else:
                self.log(f"Auto-cancel script failed with return code {result.returncode}")
                self.log(f"Error output: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            self.log("Auto-cancel script timed out")
            return False
        except Exception as e:
            self.log(f"Error running auto-cancel script: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        
        self.log(f"\n{'='*60}")
        self.log(f"🚀 BITSY BACKEND API TEST SUITE")
        self.log(f"API Base URL: {self.api_url}")
        self.log(f"{'='*60}")
        
        # Test suite
        tests = [
            ("Hotel Registration & Authentication", self.test_hotel_registration_and_auth),
            ("Hotel Settings & Payment Configuration", self.test_hotel_settings_update),
            ("Widget Booking Flow", self.test_widget_booking_flow),
            ("Hotel Bookings Management", self.test_hotel_bookings_api),
            ("Guest Dashboard APIs", self.test_guest_dashboard_apis),
            ("Marketplace APIs", self.test_marketplace_apis),
            ("Auto-cancel Script", self.test_auto_cancel_script),
        ]
        
        for test_name, test_func in tests:
            self.run_test(test_name, test_func)
        
        # Final results
        self.log(f"\n{'='*60}")
        self.log(f"📊 TEST RESULTS SUMMARY")
        self.log(f"{'='*60}")
        self.log(f"Tests Run: {self.tests_run}")
        self.log(f"Tests Passed: {self.tests_passed}")
        self.log(f"Tests Failed: {self.tests_run - self.tests_passed}")
        self.log(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_passed == self.tests_run:
            self.log("🎉 ALL TESTS PASSED!", "SUCCESS")
            return True
        else:
            self.log(f"❌ {self.tests_run - self.tests_passed} TESTS FAILED", "ERROR")
            return False

def main():
    """Main test execution function"""
    tester = BitsyAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
        
    except KeyboardInterrupt:
        tester.log("\n❌ Tests interrupted by user", "ERROR")
        return 1
    except Exception as e:
        tester.log(f"\n❌ Unexpected error: {str(e)}", "ERROR")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)