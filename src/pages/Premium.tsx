import { useState, useEffect } from "react";
import { useUsageAnalytics } from "@/hooks/useUsageAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Shield, 
  Crown,
  Calculator,
  TrendingUp,
  Users,
  Database
} from "lucide-react";

interface PremiumTier {
  id: string;
  name: string;
  description: string;
  price: number;
  yearlyPrice: number;
  popular: boolean;
  features: Array<{
    name: string;
    included: boolean;
    limit?: string;
  }>;
  limits: {
    queries: string;
    providers: string;
    storage: string;
    users: string;
  };
  support: string;
  sla: string;
}

const premiumTiers: PremiumTier[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started with basic OSINT",
    price: 0,
    yearlyPrice: 0,
    popular: false,
    features: [
      { name: "Basic OSINT providers", included: true, limit: "5 providers" },
      { name: "API key management", included: true },
      { name: "Query history", included: true, limit: "30 days" },
      { name: "Standard support", included: true },
      { name: "Advanced analytics", included: false },
      { name: "Custom integrations", included: false },
      { name: "Premium providers", included: false },
      { name: "Team collaboration", included: false },
      { name: "Priority support", included: false },
      { name: "SLA guarantee", included: false }
    ],
    limits: {
      queries: "100/month",
      providers: "5 basic",
      storage: "1 GB",
      users: "1 user"
    },
    support: "Community",
    sla: "None"
  },
  {
    id: "premium",
    name: "Premium",
    description: "Enhanced OSINT capabilities for professionals",
    price: 15,
    yearlyPrice: 150,
    popular: true,
    features: [
      { name: "All basic providers", included: true },
      { name: "Premium OSINT providers", included: true, limit: "15+ providers" },
      { name: "Advanced analytics", included: true },
      { name: "Extended query history", included: true, limit: "1 year" },
      { name: "API key management", included: true },
      { name: "Export capabilities", included: true },
      { name: "Custom integrations", included: false },
      { name: "Team collaboration", included: false },
      { name: "Priority support", included: true },
      { name: "SLA guarantee", included: false }
    ],
    limits: {
      queries: "5,000/month",
      providers: "15 premium",
      storage: "10 GB",
      users: "1 user"
    },
    support: "Email & Chat",
    sla: "99% uptime"
  },
  {
    id: "professional",
    name: "Professional", 
    description: "Advanced features for security teams",
    price: 49,
    yearlyPrice: 490,
    popular: false,
    features: [
      { name: "All premium features", included: true },
      { name: "Team collaboration", included: true, limit: "5 users" },
      { name: "Custom integrations", included: true },
      { name: "Advanced API access", included: true },
      { name: "Compliance reporting", included: true },
      { name: "Webhook integrations", included: true },
      { name: "Role-based access", included: true },
      { name: "Audit logging", included: true },
      { name: "Priority support", included: true },
      { name: "SLA guarantee", included: true }
    ],
    limits: {
      queries: "25,000/month",
      providers: "25+ premium", 
      storage: "100 GB",
      users: "5 users"
    },
    support: "Priority Support",
    sla: "99.5% uptime"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Full-scale OSINT platform for organizations",
    price: 199,
    yearlyPrice: 1990,
    popular: false,
    features: [
      { name: "All professional features", included: true },
      { name: "Unlimited users", included: true },
      { name: "Custom provider integrations", included: true },
      { name: "On-premise deployment", included: true },
      { name: "Dedicated support manager", included: true },
      { name: "Custom SLA", included: true },
      { name: "Security compliance", included: true },
      { name: "Training & onboarding", included: true },
      { name: "Advanced reporting", included: true },
      { name: "API rate limit increase", included: true }
    ],
    limits: {
      queries: "Unlimited",
      providers: "All available",
      storage: "1 TB",
      users: "Unlimited"
    },
    support: "Dedicated Manager",
    sla: "99.9% uptime"
  }
];

