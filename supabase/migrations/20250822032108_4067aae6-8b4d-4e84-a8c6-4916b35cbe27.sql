-- Create storage bucket for OSINT results and reports
INSERT INTO storage.buckets (id, name, public) VALUES ('osint-results', 'osint-results', false);

-- Create storage policies for OSINT results
CREATE POLICY "Users can view their own OSINT results" ON storage.objects
FOR SELECT USING (bucket_id = 'osint-results' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own OSINT results" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'osint-results' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own OSINT results" ON storage.objects
FOR UPDATE USING (bucket_id = 'osint-results' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own OSINT results" ON storage.objects
FOR DELETE USING (bucket_id = 'osint-results' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add real-time capabilities to command_executions table
ALTER PUBLICATION supabase_realtime ADD TABLE command_executions;
ALTER TABLE command_executions REPLICA IDENTITY FULL;

-- Create notifications table for alerts and webhooks
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'webhook', 'sms')),
  event_type TEXT NOT NULL CHECK (event_type IN ('command_completed', 'command_failed', 'threshold_exceeded', 'security_alert')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications" ON public.notifications
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for notifications updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create OSINT reports table for storing structured analysis results
CREATE TABLE public.osint_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  execution_id UUID NOT NULL REFERENCES command_executions(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('domain_analysis', 'ip_analysis', 'email_analysis', 'threat_intelligence', 'social_media')),
  target TEXT NOT NULL,
  summary TEXT,
  findings JSONB NOT NULL DEFAULT '{}',
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  tags TEXT[] DEFAULT '{}',
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on osint_reports
ALTER TABLE public.osint_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for osint_reports
CREATE POLICY "Users can view their own reports" ON public.osint_reports
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports" ON public.osint_reports
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON public.osint_reports
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" ON public.osint_reports
FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for osint_reports updated_at
CREATE TRIGGER update_osint_reports_updated_at
BEFORE UPDATE ON public.osint_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add real-time capabilities to osint_reports
ALTER PUBLICATION supabase_realtime ADD TABLE osint_reports;
ALTER TABLE osint_reports REPLICA IDENTITY FULL;

-- Create webhook endpoints table for external integrations
CREATE TABLE public.webhook_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on webhook_endpoints
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- Create policies for webhook_endpoints
CREATE POLICY "Users can manage their own webhook endpoints" ON public.webhook_endpoints
FOR ALL USING (auth.uid() = user_id);

-- Create trigger for webhook_endpoints updated_at
CREATE TRIGGER update_webhook_endpoints_updated_at
BEFORE UPDATE ON public.webhook_endpoints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();