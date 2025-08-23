-- Fix database security issues

-- Enable RLS on all public tables
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_authentications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for api_keys
CREATE POLICY "Users can view their own API keys" ON public.api_keys
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own API keys" ON public.api_keys
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own API keys" ON public.api_keys
FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own API keys" ON public.api_keys
FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE USING (auth.uid()::text = id::text);

-- Create RLS policies for premium_keys
CREATE POLICY "Users can view their own premium keys" ON public.premium_keys
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own premium keys" ON public.premium_keys
FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create RLS policies for user_authentications
CREATE POLICY "Users can view their own authentications" ON public.user_authentications
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own authentications" ON public.user_authentications
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own authentications" ON public.user_authentications
FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Intelligence tables - make them readable by authenticated users
CREATE POLICY "Authenticated users can view email intelligence" ON public.email_intelligence
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert email intelligence" ON public.email_intelligence
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view github intelligence" ON public.github_intelligence
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert github intelligence" ON public.github_intelligence
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view ip intelligence" ON public.ip_intelligence
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert ip intelligence" ON public.ip_intelligence
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view phone intelligence" ON public.phone_intelligence
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert phone intelligence" ON public.phone_intelligence
FOR INSERT TO authenticated WITH CHECK (true);

-- Auth providers can be read by all authenticated users
CREATE POLICY "Authenticated users can view auth providers" ON public.auth_providers
FOR SELECT TO authenticated USING (true);

-- Fix function security by setting search_path
CREATE OR REPLACE FUNCTION public.check_user_limits(user_uuid uuid, api_cost_to_add numeric DEFAULT 0.50)
RETURNS TABLE(within_command_limit boolean, within_cost_limit boolean, commands_used integer, total_cost_used numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;