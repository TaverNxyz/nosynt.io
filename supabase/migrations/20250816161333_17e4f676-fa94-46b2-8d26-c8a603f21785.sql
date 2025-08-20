-- Create OSINT command executions table
CREATE TABLE public.command_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  command_id TEXT NOT NULL,
  command_name TEXT NOT NULL,
  command_category TEXT NOT NULL,
  input_data TEXT NOT NULL,
  output_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error', 'timeout')),
  execution_time_ms INTEGER,
  provider TEXT NOT NULL,
  api_cost DECIMAL(10,4) DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create usage analytics table
CREATE TABLE public.usage_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_commands INTEGER DEFAULT 0,
  successful_commands INTEGER DEFAULT 0,
  failed_commands INTEGER DEFAULT 0,
  total_api_cost DECIMAL(10,4) DEFAULT 0,
  categories_used JSONB DEFAULT '[]'::jsonb,
  providers_used JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create Discord integration settings table
CREATE TABLE public.discord_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  discord_user_id TEXT,
  discord_channel_id TEXT,
  auto_sync_enabled BOOLEAN DEFAULT false,
  sync_successful_only BOOLEAN DEFAULT true,
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Telegram integration settings table  
CREATE TABLE public.telegram_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  telegram_user_id TEXT,
  telegram_chat_id TEXT,
  bot_token TEXT,
  auto_sync_enabled BOOLEAN DEFAULT false,
  sync_successful_only BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system notifications table
CREATE TABLE public.system_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription plans table (for premium features)
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  max_commands_per_month INTEGER,
  max_api_cost_per_month DECIMAL(10,4),
  features JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.command_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discord_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for command_executions
CREATE POLICY "Users can view their own executions" 
ON public.command_executions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own executions" 
ON public.command_executions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own executions" 
ON public.command_executions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for usage_analytics
CREATE POLICY "Users can view their own analytics" 
ON public.usage_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" 
ON public.usage_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" 
ON public.usage_analytics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for discord_settings
CREATE POLICY "Users can manage their own Discord settings" 
ON public.discord_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for telegram_settings
CREATE POLICY "Users can manage their own Telegram settings" 
ON public.telegram_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for system_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.system_notifications 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own notifications" 
ON public.system_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for subscription_plans (public read)
CREATE POLICY "Anyone can view active plans" 
ON public.subscription_plans 
FOR SELECT 
USING (active = true);

-- Create RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
ON public.user_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_command_executions_updated_at
BEFORE UPDATE ON public.command_executions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usage_analytics_updated_at
BEFORE UPDATE ON public.usage_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discord_settings_updated_at
BEFORE UPDATE ON public.discord_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_telegram_settings_updated_at
BEFORE UPDATE ON public.telegram_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_command_executions_user_id ON public.command_executions(user_id);
CREATE INDEX idx_command_executions_created_at ON public.command_executions(created_at DESC);
CREATE INDEX idx_command_executions_status ON public.command_executions(status);
CREATE INDEX idx_command_executions_provider ON public.command_executions(provider);

CREATE INDEX idx_usage_analytics_user_date ON public.usage_analytics(user_id, date);
CREATE INDEX idx_usage_analytics_date ON public.usage_analytics(date);

CREATE INDEX idx_system_notifications_user_read ON public.system_notifications(user_id, read);
CREATE INDEX idx_system_notifications_created_at ON public.system_notifications(created_at DESC);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, max_commands_per_month, max_api_cost_per_month, features) VALUES
('Free', 'Basic OSINT access with limited queries', 0.00, 0.00, 100, 10.00, '["Basic commands", "Discord sync", "Community support"]'::jsonb),
('Pro', 'Advanced OSINT tools and increased limits', 29.99, 299.99, 1000, 100.00, '["All commands", "Advanced analytics", "Priority support", "API access", "Discord/Telegram sync"]'::jsonb),
('Enterprise', 'Full access with custom limits', 99.99, 999.99, 10000, 1000.00, '["Unlimited commands", "Custom integrations", "24/7 support", "White-label", "On-premise deployment"]'::jsonb);

-- Create function to automatically track usage analytics
CREATE OR REPLACE FUNCTION public.track_command_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track completed executions
  IF NEW.status IN ('success', 'error') AND OLD.status = 'pending' THEN
    INSERT INTO public.usage_analytics (
      user_id, 
      date, 
      total_commands, 
      successful_commands, 
      failed_commands, 
      total_api_cost,
      categories_used,
      providers_used
    ) VALUES (
      NEW.user_id,
      CURRENT_DATE,
      1,
      CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END,
      CASE WHEN NEW.status = 'error' THEN 1 ELSE 0 END,
      COALESCE(NEW.api_cost, 0),
      jsonb_build_array(NEW.command_category),
      jsonb_build_array(NEW.provider)
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
      total_commands = usage_analytics.total_commands + 1,
      successful_commands = usage_analytics.successful_commands + CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END,
      failed_commands = usage_analytics.failed_commands + CASE WHEN NEW.status = 'error' THEN 1 ELSE 0 END,
      total_api_cost = usage_analytics.total_api_cost + COALESCE(NEW.api_cost, 0),
      categories_used = CASE 
        WHEN usage_analytics.categories_used ? NEW.command_category THEN usage_analytics.categories_used
        ELSE usage_analytics.categories_used || jsonb_build_array(NEW.command_category)
      END,
      providers_used = CASE 
        WHEN usage_analytics.providers_used ? NEW.provider THEN usage_analytics.providers_used
        ELSE usage_analytics.providers_used || jsonb_build_array(NEW.provider)
      END,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic usage tracking
CREATE TRIGGER track_command_usage_trigger
AFTER UPDATE ON public.command_executions
FOR EACH ROW
EXECUTE FUNCTION public.track_command_usage();

-- Create function to check user subscription limits
CREATE OR REPLACE FUNCTION public.check_user_limits(user_uuid UUID, api_cost_to_add DECIMAL DEFAULT 0)
RETURNS TABLE(
  within_command_limit BOOLEAN,
  within_cost_limit BOOLEAN,
  current_commands INTEGER,
  max_commands INTEGER,
  current_cost DECIMAL,
  max_cost DECIMAL
) AS $$
DECLARE
  user_plan RECORD;
  current_usage RECORD;
BEGIN
  -- Get user's current plan
  SELECT sp.* INTO user_plan
  FROM public.subscription_plans sp
  JOIN public.user_subscriptions us ON sp.id = us.plan_id
  WHERE us.user_id = user_uuid AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- If no subscription, use free plan
  IF user_plan IS NULL THEN
    SELECT * INTO user_plan
    FROM public.subscription_plans
    WHERE name = 'Free' AND active = true
    LIMIT 1;
  END IF;
  
  -- Get current month usage
  SELECT 
    COALESCE(SUM(total_commands), 0) as commands,
    COALESCE(SUM(total_api_cost), 0) as cost
  INTO current_usage
  FROM public.usage_analytics
  WHERE user_id = user_uuid 
    AND date >= DATE_TRUNC('month', CURRENT_DATE);
  
  -- Return the check results
  RETURN QUERY SELECT
    (current_usage.commands < user_plan.max_commands_per_month) as within_command_limit,
    ((current_usage.cost + api_cost_to_add) <= user_plan.max_api_cost_per_month) as within_cost_limit,
    current_usage.commands::INTEGER as current_commands,
    user_plan.max_commands_per_month as max_commands,
    current_usage.cost as current_cost,
    user_plan.max_api_cost_per_month as max_cost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;