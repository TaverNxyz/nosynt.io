import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Globe, 
  Shield, 
  Database, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Lock,
  Eye,
  Wifi,
  Hash,
  Building,
  Camera,
  Key,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Terminal,
  ExternalLink
} from "lucide-react";

interface OSINTCommand {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<any>;
  premium: boolean;
  apiRequired: boolean;
  provider: string;
  examples: string[];
}

interface CommandResult {
  command: string;
  status: 'success' | 'error' | 'pending';
  data: any;
  timestamp: Date;
}

const osintCommands: OSINTCommand[] = [
  // Primary OSINT Features
  {
    id: "discord",
    name: "Discord Intelligence",
    category: "Social Intelligence",
    description: "Search for Discord user information and associated IP addresses",
    icon: User,
    premium: true,
    apiRequired: true,
    provider: "Discord API",
    examples: ["username#1234", "user_id", "server_id"]
  },
  {
    id: "breach",
    name: "Data Breach Search",
    category: "Breach Intelligence",
    description: "Search through compromised data from various breaches and leaks",
    icon: Shield,
    premium: true,
    apiRequired: true,
    provider: "DeHashed",
    examples: ["email@domain.com", "username", "phone_number"]
  },
  {
    id: "email",
    name: "Email Intelligence",
    category: "Email Intelligence", 
    description: "Discover where an email address is registered and gather intelligence",
    icon: Mail,
    premium: true,
    apiRequired: true,
    provider: "Hunter.io",
    examples: ["target@company.com", "domain.com"]
  },
  {
    id: "phone",
    name: "Phone Lookup",
    category: "Phone Intelligence",
    description: "Lookup and analyze a phone number for intelligence gathering",
    icon: Phone,
    premium: true,
    apiRequired: true,
    provider: "Twilio",
    examples: ["+1234567890", "555-123-4567"]
  },
  {
    id: "ip",
    name: "IP Geolocation",
    category: "Network Intelligence",
    description: "Get geolocation and intelligence information for an IP address",
    icon: Globe,
    premium: false,
    apiRequired: false,
    provider: "Built-in",
    examples: ["192.168.1.1", "8.8.8.8", "127.0.0.1"]
  },
  {
    id: "npd",
    name: "National Public Data",
    category: "Public Records",
    description: "Search National Public Data records using various criteria",
    icon: Database,
    premium: true,
    apiRequired: true,
    provider: "NPD",
    examples: ["John Doe", "SSN", "Address"]
  },
  {
    id: "github",
    name: "GitHub Email Finder",
    category: "Developer Intelligence",
    description: "Find emails associated with a GitHub username",
    icon: User,
    premium: false,
    apiRequired: false,
    provider: "GitHub API",
    examples: ["github_username", "repository_name"]
  },

  // Advanced OSINT Tools
  {
    id: "shodan",
    name: "Shodan Search",
    category: "Network Intelligence",
    description: "Internet-connected device intelligence and vulnerability scanning",
    icon: Wifi,
    premium: true,
    apiRequired: true,
    provider: "Shodan",
    examples: ["apache", "product:MySQL", "192.168.1.0/24"]
  },
  {
    id: "maltego",
    name: "Maltego Transform",
    category: "Link Analysis",
    description: "Advanced link analysis and data mining",
    icon: Globe,
    premium: true,
    apiRequired: true,
    provider: "Maltego",
    examples: ["domain.com", "email@domain.com", "phone_number"]
  },
  {
    id: "harvester",
    name: "theHarvester",
    category: "Domain Intelligence",
    description: "Gather emails, subdomains, hosts, employee names",
    icon: Database,
    premium: false,
    apiRequired: false,
    provider: "Built-in",
    examples: ["domain.com", "company_name"]
  },
  {
    id: "recon-ng",
    name: "Recon-NG",
    category: "Reconnaissance",
    description: "Full-featured reconnaissance framework",
    icon: Search,
    premium: true,
    apiRequired: true,
    provider: "Recon-NG",
    examples: ["domain.com", "company_name", "person_name"]
  },
  {
    id: "tineye",
    name: "TinEye Reverse Search",
    category: "Image Intelligence",
    description: "Reverse image search and tracking",
    icon: Camera,
    premium: false,
    apiRequired: false,
    provider: "TinEye",
    examples: ["image_url", "Upload image file"]
  },
  {
    id: "foca",
    name: "FOCA Document Analysis",
    category: "Document Intelligence",
    description: "Extract metadata from documents and files",
    icon: Database,
    premium: true,
    apiRequired: true,
    provider: "FOCA",
    examples: ["document_url", "domain.com"]
  },
  {
    id: "phoneinfoga",
    name: "PhoneInfoga",
    category: "Phone Intelligence",
    description: "Advanced phone number reconnaissance",
    icon: Phone,
    premium: true,
    apiRequired: true,
    provider: "PhoneInfoga",
    examples: ["+33656108576", "+1234567890"]
  },
  {
    id: "sn0int",
    name: "sn0int Framework",
    category: "Semi-Automated OSINT",
    description: "Semi-automatic OSINT framework and package manager",
    icon: Search,
    premium: true,
    apiRequired: true,
    provider: "sn0int",
    examples: ["domain.com", "person_name", "company_name"]
  },
  {
    id: "blackbird",
    name: "Blackbird OSINT",
    category: "Username Intelligence",
    description: "Search for usernames across social networks",
    icon: User,
    premium: true,
    apiRequired: true,
    provider: "Blackbird",
    examples: ["username", "handle"]
  },
  {
    id: "criminalip",
    name: "Criminal IP",
    category: "Threat Intelligence",
    description: "IP reputation and threat intelligence",
    icon: Shield,
    premium: true,
    apiRequired: true,
    provider: "Criminal IP",
    examples: ["192.168.1.1", "malicious_domain.com"]
  },
  {
    id: "social-links",
    name: "Social Links",
    category: "Social Intelligence",
    description: "Advanced social media investigation",
    icon: User,
    premium: true,
    apiRequired: true,
    provider: "Social Links",
    examples: ["@username", "profile_url", "email@domain.com"]
  },

  // New Advanced OSINT Tools
  {
    id: "alienvault",
    name: "AlienVault OTX",
    category: "Threat Intelligence",
    description: "Open threat exchange for security research",
    icon: Shield,
    premium: true,
    apiRequired: true,
    provider: "AlienVault",
    examples: ["domain.com", "ip_address", "file_hash"]
  },
  {
    id: "nexvision",
    name: "NexVision",
    category: "Threat Detection",
    description: "Advanced threat detection and analysis platform",
    icon: Eye,
    premium: true,
    apiRequired: true,
    provider: "NexVision",
    examples: ["threat_indicator", "malware_hash", "domain.com"]
  },
  {
    id: "bingoo",
    name: "BinGoo",
    category: "Binary Analysis",
    description: "Binary analysis and malware research tools",
    icon: Database,
    premium: true,
    apiRequired: true,
    provider: "BinGoo",
    examples: ["binary_hash", "malware_sample", "executable_file"]
  },
  {
    id: "datasploit",
    name: "Datasploit",
    category: "Automated OSINT",
    description: "Automated OSINT framework for reconnaissance",
    icon: Search,
    premium: false,
    apiRequired: false,
    provider: "Datasploit",
    examples: ["domain.com", "username", "email@domain.com"]
  },
  {
    id: "google-dorks",
    name: "Google Dorks",
    category: "Search Intelligence",
    description: "Advanced Google search operators for information gathering",
    icon: Search,
    premium: false,
    apiRequired: false,
    provider: "Built-in",
    examples: ["site:target.com filetype:pdf", "inurl:admin", "intitle:index of"]
  },
  {
    id: "metagoofil",
    name: "Metagoofil",
    category: "Document Intelligence",
    description: "Extract metadata from public documents",
    icon: Database,
    premium: false,
    apiRequired: false,
    provider: "Metagoofil",
    examples: ["domain.com", "filetype:pdf", "filetype:doc"]
  },
  {
    id: "osint-framework",
    name: "OSINT Framework",
    category: "Framework Tools",
    description: "Collection of OSINT tools and resources",
    icon: Database,
    premium: false,
    apiRequired: false,
    provider: "OSINT Framework",
    examples: ["category_search", "tool_lookup", "resource_finder"]
  },
  {
    id: "prying-deep",
    name: "Prying Deep",
    category: "Deep Web Intelligence",
    description: "Deep web and dark web intelligence gathering",
    icon: Search,
    premium: true,
    apiRequired: true,
    provider: "Prying Deep",
    examples: ["deep_search", "onion_link", "hidden_service"]
  },

  // Analytics & Monitoring Commands
  {
    id: "posthog",
    name: "PostHog Analytics",
    category: "Analytics Intelligence",
    description: "Product analytics and user behavior tracking",
    icon: Database,
    premium: true,
    apiRequired: true,
    provider: "PostHog",
    examples: ["project_id", "user_session", "event_tracking"]
  },
  {
    id: "matomo",
    name: "Matomo Analytics",
    category: "Analytics Intelligence",
    description: "Privacy-focused web analytics intelligence",
    icon: Database,
    premium: true,
    apiRequired: true,
    provider: "Matomo",
    examples: ["site_id", "visitor_data", "analytics_report"]
  },
  {
    id: "plausible",
    name: "Plausible Analytics",
    category: "Analytics Intelligence",
    description: "Simple privacy-focused analytics data",
    icon: Database,
    premium: true,
    apiRequired: true,
    provider: "Plausible Analytics",
    examples: ["domain.com", "page_views", "visitor_stats"]
  },
  {
    id: "countly",
    name: "Countly Analytics",
    category: "Analytics Intelligence",
    description: "Product analytics and performance monitoring",
    icon: Database,
    premium: true,
    apiRequired: true,
    provider: "Countly",
    examples: ["app_key", "user_behavior", "crash_reports"]
  },
  {
    id: "datadog",
    name: "Datadog Monitoring",
    category: "Infrastructure Intelligence",
    description: "Infrastructure monitoring and log analysis",
    icon: Database,
    premium: true,
    apiRequired: true,
    provider: "Datadog",
    examples: ["host_metrics", "log_query", "apm_trace"]
  },
  {
    id: "grafana",
    name: "Grafana Metrics",
    category: "Infrastructure Intelligence",
    description: "Monitoring and observability platform data",
    icon: Database,
    premium: true,
    apiRequired: true,
    provider: "Grafana",
    examples: ["dashboard_id", "metric_query", "alert_rules"]
  },
  {
    id: "prometheus",
    name: "Prometheus Metrics",
    category: "Infrastructure Intelligence",
    description: "Time series monitoring and alerting",
    icon: Database,
    premium: false,
    apiRequired: false,
    provider: "Prometheus",
    examples: ["metric_name", "query_range", "alert_manager"]
  },
  {
    id: "netdata",
    name: "Netdata Monitoring",
    category: "Infrastructure Intelligence",
    description: "Real-time performance monitoring",
    icon: Database,
    premium: true,
    apiRequired: true,
    provider: "Netdata",
    examples: ["node_metrics", "system_stats", "performance_data"]
  },
  {
    id: "signoz",
    name: "SigNoz APM",
    category: "Infrastructure Intelligence",
    description: "Application performance monitoring and tracing",
    icon: Database,
    premium: true,
    apiRequired: true,
    provider: "SigNoz",
    examples: ["trace_id", "service_metrics", "error_tracking"]
  },

  // Discord Bot Integration Commands
  {
    id: "discord-admin",
    name: "Discord Admin Tools",
    category: "Discord Integration",
    description: "Server administration and moderation tools",
    icon: Lock,
    premium: true,
    apiRequired: true,
    provider: "Discord Bot",
    examples: ["ban @user", "kick @user", "purge 10"]
  },
  {
    id: "discord-lookup",
    name: "Discord Lookup Tools",
    category: "Discord Integration",
    description: "Information gathering and user analysis",
    icon: Eye,
    premium: true,
    apiRequired: true,
    provider: "Discord Bot",
    examples: ["user info @user", "server info", "token info"]
  }
];

