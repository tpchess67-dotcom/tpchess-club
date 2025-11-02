-- Table to assign roles per club (e.g., moderator per club)
CREATE TABLE IF NOT EXISTS public.user_club_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE,
  role text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, club_id)
);
