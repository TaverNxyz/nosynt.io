#!/usr/bin/env python3
"""
Direct VirusTotal API Test - Verify the API key is working
"""

import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

VIRUSTOTAL_API_KEY = os.environ.get('VIRUSTOTAL_API_KEY')

def test_virustotal_direct():
    """Test VirusTotal API directly"""
    print("🦠 Testing VirusTotal API directly")
    print(f"API Key: {VIRUSTOTAL_API_KEY[:20]}..." if VIRUSTOTAL_API_KEY else "No API key found")
    
    if not VIRUSTOTAL_API_KEY:
        print("❌ No VirusTotal API key configured")
        return False
    
    # Test domain reputation
    url = "https://www.virustotal.com/vtapi/v2/domain/report"
    params = {
        'apikey': VIRUSTOTAL_API_KEY,
        'domain': 'google.com'
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ VirusTotal API is working!")
            print(f"Response contains: {list(data.keys())}")
            return True
        elif response.status_code == 204:
            print("✅ VirusTotal API is working! (No data for domain)")
            return True
        else:
            print(f"❌ VirusTotal API error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing VirusTotal API: {e}")
        return False

if __name__ == "__main__":
    test_virustotal_direct()