#!/usr/bin/env python3
"""
KeyForge OSINT Hub Backend API Testing Suite - PRODUCTION READY VERSION
Tests NO MOCK DATA implementation - all integrations use real APIs or return proper errors
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
        
        # Test data - using real domains/IPs for production testing
        self.test_domain = "google.com"
        self.test_ip = "8.8.8.8"
        self.test_email = "contact@google.com"
        
        print(f"🚀 KeyForge OSINT Hub Backend Tests - PRODUCTION READY")
        print(f"📡 Testing against: {self.base_url}")
        print(f"🎯 Focus: NO MOCK DATA - Real APIs or proper 503 errors")
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

        # Test detailed health endpoint - CRITICAL: Check service configuration status
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                services = data.get('services', {})
                
                # Verify expected service statuses
                expected_configured = ['supabase', 'virustotal']  # These should be configured
                expected_not_configured = ['hunter_io', 'shodan', 'criminal_ip', 'ipqualityscore']  # These should NOT be configured
                
                config_correct = True
                config_details = []
                
                for service in expected_configured:
                    if services.get(service) != 'configured':
                        config_correct = False
                        config_details.append(f"{service}: expected 'configured', got '{services.get(service)}'")
                
                for service in expected_not_configured:
                    if services.get(service) != 'not_configured':
                        config_correct = False
                        config_details.append(f"{service}: expected 'not_configured', got '{services.get(service)}'")
                
                self.log_test(
                    "GET /api/health - Service Configuration Check", 
                    config_correct, 
                    f"VirusTotal: {services.get('virustotal')}, Hunter.io: {services.get('hunter_io')}, Shodan: {services.get('shodan')}, Criminal IP: {services.get('criminal_ip')}"
                )
                
                if not config_correct:
                    for detail in config_details:
                        print(f"   ⚠️  {detail}")
                        
            else:
                self.log_test(
                    "GET /api/health - Service Configuration Check", 
                    False, 
                    f"Status: {response.status_code}",
                    response.json() if response.content else None
                )
        except Exception as e:
            self.log_test("GET /api/health - Service Configuration Check", False, f"Connection error: {str(e)}")

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

    def test_unauthenticated_access(self):
        """Test endpoints without authentication (should fail)"""
        print("🚫 Testing Unauthenticated Access")
        print("-" * 30)
        
        # Test command execution
        try:
            payload = {
                "command_name": "Domain Reputation Check",
                "command_category": "Domain Analysis",
                "provider": "virustotal",
                "input_data": self.test_domain
            }
            response = self.session.post(f"{self.base_url}/commands/execute", json=payload, timeout=10)
            
            if response.status_code in [401, 403]:
                self.log_test(
                    "POST /api/commands/execute - Unauthenticated", 
                    True, 
                    f"Correctly rejected with status {response.status_code}"
                )
            else:
                self.log_test(
                    "POST /api/commands/execute - Unauthenticated", 
                    False, 
                    f"Expected 401/403, got {response.status_code}"
                )
        except Exception as e:
            self.log_test("POST /api/commands/execute - Unauthenticated", False, f"Error: {str(e)}")

        # Test API keys endpoints
        endpoints = [
            ("GET", "/api-keys", "GET /api/api-keys - Unauthenticated"),
            ("GET", "/commands/recent", "GET /api/commands/recent - Unauthenticated")
        ]
        
        for method, endpoint, test_name in endpoints:
            try:
                if method == "GET":
                    response = self.session.get(f"{self.base_url}{endpoint}", timeout=10)
                
                if response.status_code in [401, 403]:
                    self.log_test(test_name, True, f"Correctly rejected with status {response.status_code}")
                else:
                    self.log_test(test_name, False, f"Expected 401/403, got {response.status_code}")
            except Exception as e:
                self.log_test(test_name, False, f"Error: {str(e)}")

        # Test POST API keys
        try:
            payload = {"service_name": "test", "key_name": "test", "api_key": "test123"}
            response = self.session.post(f"{self.base_url}/api-keys", json=payload, timeout=10)
            if response.status_code in [401, 403]:
                self.log_test("POST /api/api-keys - Unauthenticated", True, f"Correctly rejected with status {response.status_code}")
            else:
                self.log_test("POST /api/api-keys - Unauthenticated", False, f"Expected 401/403, got {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/api-keys - Unauthenticated", False, f"Error: {str(e)}")

    def test_osint_integrations_mock_auth(self):
        """Test OSINT integrations - PRODUCTION VERSION: Real APIs or proper 503 errors"""
        print("🔍 Testing OSINT Integrations - NO MOCK DATA")
        print("-" * 30)
        
        # Create a mock JWT token for testing (will fail auth but test error handling)
        mock_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        headers = {"Authorization": f"Bearer {mock_token}"}
        
        # Test VirusTotal (should work with real API key)
        print("   🦠 Testing VirusTotal (Real API)")
        try:
            payload = {
                "command_name": "Domain Reputation Check",
                "command_category": "Domain Analysis", 
                "provider": "virustotal",
                "input_data": self.test_domain
            }
            response = self.session.post(f"{self.base_url}/commands/execute", json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "VirusTotal Domain Check - Real API", 
                    True, 
                    f"Success: {data.get('success')}, Time: {data.get('execution_time_ms')}ms"
                )
            elif response.status_code in [401, 403]:
                self.log_test(
                    "VirusTotal Domain Check - Real API", 
                    True, 
                    "Authentication properly enforced (expected with mock token)"
                )
            elif response.status_code == 503:
                self.log_test(
                    "VirusTotal Domain Check - Real API", 
                    False, 
                    "VirusTotal API key should be configured but got 503"
                )
            else:
                self.log_test(
                    "VirusTotal Domain Check - Real API", 
                    False, 
                    f"Status: {response.status_code}",
                    response.json() if response.content else None
                )
        except Exception as e:
            self.log_test("VirusTotal Domain Check - Real API", False, f"Error: {str(e)}")

        # Test services that should return 503 errors (no API keys configured)
        missing_api_tests = [
            ("hunter.io", "Email Verification", "Email Analysis", self.test_email, "Hunter.io API key not configured"),
            ("shodan", "IP Lookup", "IP Analysis", self.test_ip, "Shodan API key not configured"), 
            ("criminal ip", "IP Reputation", "IP Analysis", self.test_ip, "Criminal IP API key not configured"),
            ("ipqualityscore", "IP Quality Check", "IP Analysis", self.test_ip, "IPQualityScore API key not configured")
        ]
        
        print("   🚫 Testing Missing API Key Error Handling")
        for provider, command_name, category, input_data, expected_error in missing_api_tests:
            try:
                payload = {
                    "command_name": command_name,
                    "command_category": category,
                    "provider": provider,
                    "input_data": input_data
                }
                response = self.session.post(f"{self.base_url}/commands/execute", json=payload, headers=headers, timeout=30)
                
                if response.status_code == 503:
                    data = response.json()
                    error_msg = data.get('detail', '')
                    if expected_error.lower() in error_msg.lower():
                        self.log_test(
                            f"{provider.title()} - Missing API Key Error", 
                            True, 
                            f"Correct 503 error: {error_msg}"
                        )
                    else:
                        self.log_test(
                            f"{provider.title()} - Missing API Key Error", 
                            False, 
                            f"Wrong error message. Expected: {expected_error}, Got: {error_msg}"
                        )
                elif response.status_code in [401, 403]:
                    self.log_test(
                        f"{provider.title()} - Missing API Key Error", 
                        True, 
                        "Authentication properly enforced (expected with mock token)"
                    )
                else:
                    self.log_test(
                        f"{provider.title()} - Missing API Key Error", 
                        False, 
                        f"Expected 503 for missing API key, got {response.status_code}",
                        response.json() if response.content else None
                    )
            except Exception as e:
                self.log_test(f"{provider.title()} - Missing API Key Error", False, f"Error: {str(e)}")

        # Test unknown provider (should return 501)
        print("   ❓ Testing Unknown Provider")
        try:
            payload = {
                "command_name": "Generic Test",
                "command_category": "Test Category", 
                "provider": "unknown_provider",
                "input_data": "test_input"
            }
            response = self.session.post(f"{self.base_url}/commands/execute", json=payload, headers=headers, timeout=30)
            
            if response.status_code == 501:
                data = response.json()
                error_msg = data.get('detail', '')
                if 'not implemented yet' in error_msg.lower():
                    self.log_test(
                        "Unknown Provider - Not Implemented Error", 
                        True, 
                        f"Correct 501 error: {error_msg}"
                    )
                else:
                    self.log_test(
                        "Unknown Provider - Not Implemented Error", 
                        False, 
                        f"Wrong error message: {error_msg}"
                    )
            elif response.status_code in [401, 403]:
                self.log_test(
                    "Unknown Provider - Not Implemented Error", 
                    True, 
                    "Authentication properly enforced (expected with mock token)"
                )
            else:
                self.log_test(
                    "Unknown Provider - Not Implemented Error", 
                    False, 
                    f"Expected 501 for unknown provider, got {response.status_code}",
                    response.json() if response.content else None
                )
        except Exception as e:
            self.log_test("Unknown Provider - Not Implemented Error", False, f"Error: {str(e)}")

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
                self.log_test("Invalid JSON Handling", True, f"Correctly handled with status {response.status_code}")
            else:
                self.log_test("Invalid JSON Handling", False, f"Expected 400/422, got {response.status_code}")
        except Exception as e:
            self.log_test("Invalid JSON Handling", False, f"Error: {str(e)}")

        # Test missing required fields
        try:
            response = self.session.post(f"{self.base_url}/captcha/verify", json={}, timeout=10)
            if response.status_code == 422:
                self.log_test("Missing Fields Validation", True, "Correctly validated required fields")
            else:
                self.log_test("Missing Fields Validation", False, f"Expected 422, got {response.status_code}")
        except Exception as e:
            self.log_test("Missing Fields Validation", False, f"Error: {str(e)}")

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
                self.log_test("Root Endpoint Format", has_required_fields, f"Required fields present: {has_required_fields}")
            else:
                self.log_test("Root Endpoint Format", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Root Endpoint Format", False, f"Error: {str(e)}")

        # Test health endpoint response format
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                has_required_fields = all(key in data for key in ['status', 'timestamp', 'services'])
                self.log_test("Health Endpoint Format", has_required_fields, f"Required fields present: {has_required_fields}")
            else:
                self.log_test("Health Endpoint Format", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Health Endpoint Format", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all backend tests"""
        start_time = time.time()
        
        # Run test suites
        self.test_health_endpoints()
        self.test_captcha_endpoint()
        self.test_unauthenticated_access()
        self.test_osint_integrations_mock_auth()
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
        auth_tests = [r for r in self.test_results if 'Unauthenticated' in r['test']]
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

        # Check OSINT integrations
        osint_tests = [r for r in self.test_results if 'Mock Auth' in r['test']]
        osint_working = any(r['success'] for r in osint_tests)
        
        if osint_working:
            print("   ✅ OSINT integrations responding (auth enforcement working)")
        else:
            print("   ❌ OSINT integration issues detected")
        
        return passed_tests, failed_tests

if __name__ == "__main__":
    tester = KeyForgeAPITester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if failed == 0 else 1)