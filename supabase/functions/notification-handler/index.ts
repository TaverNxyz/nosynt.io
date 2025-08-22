import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'email' | 'webhook' | 'sms';
  event_type: string;
  data: any;
  user_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { type, event_type, data, user_id }: NotificationRequest = await req.json();

    // Get user's notification preferences
    const { data: notifications, error: notifError } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .eq('type', type)
      .eq('event_type', event_type)
      .eq('enabled', true)
      .single();

    if (notifError || !notifications) {
      console.log('No notification preferences found or disabled');
      return new Response(JSON.stringify({ success: false, message: 'Notification disabled or not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result;
    switch (type) {
      case 'email':
        result = await sendEmailNotification(notifications.config, event_type, data);
        break;
      case 'webhook':
        result = await sendWebhookNotification(notifications.config, event_type, data);
        break;
      case 'sms':
        result = await sendSMSNotification(notifications.config, event_type, data);
        break;
      default:
        throw new Error(`Notification type ${type} not supported`);
    }

    return new Response(JSON.stringify({
      success: true,
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in notification-handler:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendEmailNotification(config: any, event_type: string, data: any) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const emailData = {
    from: 'OSINT Hub <noreply@osinthub.com>',
    to: [config.email],
    subject: getEmailSubject(event_type),
    html: getEmailTemplate(event_type, data),
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });

  return await response.json();
}

async function sendWebhookNotification(config: any, event_type: string, data: any) {
  const webhookData = {
    event_type,
    timestamp: new Date().toISOString(),
    data
  };

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': config.secret || '',
    },
    body: JSON.stringify(webhookData),
  });

  return {
    status: response.status,
    success: response.ok
  };
}

async function sendSMSNotification(config: any, event_type: string, data: any) {
  const twilioSid = Deno.env.get('TWILIO_SID');
  const twilioToken = Deno.env.get('TWILIO_TOKEN');
  const twilioPhone = Deno.env.get('TWILIO_PHONE');

  if (!twilioSid || !twilioToken || !twilioPhone) {
    throw new Error('Twilio credentials not configured');
  }

  const message = getSMSMessage(event_type, data);
  const auth = btoa(`${twilioSid}:${twilioToken}`);

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: twilioPhone,
      To: config.phone,
      Body: message,
    }),
  });

  return await response.json();
}

function getEmailSubject(event_type: string): string {
  switch (event_type) {
    case 'command_completed':
      return 'OSINT Command Completed';
    case 'command_failed':
      return 'OSINT Command Failed';
    case 'threshold_exceeded':
      return 'Usage Threshold Exceeded';
    case 'security_alert':
      return 'Security Alert Detected';
    default:
      return 'OSINT Hub Notification';
  }
}

function getEmailTemplate(event_type: string, data: any): string {
  const baseTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">OSINT Hub Notification</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
        ${getEventSpecificContent(event_type, data)}
      </div>
      <p style="color: #666; font-size: 12px;">
        This is an automated notification from OSINT Hub. 
        You can manage your notification preferences in your account settings.
      </p>
    </div>
  `;

  return baseTemplate;
}

function getEventSpecificContent(event_type: string, data: any): string {
  switch (event_type) {
    case 'command_completed':
      return `
        <h3 style="color: #28a745;">Command Completed Successfully</h3>
        <p><strong>Command:</strong> ${data.command_name}</p>
        <p><strong>Target:</strong> ${data.target}</p>
        <p><strong>Provider:</strong> ${data.provider}</p>
        <p><strong>Execution Time:</strong> ${data.execution_time_ms}ms</p>
        ${data.risk_score ? `<p><strong>Risk Score:</strong> ${data.risk_score}/100</p>` : ''}
      `;
    case 'command_failed':
      return `
        <h3 style="color: #dc3545;">Command Failed</h3>
        <p><strong>Command:</strong> ${data.command_name}</p>
        <p><strong>Target:</strong> ${data.target}</p>
        <p><strong>Error:</strong> ${data.error_message}</p>
      `;
    case 'threshold_exceeded':
      return `
        <h3 style="color: #ffc107;">Usage Threshold Exceeded</h3>
        <p><strong>Type:</strong> ${data.threshold_type}</p>
        <p><strong>Current Usage:</strong> ${data.current_value}</p>
        <p><strong>Limit:</strong> ${data.limit_value}</p>
      `;
    case 'security_alert':
      return `
        <h3 style="color: #dc3545;">Security Alert</h3>
        <p><strong>Alert Type:</strong> ${data.alert_type}</p>
        <p><strong>Target:</strong> ${data.target}</p>
        <p><strong>Risk Level:</strong> ${data.risk_level}</p>
        <p><strong>Description:</strong> ${data.description}</p>
      `;
    default:
      return `<p>Event Type: ${event_type}</p><pre>${JSON.stringify(data, null, 2)}</pre>`;
  }
}

function getSMSMessage(event_type: string, data: any): string {
  switch (event_type) {
    case 'command_completed':
      return `OSINT Hub: Command "${data.command_name}" completed for ${data.target}. Risk score: ${data.risk_score || 'N/A'}/100`;
    case 'command_failed':
      return `OSINT Hub: Command "${data.command_name}" failed for ${data.target}. Error: ${data.error_message}`;
    case 'threshold_exceeded':
      return `OSINT Hub: ${data.threshold_type} threshold exceeded. Current: ${data.current_value}, Limit: ${data.limit_value}`;
    case 'security_alert':
      return `OSINT Hub ALERT: ${data.alert_type} detected for ${data.target}. Risk: ${data.risk_level}`;
    default:
      return `OSINT Hub: ${event_type} notification`;
  }
}