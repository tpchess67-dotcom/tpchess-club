-- Example RLS: restrict tournament creation to admins or moderators of the club
-- Enable RLS on tournaments
ALTER TABLE IF EXISTS public.tournaments ENABLE ROW LEVEL SECURITY;

-- Policy allowing inserts only for users who are admin or moderator for the club_id provided
CREATE POLICY "tournaments_insert_by_admins_or_club_mods" ON public.tournaments
FOR INSERT TO public
USING (false)
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
    OR EXISTS (SELECT 1 FROM public.user_club_roles ucr WHERE ucr.user_id = auth.uid() AND ucr.club_id = NEW.club_id AND ucr.role = 'moderator')
  )
);

-- You may need additional SELECT/UPDATE/DELETE policies depending on your app needs.
