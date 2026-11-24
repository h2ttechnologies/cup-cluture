-- Removes combos completely (they were added and then dropped from the admin site).
-- Run once in Supabase → SQL Editor. Safe to run again.
-- Orders already saved with a combo keep their line text; nothing else uses these tables.
drop table if exists public.combo_items;
drop table if exists public.combos;
