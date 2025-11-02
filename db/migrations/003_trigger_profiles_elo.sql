-- Trigger function to insert into elo_history when profiles.elo changes
CREATE OR REPLACE FUNCTION public.log_elo_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.elo IS DISTINCT FROM OLD.elo THEN
    INSERT INTO public.elo_history (user_id, elo, timestamp)
    VALUES (NEW.id, NEW.elo, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_elo ON public.profiles;
CREATE TRIGGER trg_log_elo
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (OLD.elo IS DISTINCT FROM NEW.elo)
EXECUTE FUNCTION public.log_elo_change();
