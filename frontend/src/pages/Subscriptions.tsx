import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useUsageAnalytics } from "@/hooks/useUsageAnalytics";
import { 
  CreditCard, 
  Crown, 
  Star, 
  Check,
  AlertCircle,
  Zap,
  Infinity
} from "lucide-react";
import { toast } from "sonner";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_commands_per_month: number;
  max_api_cost_per_month: number;
  features: string[];
  active: boolean;
}

interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan: SubscriptionPlan;
}

export default function Subscriptions() {
  const { user } = useAuth();
  const { monthlyUsage, limits, loading } = useUsageAnalytics();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPlans();
      fetchCurrentSubscription();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setPlans((data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features as string[] : []
      })));
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCurrentSubscription({
          ...data,
          plan: {
            ...data.plan,
            features: Array.isArray(data.plan.features) ? data.plan.features as string[] : []
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free': return Star;
      case 'pro': return Crown;
      case 'enterprise': return Zap;
      default: return CreditCard;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free': return 'text-blue-500';
      case 'pro': return 'text-purple-500';
      case 'enterprise': return 'text-amber-500';
      default: return 'text-primary';
    }
  };

  const formatFeatures = (features: string[]) => {
    return features.map((feature, index) => (
      <div key={index} className="flex items-center space-x-2">
        <Check className="h-4 w-4 text-green-500" />
        <span className="text-sm">{feature}</span>
      </div>
    ));
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan_id === planId;
  };

  const handleUpgrade = async (planId: string, planName: string) => {
    // In a real app, this would integrate with Stripe
    try {
      // Simulate subscription creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast.success(`Redirecting to payment for ${planName} plan...`);
      
      // In production, redirect to Stripe Checkout
      window.open('https://stripe.com/checkout', '_blank');
    } catch (error) {
      toast.error('Failed to initiate upgrade process');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view subscription plans</CardDescription>
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
          Subscription Plans
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your OSINT intelligence gathering needs
        </p>
      </div>

      {/* Current Usage Overview */}
      {limits && (
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Current Usage</span>
            </CardTitle>
            <CardDescription>Your usage this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Commands Used</span>
                  <span className="text-sm">{limits.current_commands}/{limits.max_commands}</span>
                </div>
                <Progress 
                  value={(limits.current_commands / limits.max_commands) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((limits.current_commands / limits.max_commands) * 100)}% of monthly limit
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">API Cost</span>
                  <span className="text-sm">${limits.current_cost.toFixed(2)}/${limits.max_cost.toFixed(2)}</span>
                </div>
                <Progress 
                  value={(limits.current_cost / limits.max_cost) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((limits.current_cost / limits.max_cost) * 100)}% of monthly budget
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const PlanIcon = getPlanIcon(plan.name);
          const isCurrent = isCurrentPlan(plan.id);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${isCurrent ? 'ring-2 ring-primary' : ''} bg-gradient-card shadow-card`}
            >
              {isCurrent && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                  Current Plan
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <div className={`flex justify-center mb-4`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                    <PlanIcon className={`h-6 w-6 text-primary-foreground`} />
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="py-4">
                  <div className="text-4xl font-bold">
                    ${plan.price_monthly}
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  </div>
                  {plan.price_yearly && (
                    <p className="text-sm text-muted-foreground">
                      Or ${plan.price_yearly}/year (save ${((plan.price_monthly * 12) - plan.price_yearly).toFixed(0)})
                    </p>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-center">
                  <div className="p-3 bg-gradient-metallic rounded-lg">
                    <p className="text-lg font-semibold">
                      {plan.max_commands_per_month === 999999 ? (
                        <span className="flex items-center justify-center">
                          <Infinity className="h-5 w-5 mr-1" />
                          Unlimited
                        </span>
                      ) : (
                        `${plan.max_commands_per_month.toLocaleString()} commands`
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <div className="p-3 bg-gradient-metallic rounded-lg">
                    <p className="text-lg font-semibold">
                      ${plan.max_api_cost_per_month.toFixed(0)} API budget
                    </p>
                    <p className="text-sm text-muted-foreground">monthly limit</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Features included:</p>
                  <div className="space-y-1">
                    {formatFeatures(plan.features)}
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent}
                  onClick={() => handleUpgrade(plan.id, plan.name)}
                >
                  {isCurrent ? "Current Plan" : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Subscription Details */}
      {currentSubscription && (
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>Manage your current subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="font-semibold">{currentSubscription.plan.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={currentSubscription.status === 'active' ? 'default' : 'destructive'}>
                  {currentSubscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Billing Date</p>
                <p className="font-semibold">
                  {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {currentSubscription.cancel_at_period_end && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm">
                  Your subscription will be cancelled at the end of the current billing period.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}