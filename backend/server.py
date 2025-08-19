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
HUNTER_API_KEY = os.environ.get('HUNTER_API_KEY')
SHODAN_API_KEY = os.environ.get('SHODAN_API_KEY')
CRIMINAL_IP_API_KEY = os.environ.get('CRIMINAL_IP_API_KEY')
IPQUALITYSCORE_API_KEY = os.environ.get('IPQUALITYSCORE_API_KEY')
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

# OSINT Service Integrations - REAL APIs ONLY
class OSINTService:
    @staticmethod
    async def virustotal_domain_reputation(domain: str) -> Dict[str, Any]:
        """VirusTotal domain reputation check - REAL API"""
        if not VIRUSTOTAL_API_KEY:
            raise HTTPException(
                status_code=503, 
                detail="VirusTotal API key not configured. Please add your VirusTotal API key to environment variables."
            )
        
        url = f"https://www.virustotal.com/vtapi/v2/domain/report"
        params = {
            'apikey': VIRUSTOTAL_API_KEY,
            'domain': domain
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=30)
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'data': {
                        'domain': domain,
                        'detected_urls': data.get('detected_urls', [])[:5],
                        'categories': data.get('categories', []),
                        'subdomains': data.get('subdomains', [])[:10],
                        'resolutions': data.get('resolutions', [])[:5],
                        'reputation_score': len(data.get('detected_urls', [])),
                        'last_analysis_date': data.get('scan_date', 'N/A'),
                        'whois': data.get('whois', 'No WHOIS data available')
                    }
                }
            elif response.status_code == 204:
                return {
                    'success': True,
                    'data': {
                        'domain': domain,
                        'status': 'No data available for this domain',
                        'reputation_score': 0,
                        'message': 'Domain not found in VirusTotal database'
                    }
                }
            else:
                raise HTTPException(status_code=400, detail=f"VirusTotal API error: {response.text}")

    @staticmethod
    async def virustotal_ip_reputation(ip: str) -> Dict[str, Any]:
        """VirusTotal IP reputation check - REAL API"""
        if not VIRUSTOTAL_API_KEY:
            raise HTTPException(
                status_code=503, 
                detail="VirusTotal API key not configured. Please add your VirusTotal API key to environment variables."
            )
        
        url = f"https://www.virustotal.com/vtapi/v2/ip-address/report"
        params = {
            'apikey': VIRUSTOTAL_API_KEY,
            'ip': ip
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=30)
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
            elif response.status_code == 204:
                return {
                    'success': True,
                    'data': {
                        'ip': ip,
                        'status': 'No data available for this IP',
                        'reputation_score': 0,
                        'message': 'IP not found in VirusTotal database'
                    }
                }
            else:
                raise HTTPException(status_code=400, detail=f"VirusTotal API error: {response.text}")

    @staticmethod
    async def hunter_email_verify(email: str) -> Dict[str, Any]:
        """Hunter.io email verification - REAL API ONLY"""
        if not HUNTER_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="Hunter.io API key not configured. Please add your Hunter.io API key to use email verification services."
            )
        
        url = "https://api.hunter.io/v2/email-verifier"
        params = {
            'email': email,
            'api_key': HUNTER_API_KEY
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=30)
            if response.status_code == 200:
                data = response.json()
                email_data = data.get('data', {})
                return {
                    'success': True,
                    'data': {
                        'email': email,
                        'result': email_data.get('result', 'unknown'),
                        'score': email_data.get('score', 0),
                        'regexp': email_data.get('regexp', False),
                        'gibberish': email_data.get('gibberish', True),
                        'disposable': email_data.get('disposable', True),
                        'webmail': email_data.get('webmail', False),
                        'mx_records': email_data.get('mx_records', False),
                        'smtp_server': email_data.get('smtp_server', False),
                        'smtp_check': email_data.get('smtp_check', False),
                        'accept_all': email_data.get('accept_all', False),
                        'block': email_data.get('block', True),
                        'sources': email_data.get('sources', [])
                    }
                }
            else:
                raise HTTPException(status_code=400, detail=f"Hunter.io API error: {response.text}")

    @staticmethod
    async def shodan_ip_lookup(ip: str) -> Dict[str, Any]:
        """Shodan IP lookup - REAL API ONLY"""
        if not SHODAN_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="Shodan API key not configured. Please add your Shodan API key to use IP intelligence services."
            )
        
        url = f"https://api.shodan.io/shodan/host/{ip}"
        params = {'key': SHODAN_API_KEY}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=30)
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'data': {
                        'ip': ip,
                        'city': data.get('city', 'Unknown'),
                        'country_name': data.get('country_name', 'Unknown'),
                        'country_code': data.get('country_code', 'XX'),
                        'latitude': data.get('latitude'),
                        'longitude': data.get('longitude'),
                        'org': data.get('org', 'Unknown'),
                        'isp': data.get('isp', 'Unknown'),
                        'ports': data.get('ports', []),
                        'hostnames': data.get('hostnames', []),
                        'domains': data.get('domains', []),
                        'tags': data.get('tags', []),
                        'vulns': list(data.get('vulns', [])),
                        'last_update': data.get('last_update'),
                        'os': data.get('os'),
                        'asn': data.get('asn')
                    }
                }
            elif response.status_code == 404:
                return {
                    'success': True,
                    'data': {
                        'ip': ip,
                        'status': 'No data available for this IP',
                        'message': 'IP not found in Shodan database'
                    }
                }
            else:
                raise HTTPException(status_code=400, detail=f"Shodan API error: {response.text}")

    @staticmethod
    async def criminal_ip_lookup(ip: str) -> Dict[str, Any]:
        """Criminal IP lookup - REAL API ONLY"""
        if not CRIMINAL_IP_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="Criminal IP API key not configured. Please add your Criminal IP API key to use threat intelligence services."
            )
        
        url = f"https://api.criminalip.io/v1/ip/reputation"
        headers = {'x-api-key': CRIMINAL_IP_API_KEY}
        params = {'ip': ip}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params, timeout=30)
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'data': data
                }
            else:
                raise HTTPException(status_code=400, detail=f"Criminal IP API error: {response.text}")

    @staticmethod
    async def ipqualityscore_check(target: str, check_type: str = 'ip') -> Dict[str, Any]:
        """IPQualityScore check - REAL API ONLY"""
        if not IPQUALITYSCORE_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="IPQualityScore API key not configured. Please add your IPQualityScore API key to use reputation services."
            )
        
        if check_type == 'ip':
            url = f"https://ipqualityscore.com/api/json/ip/{IPQUALITYSCORE_API_KEY}/{target}"
        elif check_type == 'email':
            url = f"https://ipqualityscore.com/api/json/email/{IPQUALITYSCORE_API_KEY}/{target}"
        else:
            url = f"https://ipqualityscore.com/api/json/url/{IPQUALITYSCORE_API_KEY}/{target}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=30)
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'data': data
                }
            else:
                raise HTTPException(status_code=400, detail=f"IPQualityScore API error: {response.text}")

