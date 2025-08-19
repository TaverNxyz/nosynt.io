import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const virusTotalApiKey = Deno.env.get('VIRUSTOTAL_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { target, executionId, command } = await req.json();
    
    console.log('VirusTotal request:', { target, executionId, command });

    let apiUrl = '';
    let requestMethod = 'GET';
    let requestBody = null;

    switch (command) {
      case 'domain_reputation':
        apiUrl = `https://www.virustotal.com/vtapi/v2/domain/report?apikey=${virusTotalApiKey}&domain=${encodeURIComponent(target)}`;
        break;
      case 'ip_reputation':
        apiUrl = `https://www.virustotal.com/vtapi/v2/ip-address/report?apikey=${virusTotalApiKey}&ip=${encodeURIComponent(target)}`;
        break;
      case 'url_scan':
        // First submit URL for scanning
        apiUrl = `https://www.virustotal.com/vtapi/v2/url/scan`;
        requestMethod = 'POST';
        requestBody = new URLSearchParams({
          apikey: virusTotalApiKey,
          url: target
        });
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }

    console.log('Making request to VirusTotal:', apiUrl);

    const response = await fetch(apiUrl, {
      method: requestMethod,
      headers: {
        'Accept': 'application/json',
        ...(requestMethod === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {})
      },
      ...(requestBody ? { body: requestBody } : {})
    });

    const responseData = await response.json();
    console.log('VirusTotal response:', responseData);

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${responseData.error || 'Unknown error'}`);
    }

    // Update execution record with success
    const { error: updateError } = await supabase
      .from('command_executions')
      .update({
        status: 'success',
        output_data: responseData,
        api_cost: 0.05 // VirusTotal cost per request
      })
      .eq('id', executionId);

    if (updateError) {
      console.error('Failed to update execution:', updateError);
    }

    return new Response(JSON.stringify({
      success: true,
      data: responseData,
      executionId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('VirusTotal function error:', error);

    // Update execution record with error
    if (req.json) {
      try {
        const { executionId } = await req.json();
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase
          .from('command_executions')
          .update({
            status: 'error',
            error_message: error.message
          })
          .eq('id', executionId);
      } catch (updateError) {
        console.error('Failed to update execution with error:', updateError);
      }
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});