export default function Premium() {
  const { monthlyUsage, limits } = useUsageAnalytics();
  const [usageMetrics, setUsageMetrics] = useState({
    currentTier: "free",
    queriesUsed: 0,
    queriesLimit: 100,
    storageUsed: 0,
    storageLimit: 1,
    providersActive: 0,
    providersLimit: 5
  });

  useEffect(() => {
    if (limits) {
      setUsageMetrics({
        currentTier: "free", // This should come from user's actual subscription
        queriesUsed: limits.current_commands,
        queriesLimit: limits.max_commands,
        storageUsed: 0, // Calculate from actual usage
        storageLimit: 1,
        providersActive: monthlyUsage.providers_used?.length || 0,
        providersLimit: limits.max_commands > 100 ? 15 : 5
      });
    }
  }, [limits, monthlyUsage]);
  const [isYearly, setIsYearly] = useState(false);
  const [selectedTier, setSelectedTier] = useState(usageMetrics.currentTier);

  const getCurrentTier = () => {
    return premiumTiers.find(tier => tier.id === usageMetrics.currentTier);
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'free':
        return <Star className="h-5 w-5" />;
      case 'premium':
        return <Zap className="h-5 w-5" />;
      case 'professional':
        return <Shield className="h-5 w-5" />;
      case 'enterprise':
        return <Crown className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const currentTier = getCurrentTier();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Premium Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and track usage across all OSINT services
        </p>
      </div>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usage">Current Usage</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          {/* Current Plan Overview */}
          <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {getTierIcon(usageMetrics.currentTier)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {currentTier?.name} Plan
                    </CardTitle>
                    <CardDescription>
                      {currentTier?.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Star className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Queries Usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Queries</span>
                    <span className="text-sm font-medium">
                      {usageMetrics.queriesUsed.toLocaleString()}/{usageMetrics.queriesLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${getUsagePercentage(usageMetrics.queriesUsed, usageMetrics.queriesLimit)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getUsagePercentage(usageMetrics.queriesUsed, usageMetrics.queriesLimit)}% used
                  </span>
                </div>

                {/* Storage Usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Storage</span>
                    <span className="text-sm font-medium">
                      {usageMetrics.storageUsed} GB/{usageMetrics.storageLimit} GB
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-terminal-blue h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${getUsagePercentage(usageMetrics.storageUsed, usageMetrics.storageLimit)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getUsagePercentage(usageMetrics.storageUsed, usageMetrics.storageLimit)}% used
                  </span>
                </div>

                {/* Providers Usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Providers</span>
                    <span className="text-sm font-medium">
                      {usageMetrics.providersActive}/{usageMetrics.providersLimit}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-terminal-green h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${getUsagePercentage(usageMetrics.providersActive, usageMetrics.providersLimit)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getUsagePercentage(usageMetrics.providersActive, usageMetrics.providersLimit)}% used
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold text-foreground">{monthlyUsage.total_commands}</p>
                    <p className="text-xs text-muted-foreground">queries executed</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-foreground">
                      {monthlyUsage.total_commands > 0 
                        ? `${((monthlyUsage.successful_commands / monthlyUsage.total_commands) * 100).toFixed(1)}%`
                        : 'N/A'
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">query success rate</p>
                  </div>
                  <Zap className="h-8 w-8 text-terminal-blue" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">API Cost</p>
                    <p className="text-2xl font-bold text-foreground">${monthlyUsage.total_api_cost.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">this month</p>
                  </div>
                  <Database className="h-8 w-8 text-terminal-green" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Providers Used</p>
                    <p className="text-2xl font-bold text-foreground">{monthlyUsage.providers_used?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">unique providers</p>
                  </div>
                  <Shield className="h-8 w-8 text-terminal-green" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 p-4 bg-card rounded-lg">
            <span className={`text-sm ${!isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <span className={`text-sm ${isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            <Badge variant="outline" className="bg-terminal-green/10 text-terminal-green border-terminal-green/20">
              Save 17%
            </Badge>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumTiers.map((tier) => (
              <Card 
                key={tier.id}
                className={`relative transition-all duration-300 ${
                  tier.popular ? 'ring-2 ring-primary shadow-lg' : 'shadow-md'
                } ${selectedTier === tier.id ? 'scale-105' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-2">
                    {getTierIcon(tier.id)}
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription className="text-sm">{tier.description}</CardDescription>
                  
                  <div className="py-4">
                    <div className="text-3xl font-bold text-foreground">
                      ${isYearly ? tier.yearlyPrice : tier.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tier.price === 0 ? 'Forever free' : `per ${isYearly ? 'year' : 'month'}`}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-terminal-green mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <div className="text-sm">
                          <span className={feature.included ? 'text-foreground' : 'text-muted-foreground'}>
                            {feature.name}
                          </span>
                          {feature.limit && (
                            <div className="text-xs text-muted-foreground">
                              {feature.limit}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button 
                      className={`w-full ${
                        tier.popular 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                      }`}
                      variant={selectedTier === tier.id ? "default" : "outline"}
                      onClick={() => setSelectedTier(tier.id)}
                    >
                      {usageMetrics.currentTier === tier.id ? 'Current Plan' : 
                       tier.price === 0 ? 'Get Started' : 'Upgrade'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Billing Analytics</span>
              </CardTitle>
              <CardDescription>
                Track your subscription costs and usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Billing analytics dashboard coming soon</p>
                  <p className="text-sm">Cost tracking and usage optimization insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}