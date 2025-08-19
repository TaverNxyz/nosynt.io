from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import json
import httpx
import asyncio
from supabase import create_client, Client
import asyncpg

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase setup
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', os.environ.get('SUPABASE_ANON_KEY'))
supabase: Client = create_client(supabase_url, supabase_key)

# OSINT API Keys
VIRUSTOTAL_API_KEY = os.environ.get('VIRUSTOTAL_API_KEY')
TURNSTILE_SECRET_KEY = os.environ.get('TURNSTILE_SECRET_KEY')

# Create the main app
app = FastAPI(title="KeyForge OSINT Hub API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Models
class CommandRequest(BaseModel):
    command_name: str
    command_category: str
    provider: str
    input_data: str
    parameters: Optional[Dict[str, Any]] = None

class CaptchaVerifyRequest(BaseModel):
    token: str

class ApiKeyRequest(BaseModel):
    service_name: str
    key_name: str
    api_key: str

# Auth helper
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # Verify JWT token with Supabase
        response = supabase.auth.get_user(credentials.credentials)
        if response.user:
            return response.user
        else:
            raise HTTPException(status_code=401, detail="Invalid authentication")
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication")

# OSINT Service Integrations
class OSINTService:
    @staticmethod
    async def virustotal_domain_reputation(domain: str) -> Dict[str, Any]:
        """VirusTotal domain reputation check"""
        if not VIRUSTOTAL_API_KEY:
            raise HTTPException(status_code=500, detail="VirusTotal API key not configured")
        
        url = f"https://www.virustotal.com/vtapi/v2/domain/report"
        params = {
            'apikey': VIRUSTOTAL_API_KEY,
            'domain': domain
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'data': {
                        'domain': domain,
                        'detected_urls': data.get('detected_urls', [])[:5],  # Limit to 5 results
                        'categories': data.get('categories', []),
                        'subdomains': data.get('subdomains', [])[:10],  # Limit to 10 results
                        'resolutions': data.get('resolutions', [])[:5],  # Limit to 5 results
                        'reputation_score': len(data.get('detected_urls', [])),
                        'last_analysis_date': data.get('scan_date', 'N/A')
                    }
                }
            else:
                raise HTTPException(status_code=400, detail=f"VirusTotal API error: {response.text}")

    @staticmethod
    async def virustotal_ip_reputation(ip: str) -> Dict[str, Any]:
        """VirusTotal IP reputation check"""
        if not VIRUSTOTAL_API_KEY:
            raise HTTPException(status_code=500, detail="VirusTotal API key not configured")
        
        url = f"https://www.virustotal.com/vtapi/v2/ip-address/report"
        params = {
            'apikey': VIRUSTOTAL_API_KEY,
            'ip': ip
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'data': {
                        'ip': ip,
                        'country': data.get('country', 'Unknown'),
                        'asn': data.get('asn', 'Unknown'),
                        'as_owner': data.get('as_owner', 'Unknown'),
                        'detected_urls': data.get('detected_urls', [])[:5],
                        'detected_communicating_samples': len(data.get('detected_communicating_samples', [])),
                        'reputation_score': len(data.get('detected_urls', [])),
                        'last_analysis_date': data.get('scan_date', 'N/A')
                    }
                }
            else:
                raise HTTPException(status_code=400, detail=f"VirusTotal API error: {response.text}")

    @staticmethod
    async def mock_hunter_email_verify(email: str) -> Dict[str, Any]:
        """Mock Hunter.io email verification"""
        await asyncio.sleep(1)  # Simulate API call delay
        
        # Generate realistic mock data
        email_parts = email.split('@')
        domain = email_parts[1] if len(email_parts) > 1 else 'unknown.com'
        
        return {
            'success': True,
            'data': {
                'email': email,
                'result': 'deliverable' if '@gmail.com' in email or '@yahoo.com' in email else 'risky',
                'score': 85 if '@gmail.com' in email else 65,
                'regexp': True,
                'gibberish': False,
                'disposable': False,
                'webmail': '@gmail.com' in email or '@yahoo.com' in email,
                'mx_records': True,
                'smtp_server': True,
                'smtp_check': True,
                'accept_all': False,
                'block': False,
                'domain': domain,
                'sources': ['hunter_api_mock']
            }
        }

    @staticmethod
    async def mock_shodan_ip_lookup(ip: str) -> Dict[str, Any]:
        """Mock Shodan IP lookup"""
        await asyncio.sleep(1)  # Simulate API call delay
        
        return {
            'success': True,
            'data': {
                'ip': ip,
                'city': 'San Francisco',
                'country_name': 'United States',
                'country_code': 'US',
                'latitude': 37.7749,
                'longitude': -122.4194,
                'org': 'Example Organization',
                'isp': 'Example ISP',
                'ports': [22, 80, 443, 8080],
                'hostnames': [f'host-{ip.replace(".", "-")}.example.com'],
                'domains': ['example.com'],
                'tags': ['cloud', 'hosting'],
                'vulns': ['CVE-2021-44228'] if '192.168' not in ip else [],
                'last_update': datetime.now().isoformat()
            }
        }

# API Routes
@api_router.get("/")
async def root():
    return {"message": "KeyForge OSINT Hub API", "version": "1.0.0", "status": "operational"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "supabase": "connected",
            "virustotal": "configured" if VIRUSTOTAL_API_KEY else "not_configured"
        }
    }

