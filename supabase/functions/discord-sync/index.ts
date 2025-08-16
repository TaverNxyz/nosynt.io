import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { command, results, channelId, userId } = await req.json();
    
    const discordToken = Deno.env.get('DISCORD_BOT_TOKEN');
    if (!discordToken) {
      throw new Error('Discord bot token not configured');
    }

    // Format the command results for Discord
    const formattedMessage = formatResultsForDiscord(command, results);
    
    // Send to Discord channel
    const discordResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${discordToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: formattedMessage,
        embeds: [{
          title: `🔍 OSINT Command: ${command.name}`,
          description: `Executed by <@${userId}>`,
          color: 0x00ff00,
          fields: [
            {
              name: "Command",
              value: command.name,
              inline: true
            },
            {
              name: "Category", 
              value: command.category,
              inline: true
            },
            {
              name: "Provider",
              value: command.provider,
              inline: true
            },
            {
              name: "Results",
              value: "```json\n" + JSON.stringify(results, null, 2).slice(0, 1000) + "```",
              inline: false
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: "OSINT Intelligence Platform"
          }
        }]
      }),
    });

    if (!discordResponse.ok) {
      const error = await discordResponse.text();
      console.error('Discord API Error:', error);
      throw new Error(`Discord API error: ${discordResponse.status}`);
    }

    const messageData = await discordResponse.json();
    
    console.log(`Successfully sent OSINT results to Discord channel ${channelId}`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      messageId: messageData.id,
      channelId: channelId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in discord-sync function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function formatResultsForDiscord(command: any, results: any): string {
  const truncatedResults = JSON.stringify(results, null, 2);
  
  return `🔍 **OSINT Command Executed**
**Command:** ${command.name}
**Category:** ${command.category} 
**Provider:** ${command.provider}

**Results Summary:**
\`\`\`json
${truncatedResults.slice(0, 1500)}${truncatedResults.length > 1500 ? '\n... (truncated)' : ''}
\`\`\``;
}