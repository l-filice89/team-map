-- First, delete duplicate locations keeping only the most recent per user
DELETE FROM public.locations a
USING public.locations b
WHERE a.user_id = b.user_id 
  AND a.created_at < b.created_at;

-- Add unique constraint to enforce one location per user
ALTER TABLE public.locations
ADD CONSTRAINT locations_user_id_key UNIQUE (user_id);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT locations_user_id_key ON public.locations IS 'Enforces one location per user';