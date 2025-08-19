import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { target, executionId, command, checkType = 'ip' } = await req.json()
    
    const IPQUALITYSCORE_API_KEY = Deno.env.get('IPQUALITYSCORE_API_KEY')
    
    if (!IPQUALITYSCORE_API_KEY) {
      // Update execution record with error
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabaseClient
        .from('command_executions')
        .update({
          status: 'error',
          error_message: 'IPQualityScore API key not configured. Please add your IPQualityScore API key to use reputation services.',
          execution_time_ms: 0
        })
        .eq('id', executionId)

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'IPQualityScore API key not configured. Please add your IPQualityScore API key to use reputation services.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 503,
        },
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const startTime = Date.now()
    
    // Real IPQualityScore API call
    let apiUrl: string
    if (checkType === 'ip') {
      apiUrl = `https://ipqualityscore.com/api/json/ip/${IPQUALITYSCORE_API_KEY}/${target}`
    } else if (checkType === 'email') {
      apiUrl = `https://ipqualityscore.com/api/json/email/${IPQUALITYSCORE_API_KEY}/${target}`
    } else {
      apiUrl = `https://ipqualityscore.com/api/json/url/${IPQUALITYSCORE_API_KEY}/${encodeURIComponent(target)}`
    }

    const response = await fetch(apiUrl)
    const executionTime = Date.now() - startTime
    
    if (!response.ok) {
      throw new Error(`IPQualityScore API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Update execution record in database
    const { error: updateError } = await supabaseClient
      .from('command_executions')
      .update({
        status: 'success',
        output_data: data,
        execution_time_ms: executionTime,
        api_cost: 0.004 // IPQualityScore typical cost
      })
      .eq('id', executionId)

    if (updateError) {
      console.error('Database update error:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data,
        execution_time: executionTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('IPQualityScore function error:', error)
    
    // Update execution record with error
    const body = await req.clone().json().catch(() => ({}))
    if (body.executionId) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabaseClient
        .from('command_executions')
        .update({
          status: 'error',
          error_message: error.message,
          execution_time_ms: 0
        })
        .eq('id', body.executionId)
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})