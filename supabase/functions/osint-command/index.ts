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
    const { command, input, user_id } = await req.json()
    
    if (!command || !input || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    let result: any = {}
    let cost = 0

    switch (command) {
      case 'ip':
        // Free IP geolocation using ip-api.com
        const ipResponse = await fetch(`http://ip-api.com/json/${input}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query`)
        if (ipResponse.ok) {
          const ipData = await ipResponse.json()
          result = {
            ip: ipData.query,
            country: ipData.country,
            region: ipData.regionName,
            city: ipData.city,
            isp: ipData.isp,
            org: ipData.org,
            coordinates: {
              lat: ipData.lat,
              lon: ipData.lon
            },
            timezone: ipData.timezone,
            status: ipData.status
          }
        }
        break

      case 'github':
        // Free GitHub user lookup
        const githubResponse = await fetch(`https://api.github.com/users/${input}`)
        if (githubResponse.ok) {
          const githubData = await githubResponse.json()
          result = {
            username: githubData.login,
            name: githubData.name,
            email: githubData.email,
            bio: githubData.bio,
            company: githubData.company,
            location: githubData.location,
            public_repos: githubData.public_repos,
            followers: githubData.followers,
            following: githubData.following,
            created_at: githubData.created_at,
            avatar_url: githubData.avatar_url
          }
        }
        break

      case 'discord':
        // This would require Discord API integration
        result = {
          error: 'Discord API integration requires OAuth setup',
          suggestion: 'Configure Discord bot integration in API Keys'
        }
        cost = 0.25
        break

      case 'breach':
        // This would require DeHashed API
        const { data: dehashedKey } = await supabase
          .from('api_keys')
          .select('encrypted_key')
          .eq('user_id', user_id)
          .eq('service_name', 'DeHashed')
          .eq('status', 'active')
          .single()

        if (!dehashedKey) {
          result = {
            error: 'DeHashed API key required',
            suggestion: 'Add your DeHashed API key to use breach search'
          }
        } else {
          result = {
            email: input,
            breaches_found: Math.floor(Math.random() * 10),
            databases: ['Collection #1', 'LinkedIn 2012', 'Adobe 2013'],
            note: 'This is a demo response. Real DeHashed integration coming soon.'
          }
          cost = 0.50
        }
        break

      case 'phone':
        // This would require Twilio Lookup API
        const { data: twilioKey } = await supabase
          .from('api_keys')
          .select('encrypted_key')
          .eq('user_id', user_id)
          .eq('service_name', 'Twilio')
          .eq('status', 'active')
          .single()

        if (!twilioKey) {
          result = {
            error: 'Twilio API key required',
            suggestion: 'Add your Twilio API key for phone lookups'
          }
        } else {
          result = {
            number: input,
            carrier: 'Demo Carrier',
            location: 'Demo Location',
            type: 'Mobile',
            valid: true,
            note: 'This is a demo response. Real Twilio integration coming soon.'
          }
          cost = 0.05
        }
        break

      default:
        result = {
          error: 'Unknown command',
          available_commands: ['ip', 'github', 'discord', 'breach', 'phone']
        }
    }

    // Log the execution
    await supabase
      .from('api_keys')
      .update({ 
        usage_count: supabase.sql`usage_count + 1`,
        last_used: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .eq('service_name', 'OSINT Platform')

    return new Response(
      JSON.stringify({
        command,
        input,
        result,
        cost,
        timestamp: new Date().toISOString(),
        execution_time: Date.now()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('OSINT command error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})