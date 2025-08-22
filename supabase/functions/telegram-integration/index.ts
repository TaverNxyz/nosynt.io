import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    
    switch (action) {
      case 'send_command_results':
        return await sendCommandResults(data);
      case 'setup_payment_tracking':
        return await setupPaymentTracking(data);
      case 'verify_payment':
        return await verifyPayment(data);
      case 'collect_user_info':
        return await collectUserInfo(data);
      default:
        throw new Error('Invalid action specified');
    }

  } catch (error) {
    console.error('Error in telegram-integration function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendCommandResults(data: any) {
  const { command, results, chatId, telegramBotToken } = data;
  
  if (!telegramBotToken) {
    throw new Error('Telegram bot token not provided');
  }

  const message = formatResultsForTelegram(command, results);
  
  const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.status}`);
  }

  return new Response(JSON.stringify({ 
    success: true,
    message: 'Results sent to Telegram'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function setupPaymentTracking(data: any) {
  const { paymentHash, userId, serviceRequest } = data;
  
  // This would integrate with your crypto payment processor
  // For now, we'll return a mock response
  
  console.log(`Setting up payment tracking for hash: ${paymentHash}`);
  
  return new Response(JSON.stringify({ 
    success: true,
    trackingId: paymentHash,
    status: 'pending',
    message: 'Payment tracking initialized'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function verifyPayment(data: any) {
  const { paymentHash, expectedAmount } = data;
  
  // This would check the blockchain for the payment
  // For now, we'll return a mock verification
  
  console.log(`Verifying payment for hash: ${paymentHash}`);
  
  // Mock verification logic - replace with actual blockchain verification
  const isValid = true; // This should check the actual blockchain
  
  return new Response(JSON.stringify({ 
    success: true,
    verified: isValid,
    amount: expectedAmount,
    confirmations: 6,
    message: isValid ? 'Payment verified' : 'Payment not found'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function collectUserInfo(data: any) {
  const { userId, requiredFields, telegramBotToken, chatId } = data;
  
  // Send interactive form to collect user info via Telegram
  const keyboard = {
    inline_keyboard: [
      [{ text: "📝 Start Info Collection", callback_data: "start_collection" }],
      [{ text: "❌ Cancel", callback_data: "cancel_collection" }]
    ]
  };

  const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: "🔐 **Information Collection Required**\n\nPlease provide the required information for your OSINT request:",
      parse_mode: 'Markdown',
      reply_markup: keyboard
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.status}`);
  }

  return new Response(JSON.stringify({ 
    success: true,
    message: 'User info collection initiated'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function formatResultsForTelegram(command: any, results: any): string {
  const truncatedResults = JSON.stringify(results, null, 2);
  
  return `🔍 **OSINT Command Executed**

**Command:** ${command.name}
**Category:** ${command.category}
**Provider:** ${command.provider}

**Results:**
\`\`\`json
${truncatedResults.slice(0, 3000)}${truncatedResults.length > 3000 ? '\n... (truncated)' : ''}
\`\`\``;
}