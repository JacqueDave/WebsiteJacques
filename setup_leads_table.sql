-- Create the leads table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  name text,
  email text
);

-- Enable RLS (Row Level Security) on the table which is best practice
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone (anon key) to INSERT data
CREATE POLICY "Enable insert for everyone" 
ON public.leads 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Create a policy that allows anyone (anon key) to SELECT data (optional, useful for debugging)
-- CREATE POLICY "Enable select for everyone" 
-- ON public.leads 
-- FOR SELECT 
-- TO anon 
-- USING (true);
