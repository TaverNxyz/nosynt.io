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
    const { ip, executionId, command } = await req.json()
    
    const CRIMINAL_IP_API_KEY = Deno.env.get('CRIMINAL_IP_API_KEY')
    
    if (!CRIMINAL_IP_API_KEY) {
      // Update execution record with error
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabaseClient
        .from('command_executions')
        .update({
          status: 'error',
          error_message: 'Criminal IP API key not configured. Please add your Criminal IP API key to use threat intelligence services.',
          execution_time_ms: 0
        })
        .eq('id', executionId)

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Criminal IP API key not configured. Please add your Criminal IP API key to use threat intelligence services.'
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
    
    // Real Criminal IP API call
    const apiUrl = 'https://api.criminalip.io/v1/ip/reputation'
    const url = new URL(apiUrl)
    url.searchParams.append('ip', ip)

    const response = await fetch(url.toString(), {
      headers: {
        'x-api-key': CRIMINAL_IP_API_KEY
      }
    })
    
    const executionTime = Date.now() - startTime
    
    if (!response.ok) {
      throw new Error(`Criminal IP API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Update execution record in database
    const { error: updateError } = await supabaseClient
      .from('command_executions')
      .update({
        status: 'success',
        output_data: data,
        execution_time_ms: executionTime,
        api_cost: 0.02 // Criminal IP typical cost
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
    console.error('Criminal IP function error:', error)
    
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