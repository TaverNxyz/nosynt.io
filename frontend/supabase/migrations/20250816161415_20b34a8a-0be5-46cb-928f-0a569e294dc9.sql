-- Fix security warnings by setting proper search_path for functions
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix the limits checking function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;