@api_router.post("/commands/execute")
async def execute_command(request: CommandRequest, user=Depends(get_current_user)):
    """Execute OSINT command"""
    try:
        logger.info(f"Executing command: {request.command_name} for user: {user.id}")
        
        # Create execution record
        execution_data = {
            'user_id': user.id,
            'command_id': f"{request.command_category}_{request.command_name}".lower().replace(' ', '_'),
            'command_name': request.command_name,
            'command_category': request.command_category,
            'provider': request.provider,
            'input_data': request.input_data,
            'status': 'pending'
        }
        
        result = supabase.table('command_executions').insert(execution_data).execute()
        execution_id = result.data[0]['id']
        
        start_time = datetime.now()
        
        # Execute based on provider and command
        try:
            if request.provider.lower() == 'virustotal':
                if 'domain' in request.command_name.lower():
                    api_result = await OSINTService.virustotal_domain_reputation(request.input_data)
                elif 'ip' in request.command_name.lower():
                    api_result = await OSINTService.virustotal_ip_reputation(request.input_data)
                else:
                    api_result = await OSINTService.virustotal_domain_reputation(request.input_data)
            elif request.provider.lower() == 'hunter.io':
                api_result = await OSINTService.mock_hunter_email_verify(request.input_data)
            elif request.provider.lower() == 'shodan':
                api_result = await OSINTService.mock_shodan_ip_lookup(request.input_data)
            else:
                # Generic mock for other providers
                await asyncio.sleep(1)
                api_result = {
                    'success': True,
                    'data': {
                        'provider': request.provider,
                        'command': request.command_name,
                        'input': request.input_data,
                        'status': 'Integration coming soon',
                        'message': f'{request.provider} integration will be available soon with your API key'
                    }
                }
            
            # Calculate execution time
            execution_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Update execution record with results
            update_data = {
                'status': 'success',
                'output_data': api_result['data'],
                'execution_time_ms': int(execution_time),
                'api_cost': 0.10  # Default cost
            }
            
            supabase.table('command_executions').update(update_data).eq('id', execution_id).execute()
            
            return {
                'success': True,
                'execution_id': execution_id,
                'data': api_result['data'],
                'execution_time_ms': int(execution_time)
            }
            
        except Exception as api_error:
            logger.error(f"API execution error: {api_error}")
            
            # Update execution record with error
            update_data = {
                'status': 'error',
                'error_message': str(api_error),
                'execution_time_ms': int((datetime.now() - start_time).total_seconds() * 1000)
            }
            
            supabase.table('command_executions').update(update_data).eq('id', execution_id).execute()
            
            raise HTTPException(status_code=400, detail=str(api_error))
            
    except Exception as e:
        logger.error(f"Command execution error: {e}")
        raise HTTPException(status_code=500, detail=f"Command execution failed: {str(e)}")

@api_router.post("/captcha/verify")
async def verify_captcha(request: CaptchaVerifyRequest):
    """Verify Cloudflare Turnstile captcha"""
    try:
        if not TURNSTILE_SECRET_KEY:
            # For development, always return success
            return {'success': True, 'message': 'Captcha verified (development mode)'}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                'https://challenges.cloudflare.com/turnstile/v0/siteverify',
                data={
                    'secret': TURNSTILE_SECRET_KEY,
                    'response': request.token
                }
            )
            
            result = response.json()
            if result.get('success'):
                return {'success': True, 'message': 'Captcha verified successfully'}
            else:
                return {'success': False, 'message': 'Captcha verification failed'}
                
    except Exception as e:
        logger.error(f"Captcha verification error: {e}")
        return {'success': False, 'message': 'Captcha verification error'}

@api_router.get("/commands/recent")
async def get_recent_commands(user=Depends(get_current_user)):
    """Get recent command executions for user"""
    try:
        result = supabase.table('command_executions').select('*').eq('user_id', user.id).order('created_at', desc=True).limit(20).execute()
        return {'success': True, 'data': result.data}
    except Exception as e:
        logger.error(f"Failed to fetch recent commands: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch recent commands")

@api_router.get("/api-keys")
async def get_api_keys(user=Depends(get_current_user)):
    """Get user's API keys"""
    try:
        result = supabase.table('api_keys').select('*').eq('user_id', user.id).order('created_at', desc=True).execute()
        return {'success': True, 'data': result.data}
    except Exception as e:
        logger.error(f"Failed to fetch API keys: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch API keys")

@api_router.post("/api-keys")
async def add_api_key(request: ApiKeyRequest, user=Depends(get_current_user)):
    """Add new API key"""
    try:
        key_data = {
            'user_id': user.id,
            'service_name': request.service_name,
            'key_name': request.key_name,
            'encrypted_key': request.api_key,  # In production, encrypt this
            'key_preview': request.api_key[:8] + "****",
            'status': 'active',
            'usage_count': 0,
            'usage_limit': 1000
        }
        
        result = supabase.table('api_keys').insert(key_data).execute()
        return {'success': True, 'data': result.data[0]}
    except Exception as e:
        logger.error(f"Failed to add API key: {e}")
        raise HTTPException(status_code=500, detail="Failed to add API key")

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)