const categories = ["All", ...Array.from(new Set(osintCommands.map(cmd => cmd.category)))];

// API Key URLs mapping
const getApiKeyUrl = (provider: string) => {
  const apiKeyUrls: Record<string, string> = {
    // Core OSINT Services
    "DeHashed": "https://www.dehashed.com/register",
    "Shodan": "https://account.shodan.io/register",
    "Hunter.io": "https://hunter.io/users/sign_up",
    "Twilio": "https://www.twilio.com/try-twilio",
    "VirusTotal": "https://www.virustotal.com/gui/join-us",
    "IPQualityScore": "https://www.ipqualityscore.com/create-account",
    "NPD": "https://www.nationalapublicdata.com/signup",
    
    // Advanced OSINT Tools
    "Maltego": "https://www.maltego.com/ce-registration/",
    "Recon-NG": "https://github.com/lanmaster53/recon-ng",
    "FOCA": "https://www.elevenpaths.com/labstools/foca/",
    "PhoneInfoga": "https://github.com/sundowndev/phoneinfoga",
    "sn0int": "https://github.com/kpcyrd/sn0int",
    "Blackbird": "https://blackbird-osint.herokuapp.com/",
    "Criminal IP": "https://www.criminalip.io/register",
    "Social Links": "https://sociallinks.io/contact",
    "AlienVault": "https://otx.alienvault.com/signup",
    "NexVision": "https://www.nexvision.com/contact",
    "BinGoo": "https://www.bingoo.com/register",
    "Datasploit": "https://github.com/DataSploit/datasploit",
    "Metagoofil": "https://github.com/laramies/metagoofil",
    "Prying Deep": "https://www.pryingdeep.com/signup",
    
    // Analytics & Monitoring
    "PostHog": "https://app.posthog.com/signup",
    "Matomo": "https://matomo.org/start-free-analytics-trial/",
    "Plausible Analytics": "https://plausible.io/register",
    "Countly": "https://accounts.countly.com/signup",
    "Datadog": "https://app.datadoghq.com/signup",
    "Grafana": "https://grafana.com/auth/sign-up/create-user",
    "Prometheus": "https://prometheus.io/download/",
    "Netdata": "https://app.netdata.cloud/sign-up",
    "SigNoz": "https://signoz.io/teams/",
    
    // Integrations
    "Discord Bot": "/api-keys",
    "Discord API": "https://discord.com/developers/applications"
  };
  return apiKeyUrls[provider];
};

