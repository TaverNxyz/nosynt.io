import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface IntegrationGuideProps {
  integration: 'discord' | 'telegram';
  onClose?: () => void;
}

export const IntegrationGuide = ({ integration, onClose }: IntegrationGuideProps) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNumber);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedStep(null), 2000);
  };

  if (integration === 'discord') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              D
            </div>
            Discord Bot Setup Guide
          </CardTitle>
          <CardDescription>
            Follow these steps to create and configure your Discord bot for OSINT command results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You'll need to create a Discord application and bot to enable automatic syncing of OSINT results to your Discord server.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">1</Badge>
              <div className="flex-1">
                <h3 className="font-semibold">Create Discord Application</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Go to the Discord Developer Portal and create a new application
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('https://discord.com/developers/applications', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Discord Developer Portal
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">2</Badge>
              <div className="flex-1">
                <h3 className="font-semibold">Create Bot</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  In your application, go to the "Bot" section and click "Add Bot"
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                  <p className="text-xs font-mono">
                    Applications → Your App → Bot → Add Bot
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">3</Badge>
              <div className="flex-1">
                <h3 className="font-semibold">Copy Bot Token</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Under the "Token" section, click "Copy" to get your bot token
                </p>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Keep your bot token secret! Never share it publicly.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">4</Badge>
              <div className="flex-1">
                <h3 className="font-semibold">Set Bot Permissions</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Your bot needs these permissions:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-terminal-green" />
                    <span className="text-sm">Send Messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-terminal-green" />
                    <span className="text-sm">Embed Links</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-terminal-green" />
                    <span className="text-sm">Read Message History</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">5</Badge>
              <div className="flex-1">
                <h3 className="font-semibold">Generate Invite Link</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Go to OAuth2 → URL Generator and select:
                </p>
                <div className="space-y-2 mb-3">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border space-y-1">
                    <p className="text-xs"><strong>Scopes:</strong> bot</p>
                    <p className="text-xs"><strong>Bot Permissions:</strong> Send Messages, Embed Links, Read Message History</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Copy the generated URL and use it to invite your bot to your server
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">6</Badge>
              <div className="flex-1">
                <h3 className="font-semibold">Get Channel ID</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Enable Developer Mode in Discord, then right-click your target channel and "Copy Channel ID"
                </p>
                <div className="space-y-2">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                    <p className="text-xs font-mono">
                      Discord Settings → Advanced → Developer Mode → ON
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Right-click channel → Copy Channel ID
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">7</Badge>
              <div className="flex-1">
                <h3 className="font-semibold">Configure in OSINT Platform</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Add your bot token in API Keys and paste the Channel ID in Discord Integration settings
                </p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('/api-keys', '_blank')}
                  >
                    Go to API Keys
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('/settings', '_blank')}
                  >
                    Go to Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Once configured, OSINT command results will automatically be sent to your Discord channel with rich embeds!
            </AlertDescription>
          </Alert>

          {onClose && (
            <div className="flex justify-end">
              <Button onClick={onClose}>
                Got it!
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (integration === 'telegram') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-terminal-blue rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            Telegram Bot Setup Guide
          </CardTitle>
          <CardDescription>
            Follow these steps to create and configure your Telegram bot for OSINT command results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You'll need to create a Telegram bot using BotFather to enable automatic syncing of OSINT results.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">1</Badge>
              <div className="flex-1">
                <h3 className="font-semibold">Start Chat with BotFather</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Open Telegram and search for @BotFather
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('https://t.me/botfather', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open BotFather
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">2</Badge>
              <div className="flex-1">
                <h3 className="font-semibold">Create New Bot</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Send this command to BotFather:
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border flex items-center justify-between">
                  <code className="text-sm">/newbot</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard('/newbot', 2)}
                  >
                    {copiedStep === 2 ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">3</Badge>
              <div className="flex-1">
                <h3 className="font-semibold">Set Bot Name and Username</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Follow BotFather's instructions to set your bot name and username
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                  <p className="text-xs">
                    <strong>Name:</strong> OSINT Command Center<br/>
                    <strong>Username:</strong> your_osint_bot (must end with 'bot')
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">4</Badge>
              <div className="flex-1">
                <h3 className="font-semibold">Copy Bot Token</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  BotFather will provide you with a bot token. Save this securely.
                </p>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Keep your bot token secret! Never share it publicly.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">5</Badge>
              <div className="flex-1">
                <h3 className="font-semibold">Get Chat ID</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Start a chat with your bot, then use this URL to get your chat ID:
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                  <code className="text-xs break-all">
                    https://api.telegram.org/bot&lt;YOUR_BOT_TOKEN&gt;/getUpdates
                  </code>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Replace &lt;YOUR_BOT_TOKEN&gt; with your actual bot token and visit the URL in your browser
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">6</Badge>
              <div className="flex-1">
                <h3 className="font-semibold">Configure in OSINT Platform</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Add your bot token in API Keys and paste the Chat ID in Telegram Integration settings
                </p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('/api-keys', '_blank')}
                  >
                    Go to API Keys
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('/settings', '_blank')}
                  >
                    Go to Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Once configured, OSINT command results will automatically be sent to your Telegram chat!
            </AlertDescription>
          </Alert>

          {onClose && (
            <div className="flex justify-end">
              <Button onClick={onClose}>
                Got it!
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};