import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

interface RealtimeData {
  type: string;
  data: any;
  timestamp: string;
}

interface LiveStats {
  total_commands: number;
  successful_commands: number;
  failed_commands: number;
  total_cost: number;
  total_reports: number;
  avg_risk_score: number;
  high_risk_reports: number;
}

export function useRealtimeUpdates() {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<RealtimeData[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) {
      disconnect();
      return;
    }

    connect();

    return () => {
      disconnect();
    };
  }, [user]);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `wss://lohucijybvchcqqqwlmk.functions.supabase.co/functions/v1/realtime-updates`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        
        // Subscribe to updates
        if (user && wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'subscribe_commands',
            user_id: user.id
          }));
          
          wsRef.current.send(JSON.stringify({
            type: 'subscribe_reports',
            user_id: user.id
          }));
          
          wsRef.current.send(JSON.stringify({
            type: 'subscribe_notifications',
            user_id: user.id
          }));

          wsRef.current.send(JSON.stringify({
            type: 'get_live_stats',
            user_id: user.id
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: RealtimeData = JSON.parse(event.data);
          
          switch (data.type) {
            case 'command_update':
            case 'report_update':
            case 'notification':
              setRecentUpdates(prev => [data, ...prev.slice(0, 49)]);
              break;
            case 'live_stats':
              setLiveStats(data.data as LiveStats);
              break;
            case 'connected':
            case 'subscribed':
              console.log('WebSocket:', data);
              break;
            case 'error':
              console.error('WebSocket error:', data);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (user) {
            connect();
          }
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnected(false);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
    setLiveStats(null);
    setRecentUpdates([]);
  };

  const refreshStats = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN && user) {
      wsRef.current.send(JSON.stringify({
        type: 'get_live_stats',
        user_id: user.id
      }));
    }
  };

  return {
    connected,
    liveStats,
    recentUpdates,
    connect,
    disconnect,
    refreshStats
  };
}