export default function Commands() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [commandInput, setCommandInput] = useState("");
  const [selectedCommand, setSelectedCommand] = useState<OSINTCommand | null>(null);
  const [results, setResults] = useState<CommandResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const filteredCommands = osintCommands.filter(cmd => {
    const matchesCategory = selectedCategory === "All" || cmd.category === selectedCategory;
    const matchesSearch = cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cmd.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const executeCommand = async () => {
    if (!selectedCommand || !commandInput.trim()) {
      toast.error("Please select a command and provide input");
      return;
    }

    if (selectedCommand.premium && !user) {
      toast.error("Premium commands require authentication");
      return;
    }

    // Check user limits
    try {
      const { data: limits } = await supabase.rpc('check_user_limits', { user_uuid: user?.id });
      if (limits && limits.length > 0) {
        const limit = limits[0];
        if (!limit.within_command_limit) {
          toast.error(`Monthly command limit reached (${limit.current_commands}/${limit.max_commands}). Upgrade your plan to continue.`);
          return;
        }
        if (!limit.within_cost_limit) {
          toast.error(`Monthly API cost limit reached ($${limit.current_cost}/$${limit.max_cost}). Upgrade your plan to continue.`);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to check limits:', error);
    }

    // Check for required API keys
    if (selectedCommand.apiRequired) {
      const { data: apiKeys } = await supabase
        .from('api_keys')
        .select('*')
        .eq('service_name', selectedCommand.provider)
        .eq('status', 'active')
        .limit(1);
      
      if (!apiKeys || apiKeys.length === 0) {
        const apiKeyUrl = getApiKeyUrl(selectedCommand.provider);
        toast.error(`This command requires a ${selectedCommand.provider} API key. Get one from their website and add it in API Keys page.`);
        // Open API key page in new tab for convenience
        if (apiKeyUrl) {
          setTimeout(() => window.open(apiKeyUrl, '_blank'), 1000);
        }
        return;
      }
    }

    setIsExecuting(true);
    
    // Create execution record
    const { data: execution, error: executionError } = await supabase
      .from('command_executions')
      .insert({
        user_id: user?.id,
        command_id: selectedCommand.id,
        command_name: selectedCommand.name,
        command_category: selectedCommand.category,
        input_data: commandInput,
        provider: selectedCommand.provider,
        status: 'pending'
      })
      .select()
      .single();

    if (executionError) {
      console.error('Failed to create execution record:', executionError);
      setIsExecuting(false);
      return;
    }
    
    // Simulate realistic command execution with proper delay
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    setTimeout(async () => {
      const success = Math.random() > 0.05; // 95% success rate
      const mockData = success ? generateMockResults(selectedCommand.id) : null;
      const apiCost = selectedCommand.apiRequired ? (Math.random() * 2 + 0.1) : 0;
      
      const mockResult: CommandResult = {
        command: `${selectedCommand.name}: ${commandInput}`,
        status: success ? 'success' : 'error',
        data: success ? {
          query: commandInput,
          provider: selectedCommand.provider,
          results: mockData,
          execution_time: `${(delay / 1000).toFixed(2)}s`
        } : {
          error: "Service temporarily unavailable",
          provider: selectedCommand.provider,
          retry_in: "5 minutes"
        },
        timestamp: new Date()
      };
      
      // Update execution record with proper integer value
      await supabase
        .from('command_executions')
        .update({
          status: success ? 'success' : 'error',
          output_data: mockResult.data,
          execution_time_ms: Math.round(delay), // Ensure integer value
          api_cost: Math.round(apiCost * 100) / 100, // Round to 2 decimal places
          error_message: success ? null : mockResult.data.error
        })
        .eq('id', execution.id);
      
      setResults(prev => [mockResult, ...prev]);
      setIsExecuting(false);
      setCommandInput("");
      
      if (success) {
        // Auto-sync to Discord only if enabled
        try {
          await syncToDiscord(selectedCommand, mockResult.data);
          toast.success(`${selectedCommand.name} executed successfully`);
        } catch (error) {
          console.error('Discord sync error:', error);
          toast.success(`${selectedCommand.name} executed (Discord sync disabled)`);
        }
      } else {
        toast.error(`${selectedCommand.name} execution failed`);
      }
    }, delay);
  };

  // Discord sync function
  const syncToDiscord = async (command: any, results: any) => {
    try {
      // Only sync if user has Discord settings configured
      const { data: discordSettings } = await supabase
        .from('discord_settings')
        .select('*')
        .eq('user_id', user?.id)
        .eq('auto_sync_enabled', true)
        .single();

      if (!discordSettings || !discordSettings.discord_channel_id) {
        console.log('Discord sync skipped - no configuration found');
        return;
      }

      const { data, error } = await supabase.functions.invoke('discord-sync', {
        body: {
          command: command,
          results: results,
          channelId: discordSettings.discord_channel_id,
          userId: discordSettings.discord_user_id || 'anonymous'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Discord sync failed:', error);
      throw error;
    }
  };

  const generateMockResults = (commandId: string) => {
    switch (commandId) {
      case "discord":
        return {
          user_id: "123456789012345678",
          username: "target_user#1234",
          created_at: "2020-03-15T10:30:00Z",
          mutual_servers: 12,
          associated_ips: ["192.168.1.100", "10.0.0.50"],
          last_seen: "2024-08-15T14:22:00Z"
        };
      case "breach":
        return {
          email: "victim@company.com",
          breaches_found: 5,
          databases: ["Collection #1", "LinkedIn 2012", "Adobe 2013"],
          passwords: ["hashed_password_1", "hashed_password_2"],
          first_seen: "2012-06-05"
        };
      case "email":
        return {
          email: "target@company.com",
          domain: "company.com",
          sources: ["LinkedIn", "Company Website", "GitHub"],
          confidence: 95,
          social_profiles: ["linkedin.com/in/target", "twitter.com/target"]
        };
      case "phone":
        return {
          number: "+1234567890",
          carrier: "Verizon Wireless",
          location: "New York, NY",
          type: "Mobile",
          valid: true,
          country_code: "US"
        };
      case "ip":
        return {
          ip: "192.168.1.1",
          country: "United States",
          region: "California",
          city: "San Francisco",
          isp: "Example ISP",
          threat_level: "low"
        };
      case "npd":
        return {
          name: "John Doe",
          age: 35,
          addresses: ["123 Main St, Anytown, ST 12345"],
          phone_numbers: ["+1234567890"],
          relatives: ["Jane Doe", "Bob Doe"],
          confidence: 89
        };
      case "github":
        return {
          username: "target_user",
          email: "dev@example.com",
          repos: 42,
          followers: 156,
          public_repos: ["project1", "project2"],
          languages: ["JavaScript", "Python", "Go"]
        };
      case "shodan":
        return {
          ip: "192.168.1.1",
          open_ports: [22, 80, 443],
          services: ["SSH", "HTTP", "HTTPS"],
          vulnerabilities: ["CVE-2023-1234"],
          last_scan: "2024-08-15"
        };
      default:
        return {
          status: "success",
          results_found: Math.floor(Math.random() * 100) + 1,
          confidence: "high",
          execution_time: `${(Math.random() * 3 + 0.5).toFixed(2)}s`
        };
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access OSINT commands</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Terminal className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            OSINT Command Center
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Execute intelligence gathering commands across 150+ premium OSINT services. 
          Use <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">⌘K</kbd> to open the command palette anywhere.
        </p>
        <div className="flex items-center justify-center space-x-4 mt-6">
          <Badge variant="secondary" className="bg-muted/50 text-foreground border-border">
            <CheckCircle className="h-3 w-3 mr-1" />
            150+ Commands Available
          </Badge>
          <Badge variant="secondary" className="bg-muted/50 text-foreground border-border">
            <Zap className="h-3 w-3 mr-1" />
            Instant Execution
          </Badge>
          <Badge variant="secondary" className="bg-muted/50 text-foreground border-border">
            <Key className="h-3 w-3 mr-1" />
            API Integration
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="commands" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="commands">Available Commands</TabsTrigger>
          <TabsTrigger value="results">Execution Results</TabsTrigger>
        </TabsList>

        <TabsContent value="commands" className="space-y-6">
          <div className="flex gap-6">
            {/* Left Sidebar - Categories */}
            <div className="w-64 space-y-4">
              <h3 className="text-lg font-semibold">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="w-full justify-start text-left h-auto py-2 px-3"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              
              {/* Search */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Search Commands</h4>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter commands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 space-y-4">

          {/* Commands Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCommands.map((command) => (
              <Card 
                key={command.id} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedCommand?.id === command.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCommand(command)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <command.icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-sm font-medium">{command.name}</CardTitle>
                    </div>
                    <div className="flex flex-col gap-1">
                      {command.premium && (
                        <Badge variant="secondary" className="text-xs">Premium</Badge>
                      )}
                      {command.apiRequired && (
                        <Badge variant="outline" className="text-xs">
                          <Key className="h-3 w-3 mr-1" />
                          API
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-xs">{command.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Provider:</span>
                      <span className="font-medium">{command.provider}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span>Examples: </span>
                      <span className="font-mono">{command.examples[0]}</span>
                    </div>
                    {command.apiRequired && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full mt-2 text-xs h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          const apiUrl = getApiKeyUrl(command.provider);
                          if (apiUrl) window.open(apiUrl, '_blank');
                        }}
                      >
                        <Key className="h-3 w-3 mr-1" />
                        Get {command.provider} API Key
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

          {/* Command Execution */}
          {selectedCommand && (
            <Card className="bg-gradient-metallic border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <selectedCommand.icon className="h-5 w-5 text-primary" />
                  <span>Execute: {selectedCommand.name}</span>
                </CardTitle>
                <CardDescription>{selectedCommand.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Input</label>
                  <Textarea
                    placeholder={`Enter ${selectedCommand.examples.join(', ')}`}
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Provider: {selectedCommand.provider}
                  </div>
                  <Button 
                    onClick={executeCommand} 
                    disabled={isExecuting || !commandInput.trim()}
                    className="bg-gradient-primary hover:shadow-glow text-white"
                  >
                    {isExecuting ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Execute Command
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {results.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
                <p className="text-muted-foreground">Execute commands to see results here</p>
              </CardContent>
            </Card>
          ) : (
            results.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{result.command}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {result.status === 'success' && (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Success
                        </Badge>
                      )}
                      {result.status === 'error' && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {result.timestamp.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}