# API Routes
@api_router.get("/")
async def root():
    return {"message": "KeyForge OSINT Hub API", "version": "1.0.0", "status": "operational"}

@api_router.get("/health")
async def health_check():
    services = {
        "supabase": "connected" if supabase_url and supabase_key else "not_configured",
        "virustotal": "configured" if VIRUSTOTAL_API_KEY else "not_configured",
        "hunter_io": "configured" if HUNTER_API_KEY else "not_configured",
        "shodan": "configured" if SHODAN_API_KEY else "not_configured",
        "criminal_ip": "configured" if CRIMINAL_IP_API_KEY else "not_configured",
        "ipqualityscore": "configured" if IPQUALITYSCORE_API_KEY else "not_configured"
    }
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": services,
        "message": "Add missing API keys to environment variables to enable all services"
    }

@api_router.post("/commands/execute")
async def execute_command(request: CommandRequest, user=Depends(get_current_user)):
    """Execute OSINT command - REAL APIs ONLY"""
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
        
        # Execute based on provider and command - REAL APIs ONLY
        try:
            if request.provider.lower() == 'virustotal':
                if 'domain' in request.command_name.lower():
                    api_result = await OSINTService.virustotal_domain_reputation(request.input_data)
                elif 'ip' in request.command_name.lower():
                    api_result = await OSINTService.virustotal_ip_reputation(request.input_data)
                else:
                    api_result = await OSINTService.virustotal_domain_reputation(request.input_data)
            elif request.provider.lower() == 'hunter.io':
                api_result = await OSINTService.hunter_email_verify(request.input_data)
            elif request.provider.lower() == 'shodan':
                api_result = await OSINTService.shodan_ip_lookup(request.input_data)
            elif request.provider.lower() == 'criminal ip':
                api_result = await OSINTService.criminal_ip_lookup(request.input_data)
            elif request.provider.lower() == 'ipqualityscore':
                if 'email' in request.command_name.lower():
                    api_result = await OSINTService.ipqualityscore_check(request.input_data, 'email')
                elif 'ip' in request.command_name.lower():
                    api_result = await OSINTService.ipqualityscore_check(request.input_data, 'ip')
                else:
                    api_result = await OSINTService.ipqualityscore_check(request.input_data, 'url')
            else:
                # No more mocks - return proper error
                raise HTTPException(
                    status_code=501,
                    detail=f"Provider '{request.provider}' integration not implemented yet. Please add the API key and integration code."
                )
            
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
            
        except HTTPException:
            raise
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
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Command execution error: {e}")
        raise HTTPException(status_code=500, detail=f"Command execution failed: {str(e)}")

@api_router.post("/captcha/verify")
async def verify_captcha(request: CaptchaVerifyRequest):
    """Verify Cloudflare Turnstile captcha"""
    try:
        if not TURNSTILE_SECRET_KEY:
            raise HTTPException(
                status_code=503,
                detail="Turnstile secret key not configured. Please add TURNSTILE_SECRET_KEY to environment variables."
            )
        
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
        raise HTTPException(status_code=500, detail="Captcha verification error")

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