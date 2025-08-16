import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 bg-gradient-cosmic pointer-events-none" />
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-primary rounded-full opacity-20 blur-3xl animate-float" />
      <div className="absolute bottom-40 left-20 w-48 h-48 bg-gradient-security rounded-full opacity-10 blur-3xl animate-pulse-glow" />
      
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12 relative z-10">
        <div className="space-y-4 animate-slide-in-bottom">
          <div className="relative inline-block">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent relative z-10">
              OSINT Intelligence Platform
            </h1>
            <div className="absolute inset-0 bg-gradient-primary bg-clip-text text-transparent blur-sm opacity-50 animate-pulse-glow">
              OSINT Intelligence Platform
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-in-bottom [animation-delay:200ms]">
            Professional Open Source Intelligence gathering and analysis platform. 
            Aggregate data from 25+ premium OSINT services with enterprise-grade security.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-in-bottom [animation-delay:400ms]">
          <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300 hover:scale-105 group relative overflow-hidden text-white">
            <Link to="/commands">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 animate-shimmer bg-[length:200%_100%]" />
              <Search className="mr-2 h-5 w-5 relative z-10 text-white" />
              <span className="relative z-10 text-white">Execute Commands</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="hover:bg-secondary/50 transition-all duration-300 hover:scale-105 hover:shadow-floating group">
            <Link to="/api-keys">
              <Key className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              Manage API Keys
            </Link>
          </Button>
        </div>
        
        {/* Floating Icons */}
        <div className="absolute top-0 left-1/4 animate-cosmic-orbit">
          <Search className="h-6 w-6 text-cyber-blue/40" />
        </div>
        <div className="absolute top-0 right-1/4 animate-cosmic-orbit [animation-delay:10s]">
          <Globe className="h-6 w-6 text-cyber-purple/40" />
        </div>
        <div className="absolute top-0 left-3/4 animate-cosmic-orbit [animation-delay:15s]">
          <Eye className="h-6 w-6 text-[hsl(var(--security-green))]/40" />
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <Card className="bg-gradient-metallic border-border/50 shadow-floating hover:shadow-cosmic transition-all duration-500 hover:scale-105 group animate-scale-in backdrop-blur-sm">
          <CardContent className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--security-green))]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-muted-foreground">Active Providers</p>
                <p className="text-2xl font-bold text-[hsl(var(--security-green))] group-hover:animate-pulse">23/25</p>
              </div>
              <CheckCircle className="h-8 w-8 text-[hsl(var(--security-green))] group-hover:animate-float" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-metallic border-border/50 shadow-floating hover:shadow-cosmic transition-all duration-500 hover:scale-105 group animate-scale-in [animation-delay:100ms] backdrop-blur-sm">
          <CardContent className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--cyber-blue))]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold text-foreground group-hover:animate-pulse">1.2s</p>
              </div>
              <Zap className="h-8 w-8 text-[hsl(var(--cyber-blue))] group-hover:animate-float" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-metallic border-border/50 shadow-floating hover:shadow-cosmic transition-all duration-500 hover:scale-105 group animate-scale-in [animation-delay:200ms] backdrop-blur-sm">
          <CardContent className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Queries</p>
                <p className="text-2xl font-bold text-foreground group-hover:animate-pulse">12.4K</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary group-hover:animate-float" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-metallic border-border/50 shadow-floating hover:shadow-cosmic transition-all duration-500 hover:scale-105 group animate-scale-in [animation-delay:300ms] backdrop-blur-sm">
          <CardContent className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--security-green))]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-muted-foreground">Security Score</p>
                <p className="text-2xl font-bold text-[hsl(var(--security-green))] group-hover:animate-pulse">95%</p>
              </div>
              <Shield className="h-8 w-8 text-[hsl(var(--security-green))] group-hover:animate-float" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* API Key Management */}
        <Card className="bg-gradient-metallic border-border/50 shadow-floating hover:shadow-cosmic transition-all duration-500 group animate-slide-in-right backdrop-blur-sm">
          <CardHeader className="relative">
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-primary rounded-full animate-pulse-glow" />
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-primary group-hover:animate-float" />
              <span>API Key Management</span>
            </CardTitle>
            <CardDescription>
              Secure storage and management of premium OSINT API credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
            <div className="flex items-center justify-between relative z-10">
              <span className="text-sm">Active API Keys</span>
              <Badge variant="outline" className="bg-[hsl(var(--security-green))]/10 text-[hsl(var(--security-green))] border-[hsl(var(--security-green))]/20 hover:shadow-glow transition-all duration-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                3 Active
              </Badge>
            </div>
            <div className="flex items-center justify-between relative z-10">
              <span className="text-sm">Expired Keys</span>
              <Badge variant="outline" className="bg-[hsl(var(--security-red))]/10 text-[hsl(var(--security-red))] border-[hsl(var(--security-red))]/20 hover:shadow-glow transition-all duration-300">
                <AlertTriangle className="h-3 w-3 mr-1" />
                1 Expired
              </Badge>
            </div>
            <Button asChild className="w-full mt-4 relative z-10 group/button" variant="outline">
              <Link to="/api-keys">
                <Key className="mr-2 h-4 w-4 group-hover/button:animate-pulse" />
                Manage Keys
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-gradient-metallic border-border/50 shadow-floating hover:shadow-cosmic transition-all duration-500 group animate-slide-in-right [animation-delay:200ms] backdrop-blur-sm">
          <CardHeader className="relative">
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-security rounded-full animate-pulse-glow" />
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-[hsl(var(--cyber-blue))] group-hover:animate-float" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription>
              Real-time monitoring of all OSINT service providers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--cyber-blue))]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
            <div className="flex items-center justify-between relative z-10">
              <span className="text-sm">Operational Services</span>
              <Badge variant="outline" className="bg-[hsl(var(--security-green))]/10 text-[hsl(var(--security-green))] border-[hsl(var(--security-green))]/20 hover:shadow-glow transition-all duration-300">
                23 Online
              </Badge>
            </div>
            <div className="flex items-center justify-between relative z-10">
              <span className="text-sm">Maintenance Mode</span>
              <Badge variant="outline" className="bg-[hsl(var(--cyber-blue))]/10 text-[hsl(var(--cyber-blue))] border-[hsl(var(--cyber-blue))]/20 hover:shadow-glow transition-all duration-300">
                <Clock className="h-3 w-3 mr-1" />
                2 Services
              </Badge>
            </div>
            <Button asChild className="w-full mt-4 relative z-10 group/button" variant="outline">
              <Link to="/providers">
                <Activity className="mr-2 h-4 w-4 group-hover/button:animate-pulse" />
                View Status
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Platform Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <Card className="bg-gradient-metallic border-border/50 shadow-floating hover:shadow-cosmic transition-all duration-500 group animate-scale-in backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">Implementation Tracking</CardTitle>
            <CardDescription>5-phase development roadmap with $140k investment</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between text-sm">
                <span>Phase 2: Core Features</span>
                <span className="font-medium">75%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full group-hover:animate-pulse" style={{ width: '75%' }} />
              </div>
            </div>
            <Button asChild className="w-full mt-4 group/button" variant="outline">
              <Link to="/implementation">
                <TrendingUp className="mr-2 h-4 w-4 group-hover/button:animate-pulse" />
                View Roadmap
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-metallic border-border/50 shadow-floating hover:shadow-cosmic transition-all duration-500 group animate-scale-in [animation-delay:100ms] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg group-hover:text-[hsl(var(--security-green))] transition-colors duration-300">Security Compliance</CardTitle>
            <CardDescription>GDPR, SOC 2, ISO 27001, and NIST frameworks</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--security-green))]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Compliance</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-[hsl(var(--security-green))] h-2 rounded-full group-hover:animate-pulse" style={{ width: '85%' }} />
              </div>
            </div>
            <Button asChild className="w-full mt-4 group/button" variant="outline">
              <Link to="/security">
                <Shield className="mr-2 h-4 w-4 group-hover/button:animate-pulse" />
                Security Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-metallic border-border/50 shadow-floating hover:shadow-cosmic transition-all duration-500 group animate-scale-in [animation-delay:200ms] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg group-hover:text-[hsl(var(--cyber-purple))] transition-colors duration-300">Premium Calculator</CardTitle>
            <CardDescription>4-tier pricing: Free → Premium → Pro → Enterprise</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--cyber-purple))]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between text-sm">
                <span>Current: Premium Plan</span>
                <Badge className="bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300">$15/mo</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                12.4K/25K queries used this month
              </div>
            </div>
            <Button asChild className="w-full mt-4 group/button" variant="outline">
              <Link to="/premium">
                <Calculator className="mr-2 h-4 w-4 group-hover/button:animate-pulse" />
                Manage Subscription
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}