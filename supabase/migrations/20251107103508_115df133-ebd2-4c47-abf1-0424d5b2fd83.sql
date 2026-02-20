-- Add INSERT policy to users table to prevent direct inserts
-- Only the handle_new_user() trigger (which has SECURITY DEFINER) can insert
CREATE POLICY "Prevent direct user creation"
ON public.users
FOR INSERT
WITH CHECK (false);