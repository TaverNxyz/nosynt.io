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
    const { email, executionId, command } = await req.json()
    
    const HUNTER_API_KEY = Deno.env.get('HUNTER_API_KEY')
    
    if (!HUNTER_API_KEY) {
      // Update execution record with error
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabaseClient
        .from('command_executions')
        .update({
          status: 'error',
          error_message: 'Hunter.io API key not configured. Please add your Hunter.io API key to use email verification services.',
          execution_time_ms: 0
        })
        .eq('id', executionId)

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Hunter.io API key not configured. Please add your Hunter.io API key to use email verification services.'
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
    
    // Real Hunter.io API call
    const apiUrl = 'https://api.hunter.io/v2/email-verifier'
    const url = new URL(apiUrl)
    url.searchParams.append('email', email)
    url.searchParams.append('api_key', HUNTER_API_KEY)

    const response = await fetch(url.toString())
    const executionTime = Date.now() - startTime
    
    if (!response.ok) {
      throw new Error(`Hunter.io API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const emailData = data.data || {}

    const processedData = {
      email: email,
      result: emailData.result || 'unknown',
      score: emailData.score || 0,
      regexp: emailData.regexp || false,
      gibberish: emailData.gibberish || true,
      disposable: emailData.disposable || true,
      webmail: emailData.webmail || false,
      mx_records: emailData.mx_records || false,
      smtp_server: emailData.smtp_server || false,
      smtp_check: emailData.smtp_check || false,
      accept_all: emailData.accept_all || false,
      block: emailData.block || true,
      sources: emailData.sources || []
    }

    // Update execution record in database
    const { error: updateError } = await supabaseClient
      .from('command_executions')
      .update({
        status: 'success',
        output_data: processedData,
        execution_time_ms: executionTime,
        api_cost: 0.10 // Hunter.io typical cost
      })
      .eq('id', executionId)

    if (updateError) {
      console.error('Database update error:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: processedData,
        execution_time: executionTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Hunter.io function error:', error)
    
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