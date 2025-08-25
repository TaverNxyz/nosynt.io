-- Ensure we have proper initial data for subscription plans with proper conflict handling
INSERT INTO public.subscription_plans (name, price_monthly, price_yearly, max_commands_per_month, max_api_cost_per_month, features, description, active) 
SELECT 'Free', 0, 0, 50, 10.00, '["Basic OSINT Commands", "Email Support", "Community Access"]'::jsonb, 'Get started with basic OSINT capabilities', true
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Free');

INSERT INTO public.subscription_plans (name, price_monthly, price_yearly, max_commands_per_month, max_api_cost_per_month, features, description, active) 
SELECT 'Professional', 29.99, 299.99, 500, 100.00, '["All OSINT Commands", "Premium Integrations", "Priority Support", "Advanced Analytics", "Custom Reports"]'::jsonb, 'For professionals requiring advanced OSINT capabilities', true
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Professional');

INSERT INTO public.subscription_plans (name, price_monthly, price_yearly, max_commands_per_month, max_api_cost_per_month, features, description, active) 
SELECT 'Enterprise', 99.99, 999.99, 2000, 500.00, '["Unlimited OSINT Commands", "All Integrations", "24/7 Support", "Custom Development", "On-premise Deployment", "Compliance Features"]'::jsonb, 'For organizations with extensive OSINT requirements', true
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Enterprise');

-- Ensure we have some sample products for the marketplace
INSERT INTO public.products (name, description, price, active) 
SELECT 'OSINT Command Bundle', 'Comprehensive package of OSINT commands and tools for professional investigators', 99.99, true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'OSINT Command Bundle');

INSERT INTO public.products (name, description, price, active) 
SELECT 'Premium Analytics Dashboard', 'Advanced analytics and reporting dashboard for OSINT operations', 49.99, true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Premium Analytics Dashboard');

INSERT INTO public.products (name, description, price, active) 
SELECT 'Threat Intelligence Feed', 'Real-time threat intelligence and IOC feeds from multiple sources', 199.99, true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Threat Intelligence Feed');

INSERT INTO public.products (name, description, price, active) 
SELECT 'Custom Integration Service', 'Professional service for custom API integrations and automations', 499.99, true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Custom Integration Service');

-- Add some sample system notifications (only if none exist)
INSERT INTO public.system_notifications (title, message, type, user_id, action_url) 
SELECT 'Welcome to deaddrop.io', 'Thank you for joining our OSINT platform. Start by adding your first API key to unlock premium features.', 'info', NULL, '/api-keys'
WHERE NOT EXISTS (SELECT 1 FROM public.system_notifications WHERE title = 'Welcome to deaddrop.io');

INSERT INTO public.system_notifications (title, message, type, user_id, action_url) 
SELECT 'Security Best Practices', 'Remember to regularly rotate your API keys and enable two-factor authentication for enhanced security.', 'warning', NULL, '/settings'
WHERE NOT EXISTS (SELECT 1 FROM public.system_notifications WHERE title = 'Security Best Practices');

INSERT INTO public.system_notifications (title, message, type, user_id, action_url) 
SELECT 'New Feature: Discord Integration', 'You can now automatically sync your OSINT command results to Discord channels. Configure it in your settings.', 'success', NULL, '/settings'
WHERE NOT EXISTS (SELECT 1 FROM public.system_notifications WHERE title = 'New Feature: Discord Integration');