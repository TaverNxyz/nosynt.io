import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const hunterApiKey = Deno.env.get('HUNTER_IO_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { email, executionId, command } = await req.json();
    
    console.log('Hunter.io request:', { email, executionId, command });

    let apiUrl = '';
    let requestData: any = {};

    switch (command) {
      case 'email_verify':
        apiUrl = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${hunterApiKey}`;
        break;
      case 'domain_search':
        const domain = email.split('@')[1] || email;
        apiUrl = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${hunterApiKey}`;
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }

    console.log('Making request to Hunter.io:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseData = await response.json();
    console.log('Hunter.io response:', responseData);

    if (!response.ok) {
      throw new Error(`Hunter.io API error: ${responseData.errors?.[0]?.details || 'Unknown error'}`);
    }

    // Update execution record with success
    const { error: updateError } = await supabase
      .from('command_executions')
      .update({
        status: 'success',
        output_data: responseData,
        api_cost: 0.01 // Hunter.io cost per request
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
    console.error('Hunter.io function error:', error);

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