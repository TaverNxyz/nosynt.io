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
    const { executionId, userId } = await req.json()
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get execution details
    const { data: execution, error: execError } = await supabaseClient
      .from('command_executions')
      .select('*')
      .eq('id', executionId)
      .single()

    if (execError || !execution) {
      throw new Error('Execution not found')
    }

    // Get user's Discord settings
    const { data: discordSettings, error: settingsError } = await supabaseClient
      .from('discord_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (settingsError || !discordSettings || !discordSettings.webhook_url) {
      throw new Error('Discord webhook not configured')
    }

    // Check if auto-sync is enabled and if we should sync this execution
    if (!discordSettings.auto_sync_enabled) {
      return new Response(
        JSON.stringify({ success: false, message: 'Auto-sync disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (discordSettings.sync_successful_only && execution.status !== 'success') {
      return new Response(
        JSON.stringify({ success: false, message: 'Sync only successful executions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare Discord embed
    const embed = {
      title: `🔍 OSINT Command Executed`,
      color: execution.status === 'success' ? 0x00ff00 : 0xff0000,
      fields: [
        { name: 'Command', value: execution.command_name, inline: true },
        { name: 'Provider', value: execution.provider, inline: true },
        { name: 'Status', value: execution.status.toUpperCase(), inline: true },
        { name: 'Input', value: execution.input_data, inline: false },
        { name: 'Execution Time', value: `${execution.execution_time_ms || 0}ms`, inline: true },
        { name: 'Cost', value: `$${execution.api_cost || 0}`, inline: true }
      ],
      timestamp: execution.created_at,
      footer: { text: 'KeyForge OSINT Hub' }
    }

    if (execution.status === 'success' && execution.output_data) {
      const outputPreview = JSON.stringify(execution.output_data).substring(0, 500)
      embed.fields.push({
        name: 'Results Preview',
        value: `\`\`\`json\n${outputPreview}${outputPreview.length >= 500 ? '...' : ''}\n\`\`\``,
        inline: false
      })
    }

    if (execution.status === 'error' && execution.error_message) {
      embed.fields.push({
        name: 'Error',
        value: execution.error_message.substring(0, 500),
        inline: false
      })
    }

    // Send to Discord
    const discordResponse = await fetch(discordSettings.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    })

    if (!discordResponse.ok) {
      throw new Error(`Discord webhook failed: ${discordResponse.status}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully synced to Discord' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Discord sync error:', error)

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