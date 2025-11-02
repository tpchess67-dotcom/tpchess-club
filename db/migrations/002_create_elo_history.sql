-- Create elo_history table
CREATE TABLE IF NOT EXISTS public.elo_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  elo integer NOT NULL,
  timestamp timestamptz DEFAULT now()
);
