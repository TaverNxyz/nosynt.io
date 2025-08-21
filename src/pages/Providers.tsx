import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Activity,
  Database,
  Zap,
  TrendingUp
} from "lucide-react";

interface Provider {
  id: string;
  name: string;
  category: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  description: string;
  features: string[];
  rateLimit: string;
  cost: string;
}

const mockProviders: Provider[] = [
  {
    id: "1",
    name: "DeHashed",
    category: "Breach Data",
    status: "operational",
    responseTime: 245,
    uptime: 99.8,
    lastCheck: "2 min ago",
    description: "Comprehensive breach database with 12+ billion records",
    features: ["Email lookups", "Password history", "Breach notifications"],
    rateLimit: "1000/hour",
    cost: "$0.50/query"
  },
  {
    id: "2",
    name: "Shodan",
    category: "IoT Scanning",
    status: "operational", 
    responseTime: 156,
    uptime: 99.9,
    lastCheck: "1 min ago",
    description: "Internet-connected device search engine",
    features: ["Device discovery", "Vulnerability scanning", "Historical data"],
    rateLimit: "100/month (free)",
    cost: "$59/month"
  },
  {
    id: "3",
    name: "Hunter.io",
    category: "Email Intelligence",
    status: "degraded",
    responseTime: 892,
    uptime: 98.5,
    lastCheck: "3 min ago",
    description: "Email finder and verification service",
    features: ["Email discovery", "Verification", "Domain search"],
    rateLimit: "100/month (free)",
    cost: "$49/month"
  },
  {
    id: "4",
    name: "VirusTotal",
    category: "Threat Intelligence",
    status: "operational",
    responseTime: 198,
    uptime: 99.7,
    lastCheck: "1 min ago",
    description: "Malware detection and URL analysis",
    features: ["File scanning", "URL analysis", "Domain intelligence"],
    rateLimit: "500/day (free)",
    cost: "Free/Premium"
  },
  {
    id: "5",
    name: "Twilio",
    category: "Communication",
    status: "maintenance",
    responseTime: 0,
    uptime: 99.2,
    lastCheck: "5 min ago",
    description: "SMS and voice communication platform",
    features: ["SMS sending", "Voice calls", "Phone verification"],
    rateLimit: "No limit",
    cost: "$0.0075/SMS"
  },
  {
    id: "6",
    name: "IPQualityScore",
    category: "IP Intelligence",
    status: "outage",
    responseTime: 0,
    uptime: 97.8,
    lastCheck: "15 min ago",
    description: "IP reputation and fraud detection",
    features: ["IP scoring", "Proxy detection", "Geolocation"],
    rateLimit: "5000/month (free)",
    cost: "$0.004/query"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational':
      return 'text-terminal-green bg-terminal-green/10 border-terminal-green/20';
    case 'degraded':
      return 'text-terminal-amber bg-terminal-amber/10 border-terminal-amber/20';
    case 'outage':
      return 'text-terminal-red bg-terminal-red/10 border-terminal-red/20';
    case 'maintenance':
      return 'text-terminal-blue bg-terminal-blue/10 border-terminal-blue/20';
    default:
      return 'text-muted-foreground bg-muted/10 border-muted/20';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'operational':
      return <CheckCircle className="h-4 w-4" />;
    case 'degraded':
      return <AlertTriangle className="h-4 w-4" />;
    case 'outage':
      return <XCircle className="h-4 w-4" />;
    case 'maintenance':
      return <Clock className="h-4 w-4" />;
    default:
      return null;
  }
};

export default function Providers() {
  const [providers] = useState<Provider[]>(mockProviders);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(providers.map(p => p.category)))];
  
  const filteredProviders = selectedCategory === "all" 
    ? providers 
    : providers.filter(p => p.category === selectedCategory);

  const operationalCount = providers.filter(p => p.status === 'operational').length;
  const totalProviders = providers.length;
  const avgResponseTime = providers.reduce((acc, p) => acc + p.responseTime, 0) / providers.length;
  const avgUptime = providers.reduce((acc, p) => acc + p.uptime, 0) / providers.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Provider Monitoring</h1>
        <p className="text-muted-foreground mt-2">
          Real-time status monitoring for all OSINT service providers
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Operational</p>
                <p className="text-2xl font-bold text-terminal-green">
                  {operationalCount}/{totalProviders}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-terminal-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(avgResponseTime)}ms
                </p>
              </div>
              <Zap className="h-8 w-8 text-terminal-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Uptime</p>
                <p className="text-2xl font-bold text-foreground">
                  {avgUptime.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-terminal-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Services</p>
                <p className="text-2xl font-bold text-foreground">{totalProviders}</p>
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status">Service Status</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-gradient-primary" : ""}
              >
                {category === "all" ? "All Services" : category}
              </Button>
            ))}
          </div>

          {/* Provider Grid */}
          <div className="grid gap-4">
            {filteredProviders.map((provider) => (
              <Card key={provider.id} className="bg-gradient-card shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <CardDescription>{provider.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(provider.status)}>
                      {getStatusIcon(provider.status)}
                      <span className="ml-1 capitalize">{provider.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Response Time</p>
                      <p className="font-semibold">{provider.responseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Uptime</p>
                      <p className="font-semibold">{provider.uptime}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rate Limit</p>
                      <p className="font-semibold">{provider.rateLimit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost</p>
                      <p className="font-semibold">{provider.cost}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {provider.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
                <CardDescription>Average response times over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Analytics dashboard coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle>Uptime History</CardTitle>
                <CardDescription>Service availability over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Uptime monitoring dashboard</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}