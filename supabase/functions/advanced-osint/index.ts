import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OSINTRequest {
  command: string;
  target: string;
  category: string;
  provider: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { command, target, category, provider }: OSINTRequest = await req.json();

    let result: any = {};
    let apiCost = 0;

    switch (provider) {
      case 'ThreatCrowd':
        result = await threatCrowdLookup(target, command);
        apiCost = 0; // Free service
        break;
      case 'AlienVault':
        result = await alienVaultLookup(target, command);
        apiCost = 0.05;
        break;
      case 'Censys':
        result = await censysLookup(target, command);
        apiCost = 0.10;
        break;
      case 'RiskIQ':
        result = await riskIQLookup(target, command);
        apiCost = 0.15;
        break;
      case 'SecurityTrails':
        result = await securityTrailsLookup(target, command);
        apiCost = 0.08;
        break;
      case 'Passivetotal':
        result = await passivetotalLookup(target, command);
        apiCost = 0.12;
        break;
      default:
        throw new Error(`Provider ${provider} not supported`);
    }

    // Store result in file storage
    const reportData = {
      target,
      command,
      provider,
      result,
      timestamp: new Date().toISOString(),
      risk_assessment: assessThreatLevel(result)
    };

    const fileName = `${user.id}/${Date.now()}_${command}_${target.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    
    // Upload to storage
    const { error: uploadError } = await supabaseClient.storage
      .from('osint-results')
      .upload(fileName, JSON.stringify(reportData, null, 2), {
        contentType: 'application/json'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
    }

    return new Response(JSON.stringify({
      success: true,
      result,
      apiCost,
      fileName: uploadError ? null : fileName,
      riskScore: reportData.risk_assessment.score
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in advanced-osint function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function threatCrowdLookup(target: string, command: string) {
  const baseUrl = 'https://www.threatcrowd.org/searchApi/v2';
  let endpoint = '';

  switch (command) {
    case 'domain_reputation':
      endpoint = `/domain/report/?domain=${target}`;
      break;
    case 'ip_reputation':
      endpoint = `/ip/report/?ip=${target}`;
      break;
    case 'email_lookup':
      endpoint = `/email/report/?email=${target}`;
      break;
    default:
      throw new Error(`Command ${command} not supported for ThreatCrowd`);
  }

  const response = await fetch(`${baseUrl}${endpoint}`);
  return await response.json();
}

async function alienVaultLookup(target: string, command: string) {
  const apiKey = Deno.env.get('ALIEN_VAULT_API_KEY');
  if (!apiKey) {
    throw new Error('AlienVault API key not configured');
  }

  const baseUrl = 'https://otx.alienvault.com/api/v1/indicators';
  let endpoint = '';

  switch (command) {
    case 'domain_reputation':
      endpoint = `/domain/${target}/general`;
      break;
    case 'ip_reputation':
      endpoint = `/IPv4/${target}/general`;
      break;
    case 'url_analysis':
      endpoint = `/url/${encodeURIComponent(target)}/general`;
      break;
    default:
      throw new Error(`Command ${command} not supported for AlienVault`);
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'X-OTX-API-KEY': apiKey
    }
  });

  return await response.json();
}

async function censysLookup(target: string, command: string) {
  const apiId = Deno.env.get('CENSYS_API_ID');
  const apiSecret = Deno.env.get('CENSYS_API_SECRET');
  
  if (!apiId || !apiSecret) {
    throw new Error('Censys API credentials not configured');
  }

  const baseUrl = 'https://search.censys.io/api/v2';
  const auth = btoa(`${apiId}:${apiSecret}`);

  let endpoint = '';
  switch (command) {
    case 'host_lookup':
      endpoint = `/hosts/${target}`;
      break;
    case 'certificate_lookup':
      endpoint = `/certificates/${target}`;
      break;
    default:
      throw new Error(`Command ${command} not supported for Censys`);
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'Authorization': `Basic ${auth}`
    }
  });

  return await response.json();
}

async function riskIQLookup(target: string, command: string) {
  const apiKey = Deno.env.get('RISKIQ_API_KEY');
  if (!apiKey) {
    throw new Error('RiskIQ API key not configured');
  }

  const baseUrl = 'https://api.passivetotal.org/v2';
  let endpoint = '';

  switch (command) {
    case 'passive_dns':
      endpoint = `/dns/passive?query=${target}`;
      break;
    case 'whois_lookup':
      endpoint = `/whois?query=${target}`;
      break;
    default:
      throw new Error(`Command ${command} not supported for RiskIQ`);
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  return await response.json();
}

async function securityTrailsLookup(target: string, command: string) {
  const apiKey = Deno.env.get('SECURITYTRAILS_API_KEY');
  if (!apiKey) {
    throw new Error('SecurityTrails API key not configured');
  }

  const baseUrl = 'https://api.securitytrails.com/v1';
  let endpoint = '';

  switch (command) {
    case 'domain_history':
      endpoint = `/history/${target}/dns/a`;
      break;
    case 'subdomain_discovery':
      endpoint = `/domain/${target}/subdomains`;
      break;
    default:
      throw new Error(`Command ${command} not supported for SecurityTrails`);
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'APIKEY': apiKey
    }
  });

  return await response.json();
}

async function passivetotalLookup(target: string, command: string) {
  const apiKey = Deno.env.get('PASSIVETOTAL_API_KEY');
  if (!apiKey) {
    throw new Error('PassiveTotal API key not configured');
  }

  const baseUrl = 'https://api.passivetotal.org/v2';
  let endpoint = '';

  switch (command) {
    case 'malware_analysis':
      endpoint = `/enrichment/malware?query=${target}`;
      break;
    case 'ssl_certificate':
      endpoint = `/ssl-certificate/history?query=${target}`;
      break;
    default:
      throw new Error(`Command ${command} not supported for PassiveTotal`);
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  return await response.json();
}

function assessThreatLevel(result: any): { score: number; level: string; indicators: string[] } {
  let score = 0;
  const indicators: string[] = [];

  // Basic threat assessment logic
  if (result.error) {
    return { score: 0, level: 'unknown', indicators: ['Error in analysis'] };
  }

  // Check for malicious indicators
  if (result.malicious || result.malware || result.blacklist) {
    score += 80;
    indicators.push('Marked as malicious');
  }

  if (result.suspicious || result.phishing) {
    score += 60;
    indicators.push('Suspicious activity detected');
  }

  if (result.reputation && result.reputation < 50) {
    score += 40;
    indicators.push('Poor reputation score');
  }

  if (result.certificates && result.certificates.length > 10) {
    score += 20;
    indicators.push('High certificate count');
  }

  // Determine threat level
  let level = 'low';
  if (score >= 80) level = 'critical';
  else if (score >= 60) level = 'high';
  else if (score >= 30) level = 'medium';

  return { score: Math.min(score, 100), level, indicators };
}