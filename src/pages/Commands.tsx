import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCommandExecution, CommandRequest } from "@/hooks/useCommandExecution";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Clock, Search, Zap, Globe, Shield, Database, Mail, Phone, User } from "lucide-react";
import { TurnstileCaptcha } from "@/components/TurnstileCaptcha";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const commandCategories = [
  {
    id: "email",
    name: "Email Intelligence",
    icon: <Search className="h-5 w-5" />,
    commands: [
      { id: "email_verify", name: "Email Verification", provider: "Hunter.io", description: "Verify email validity and deliverability" },
      { id: "email_breach", name: "Breach Check", provider: "DeHashed", description: "Check if email appears in data breaches" },
      { id: "email_reputation", name: "Email Reputation", provider: "IPQualityScore", description: "Check email reputation and risk score" }
    ]
  },
  {
    id: "domain",
    name: "Domain Intelligence", 
    icon: <Globe className="h-5 w-5" />,
    commands: [
      { id: "domain_whois", name: "WHOIS Lookup", provider: "Shodan", description: "Get domain registration information" },
      { id: "domain_reputation", name: "Domain Reputation", provider: "VirusTotal", description: "Check domain reputation and security status" },
      { id: "subdomain_enum", name: "Subdomain Enumeration", provider: "Criminal IP", description: "Discover subdomains and infrastructure" }
    ]
  },
  {
    id: "ip",
    name: "IP Intelligence",
    icon: <Shield className="h-5 w-5" />,
    commands: [
      { id: "ip_lookup", name: "IP Geolocation", provider: "IPQualityScore", description: "Get IP location and ISP information" },
      { id: "ip_reputation", name: "IP Reputation", provider: "VirusTotal", description: "Check IP reputation and threat status" },
      { id: "port_scan", name: "Port Scanning", provider: "Shodan", description: "Scan open ports and services" }
    ]
  },
  {
    id: "social",
    name: "Social Intelligence",
    icon: <Database className="h-5 w-5" />,
    commands: [
      { id: "username_search", name: "Username Search", provider: "Social Links", description: "Search username across social platforms" },
      { id: "social_profile", name: "Profile Analysis", provider: "Maltego", description: "Analyze social media profiles and connections" },
      { id: "phone_lookup", name: "Phone Number Lookup", provider: "Twilio", description: "Get phone number information and carrier details" }
    ]
  }
];

export default function Commands() {
  const { user } = useAuth();
  const { executeCommand, getRecentResults, executing, results } = useCommandExecution();
  const [selectedCategory, setSelectedCategory] = useState("email");
  const [selectedCommand, setSelectedCommand] = useState("");
  const [inputData, setInputData] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);

  useEffect(() => {
    if (user) {
      getRecentResults();
    }
  }, [user]);

  const currentCategory = commandCategories.find(cat => cat.id === selectedCategory);

  const handleExecuteCommand = async () => {
    if (!selectedCommand || !inputData.trim()) {
      return;
    }

    // Show captcha if not verified yet
    if (!captchaToken) {
      setShowCaptcha(true);
      toast.error("Please complete the captcha verification");
      return;
    }

    // Verify captcha with backend
    try {
      const { data: captchaResult } = await supabase.functions.invoke('verify-captcha', {
        body: { token: captchaToken }
      });

      if (!captchaResult?.success) {
        toast.error("Captcha verification failed");
        setCaptchaToken(null);
        setShowCaptcha(true);
        return;
      }
    } catch (error) {
      toast.error("Failed to verify captcha");
      return;
    }

    const command = currentCategory?.commands.find(cmd => cmd.id === selectedCommand);
    if (!command) return;

    const request: CommandRequest = {
      command_name: command.name,
      command_category: currentCategory.name,
      provider: command.provider,
      input_data: inputData.trim()
    };

    const result = await executeCommand(request);
    if (result) {
      setInputData("");
      setSelectedCommand("");
      setCaptchaToken(null);
      setShowCaptcha(false);
    }
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    setShowCaptcha(false);
    toast.success("Captcha verified successfully");
  };

  const handleCaptchaError = (error: string) => {
    toast.error(`Captcha error: ${error}`);
    setCaptchaToken(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to execute OSINT commands</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          OSINT Command Center
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Execute professional OSINT commands and intelligence gathering operations
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {commandCategories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setSelectedCommand("");
              }}
            >
              {category.icon}
              <span className="ml-2 hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {commandCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            {/* Command Selection */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {category.icon}
                  <span>{category.name}</span>
                </CardTitle>
                <CardDescription>
                  Select and execute {category.name.toLowerCase()} commands
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="command">Command</Label>
                    <Select value={selectedCommand} onValueChange={setSelectedCommand}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a command" />
                      </SelectTrigger>
                      <SelectContent>
                        {category.commands.map((command) => (
                          <SelectItem key={command.id} value={command.id}>
                            <div className="flex items-center space-x-2">
                              <span>{command.name}</span>
                              <Badge variant="outline" className="ml-auto">
                                {command.provider}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target">Target</Label>
                    <Input
                      id="target"
                      value={inputData}
                      onChange={(e) => setInputData(e.target.value)}
                      placeholder="Enter target (email, domain, IP, etc.)"
                    />
                  </div>
                </div>
                
                {selectedCommand && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {category.commands.find(cmd => cmd.id === selectedCommand)?.description}
                    </p>
                  </div>
                )}
                
                {showCaptcha && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <Label className="text-sm font-medium mb-2 block">Security Verification</Label>
                    <TurnstileCaptcha 
                      onVerify={handleCaptchaVerify}
                      onError={handleCaptchaError}
                    />
                  </div>
                )}

                <Button 
                  onClick={handleExecuteCommand}
                  disabled={!selectedCommand || !inputData.trim() || executing}
                  className="w-full"
                  size="lg"
                >
                  {executing ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      {captchaToken ? 'Execute Command' : 'Verify & Execute'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        {/* Execution Results - Outside tabs to show on all tabs */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
            <CardDescription>Your command execution history and results</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No executions yet. Run your first command above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.slice(0, 10).map((execution) => (
                  <div key={execution.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(execution.status)}
                        <span className="font-medium">{execution.command_name}</span>
                        <Badge variant="outline">{execution.provider}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(execution.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Target: {execution.input_data}</p>
                    {execution.status === 'success' && execution.output_data && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(execution.output_data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {execution.status === 'error' && execution.error_message && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                        {execution.error_message}
                      </div>
                    )}
                    {execution.execution_time_ms && (
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Duration: {execution.execution_time_ms}ms</span>
                        {execution.api_cost && <span>Cost: ${execution.api_cost}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}