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

    // Get user's Telegram settings
    const { data: telegramSettings, error: settingsError } = await supabaseClient
      .from('telegram_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (settingsError || !telegramSettings || !telegramSettings.bot_token || !telegramSettings.telegram_chat_id) {
      throw new Error('Telegram bot not configured')
    }

    // Check if auto-sync is enabled and if we should sync this execution
    if (!telegramSettings.auto_sync_enabled) {
      return new Response(
        JSON.stringify({ success: false, message: 'Auto-sync disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (telegramSettings.sync_successful_only && execution.status !== 'success') {
      return new Response(
        JSON.stringify({ success: false, message: 'Sync only successful executions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare Telegram message
    const statusEmoji = execution.status === 'success' ? '✅' : execution.status === 'error' ? '❌' : '⏳'
    
    let message = `${statusEmoji} *OSINT Command Executed*\n\n`
    message += `🔧 *Command:* ${execution.command_name}\n`
    message += `🏢 *Provider:* ${execution.provider}\n`
    message += `📊 *Status:* ${execution.status.toUpperCase()}\n`
    message += `🎯 *Input:* \`${execution.input_data}\`\n`
    message += `⏱️ *Time:* ${execution.execution_time_ms || 0}ms\n`
    message += `💰 *Cost:* $${execution.api_cost || 0}\n`
    message += `📅 *Date:* ${new Date(execution.created_at).toLocaleString()}\n\n`

    if (execution.status === 'success' && execution.output_data) {
      const outputPreview = JSON.stringify(execution.output_data, null, 2).substring(0, 800)
      message += `📋 *Results:*\n\`\`\`json\n${outputPreview}${outputPreview.length >= 800 ? '\n...' : ''}\n\`\`\`\n`
    }

    if (execution.status === 'error' && execution.error_message) {
      message += `🚨 *Error:* ${execution.error_message.substring(0, 500)}\n`
    }

    message += `\n🔗 *KeyForge OSINT Hub*`

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${telegramSettings.bot_token}/sendMessage`
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramSettings.telegram_chat_id,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    })

    const telegramResult = await telegramResponse.json()

    if (!telegramResponse.ok) {
      throw new Error(`Telegram API failed: ${telegramResult.description || telegramResponse.status}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully synced to Telegram',
        telegram_message_id: telegramResult.result.message_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Telegram sync error:', error)

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