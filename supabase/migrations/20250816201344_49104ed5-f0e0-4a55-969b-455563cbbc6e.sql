-- Fix the INSERT policy for api_keys table to properly restrict access
DROP POLICY IF EXISTS "Users can create their own API keys" ON public.api_keys;

CREATE POLICY "Users can create their own API keys" 
ON public.api_keys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);