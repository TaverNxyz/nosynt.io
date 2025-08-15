import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
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
  // Domain & IP Intelligence
  {
    id: "whois",
    name: "WHOIS Lookup",
    category: "Domain Intelligence",
    description: "Domain registration and ownership information",
    icon: Globe,
    premium: false,
    apiRequired: false,
    provider: "Built-in",
    examples: ["example.com", "192.168.1.1"]
  },
  {
    id: "subdomain",
    name: "Subdomain Enumeration",
    category: "Domain Intelligence", 
    description: "Discover subdomains and DNS records",
    icon: Database,
    premium: true,
    apiRequired: true,
    provider: "SecurityTrails",
    examples: ["target.com", "*.example.com"],
    cost: "$0.10/query"
  },
  {
    id: "shodan",
    name: "Shodan Search",
    category: "Network Intelligence",
    description: "Internet-connected device intelligence",
    icon: Wifi,
    premium: true,
    apiRequired: true,
    provider: "Shodan",
    examples: ["apache", "product:MySQL", "192.168.1.0/24"],
    cost: "$0.25/query"
  },
  
  // Email Intelligence
  {
    id: "email-verify",
    name: "Email Verification",
    category: "Email Intelligence",
    description: "Verify email existence and deliverability",
    icon: Mail,
    premium: false,
    apiRequired: false,
    provider: "Built-in",
    examples: ["test@example.com"]
  },
  {
    id: "email-breach",
    name: "Data Breach Check",
    category: "Email Intelligence",
    description: "Check if email appears in known breaches",
    icon: Shield,
    premium: true,
    apiRequired: true,
    provider: "DeHashed",
    examples: ["victim@company.com"],
    cost: "$0.50/query"
  },
  
  // Phone Intelligence
  {
    id: "phone-lookup",
    name: "Phone Number Lookup",
    category: "Phone Intelligence",
    description: "Carrier, location, and validation data",
    icon: Phone,
    premium: true,
    apiRequired: true,
    provider: "Twilio",
    examples: ["+1234567890", "555-123-4567"],
    cost: "$0.05/query"
  },
  
  // Social Media Intelligence
  {
    id: "social-search",
    name: "Social Media Search",
    category: "Social Intelligence",
    description: "Find social media profiles and posts",
    icon: User,
    premium: true,
    apiRequired: true,
    provider: "Social Links",
    examples: ["@username", "john.doe"],
    cost: "$0.15/query"
  },
  
  // Business Intelligence
  {
    id: "company-lookup",
    name: "Company Lookup",
    category: "Business Intelligence",
    description: "Business registration and corporate data",
    icon: Building,
    premium: true,
    apiRequired: true,
    provider: "OpenCorporates",
    examples: ["Apple Inc", "12345678"],
    cost: "$0.20/query"
  },
  
  // Image Intelligence
  {
    id: "reverse-image",
    name: "Reverse Image Search",
    category: "Image Intelligence",
    description: "Find similar images and sources",
    icon: Camera,
    premium: false,
    apiRequired: false,
    provider: "TinEye",
    examples: ["Upload image file"]
  },
  
  // Hash Intelligence
  {
    id: "hash-lookup",
    name: "Hash Lookup",
    category: "Crypto Intelligence", 
    description: "Identify file hashes and malware",
    icon: Hash,
    premium: true,
    apiRequired: true,
    provider: "VirusTotal",
    examples: ["d41d8cd98f00b204e9800998ecf8427e"],
    cost: "$0.01/query"
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

    if (selectedCommand.apiRequired) {
      toast.error(`This command requires a ${selectedCommand.provider} API key. Please configure it in API Keys page.`);
      return;
    }

    setIsExecuting(true);
    
    // Simulate command execution
    setTimeout(() => {
      const mockResult: CommandResult = {
        command: `${selectedCommand.name}: ${commandInput}`,
        status: 'success',
        data: {
          query: commandInput,
          provider: selectedCommand.provider,
          results: generateMockResults(selectedCommand.id),
          cost: selectedCommand.cost || "Free"
        },
        timestamp: new Date()
      };
      
      setResults(prev => [mockResult, ...prev]);
      setIsExecuting(false);
      setCommandInput("");
      toast.success(`${selectedCommand.name} executed successfully`);
    }, 2000);
  };

  const generateMockResults = (commandId: string) => {
    switch (commandId) {
      case "whois":
        return {
          domain: "example.com",
          registrar: "Example Registrar",
          created: "1995-08-14",
          expires: "2025-08-14",
          nameservers: ["ns1.example.com", "ns2.example.com"]
        };
      case "email-verify":
        return {
          email: "test@example.com",
          valid: true,
          deliverable: true,
          risk: "low"
        };
      default:
        return {
          status: "success",
          results_found: Math.floor(Math.random() * 100) + 1,
          confidence: "high"
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