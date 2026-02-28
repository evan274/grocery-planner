-- Grocery Planner Schema
-- Run this in Supabase SQL Editor after creating your project

-- allowed_emails: invite-only gating
CREATE TABLE public.allowed_emails (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- recipes: per-user library, ingredients as JSONB
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('dinner', 'lunch')),
  base_servings INT NOT NULL DEFAULT 4,
  prep_minutes INT,
  cook_minutes INT,
  tags TEXT[] DEFAULT '{}',
  ingredients JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- staples: per-user
CREATE TABLE public.staples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL
);

-- pantry_config: per-user
CREATE TABLE public.pantry_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  UNIQUE(user_id, item_name)
);

-- RLS: users can only access their own data
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users CRUD own recipes" ON public.recipes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users CRUD own staples" ON public.staples FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users CRUD own pantry" ON public.pantry_config FOR ALL USING (auth.uid() = user_id);

-- Allow anyone to read allowed_emails (for login check)
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read allowed_emails" ON public.allowed_emails FOR SELECT USING (true);

-- Seed your invite list
-- INSERT INTO public.allowed_emails (email) VALUES
--   ('evan@example.com'),
--   ('friend@example.com');
