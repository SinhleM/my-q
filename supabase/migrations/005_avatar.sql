-- Avatar fields on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_index int,      -- 0-8, which profile icon
  ADD COLUMN IF NOT EXISTS avatar_url   text;     -- custom uploaded photo URL
