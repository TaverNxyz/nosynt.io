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
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const startTime = Date.now()
    
    // Mock Hunter.io response since we don't have the API key
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    const executionTime = Date.now() - startTime
    const emailParts = email.split('@')
    const domain = emailParts[1] || 'unknown.com'
    
    const mockData = {
      email: email,
      result: email.includes('gmail.com') || email.includes('yahoo.com') ? 'deliverable' : 'risky',
      score: email.includes('gmail.com') ? 95 : (email.includes('yahoo.com') ? 85 : 65),
      regexp: true,
      gibberish: false,
      disposable: false,
      webmail: email.includes('gmail.com') || email.includes('yahoo.com') || email.includes('outlook.com'),
      mx_records: true,
      smtp_server: true,
      smtp_check: true,
      accept_all: false,
      block: false,
      domain: domain,
      sources: ['hunter_mock_api'],
      note: 'This is mock data. Configure Hunter.io API key for real results.'
    }

    // Update execution record in database
    const { error: updateError } = await supabaseClient
      .from('command_executions')
      .update({
        status: 'success',
        output_data: mockData,
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
        data: mockData,
        execution_time: executionTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Hunter.io function error:', error)
    
    // Update execution record with error if executionId is available
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