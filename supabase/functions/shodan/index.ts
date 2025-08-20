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
    
    const SHODAN_API_KEY = Deno.env.get('SHODAN_API_KEY')
    
    if (!SHODAN_API_KEY) {
      // Update execution record with error
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabaseClient
        .from('command_executions')
        .update({
          status: 'error',
          error_message: 'Shodan API key not configured. Please add your Shodan API key to use IP intelligence services.',
          execution_time_ms: 0
        })
        .eq('id', executionId)

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Shodan API key not configured. Please add your Shodan API key to use IP intelligence services.'
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
    
    // Real Shodan API call
    const apiUrl = `https://api.shodan.io/shodan/host/${ip}`
    const url = new URL(apiUrl)
    url.searchParams.append('key', SHODAN_API_KEY)

    const response = await fetch(url.toString())
    const executionTime = Date.now() - startTime
    
    let processedData: any

    if (response.status === 200) {
      const data = await response.json()
      processedData = {
        ip: ip,
        city: data.city || 'Unknown',
        country_name: data.country_name || 'Unknown',
        country_code: data.country_code || 'XX',
        latitude: data.latitude,
        longitude: data.longitude,
        org: data.org || 'Unknown',
        isp: data.isp || 'Unknown',
        ports: data.ports || [],
        hostnames: data.hostnames || [],
        domains: data.domains || [],
        tags: data.tags || [],
        vulns: Object.keys(data.vulns || {}),
        last_update: data.last_update,
        os: data.os,
        asn: data.asn
      }
    } else if (response.status === 404) {
      processedData = {
        ip: ip,
        status: 'No data available for this IP',
        message: 'IP not found in Shodan database'
      }
    } else {
      throw new Error(`Shodan API error: ${response.status} ${response.statusText}`)
    }

    // Update execution record in database
    const { error: updateError } = await supabaseClient
      .from('command_executions')
      .update({
        status: 'success',
        output_data: processedData,
        execution_time_ms: executionTime,
        api_cost: 0.02 // Shodan typical cost
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
    console.error('Shodan function error:', error)
    
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