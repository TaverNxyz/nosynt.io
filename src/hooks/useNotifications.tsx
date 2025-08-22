import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface NotificationSetting {
  id?: string;
  type: 'email' | 'webhook' | 'sms';
  event_type: 'command_completed' | 'command_failed' | 'threshold_exceeded' | 'security_alert';
  enabled: boolean;
  config: any;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setNotifications((data || []) as NotificationSetting[]);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotification = async (notification: NotificationSetting) => {
    if (!user) return;

    try {
      const notificationData = {
        user_id: user.id,
        type: notification.type,
        event_type: notification.event_type,
        enabled: notification.enabled,
        config: notification.config
      };

      if (notification.id) {
        const { error } = await supabase
          .from('notifications')
          .update(notificationData)
          .eq('id', notification.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notifications')
          .insert(notificationData);

        if (error) throw error;
      }

      await fetchNotifications();
      return true;
    } catch (error) {
      console.error('Failed to save notification:', error);
      return false;
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchNotifications();
      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  };

  const triggerNotification = async (event_type: string, data: any) => {
    if (!user) return;

    try {
      // Find enabled notifications for this event type
      const enabledNotifications = notifications.filter(
        n => n.enabled && n.event_type === event_type
      );

      // Send notification for each enabled type
      for (const notification of enabledNotifications) {
        await supabase.functions.invoke('notification-handler', {
          body: {
            type: notification.type,
            event_type,
            data,
            user_id: user.id
          }
        });
      }
    } catch (error) {
      console.error('Failed to trigger notification:', error);
    }
  };

  return {
    notifications,
    loading,
    saveNotification,
    deleteNotification,
    triggerNotification,
    refreshNotifications: fetchNotifications
  };
}