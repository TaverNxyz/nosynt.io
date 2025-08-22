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
    const { target, executionId, command } = await req.json()
    
    const VIRUSTOTAL_API_KEY = Deno.env.get('VIRUSTOTAL_API_KEY') || 'a9f1eebcb1be3768cf4cedc133fc3e2e88f9fb7c302ad2f41f414e16d0a451ad'
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let apiUrl: string
    let params: Record<string, string>
    
    if (command === 'domain_reputation') {
      apiUrl = 'https://www.virustotal.com/vtapi/v2/domain/report'
      params = { apikey: VIRUSTOTAL_API_KEY, domain: target }
    } else if (command === 'ip_reputation') {
      apiUrl = 'https://www.virustotal.com/vtapi/v2/ip-address/report'
      params = { apikey: VIRUSTOTAL_API_KEY, ip: target }
    } else {
      throw new Error(`Unsupported command: ${command}`)
    }

    // Make API call to VirusTotal
    const url = new URL(apiUrl)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const startTime = Date.now()
    const response = await fetch(url.toString())
    const executionTime = Date.now() - startTime
    
    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Process the response based on command type
    let processedData: any
    
    if (command === 'domain_reputation') {
      processedData = {
        domain: target,
        detected_urls: data.detected_urls?.slice(0, 5) || [],
        categories: data.categories || [],
        subdomains: data.subdomains?.slice(0, 10) || [],
        resolutions: data.resolutions?.slice(0, 5) || [],
        reputation_score: data.detected_urls?.length || 0,
        last_analysis_date: data.scan_date || 'N/A',
        whois: data.whois || 'No WHOIS data available'
      }
    } else if (command === 'ip_reputation') {
      processedData = {
        ip: target,
        country: data.country || 'Unknown',
        asn: data.asn || 'Unknown',
        as_owner: data.as_owner || 'Unknown',
        detected_urls: data.detected_urls?.slice(0, 5) || [],
        detected_communicating_samples: data.detected_communicating_samples?.length || 0,
        reputation_score: data.detected_urls?.length || 0,
        last_analysis_date: data.scan_date || 'N/A'
      }
    }

    // Update execution record in database
    const { error: updateError } = await supabaseClient
      .from('command_executions')
      .update({
        status: 'success',
        output_data: processedData,
        execution_time_ms: executionTime,
        api_cost: 0.25 // VirusTotal API cost
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
    console.error('VirusTotal function error:', error)
    
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