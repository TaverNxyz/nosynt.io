-- Create API Keys table
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_preview TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'invalid')),
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  usage_limit INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for API keys
CREATE POLICY "Users can view their own API keys" 
ON public.api_keys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys" 
ON public.api_keys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" 
ON public.api_keys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" 
ON public.api_keys 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('month', 'year')),
  features JSONB NOT NULL DEFAULT '[]',
  command_limit INTEGER NOT NULL DEFAULT 100,
  cost_limit DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for user subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create usage_analytics table
CREATE TABLE public.usage_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_commands INTEGER NOT NULL DEFAULT 0,
  successful_commands INTEGER NOT NULL DEFAULT 0,
  failed_commands INTEGER NOT NULL DEFAULT 0,
  total_api_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  categories_used TEXT[] DEFAULT '{}',
  providers_used TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for usage analytics
CREATE POLICY "Users can view their own usage analytics" 
ON public.usage_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create command_executions table
CREATE TABLE public.command_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  command_name TEXT NOT NULL,
  command_input TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  result JSONB,
  api_cost DECIMAL(10,2) DEFAULT 0.00,
  execution_time INTEGER, -- in milliseconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.command_executions ENABLE ROW LEVEL SECURITY;

-- Create policies for command executions
CREATE POLICY "Users can view their own command executions" 
ON public.command_executions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own command executions" 
ON public.command_executions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own command executions" 
ON public.command_executions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price, billing_interval, features, command_limit, cost_limit, is_premium) VALUES
('Free', 'Basic OSINT commands', 0.00, 'month', '["Basic commands", "100 commands/month", "$10 API cost limit"]', 100, 10.00, false),
('Pro', 'Advanced OSINT tools', 29.99, 'month', '["All OSINT commands", "1000 commands/month", "$100 API cost limit", "Priority support"]', 1000, 100.00, true),
('Enterprise', 'Unlimited access', 99.99, 'month', '["Unlimited commands", "Unlimited API costs", "24/7 support", "Custom integrations"]', 999999, 999999.99, true);

-- Create function to check user limits
CREATE OR REPLACE FUNCTION public.check_user_limits(user_uuid UUID)
RETURNS TABLE (
  within_command_limit BOOLEAN,
  within_cost_limit BOOLEAN,
  current_commands INTEGER,
  max_commands INTEGER,
  current_cost DECIMAL(10,2),
  max_cost DECIMAL(10,2)
) AS $$
DECLARE
  user_plan RECORD;
  current_month_usage RECORD;
BEGIN
  -- Get user's current subscription plan or default to free
  SELECT sp.command_limit, sp.cost_limit 
  INTO user_plan
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- If no subscription found, use free plan limits
  IF user_plan IS NULL THEN
    SELECT command_limit, cost_limit 
    INTO user_plan
    FROM public.subscription_plans 
    WHERE name = 'Free'
    LIMIT 1;
  END IF;
  
  -- Get current month's usage
  SELECT 
    COALESCE(SUM(total_commands), 0) as commands,
    COALESCE(SUM(total_api_cost), 0) as cost
  INTO current_month_usage
  FROM public.usage_analytics
  WHERE user_id = user_uuid 
    AND date >= date_trunc('month', CURRENT_DATE);
  
  -- Return the results
  RETURN QUERY SELECT
    current_month_usage.commands < user_plan.command_limit,
    current_month_usage.cost < user_plan.cost_limit,
    current_month_usage.commands::INTEGER,
    user_plan.command_limit,
    current_month_usage.cost,
    user_plan.cost_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usage_analytics_updated_at
  BEFORE UPDATE ON public.usage_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_command_executions_updated_at
  BEFORE UPDATE ON public.command_executions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();