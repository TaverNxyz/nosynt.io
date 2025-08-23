import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff, 
  Save, 
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Download,
  Database,
  Zap,
  MessageSquare,
  Send,
  Bot,
  Webhook,
  Smartphone,
  Mail,
  Phone,
  Lock
} from "lucide-react";
import { toast } from "sonner";

interface SystemNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [showApiKey, setShowApiKey] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  
  // Discord integration settings
  const [discordSettings, setDiscordSettings] = useState({
    auto_sync_enabled: false,
    sync_successful_only: true,
    discord_channel_id: "",
    webhook_url: ""
  });
  
  // Telegram integration settings
  const [telegramSettings, setTelegramSettings] = useState({
    auto_sync_enabled: false,
    sync_successful_only: true,
    telegram_chat_id: "",
    bot_token: ""
  });

  useEffect(() => {
    if (user) {
      // Mock data for now
      setNotifications([
        {
          id: "1",
          type: 'info',
          title: 'System Update',
          message: 'New OSINT providers added to the platform',
          created_at: new Date().toISOString(),
          read: false
        },
        {
          id: "2", 
          type: 'success',
          title: 'API Key Verified',
          message: 'Your Hunter.io API key has been successfully verified',
          created_at: new Date().toISOString(),
          read: true
        }
      ]);
      setLoading(false);
    }
  }, [user]);

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const exportData = async () => {
    setExportLoading(true);
    try {
      // Mock export functionality
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Data export completed successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-security-green" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-security-yellow" />;
      case 'error':
        return <X className="h-4 w-4 text-security-red" />;
      default:
        return <Info className="h-4 w-4 text-cyber-blue" />;
    }
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Please log in to access your settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and integrations
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="data">Data & Export</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* System Notifications */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>System Notifications</span>
              </CardTitle>
              <CardDescription>
                Recent system updates and important information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 rounded-lg border ${notification.read ? 'bg-muted/50' : 'bg-background'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="space-y-1">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Notifications</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>SMS Notifications</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive critical alerts via SMS
                  </p>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span>Push Notifications</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
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
              <CardDescription>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Two-Factor Authentication</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span>Login Notifications</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified of new login attempts
                  </p>
                </div>
                <Switch
                  checked={loginNotifications}
                  onCheckedChange={setLoginNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* Discord Integration */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Discord Integration</span>
              </CardTitle>
              <CardDescription>
                Automatically sync command results to Discord channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Auto-sync to Discord</Label>
                <Switch
                  checked={discordSettings.auto_sync_enabled}
                  onCheckedChange={(checked) =>
                    setDiscordSettings(prev => ({ ...prev, auto_sync_enabled: checked }))
                  }
                />
              </div>
              
              {discordSettings.auto_sync_enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="discord-webhook">Webhook URL</Label>
                    <Input
                      id="discord-webhook"
                      type="url"
                      value={discordSettings.webhook_url}
                      onChange={(e) =>
                        setDiscordSettings(prev => ({ ...prev, webhook_url: e.target.value }))
                      }
                      placeholder="https://discord.com/api/webhooks/..."
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Only sync successful results</Label>
                    <Switch
                      checked={discordSettings.sync_successful_only}
                      onCheckedChange={(checked) =>
                        setDiscordSettings(prev => ({ ...prev, sync_successful_only: checked }))
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Telegram Integration */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Telegram Integration</span>
              </CardTitle>
              <CardDescription>
                Send command results to Telegram chats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Auto-sync to Telegram</Label>
                <Switch
                  checked={telegramSettings.auto_sync_enabled}
                  onCheckedChange={(checked) =>
                    setTelegramSettings(prev => ({ ...prev, auto_sync_enabled: checked }))
                  }
                />
              </div>
              
              {telegramSettings.auto_sync_enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="telegram-token">Bot Token</Label>
                    <Input
                      id="telegram-token"
                      type="password"
                      value={telegramSettings.bot_token}
                      onChange={(e) =>
                        setTelegramSettings(prev => ({ ...prev, bot_token: e.target.value }))
                      }
                      placeholder="Your Telegram bot token"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telegram-chat">Chat ID</Label>
                    <Input
                      id="telegram-chat"
                      value={telegramSettings.telegram_chat_id}
                      onChange={(e) =>
                        setTelegramSettings(prev => ({ ...prev, telegram_chat_id: e.target.value }))
                      }
                      placeholder="Telegram chat ID"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Data Export</span>
              </CardTitle>
              <CardDescription>
                Export your command history and results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download all your command executions, API usage data, and settings in JSON format.
              </p>
              
              <Button
                onClick={exportData}
                disabled={exportLoading}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {exportLoading ? 'Exporting...' : 'Export All Data'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}