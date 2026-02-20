-- Create locations table for user check-ins
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_locations_user_created ON public.locations(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Users can view their own locations
CREATE POLICY "Users can view their own locations"
ON public.locations
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own locations
CREATE POLICY "Users can create their own locations"
ON public.locations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own locations
CREATE POLICY "Users can update their own locations"
ON public.locations
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own locations
CREATE POLICY "Users can delete their own locations"
ON public.locations
FOR DELETE
USING (auth.uid() = user_id);