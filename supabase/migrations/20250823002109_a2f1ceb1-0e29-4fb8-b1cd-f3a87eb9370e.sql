-- Create command_executions table
CREATE TABLE public.command_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  command_id TEXT NOT NULL,
  command_name TEXT NOT NULL,
  command_category TEXT NOT NULL,
  provider TEXT NOT NULL,
  input_data TEXT NOT NULL,
  output_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error')),
  error_message TEXT,
  execution_time_ms INTEGER,
  api_cost DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.command_executions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own command executions"
ON public.command_executions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own command executions"
ON public.command_executions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own command executions"
ON public.command_executions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_command_executions_user_id ON public.command_executions(user_id);
CREATE INDEX idx_command_executions_created_at ON public.command_executions(created_at);

-- Create check_user_limits function
CREATE OR REPLACE FUNCTION public.check_user_limits(
  user_uuid UUID,
  api_cost_to_add DECIMAL DEFAULT 0.50
)
RETURNS TABLE(
  within_command_limit BOOLEAN,
  within_cost_limit BOOLEAN,
  commands_used INTEGER,
  total_cost_used DECIMAL
) AS $$
DECLARE
  commands_count INTEGER;
  total_cost DECIMAL;
  max_commands INTEGER := 100; -- Default limit
  max_cost DECIMAL := 50.00; -- Default limit
BEGIN
  -- Count commands in current month
  SELECT COUNT(*), COALESCE(SUM(api_cost), 0)
  INTO commands_count, total_cost
  FROM public.command_executions
  WHERE user_id = user_uuid
    AND created_at >= date_trunc('month', CURRENT_DATE);

  -- Return limits check
  RETURN QUERY SELECT
    (commands_count + 1) <= max_commands AS within_command_limit,
    (total_cost + api_cost_to_add) <= max_cost AS within_cost_limit,
    commands_count AS commands_used,
    total_cost AS total_cost_used;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_command_executions_updated_at
  BEFORE UPDATE ON public.command_executions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();