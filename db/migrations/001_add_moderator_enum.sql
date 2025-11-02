-- Add moderator to enum app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderator';
