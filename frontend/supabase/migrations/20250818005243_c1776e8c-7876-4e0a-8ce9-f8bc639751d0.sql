-- Ensure we have proper initial data for subscription plans
INSERT INTO public.subscription_plans (name, price_monthly, price_yearly, max_commands_per_month, max_api_cost_per_month, features, description, active) 
VALUES 
  (
    'Free', 
    0, 
    0, 
    50, 
    10.00, 
    '["Basic OSINT Commands", "Email Support", "Community Access"]'::jsonb, 
    'Get started with basic OSINT capabilities', 
    true
  ),
  (
    'Professional', 
    29.99, 
    299.99, 
    500, 
    100.00, 
    '["All OSINT Commands", "Premium Integrations", "Priority Support", "Advanced Analytics", "Custom Reports"]'::jsonb, 
    'For professionals requiring advanced OSINT capabilities', 
    true
  ),
  (
    'Enterprise', 
    99.99, 
    999.99, 
    2000, 
    500.00, 
    '["Unlimited OSINT Commands", "All Integrations", "24/7 Support", "Custom Development", "On-premise Deployment", "Compliance Features"]'::jsonb, 
    'For organizations with extensive OSINT requirements', 
    true
  )
ON CONFLICT (name) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  max_commands_per_month = EXCLUDED.max_commands_per_month,
  max_api_cost_per_month = EXCLUDED.max_api_cost_per_month,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  active = EXCLUDED.active;

-- Ensure we have some sample products for the marketplace
INSERT INTO public.products (name, description, price, active) 
VALUES 
  (
    'OSINT Command Bundle', 
    'Comprehensive package of OSINT commands and tools for professional investigators', 
    99.99, 
    true
  ),
  (
    'Premium Analytics Dashboard', 
    'Advanced analytics and reporting dashboard for OSINT operations', 
    49.99, 
    true
  ),
  (
    'Threat Intelligence Feed', 
    'Real-time threat intelligence and IOC feeds from multiple sources', 
    199.99, 
    true
  ),
  (
    'Custom Integration Service', 
    'Professional service for custom API integrations and automations', 
    499.99, 
    true
  )
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  active = EXCLUDED.active;

-- Add some sample system notifications
INSERT INTO public.system_notifications (title, message, type, user_id, action_url) 
VALUES 
  (
    'Welcome to deaddrop.io', 
    'Thank you for joining our OSINT platform. Start by adding your first API key to unlock premium features.', 
    'info', 
    NULL,
    '/api-keys'
  ),
  (
    'Security Best Practices', 
    'Remember to regularly rotate your API keys and enable two-factor authentication for enhanced security.', 
    'warning', 
    NULL,
    '/settings'
  ),
  (
    'New Feature: Discord Integration', 
    'You can now automatically sync your OSINT command results to Discord channels. Configure it in your settings.', 
    'success', 
    NULL,
    '/settings'
  )
ON CONFLICT DO NOTHING;

-- Create triggers for automatic updated_at timestamp updates on all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all tables that have updated_at columns
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN 
    SELECT t.table_name 
    FROM information_schema.tables t
    JOIN information_schema.columns c ON t.table_name = c.table_name
    WHERE t.table_schema = 'public' 
    AND c.column_name = 'updated_at'
    AND t.table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;