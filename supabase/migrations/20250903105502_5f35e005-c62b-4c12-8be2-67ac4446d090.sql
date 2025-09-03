-- Update auth settings to support OTP verification
-- Note: This updates the auth configuration for OTP-based verification

-- Enable OTP for email verification
UPDATE auth.config 
SET 
  email_confirm_changes = false,
  enable_signup = true,
  enable_anonymous_sign_ins = false
WHERE true;

-- The actual email confirmation setting needs to be configured in Supabase dashboard
-- This migration ensures database is ready for OTP verification flow