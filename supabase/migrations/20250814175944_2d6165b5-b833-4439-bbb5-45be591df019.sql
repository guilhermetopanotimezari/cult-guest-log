-- Create visitors table
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  service_date TEXT NOT NULL,
  service_time TEXT NOT NULL,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access (since this is a church visitor system)
CREATE POLICY "Anyone can view visitors" 
ON public.visitors 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert visitors" 
ON public.visitors 
FOR INSERT 
WITH CHECK (true);