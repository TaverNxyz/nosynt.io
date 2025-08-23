import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Database, 
  Clock,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_queries: number;
  popular?: boolean;
}

interface UserSubscription {
  id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan: SubscriptionPlan;
}

export default function Subscriptions() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPlans();
      fetchCurrentSubscription();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      // Mock subscription plans
      const mockPlans: SubscriptionPlan[] = [
        {
          id: "free",
          name: "Free",
          description: "Perfect for getting started with OSINT",
          price_monthly: 0,
          price_yearly: 0,
          max_queries: 100,
          features: [
            "100 queries per month",
            "Basic OSINT providers",
            "Standard support",
            "Data export"
          ]
        },
        {
          id: "premium",
          name: "Premium",
          description: "For serious investigators and researchers",
          price_monthly: 15,
          price_yearly: 150,
          max_queries: 2500,
          popular: true,
          features: [
            "2,500 queries per month",
            "All OSINT providers",
            "Priority support",
            "Advanced analytics",
            "API access",
            "Webhook integrations",
            "Custom exports"
          ]
        },
        {
          id: "pro",
          name: "Professional",
          description: "For teams and heavy usage",
          price_monthly: 49,
          price_yearly: 490,
          max_queries: 10000,
          features: [
            "10,000 queries per month",
            "All premium features",
            "Team collaboration",
            "Custom integrations",
            "Dedicated support",
            "SLA guarantee",
            "Advanced security"
          ]
        },
        {
          id: "enterprise",
          name: "Enterprise",
          description: "For large organizations",
          price_monthly: 199,
          price_yearly: 1990,
          max_queries: 50000,
          features: [
            "50,000+ queries per month",
            "Custom pricing available",
            "White-label solution",
            "On-premise deployment",
            "24/7 dedicated support",
            "Custom SLA",
            "Advanced compliance"
          ]
        }
      ];
      setPlans(mockPlans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    if (!user) return;

    try {
      // Mock current subscription (Premium plan)
      const mockSubscription: UserSubscription = {
        id: "sub_1",
        plan_id: "premium",
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        plan: plans.find(p => p.id === "premium") || plans[1]
      };
      setCurrentSubscription(mockSubscription);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      return;
    }

    try {
      // Mock subscription process
      toast.success("Subscription updated successfully!");
    } catch (error) {
      toast.error("Failed to update subscription");
    }
  };

  const handleCancelSubscription = async () => {
    try {
      // Mock cancellation
      toast.success("Subscription will be cancelled at the end of the current period");
    } catch (error) {
      toast.error("Failed to cancel subscription");
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return isYearly ? plan.price_yearly : plan.price_monthly;
  };

  const getSavings = (plan: SubscriptionPlan) => {
    if (plan.price_yearly === 0) return 0;
    const monthlyTotal = plan.price_monthly * 12;
    return monthlyTotal - plan.price_yearly;
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscription Plans</h1>
          <p className="text-muted-foreground mt-2">
            Please log in to manage your subscription
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Scale your OSINT investigations with our flexible pricing plans
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mt-8">
          <span className={`${!isYearly ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              isYearly ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isYearly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`${isYearly ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
            Yearly
          </span>
          {isYearly && (
            <Badge className="bg-gradient-primary text-primary-foreground">
              Save up to 17%
            </Badge>
          )}
        </div>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <Card className="bg-gradient-card shadow-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-primary" />
              <span>Current Subscription</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{currentSubscription.plan.name}</h3>
                <p className="text-muted-foreground">
                  {currentSubscription.plan.max_queries.toLocaleString()} queries per month
                </p>
                <p className="text-sm text-muted-foreground">
                  Next billing: {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${getPrice(currentSubscription.plan)}</p>
                <p className="text-sm text-muted-foreground">
                  per {isYearly ? 'year' : 'month'}
                </p>
              </div>
            </div>
            
            {!currentSubscription.cancel_at_period_end && (
              <Button 
                variant="outline" 
                onClick={handleCancelSubscription}
                className="mt-4"
              >
                Cancel Subscription
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              plan.popular 
                ? 'border-primary shadow-glow bg-gradient-card' 
                : 'bg-gradient-card shadow-card'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="py-4">
                <div className="text-3xl font-bold">
                  ${getPrice(plan)}
                  {plan.price_monthly > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  )}
                </div>
                {isYearly && getSavings(plan) > 0 && (
                  <p className="text-sm text-security-green">
                    Save ${getSavings(plan)} per year
                  </p>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-security-green" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={() => handleSubscribe(plan.id)}
                className={`w-full ${
                  plan.popular 
                    ? 'bg-gradient-primary hover:shadow-glow' 
                    : ''
                }`}
                variant={plan.popular ? 'default' : 'outline'}
                disabled={currentSubscription?.plan_id === plan.id}
              >
                {currentSubscription?.plan_id === plan.id ? (
                  'Current Plan'
                ) : plan.price_monthly === 0 ? (
                  'Get Started'
                ) : (
                  <>
                    Upgrade to {plan.name}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Need Help Choosing?</CardTitle>
          <CardDescription>
            Contact our sales team for custom enterprise solutions or if you need help selecting the right plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-5 w-5 text-primary" />
              <span>24/7 Priority Support</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-security-green" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-3">
              <Database className="h-5 w-5 text-cyber-blue" />
              <span>Custom Integrations</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            <Clock className="mr-2 h-4 w-4" />
            Schedule a Demo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}