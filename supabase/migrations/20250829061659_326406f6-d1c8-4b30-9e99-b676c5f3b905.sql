-- Create api_keys table
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_preview TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  usage_count INTEGER NOT NULL DEFAULT 0,
  usage_limit INTEGER NOT NULL DEFAULT 1000,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create usage_analytics table
CREATE TABLE public.usage_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_commands INTEGER NOT NULL DEFAULT 0,
  successful_commands INTEGER NOT NULL DEFAULT 0,
  failed_commands INTEGER NOT NULL DEFAULT 0,
  total_api_cost DECIMAL(10,4) NOT NULL DEFAULT 0,
  categories_used JSONB NOT NULL DEFAULT '[]',
  providers_used JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create command_executions table
CREATE TABLE public.command_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  command_id TEXT NOT NULL,
  command_name TEXT NOT NULL,
  command_category TEXT NOT NULL,
  input_data TEXT NOT NULL,
  output_data JSONB,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  execution_time_ms INTEGER,
  api_cost DECIMAL(10,4) DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.command_executions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for api_keys
CREATE POLICY "Users can manage their own API keys" 
ON public.api_keys 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for usage_analytics
CREATE POLICY "Users can view their own usage analytics" 
ON public.usage_analytics 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for command_executions
CREATE POLICY "Users can manage their own command executions" 
ON public.command_executions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

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

CREATE TRIGGER update_usage_analytics_updated_at
  BEFORE UPDATE ON public.usage_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create check_user_limits function
CREATE OR REPLACE FUNCTION public.check_user_limits(user_uuid UUID)
RETURNS TABLE (
  within_command_limit BOOLEAN,
  within_cost_limit BOOLEAN,
  current_commands INTEGER,
  max_commands INTEGER,
  current_cost DECIMAL,
  max_cost DECIMAL
) AS $$
DECLARE
  current_month INTEGER := EXTRACT(MONTH FROM now());
  current_year INTEGER := EXTRACT(YEAR FROM now());
  user_commands INTEGER := 0;
  user_cost DECIMAL := 0;
  cmd_limit INTEGER := 1000;
  cost_limit DECIMAL := 100.0;
BEGIN
  -- Get current month usage
  SELECT 
    COALESCE(total_commands, 0),
    COALESCE(total_api_cost, 0)
  INTO user_commands, user_cost
  FROM public.usage_analytics 
  WHERE user_id = user_uuid 
    AND month = current_month 
    AND year = current_year;

  -- Return limits check
  RETURN QUERY SELECT
    user_commands < cmd_limit,
    user_cost < cost_limit,
    user_commands,
    cmd_limit,
    user_cost,
    cost_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_usage_analytics_user_month_year ON public.usage_analytics(user_id, month, year);
CREATE INDEX idx_command_executions_user_id ON public.command_executions(user_id);
CREATE INDEX idx_command_executions_created_at ON public.command_executions(created_at DESC);