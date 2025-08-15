-- Fix OTP expiry security warning by setting proper auth configuration
-- This sets the OTP expiry to recommended security standards
UPDATE auth.config 
SET 
  otp_exp = 3600,  -- 1 hour expiry (recommended)
  otp_length = 6   -- 6 digit OTP (standard)
WHERE TRUE;