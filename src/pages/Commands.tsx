import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
  Zap
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
  cost?: string;
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
    examples: ["username#1234", "user_id", "server_id"],
    cost: "$0.25/query"
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
    examples: ["email@domain.com", "username", "phone_number"],
    cost: "$0.50/query"
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
    examples: ["target@company.com", "domain.com"],
    cost: "$0.15/query"
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
    examples: ["+1234567890", "555-123-4567"],
    cost: "$0.05/query"
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
    examples: ["John Doe", "SSN", "Address"],
    cost: "$1.00/query"
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
    examples: ["apache", "product:MySQL", "192.168.1.0/24"],
    cost: "$0.25/query"
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
    examples: ["domain.com", "email@domain.com", "phone_number"],
    cost: "$2.00/query"
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
    examples: ["domain.com", "company_name", "person_name"],
    cost: "$0.30/query"
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
    examples: ["document_url", "domain.com"],
    cost: "$0.20/query"
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
    examples: ["+33656108576", "+1234567890"],
    cost: "$0.10/query"
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
    examples: ["domain.com", "person_name", "company_name"],
    cost: "$0.40/query"
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
    examples: ["username", "handle"],
    cost: "$0.15/query"
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
    examples: ["192.168.1.1", "malicious_domain.com"],
    cost: "$0.35/query"
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
    examples: ["@username", "profile_url", "email@domain.com"],
    cost: "$0.75/query"
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
    examples: ["ban @user", "kick @user", "purge 10"],
    cost: "Included"
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
    examples: ["user info @user", "server info", "token info"],
    cost: "Included"
  }
];

const categories = ["All", ...Array.from(new Set(osintCommands.map(cmd => cmd.category)))];

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

    setIsExecuting(true);
    
    try {
      let result;
      
      if (selectedCommand.id === 'shodan') {
        // Use Shodan edge function for Shodan searches
        const { data, error } = await supabase.functions.invoke('shodan-search', {
          body: { 
            query: commandInput.trim(),
            user_id: user?.id 
          }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        result = data;
      } else {
        // Use general OSINT command function for other commands
        const { data, error } = await supabase.functions.invoke('osint-command', {
          body: { 
            command: selectedCommand.id,
            input: commandInput.trim(),
            user_id: user?.id 
          }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        result = data.result;
      }

      const commandResult: CommandResult = {
        command: `${selectedCommand.name}: ${commandInput}`,
        status: 'success',
        data: result,
        timestamp: new Date()
      };
      
      setResults(prev => [commandResult, ...prev]);
      setCommandInput("");
      toast.success(`${selectedCommand.name} executed successfully`);
      
    } catch (error: any) {
      const errorResult: CommandResult = {
        command: `${selectedCommand.name}: ${commandInput}`,
        status: 'error',
        data: { error: error.message },
        timestamp: new Date()
      };
      
      setResults(prev => [errorResult, ...prev]);
      toast.error(`Error executing ${selectedCommand.name}: ${error.message}`);
    } finally {
      setIsExecuting(false);
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
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          OSINT Command Center
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Execute intelligence gathering commands across 25+ premium OSINT services. 
          Bring your own API keys for premium features.
        </p>
      </div>

      <Tabs defaultValue="commands" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="commands">Available Commands</TabsTrigger>
          <TabsTrigger value="results">Execution Results</TabsTrigger>
        </TabsList>

        <TabsContent value="commands" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search commands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Commands Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    {command.cost && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="font-medium text-primary">{command.cost}</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      <span>Examples: </span>
                      <span className="font-mono">{command.examples[0]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                    Provider: {selectedCommand.provider} | Cost: {selectedCommand.cost || "Free"}
                    {selectedCommand.apiRequired && (
                      <Badge variant="outline" className="ml-2">
                        <Key className="h-3 w-3 mr-1" />
                        API Key Required
                      </Badge>
                    )}
                  </div>
                  <Button 
                    onClick={executeCommand} 
                    disabled={isExecuting || !commandInput.trim()}
                    className="bg-gradient-primary hover:shadow-glow"
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