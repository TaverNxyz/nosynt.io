import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IntegrationGuide } from "@/components/IntegrationGuide";
import { toast } from "sonner";
import { 
  Settings, 
  Bell, 
  Trash2, 
  Plus,
  ExternalLink,
  Database,
  BarChart3,
  Shield,
  Zap,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  type: 'email' | 'discord' | 'telegram' | 'webhook';
}

interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
  action_url?: string;
}

export default function SystemSettings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'command_success',
      title: 'Command Completion',
      description: 'Notify when OSINT commands complete successfully',
      enabled: true,
      type: 'email'
    },
    {
      id: 'command_failed',
      title: 'Command Failures',
      description: 'Alert when commands fail or encounter errors',
      enabled: true,
      type: 'email'
    },
    {
      id: 'limit_reached',
      title: 'Usage Limits',
      description: 'Warning when approaching monthly limits',
      enabled: true,
      type: 'email'
    },
    {
      id: 'new_features',
      title: 'Feature Updates',
      description: 'Announcements about new OSINT tools and features',
      enabled: false,
      type: 'email'
    }
  ]);
  const [discordSettings, setDiscordSettings] = useState({
    auto_sync_enabled: false,
    sync_successful_only: true,
    discord_channel_id: '',
    webhook_url: ''
  });
  const [telegramSettings, setTelegramSettings] = useState({
    auto_sync_enabled: false,
    sync_successful_only: true,
    telegram_chat_id: '',
    bot_token: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchIntegrationSettings();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications((data || []).map(notification => ({
        ...notification,
        type: notification.type as 'info' | 'warning' | 'error' | 'success'
      })));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchIntegrationSettings = async () => {
    if (!user) return;

    try {
      // Fetch Discord settings
      const { data: discordData } = await supabase
        .from('discord_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (discordData) {
        setDiscordSettings(discordData);
      }

      // Fetch Telegram settings
      const { data: telegramData } = await supabase
        .from('telegram_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (telegramData) {
        setTelegramSettings(telegramData);
      }
    } catch (error) {
      console.error('Failed to fetch integration settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDiscordSettings = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('discord_settings')
        .upsert({
          user_id: user.id,
          ...discordSettings
        });

      if (error) throw error;

      toast.success('Discord settings updated successfully');
    } catch (error) {
      console.error('Failed to update Discord settings:', error);
      toast.error('Failed to update Discord settings');
    }
  };

  // Internal function for auto-saving Discord settings
  const updateDiscordSettingsInternal = async (settings: typeof discordSettings) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('discord_settings')
        .upsert({
          user_id: user.id,
          ...settings
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to auto-save Discord settings:', error);
    }
  };

  const updateTelegramSettings = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('telegram_settings')
        .upsert({
          user_id: user.id,
          ...telegramSettings
        });

      if (error) throw error;

      toast.success('Telegram settings updated successfully');
    } catch (error) {
      console.error('Failed to update Telegram settings:', error);
      toast.error('Failed to update Telegram settings');
    }
  };

  // Internal function for auto-saving Telegram settings
  const updateTelegramSettingsInternal = async (settings: typeof telegramSettings) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('telegram_settings')
        .upsert({
          user_id: user.id,
          ...settings
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to auto-save Telegram settings:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const testDiscordIntegration = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('discord-sync', {
        body: {
          command: { name: 'Test Command', provider: 'System' },
          results: { test: true, message: 'This is a test notification' },
          channelId: discordSettings.discord_channel_id,
          userId: user?.id
        }
      });

      if (error) throw error;
      toast.success('Test message sent to Discord');
    } catch (error) {
      console.error('Discord test failed:', error);
      toast.error('Discord integration test failed');
    }
  };

  const testTelegramIntegration = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('telegram-integration', {
        body: {
          action: 'sendCommandResults',
          data: {
            command: 'Test Command',
            results: { test: true, message: 'This is a test notification' },
            chatId: telegramSettings.telegram_chat_id,
            telegramBotToken: telegramSettings.bot_token
          }
        }
      });

      if (error) throw error;
      toast.success('Test message sent to Telegram');
    } catch (error) {
      console.error('Telegram test failed:', error);
      toast.error('Telegram integration test failed');
    }
  };

  const exportUserData = async () => {
    if (!user) return;

    try {
      // Fetch all user data
      const [executions, analytics, apiKeys] = await Promise.all([
        supabase.from('command_executions').select('*').eq('user_id', user.id),
        supabase.from('usage_analytics').select('*').eq('user_id', user.id),
        supabase.from('api_keys').select('service_name, key_name, status, created_at').eq('user_id', user.id)
      ]);

      const exportData = {
        user_info: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        command_executions: executions.data,
        usage_analytics: analytics.data,
        api_keys: apiKeys.data,
        exported_at: new Date().toISOString()
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `osint-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data');
    }
  };

  const clearAllData = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL your data? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      await Promise.all([
        supabase.from('command_executions').delete().eq('user_id', user.id),
        supabase.from('usage_analytics').delete().eq('user_id', user.id),
        supabase.from('api_keys').delete().eq('user_id', user.id),
        supabase.from('discord_settings').delete().eq('user_id', user.id),
        supabase.from('telegram_settings').delete().eq('user_id', user.id),
        supabase.from('system_notifications').delete().eq('user_id', user.id)
      ]);

      toast.success('All data cleared successfully');
      
      // Refresh the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear data:', error);
      toast.error('Failed to clear data');
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'error': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access system settings</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          System Settings
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Configure notifications, integrations, and manage your OSINT platform settings
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* Notification Settings */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>Configure when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{setting.title}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={(checked) => {
                      setNotificationSettings(prev =>
                        prev.map(s => s.id === setting.id ? { ...s, enabled: checked } : s)
                      );
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Your latest system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No notifications yet</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg ${!notification.read ? 'bg-muted/20' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{notification.title}</p>
                          <Badge variant="outline" className={getNotificationTypeColor(notification.type)}>
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {notification.action_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(notification.action_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* Discord Integration */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-[#5865F2] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  D
                </div>
                <span>Discord Integration</span>
                <Badge variant={discordSettings.auto_sync_enabled && discordSettings.discord_channel_id ? "default" : "secondary"}>
                  {discordSettings.auto_sync_enabled && discordSettings.discord_channel_id ? "Active" : "Inactive"}
                </Badge>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Discord Integration Setup</DialogTitle>
                    </DialogHeader>
                    <IntegrationGuide integration="discord" />
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Automatically sync OSINT command results to Discord channels with rich embeds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You need to create a Discord bot and add your bot token to API Keys. The bot requires "Send Messages" and "Embed Links" permissions.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discord-channel">Discord Channel ID *</Label>
                  <Input
                    id="discord-channel"
                    value={discordSettings.discord_channel_id}
                    onChange={(e) => setDiscordSettings(prev => ({ ...prev, discord_channel_id: e.target.value }))}
                    placeholder="1403708913332785236"
                    className={!discordSettings.discord_channel_id ? "border-yellow-500" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    18-19 digit number from Discord channel (Enable Developer Mode → Right-click channel → Copy Channel ID)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discord-webhook">Webhook URL (Optional)</Label>
                  <Input
                    id="discord-webhook"
                    value={discordSettings.webhook_url}
                    onChange={(e) => setDiscordSettings(prev => ({ ...prev, webhook_url: e.target.value }))}
                    placeholder="https://canary.discord.com/api/webhooks/..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Alternative to bot token method
                  </p>
                </div>
              </div>
              
               <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={discordSettings.auto_sync_enabled}
                    onCheckedChange={(checked) => {
                      const newSettings = { ...discordSettings, auto_sync_enabled: checked };
                      setDiscordSettings(newSettings);
                      // Auto-save when changed
                      updateDiscordSettingsInternal(newSettings);
                    }}
                  />
                  <Label>Auto-sync command results</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={discordSettings.sync_successful_only}
                    onCheckedChange={(checked) => {
                      const newSettings = { ...discordSettings, sync_successful_only: checked };
                      setDiscordSettings(newSettings);
                      // Auto-save when changed
                      updateDiscordSettingsInternal(newSettings);
                    }}
                  />
                  <Label>Only sync successful results</Label>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={updateDiscordSettings}>Save Settings</Button>
                <Button 
                  variant="outline" 
                  onClick={testDiscordIntegration}
                  disabled={!discordSettings.discord_channel_id}
                >
                  Test Integration
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => window.open('/api-keys', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  API Keys
                </Button>
              </div>

              {!discordSettings.discord_channel_id && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Discord Channel ID is required. Click the help button above for detailed setup instructions.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Telegram Integration */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-[#229ED9] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  T
                </div>
                <span>Telegram Integration</span>
                <Badge variant={telegramSettings.auto_sync_enabled && telegramSettings.telegram_chat_id ? "default" : "secondary"}>
                  {telegramSettings.auto_sync_enabled && telegramSettings.telegram_chat_id ? "Active" : "Inactive"}
                </Badge>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Telegram Integration Setup</DialogTitle>
                    </DialogHeader>
                    <IntegrationGuide integration="telegram" />
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>Send OSINT results to Telegram chats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Create a Telegram bot using @BotFather and add your bot token to API Keys. Then get your chat ID by messaging the bot.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telegram-chat">Telegram Chat ID</Label>
                  <Input
                    id="telegram-chat"
                    value={telegramSettings.telegram_chat_id}
                    onChange={(e) => setTelegramSettings(prev => ({ ...prev, telegram_chat_id: e.target.value }))}
                    placeholder="voee178@gmail.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Telegram username or chat ID
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram-token">Bot Token</Label>
                  <Input
                    id="telegram-token"
                    type="password"
                    value={telegramSettings.bot_token}
                    onChange={(e) => setTelegramSettings(prev => ({ ...prev, bot_token: e.target.value }))}
                    placeholder="••••••••••••••••"
                  />
                  <p className="text-xs text-muted-foreground">
                    Set in API Keys section
                  </p>
                </div>
              </div>
              
               <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={telegramSettings.auto_sync_enabled}
                    onCheckedChange={(checked) => {
                      const newSettings = { ...telegramSettings, auto_sync_enabled: checked };
                      setTelegramSettings(newSettings);
                      // Auto-save when changed
                      updateTelegramSettingsInternal(newSettings);
                    }}
                  />
                  <Label>Auto-sync command results</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={telegramSettings.sync_successful_only}
                    onCheckedChange={(checked) => {
                      const newSettings = { ...telegramSettings, sync_successful_only: checked };
                      setTelegramSettings(newSettings);
                      // Auto-save when changed
                      updateTelegramSettingsInternal(newSettings);
                    }}
                  />
                  <Label>Only sync successful results</Label>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={updateTelegramSettings}>Save Settings</Button>
                <Button 
                  variant="outline" 
                  onClick={testTelegramIntegration}
                  disabled={!telegramSettings.telegram_chat_id}
                >
                  Test Integration
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => window.open('/api-keys', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  API Keys
                </Button>
              </div>

              {!telegramSettings.telegram_chat_id && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Telegram Chat ID is required. Click the help button above for detailed setup instructions.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Data Management</span>
              </CardTitle>
              <CardDescription>Export or delete your OSINT platform data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Export Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download all your command executions, analytics, and settings as JSON
                  </p>
                  <Button onClick={exportUserData} className="w-full">
                    <Database className="mr-2 h-4 w-4" />
                    Export All Data
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg border-destructive/20">
                  <h3 className="font-medium mb-2 text-destructive">Clear All Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete all your data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={clearAllData} className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>Manage your account security and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <Button disabled variant="outline" className="w-full">
                    <Zap className="mr-2 h-4 w-4" />
                    Configure 2FA (Coming Soon)
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">API Access Tokens</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate tokens for programmatic access
                  </p>
                  <Button disabled variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Token (Coming Soon)
                  </Button>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg bg-muted/20">
                <h3 className="font-medium mb-2">Session Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">User ID:</span> {user.id}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Last Sign In:</span> {new Date(user.last_sign_in_at || '').toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}