import requests
import sys
import json
from datetime import datetime

class BitsySaaSAPITester:
    def __init__(self, base_url="https://bitsy-tools.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.hotel_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_email = f"test_hotel_{datetime.now().strftime('%H%M%S')}@test.com"
        self.test_password = "TestPass123!"
        self.test_hotel_name = f"Test Hotel {datetime.now().strftime('%H%M%S')}"

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "api", 200)

    def test_register(self):
        """Test hotel registration"""
        success, response = self.run_test(
            "Hotel Registration",
            "POST",
            "api/auth/register",
            201,
            data={
                "email": self.test_user_email,
                "password": self.test_password,
                "hotelName": self.test_hotel_name
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            self.hotel_id = response['hotel']['_id']
            print(f"   Hotel ID: {self.hotel_id}")
            return True
        return False

    def test_login(self):
        """Test hotel login"""
        success, response = self.run_test(
            "Hotel Login",
            "POST",
            "api/auth/login",
            200,
            data={
                "email": self.test_user_email,
                "password": self.test_password
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_get_me(self):
        """Test get current hotel info"""
        return self.run_test("Get Current Hotel", "GET", "api/auth/me", 200)

    def test_get_hotel_settings(self):
        """Test get hotel settings"""
        return self.run_test("Get Hotel Settings", "GET", "api/hotel/settings", 200)

    def test_update_hotel_settings(self):
        """Test update hotel settings"""
        return self.run_test(
            "Update Hotel Settings",
            "PUT",
            "api/hotel/settings",
            200,
            data={
                "hotelName": f"Updated {self.test_hotel_name}",
                "contactPhone": "+1-555-123-4567",
                "contactEmail": "contact@testhotel.com",
                "notificationEmail": self.test_user_email,
                "logoUrl": "https://example.com/logo.png"
            }
        )

    def test_get_widget_code(self):
        """Test get widget embed code"""
        return self.run_test("Get Widget Code", "GET", "api/hotel/widget-code", 200)

    def test_get_rooms(self):
        """Test get rooms"""
        return self.run_test("Get Rooms", "GET", "api/rooms", 200)

    def test_create_room(self):
        """Test create room"""
        success, response = self.run_test(
            "Create Room",
            "POST",
            "api/rooms",
            201,
            data={
                "roomType": "Deluxe Suite",
                "description": "Ocean view suite with balcony",
                "rate": 199.99,
                "availableCount": 5
            }
        )
        if success and 'room' in response:
            self.room_id = response['room']['_id']
            return True
        return False

    def test_update_room(self):
        """Test update room"""
        if not hasattr(self, 'room_id'):
            print("❌ No room ID available for update test")
            return False
        
        return self.run_test(
            "Update Room",
            "PUT",
            f"api/rooms/{self.room_id}",
            200,
            data={
                "roomType": "Premium Deluxe Suite",
                "rate": 249.99,
                "availableCount": 3
            }
        )

    def test_get_wallets(self):
        """Test get wallet addresses"""
        return self.run_test("Get Wallets", "GET", "api/wallets", 200)

    def test_update_wallets(self):
        """Test update wallet addresses"""
        return self.run_test(
            "Update Wallets",
            "PUT",
            "api/wallets",
            200,
            data={
                "bitcoin": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
                "ethereum": "0x742f35Cc4F2e64A5c1e8A7e3E0c5Dfc62a9De4D1",
                "polygon": "0x742f35Cc4F2e64A5c1e8A7e3E0c5Dfc62a9De4D1",
                "solana": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
                "tron": "TLPid9R7M5YtTJJQNs3D8L3aHU1K3VNJwL"
            }
        )

    def test_get_stats(self):
        """Test get booking statistics"""
        return self.run_test("Get Stats (7d)", "GET", "api/stats", 200, params={"period": "7d"})

    def test_get_stats_30d(self):
        """Test get booking statistics for 30 days"""
        return self.run_test("Get Stats (30d)", "GET", "api/stats", 200, params={"period": "30d"})

    def test_widget_config_public(self):
        """Test widget config endpoint (public)"""
        if not self.hotel_id:
            print("❌ No hotel ID available for widget config test")
            return False
        
        return self.run_test(
            "Widget Config (Public)",
            "GET",
            f"api/widget/{self.hotel_id}/config",
            200
        )

    def test_widget_javascript_file(self):
        """Test widget JavaScript file serving"""
        url = f"{self.base_url}/widget/bitsy-widget.js"
        print(f"\n🔍 Testing Widget JavaScript File...")
        print(f"   URL: {url}")
        
        self.tests_run += 1
        try:
            response = requests.get(url)
            if response.status_code == 200 and 'javascript' in response.headers.get('content-type', '').lower() or response.text.startswith('(function()'):
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                print(f"   Content-Type: {response.headers.get('content-type', 'N/A')}")
                print(f"   File size: {len(response.text)} chars")
                return True
            else:
                print(f"❌ Failed - Status: {response.status_code}, Content-Type: {response.headers.get('content-type', 'N/A')}")
                return False
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

    def test_delete_room(self):
        """Test delete room (soft delete)"""
        if not hasattr(self, 'room_id'):
            print("❌ No room ID available for delete test")
            return False
        
        return self.run_test(
            "Delete Room",
            "DELETE",
            f"api/rooms/{self.room_id}",
            200
        )

def main():
    """Main test execution"""
    print("🚀 Starting Bitsy SaaS API Tests")
    print(f"📡 Testing endpoint: https://bitsy-tools.preview.emergentagent.com")
    print("=" * 60)
    
    tester = BitsySaaSAPITester()
    
    # Test sequence
    tests = [
        # Basic endpoints
        ("Health Check", tester.test_health_check),
        ("API Root", tester.test_api_root),
        
        # Authentication
        ("Registration", tester.test_register),
        ("Login", tester.test_login),
        ("Get Current User", tester.test_get_me),
        
        # Hotel Settings
        ("Get Hotel Settings", tester.test_get_hotel_settings),
        ("Update Hotel Settings", tester.test_update_hotel_settings),
        ("Get Widget Code", tester.test_get_widget_code),
        
        # Rooms Management
        ("Get Rooms", tester.test_get_rooms),
        ("Create Room", tester.test_create_room),
        ("Update Room", tester.test_update_room),
        ("Delete Room", tester.test_delete_room),
        
        # Wallets
        ("Get Wallets", tester.test_get_wallets),
        ("Update Wallets", tester.test_update_wallets),
        
        # Statistics
        ("Get Stats 7d", tester.test_get_stats),
        ("Get Stats 30d", tester.test_get_stats_30d),
        
        # Widget (Public endpoints)
        ("Widget Config", tester.test_widget_config_public),
        ("Widget JS File", tester.test_widget_javascript_file),
    ]
    
    # Execute tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} - Unexpected error: {str(e)}")
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    print(f"Total tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())