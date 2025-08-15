import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity, 
  Database, 
  Globe,
  Eye,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Settings
} from "lucide-react";

interface AnalyticsPlatform {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  usage: number;
  icon: React.ComponentType<any>;
  features: string[];
  integration: 'connected' | 'available' | 'enterprise';
}

const analyticsPlatforms: AnalyticsPlatform[] = [
  {
    id: "posthog",
    name: "PostHog",
    description: "Product analytics, feature flags, and session recordings",
    status: 'active',
    usage: 85,
    icon: BarChart3,
    features: ["Event Tracking", "User Funnels", "Feature Flags", "Session Replay"],
    integration: 'connected'
  },
  {
    id: "matomo",
    name: "Matomo",
    description: "Privacy-focused web analytics platform",
    status: 'active',
    usage: 72,
    icon: Globe,
    features: ["Privacy Compliance", "Real-time Analytics", "Goal Tracking"],
    integration: 'connected'
  },
  {
    id: "metabase",
    name: "Metabase",
    description: "Business intelligence and data visualization",
    status: 'active',
    usage: 60,
    icon: Database,
    features: ["SQL Queries", "Dashboards", "Data Visualization", "Alerts"],
    integration: 'connected'
  },
  {
    id: "plausible",
    name: "Plausible Analytics",
    description: "Simple, privacy-friendly web analytics",
    status: 'active',
    usage: 45,
    icon: TrendingUp,
    features: ["Lightweight", "GDPR Compliant", "No Cookies", "Open Source"],
    integration: 'available'
  },
  {
    id: "superset",
    name: "Apache Superset",
    description: "Modern data exploration and visualization platform",
    status: 'maintenance',
    usage: 30,
    icon: BarChart3,
    features: ["Rich Visualizations", "SQL Lab", "Security", "Scalability"],
    integration: 'available'
  },
  {
    id: "grafana",
    name: "Grafana",
    description: "Observability and monitoring platform",
    status: 'active',
    usage: 90,
    icon: Activity,
    features: ["Monitoring", "Alerting", "Visualization", "Observability"],
    integration: 'connected'
  },
  {
    id: "datadog",
    name: "Datadog",
    description: "Cloud monitoring and security platform",
    status: 'active',
    usage: 95,
    icon: Eye,
    features: ["APM", "Infrastructure Monitoring", "Log Management", "Security"],
    integration: 'enterprise'
  },
  {
    id: "prometheus",
    name: "Prometheus",
    description: "Systems monitoring and alerting toolkit",
    status: 'active',
    usage: 78,
    icon: Clock,
    features: ["Time Series DB", "Alerting", "Service Discovery", "Exporters"],
    integration: 'connected'
  }
];

const usageStats = {
  totalQueries: 45621,
  activeUsers: 1247,
  successRate: 98.5,
  avgResponseTime: 1.2,
  monthlyGrowth: 23.5
};

export default function Analytics() {
  const [selectedPlatform, setSelectedPlatform] = useState<AnalyticsPlatform | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'maintenance': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'inactive': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getIntegrationColor = (integration: string) => {
    switch (integration) {
      case 'connected': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'available': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'enterprise': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Analytics & Monitoring
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive analytics and monitoring across multiple platforms for OSINT intelligence operations
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-metallic border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Queries</p>
                <p className="text-2xl font-bold text-foreground">{usageStats.totalQueries.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-metallic border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">{usageStats.activeUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-metallic border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-500">{usageStats.successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-metallic border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold text-foreground">{usageStats.avgResponseTime}s</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-metallic border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Growth</p>
                <p className="text-2xl font-bold text-primary">+{usageStats.monthlyGrowth}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="platforms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms">Analytics Platforms</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-6">
          {/* Analytics Platforms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsPlatforms.map((platform) => (
              <Card 
                key={platform.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedPlatform?.id === platform.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedPlatform(platform)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <platform.icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className={getStatusColor(platform.status)}>
                        {platform.status}
                      </Badge>
                      <Badge variant="outline" className={getIntegrationColor(platform.integration)}>
                        {platform.integration}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{platform.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Usage</span>
                        <span>{platform.usage}%</span>
                      </div>
                      <Progress value={platform.usage} className="h-2" />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Key Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {platform.features.slice(0, 2).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {platform.features.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{platform.features.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Platform Details */}
          {selectedPlatform && (
            <Card className="bg-gradient-metallic border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <selectedPlatform.icon className="h-6 w-6 text-primary" />
                  <span>{selectedPlatform.name} Integration</span>
                </CardTitle>
                <CardDescription>{selectedPlatform.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Status</p>
                    <Badge className={getStatusColor(selectedPlatform.status)}>
                      {selectedPlatform.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Integration</p>
                    <Badge className={getIntegrationColor(selectedPlatform.integration)}>
                      {selectedPlatform.integration}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Usage</p>
                    <p className="text-lg font-bold">{selectedPlatform.usage}%</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">All Features</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlatform.features.map((feature) => (
                      <Badge key={feature} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    View Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics Dashboard</CardTitle>
              <CardDescription>Detailed analytics and insights from connected platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboards will be displayed here</p>
                <p className="text-sm">Connect to external analytics platforms to view detailed reports</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Monitoring</CardTitle>
              <CardDescription>Real-time system performance and health monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Monitoring dashboards will be displayed here</p>
                <p className="text-sm">Real-time metrics from Grafana, Prometheus, and Datadog</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}