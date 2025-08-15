import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query, user_id } = await req.json()
    
    if (!query || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing query or user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user's Shodan API key
    const { data: apiKeys, error: keyError } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', user_id)
      .eq('service_name', 'Shodan')
      .eq('status', 'active')
      .single()

    if (keyError || !apiKeys) {
      return new Response(
        JSON.stringify({ error: 'Shodan API key not found. Please add your Shodan API key.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Decrypt API key (in production, implement proper decryption)
    const shodanApiKey = apiKeys.encrypted_key

    // Make request to Shodan API
    const shodanResponse = await fetch(`https://api.shodan.io/shodan/host/search?key=${shodanApiKey}&query=${encodeURIComponent(query)}&facets=port:100,country:100`)
    
    if (!shodanResponse.ok) {
      const errorText = await shodanResponse.text()
      return new Response(
        JSON.stringify({ error: `Shodan API error: ${errorText}` }),
        { status: shodanResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const shodanData = await shodanResponse.json()

    // Update usage count
    await supabase
      .from('api_keys')
      .update({ 
        usage_count: supabase.sql`usage_count + 1`,
        last_used: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .eq('service_name', 'Shodan')

    // Process and return results
    const processedResults = {
      total: shodanData.total || 0,
      matches: shodanData.matches?.slice(0, 10).map((match: any) => ({
        ip: match.ip_str,
        port: match.port,
        hostnames: match.hostnames || [],
        location: {
          country: match.location?.country_name,
          city: match.location?.city,
          region: match.location?.region_code
        },
        org: match.org,
        isp: match.isp,
        product: match.product,
        version: match.version,
        banner: match.data?.substring(0, 200) + (match.data?.length > 200 ? '...' : ''),
        timestamp: match.timestamp
      })) || [],
      facets: shodanData.facets || {},
      query_credits: shodanData.query_credits || 1,
      execution_time: Date.now()
    }

    return new Response(
      JSON.stringify(processedResults),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Shodan search error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})