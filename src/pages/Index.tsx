import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Key, 
  Database, 
  CheckCircle, 
  Zap, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  Clock,
  Calculator,
  Search,
  Globe,
  Eye
} from "lucide-react";

export default function Index() {
  const { user } = useAuth();
  const [apiKeyStats, setApiKeyStats] = useState({ active: 0, expired: 0 });

  useEffect(() => {
    if (user) {
      fetchApiKeyStats();
    }
  }, [user]);

  const fetchApiKeyStats = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('status');

      if (error) throw error;

      const stats = (data || []).reduce(
        (acc, key) => {
          if (key.status === 'active') acc.active++;
          else if (key.status === 'expired' || key.status === 'invalid') acc.expired++;
          return acc;
        },
        { active: 0, expired: 0 }
      );

      setApiKeyStats(stats);
    } catch (error) {
      console.error('Error fetching API key stats:', error);
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to access the OSINT platform</p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8 relative">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12 relative z-10">
        <div className="space-y-4">
          <div className="relative inline-block">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground relative z-10">
              deaddrop.io
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional Open Source Intelligence gathering and analysis platform. 
            Aggregate data from 25+ premium OSINT services with enterprise-grade security.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="hover:scale-105 transition-transform">
            <Link to="/commands">
              <Search className="mr-2 h-5 w-5" />
              Execute Commands
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="hover:scale-105 transition-transform">
            <Link to="/api-keys">
              <Key className="mr-2 h-5 w-5" />
              Manage API Keys
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <Card className="hover:scale-105 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Providers</p>
                <p className="text-2xl font-bold text-terminal-green">23/25</p>
              </div>
              <CheckCircle className="h-8 w-8 text-terminal-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold text-foreground">1.2s</p>
              </div>
              <Zap className="h-8 w-8 text-terminal-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Queries</p>
                <p className="text-2xl font-bold text-foreground">12.4K</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Score</p>
                <p className="text-2xl font-bold text-terminal-green">95%</p>
              </div>
              <Shield className="h-8 w-8 text-terminal-green" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* API Key Management */}
        <Card className="hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-primary" />
              <span>API Key Management</span>
            </CardTitle>
            <CardDescription>
              Secure storage and management of premium OSINT API credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active API Keys</span>
              <Badge variant="outline" className="text-terminal-green">
                <CheckCircle className="h-3 w-3 mr-1" />
                {apiKeyStats.active} Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Expired Keys</span>
              <Badge variant="outline" className="text-terminal-red">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {apiKeyStats.expired} Expired
              </Badge>
            </div>
            <Button asChild className="w-full" variant="outline">
              <Link to="/api-keys">
                <Key className="mr-2 h-4 w-4" />
                Manage Keys
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-terminal-blue" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription>
              Real-time monitoring of all OSINT service providers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Operational Services</span>
              <Badge variant="outline" className="text-terminal-green">
                23 Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Maintenance Mode</span>
              <Badge variant="outline" className="text-terminal-amber">
                <Clock className="h-3 w-3 mr-1" />
                2 Services
              </Badge>
            </div>
            <Button asChild className="w-full" variant="outline">
              <Link to="/providers">
                <Activity className="mr-2 h-4 w-4" />
                View Status
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Platform Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <Card className="hover:scale-105 transition-transform duration-300">
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
              <Link to="/implementation">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Roadmap
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-300">
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
                <div className="bg-terminal-green h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/security">
                <Shield className="mr-2 h-4 w-4" />
                Security Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Premium Calculator</CardTitle>
            <CardDescription>4-tier pricing: Free → Premium → Pro → Enterprise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Current: Premium Plan</span>
                <Badge className="bg-primary text-primary-foreground">$15/mo</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                12.4K/25K queries used this month
              </div>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/premium">
                <Calculator className="mr-2 h-4 w-4" />
                Manage Subscription
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}