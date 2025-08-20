import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()
    
    const TURNSTILE_SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY')
    
    if (!TURNSTILE_SECRET_KEY) {
      // For development/testing, always return success
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Captcha verified (development mode)',
          'error-codes': []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Verify with Cloudflare Turnstile
    const formData = new FormData()
    formData.append('secret', TURNSTILE_SECRET_KEY)
    formData.append('response', token)

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (result.success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Captcha verified successfully',
          'error-codes': []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Captcha verification failed',
          'error-codes': result['error-codes'] || []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

  } catch (error) {
    console.error('Captcha verification error:', error)

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})