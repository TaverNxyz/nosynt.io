import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Activity, 
  TrendingUp, 
  Database, 
  Key, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8 text-center">
        <div className="relative z-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            OSINT Intelligence Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Professional-grade Open Source Intelligence gathering with 25+ premium providers, 
            real-time monitoring, and enterprise-level security compliance
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button asChild className="bg-gradient-primary shadow-primary">
              <Link to="/api-keys">
                <Key className="h-4 w-4 mr-2" />
                Manage API Keys
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/providers">
                <Database className="h-4 w-4 mr-2" />
                View Providers
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Providers</p>
                <p className="text-2xl font-bold text-[hsl(var(--security-green))]">23/25</p>
              </div>
              <CheckCircle className="h-8 w-8 text-[hsl(var(--security-green))]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold text-foreground">1.2s</p>
              </div>
              <Zap className="h-8 w-8 text-[hsl(var(--cyber-blue))]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Queries</p>
                <p className="text-2xl font-bold text-foreground">1,250</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Score</p>
                <p className="text-2xl font-bold text-[hsl(var(--security-green))]">95%</p>
              </div>
              <Shield className="h-8 w-8 text-[hsl(var(--security-green))]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>API Key Management</span>
            </CardTitle>
            <CardDescription>
              Securely manage your premium OSINT service API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active API Keys</span>
              <Badge variant="outline" className="bg-[hsl(var(--security-green))]/10 text-[hsl(var(--security-green))] border-[hsl(var(--security-green))]/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                3 Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Expired Keys</span>
              <Badge variant="outline" className="bg-[hsl(var(--security-red))]/10 text-[hsl(var(--security-red))] border-[hsl(var(--security-red))]/20">
                <AlertTriangle className="h-3 w-3 mr-1" />
                1 Expired
              </Badge>
            </div>
            <Button asChild className="w-full bg-gradient-security">
              <Link to="/api-keys">Manage Keys</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription>
              Real-time monitoring of all OSINT providers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Operational Services</span>
              <Badge variant="outline" className="bg-[hsl(var(--security-green))]/10 text-[hsl(var(--security-green))] border-[hsl(var(--security-green))]/20">
                23 Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Maintenance Mode</span>
              <Badge variant="outline" className="bg-[hsl(var(--cyber-blue))]/10 text-[hsl(var(--cyber-blue))] border-[hsl(var(--cyber-blue))]/20">
                <Clock className="h-3 w-3 mr-1" />
                2 Services
              </Badge>
            </div>
            <Button asChild className="w-full bg-gradient-security">
              <Link to="/providers">View Status</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Platform Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Implementation Tracking</CardTitle>
            <CardDescription>5-phase development roadmap with $140k investment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Phase 2: Core Features</span>
                <span className="font-medium">75%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/implementation">View Roadmap</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Security Compliance</CardTitle>
            <CardDescription>GDPR, SOC 2, ISO 27001, and NIST frameworks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Compliance</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-[hsl(var(--security-green))] h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/security">Security Dashboard</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Premium Calculator</CardTitle>
            <CardDescription>4-tier pricing: Free → Premium → Pro → Enterprise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Current: Premium Plan</span>
                <Badge className="bg-gradient-primary text-primary-foreground">$15/mo</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                1,250/5,000 queries used this month
              </div>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/premium">Manage Subscription</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
