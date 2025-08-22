import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  socket.onopen = () => {
    console.log("WebSocket connection established");
    socket.send(JSON.stringify({
      type: 'connected',
      message: 'Real-time updates enabled'
    }));
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'subscribe_commands':
          await subscribeToCommandUpdates(socket, message.user_id, supabaseClient);
          break;
        case 'subscribe_reports':
          await subscribeToReportUpdates(socket, message.user_id, supabaseClient);
          break;
        case 'subscribe_notifications':
          await subscribeToNotifications(socket, message.user_id, supabaseClient);
          break;
        case 'get_live_stats':
          await sendLiveStats(socket, message.user_id, supabaseClient);
          break;
        default:
          socket.send(JSON.stringify({
            type: 'error',
            message: `Unknown message type: ${message.type}`
          }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return response;
});

async function subscribeToCommandUpdates(socket: WebSocket, userId: string, supabase: any) {
  // Set up real-time subscription to command_executions
  const channel = supabase.channel(`user_commands_${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'command_executions',
      filter: `user_id=eq.${userId}`
    }, (payload: any) => {
      socket.send(JSON.stringify({
        type: 'command_update',
        event: payload.eventType,
        data: payload.new || payload.old,
        timestamp: new Date().toISOString()
      }));
    })
    .subscribe();

  socket.send(JSON.stringify({
    type: 'subscribed',
    subscription: 'command_updates',
    channel_id: channel.topic
  }));
}

async function subscribeToReportUpdates(socket: WebSocket, userId: string, supabase: any) {
  // Set up real-time subscription to osint_reports
  const channel = supabase.channel(`user_reports_${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'osint_reports',
      filter: `user_id=eq.${userId}`
    }, (payload: any) => {
      socket.send(JSON.stringify({
        type: 'report_update',
        event: payload.eventType,
        data: payload.new || payload.old,
        timestamp: new Date().toISOString()
      }));
    })
    .subscribe();

  socket.send(JSON.stringify({
    type: 'subscribed',
    subscription: 'report_updates',
    channel_id: channel.topic
  }));
}

async function subscribeToNotifications(socket: WebSocket, userId: string, supabase: any) {
  // Set up real-time subscription to system_notifications
  const channel = supabase.channel(`user_notifications_${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'system_notifications',
      filter: `user_id=eq.${userId}`
    }, (payload: any) => {
      socket.send(JSON.stringify({
        type: 'notification',
        data: payload.new,
        timestamp: new Date().toISOString()
      }));
    })
    .subscribe();

  socket.send(JSON.stringify({
    type: 'subscribed',
    subscription: 'notifications',
    channel_id: channel.topic
  }));
}

async function sendLiveStats(socket: WebSocket, userId: string, supabase: any) {
  try {
    // Get current month stats
    const currentMonth = new Date();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const { data: executions } = await supabase
      .from('command_executions')
      .select('status, created_at, api_cost')
      .eq('user_id', userId)
      .gte('created_at', firstDay.toISOString());

    const { data: reports } = await supabase
      .from('osint_reports')
      .select('risk_score, created_at')
      .eq('user_id', userId)
      .gte('created_at', firstDay.toISOString());

    const stats = {
      total_commands: executions?.length || 0,
      successful_commands: executions?.filter(e => e.status === 'success').length || 0,
      failed_commands: executions?.filter(e => e.status === 'error').length || 0,
      total_cost: executions?.reduce((sum, e) => sum + (e.api_cost || 0), 0) || 0,
      total_reports: reports?.length || 0,
      avg_risk_score: reports?.length ? 
        reports.reduce((sum, r) => sum + (r.risk_score || 0), 0) / reports.length : 0,
      high_risk_reports: reports?.filter(r => (r.risk_score || 0) >= 70).length || 0
    };

    socket.send(JSON.stringify({
      type: 'live_stats',
      data: stats,
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Error getting live stats:', error);
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Failed to get live statistics'
    }));
  }
}