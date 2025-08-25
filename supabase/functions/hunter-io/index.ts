import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HunterRequest {
  command: 'discover' | 'domain-search' | 'email-finder' | 'email-verifier' | 'company-enrichment' | 'person-enrichment' | 'combined-enrichment'
  params: {
    domain?: string
    email?: string
    first_name?: string
    last_name?: string
    [key: string]: any
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get user from auth header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('Auth error:', userError)
      throw new Error('Authentication failed')
    }

    console.log('Authenticated user:', user.id)

    // Get request body
    const { command, params }: HunterRequest = await req.json()
    console.log('Hunter.io request:', { command, params })

    // Get user's Hunter.io API key from database
    const { data: apiKeyData, error: keyError } = await supabaseClient
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', user.id)
      .eq('service_name', 'Hunter.io')
      .eq('status', 'active')
      .single()

    if (keyError || !apiKeyData) {
      console.error('API key error:', keyError)
      throw new Error('Hunter.io API key not found. Please add your API key in the API Keys section.')
    }

    const apiKey = apiKeyData.encrypted_key
    console.log('Using Hunter.io API key:', apiKey.substring(0, 8) + '****')

    // Build the appropriate Hunter.io API URL based on command
    let apiUrl = 'https://api.hunter.io/v2/'
    const urlParams = new URLSearchParams()
    urlParams.append('api_key', apiKey)

    switch (command) {
      case 'discover':
        apiUrl += 'discover'
        break
      
      case 'domain-search':
        apiUrl += 'domain-search'
        if (!params.domain) {
          throw new Error('Domain parameter is required for domain-search')
        }
        urlParams.append('domain', params.domain)
        if (params.limit) urlParams.append('limit', params.limit.toString())
        if (params.offset) urlParams.append('offset', params.offset.toString())
        break
      
      case 'email-finder':
        apiUrl += 'email-finder'
        if (!params.domain) {
          throw new Error('Domain parameter is required for email-finder')
        }
        urlParams.append('domain', params.domain)
        if (params.first_name) urlParams.append('first_name', params.first_name)
        if (params.last_name) urlParams.append('last_name', params.last_name)
        if (params.full_name) urlParams.append('full_name', params.full_name)
        
        // Check if we have required name parameters
        if (!params.first_name && !params.last_name && !params.full_name) {
          throw new Error('At least one of first_name, last_name, or full_name is required for email-finder')
        }
        break
      
      case 'email-verifier':
        apiUrl += 'email-verifier'
        if (!params.email) {
          throw new Error('Email parameter is required for email-verifier')
        }
        urlParams.append('email', params.email)
        break
      
      case 'company-enrichment':
        apiUrl += 'companies/find'
        if (!params.domain) {
          throw new Error('Domain parameter is required for company-enrichment')
        }
        urlParams.append('domain', params.domain)
        break
      
      case 'person-enrichment':
        apiUrl += 'people/find'
        if (!params.email) {
          throw new Error('Email parameter is required for person-enrichment')
        }
        urlParams.append('email', params.email)
        break
      
      case 'combined-enrichment':
        apiUrl += 'combined/find'
        if (!params.email) {
          throw new Error('Email parameter is required for combined-enrichment')
        }
        urlParams.append('email', params.email)
        break
      
      default:
        throw new Error(`Unsupported command: ${command}`)
    }

    const fullUrl = `${apiUrl}?${urlParams.toString()}`
    console.log('Making request to Hunter.io:', fullUrl.replace(apiKey, '****'))

    // Make request to Hunter.io API
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OSINT-Command-Center/1.0'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hunter.io API error:', response.status, errorText)
      throw new Error(`Hunter.io API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Hunter.io response received:', Object.keys(data))

    // Update API key usage
    await supabaseClient
      .from('api_keys')
      .update({ 
        usage_count: supabaseClient.rpc('increment', { x: 1 }),
        last_used: new Date().toISOString() 
      })
      .eq('user_id', user.id)
      .eq('service_name', 'Hunter.io')

    // Calculate API cost (Hunter.io pricing varies by endpoint)
    let apiCost = 0
    switch (command) {
      case 'domain-search':
        apiCost = 0.10 * (data?.data?.emails?.length || 1)
        break
      case 'email-finder':
      case 'email-verifier':
        apiCost = 0.10
        break
      case 'company-enrichment':
      case 'person-enrichment':
      case 'combined-enrichment':
        apiCost = 0.20
        break
      case 'discover':
        apiCost = 0.50
        break
    }

    return new Response(JSON.stringify({
      success: true,
      data: data,
      command: command,
      api_cost: apiCost,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Error in hunter-io function:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})