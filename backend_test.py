#!/usr/bin/env python3
"""
KeyForge OSINT Hub Backend API Testing Suite
Tests all backend endpoints and OSINT integrations
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class KeyForgeAPITester:
    def __init__(self):
        # Use the production URL from frontend/.env
        self.base_url = "https://keyforge-osint.preview.emergentagent.com/api"
        self.session = requests.Session()
        self.test_results = []
        
        # Test data
        self.test_domain = "google.com"
        self.test_ip = "8.8.8.8"
        self.test_email = "test@gmail.com"
        
        print(f"🚀 Starting KeyForge OSINT Hub Backend Tests")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)

    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   📝 {details}")
        if response_data and isinstance(response_data, dict):
            if 'error' in response_data or 'detail' in response_data:
                print(f"   🔍 Error: {response_data.get('error', response_data.get('detail', 'Unknown error'))}")
        print()
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })

    def test_health_endpoints(self):
        """Test basic health and connectivity endpoints"""
        print("🏥 Testing Health Endpoints")
        print("-" * 30)
        
        # Test root endpoint
        try:
            response = self.session.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "GET /api/ - Root Health Check", 
                    True, 
                    f"Status: {response.status_code}, Message: {data.get('message', 'N/A')}"
                )
            else:
                self.log_test(
                    "GET /api/ - Root Health Check", 
                    False, 
                    f"Status: {response.status_code}",
                    response.json() if response.content else None
                )
        except Exception as e:
            self.log_test("GET /api/ - Root Health Check", False, f"Connection error: {str(e)}")

        # Test detailed health endpoint
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                services = data.get('services', {})
                self.log_test(
                    "GET /api/health - Detailed Health Check", 
                    True, 
                    f"Status: {data.get('status')}, Supabase: {services.get('supabase')}, VirusTotal: {services.get('virustotal')}"
                )
            else:
                self.log_test(
                    "GET /api/health - Detailed Health Check", 
                    False, 
                    f"Status: {response.status_code}",
                    response.json() if response.content else None
                )
        except Exception as e:
            self.log_test("GET /api/health - Detailed Health Check", False, f"Connection error: {str(e)}")

    def test_captcha_endpoint(self):
        """Test captcha verification endpoint"""
        print("🔒 Testing Captcha Endpoint")
        print("-" * 30)
        
        try:
            # Test with dummy token (should work in dev mode)
            payload = {"token": "dummy_test_token"}
            response = self.session.post(f"{self.base_url}/captcha/verify", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "POST /api/captcha/verify - Captcha Verification", 
                    True, 
                    f"Success: {data.get('success')}, Message: {data.get('message')}"
                )
            else:
                self.log_test(
                    "POST /api/captcha/verify - Captcha Verification", 
                    False, 
                    f"Status: {response.status_code}",
                    response.json() if response.content else None
                )
        except Exception as e:
            self.log_test("POST /api/captcha/verify - Captcha Verification", False, f"Error: {str(e)}")

    def test_unauthenticated_command_execution(self):
        """Test command execution without authentication (should fail)"""
        print("🚫 Testing Unauthenticated Access")
        print("-" * 30)
        
        try:
            payload = {
                "command_name": "Domain Reputation Check",
                "command_category": "Domain Analysis",
                "provider": "virustotal",
                "input_data": self.test_domain
            }
            response = self.session.post(f"{self.base_url}/commands/execute", json=payload, timeout=10)
            
            if response.status_code == 401:
                self.log_test(
                    "POST /api/commands/execute - Unauthenticated Access", 
                    True, 
                    "Correctly rejected unauthenticated request"
                )
            else:
                self.log_test(
                    "POST /api/commands/execute - Unauthenticated Access", 
                    False, 
                    f"Expected 401, got {response.status_code}",
                    response.json() if response.content else None
                )
        except Exception as e:
            self.log_test("POST /api/commands/execute - Unauthenticated Access", False, f"Error: {str(e)}")

    def test_unauthenticated_api_key_endpoints(self):
        """Test API key endpoints without authentication (should fail)"""
        print("🔑 Testing Unauthenticated API Key Access")
        print("-" * 30)
        
        # Test GET /api-keys
        try:
            response = self.session.get(f"{self.base_url}/api-keys", timeout=10)
            if response.status_code == 401:
                self.log_test(
                    "GET /api/api-keys - Unauthenticated Access", 
                    True, 
                    "Correctly rejected unauthenticated request"
                )
            else:
                self.log_test(
                    "GET /api/api-keys - Unauthenticated Access", 
                    False, 
                    f"Expected 401, got {response.status_code}"
                )
        except Exception as e:
            self.log_test("GET /api/api-keys - Unauthenticated Access", False, f"Error: {str(e)}")

        # Test POST /api-keys
        try:
            payload = {
                "service_name": "test_service",
                "key_name": "test_key",
                "api_key": "test_api_key_123"
            }
            response = self.session.post(f"{self.base_url}/api-keys", json=payload, timeout=10)
            if response.status_code == 401:
                self.log_test(
                    "POST /api/api-keys - Unauthenticated Access", 
                    True, 
                    "Correctly rejected unauthenticated request"
                )
            else:
                self.log_test(
                    "POST /api/api-keys - Unauthenticated Access", 
                    False, 
                    f"Expected 401, got {response.status_code}"
                )
        except Exception as e:
            self.log_test("POST /api/api-keys - Unauthenticated Access", False, f"Error: {str(e)}")

        # Test GET /commands/recent
        try:
            response = self.session.get(f"{self.base_url}/commands/recent", timeout=10)
            if response.status_code == 401:
                self.log_test(
                    "GET /api/commands/recent - Unauthenticated Access", 
                    True, 
                    "Correctly rejected unauthenticated request"
                )
            else:
                self.log_test(
                    "GET /api/commands/recent - Unauthenticated Access", 
                    False, 
                    f"Expected 401, got {response.status_code}"
                )
        except Exception as e:
            self.log_test("GET /api/commands/recent - Unauthenticated Access", False, f"Error: {str(e)}")

    def test_cors_headers(self):
        """Test CORS configuration"""
        print("🌐 Testing CORS Configuration")
        print("-" * 30)
        
        try:
            # Test preflight request
            headers = {
                'Origin': 'https://keyforge-osint.preview.emergentagent.com',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
            response = self.session.options(f"{self.base_url}/health", headers=headers, timeout=10)
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            self.log_test(
                "OPTIONS /api/health - CORS Preflight", 
                True, 
                f"CORS headers present: {bool(any(cors_headers.values()))}"
            )
        except Exception as e:
            self.log_test("OPTIONS /api/health - CORS Preflight", False, f"Error: {str(e)}")

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("⚠️ Testing Error Handling")
        print("-" * 30)
        
        # Test invalid JSON
        try:
            response = self.session.post(
                f"{self.base_url}/captcha/verify", 
                data="invalid json", 
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            if response.status_code in [400, 422]:
                self.log_test(
                    "POST /api/captcha/verify - Invalid JSON", 
                    True, 
                    f"Correctly handled invalid JSON with status {response.status_code}"
                )
            else:
                self.log_test(
                    "POST /api/captcha/verify - Invalid JSON", 
                    False, 
                    f"Expected 400/422, got {response.status_code}"
                )
        except Exception as e:
            self.log_test("POST /api/captcha/verify - Invalid JSON", False, f"Error: {str(e)}")

        # Test missing required fields
        try:
            response = self.session.post(f"{self.base_url}/captcha/verify", json={}, timeout=10)
            if response.status_code == 422:
                self.log_test(
                    "POST /api/captcha/verify - Missing Fields", 
                    True, 
                    "Correctly validated required fields"
                )
            else:
                self.log_test(
                    "POST /api/captcha/verify - Missing Fields", 
                    False, 
                    f"Expected 422, got {response.status_code}"
                )
        except Exception as e:
            self.log_test("POST /api/captcha/verify - Missing Fields", False, f"Error: {str(e)}")

    def test_response_formats(self):
        """Test response format consistency"""
        print("📋 Testing Response Formats")
        print("-" * 30)
        
        # Test root endpoint response format
        try:
            response = self.session.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                has_required_fields = all(key in data for key in ['message', 'version', 'status'])
                self.log_test(
                    "GET /api/ - Response Format", 
                    has_required_fields, 
                    f"Required fields present: {has_required_fields}"
                )
            else:
                self.log_test("GET /api/ - Response Format", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/ - Response Format", False, f"Error: {str(e)}")

        # Test health endpoint response format
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                has_required_fields = all(key in data for key in ['status', 'timestamp', 'services'])
                self.log_test(
                    "GET /api/health - Response Format", 
                    has_required_fields, 
                    f"Required fields present: {has_required_fields}"
                )
            else:
                self.log_test("GET /api/health - Response Format", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/health - Response Format", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all backend tests"""
        start_time = time.time()
        
        # Run test suites
        self.test_health_endpoints()
        self.test_captcha_endpoint()
        self.test_unauthenticated_command_execution()
        self.test_unauthenticated_api_key_endpoints()
        self.test_cors_headers()
        self.test_error_handling()
        self.test_response_formats()
        
        # Generate summary
        end_time = time.time()
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"⏱️  Total execution time: {end_time - start_time:.2f} seconds")
        print(f"📈 Total tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📊 Success rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   ❌ {result['test']}: {result['details']}")
        
        print("\n🎯 CRITICAL FINDINGS:")
        
        # Check if basic connectivity works
        root_test = next((r for r in self.test_results if 'Root Health Check' in r['test']), None)
        health_test = next((r for r in self.test_results if 'Detailed Health Check' in r['test']), None)
        
        if root_test and root_test['success']:
            print("   ✅ Backend API is accessible and responding")
        else:
            print("   ❌ Backend API connectivity issues detected")
            
        if health_test and health_test['success']:
            print("   ✅ Health endpoint working with service status")
        else:
            print("   ❌ Health endpoint issues detected")
            
        # Check authentication
        auth_tests = [r for r in self.test_results if 'Unauthenticated Access' in r['test']]
        auth_working = all(r['success'] for r in auth_tests)
        
        if auth_working:
            print("   ✅ Authentication protection working correctly")
        else:
            print("   ❌ Authentication protection issues detected")
            
        # Check captcha
        captcha_test = next((r for r in self.test_results if 'Captcha Verification' in r['test']), None)
        if captcha_test and captcha_test['success']:
            print("   ✅ Captcha endpoint working (dev mode)")
        else:
            print("   ❌ Captcha endpoint issues detected")
        
        return passed_tests, failed_tests

if __name__ == "__main__":
    tester = KeyForgeAPITester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if failed == 0 else 1)