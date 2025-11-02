-- Create tournament_results table and view for final rankings
CREATE TABLE IF NOT EXISTS public.tournament_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  score numeric,
  rank integer
);

CREATE OR REPLACE VIEW public.tournament_final_ranking AS
SELECT tr.tournament_id, tr.user_id, p.full_name, p.email, tr.score, tr.rank
FROM public.tournament_results tr
LEFT JOIN public.profiles p ON p.id = tr.user_id;
