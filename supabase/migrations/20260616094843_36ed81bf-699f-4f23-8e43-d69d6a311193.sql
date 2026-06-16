ALTER TABLE public.pvc_surveys
  ADD COLUMN IF NOT EXISTS plateau_condition text,
  ADD COLUMN IF NOT EXISTS plateau_challenges text[],
  ADD COLUMN IF NOT EXISTS plateau_challenges_other text,
  ADD COLUMN IF NOT EXISTS plateau_optimism text,
  ADD COLUMN IF NOT EXISTS plateau_government_priority text,
  ADD COLUMN IF NOT EXISTS plateau_advice_leaders text,
  ADD COLUMN IF NOT EXISTS plateau_advice_inec text,
  ADD COLUMN IF NOT EXISTS plateau_other_comments text;