# Grocery Orders
**Status:** Active
**Last worked:** 2026-02-27
**Live URL:** localhost (dev server on random port 3001-3999)

## What This Is
Personal Next.js grocery planner app for ~10-15 invited friends/family. Plan meals, minimize food waste through smart ingredient overlap, and generate consolidated grocery lists. Features recipe CRUD with URL import, invite-only auth via magic links, and a warm editorial design (NYT Cooking vibe).

## Tech Stack
- Next.js 16 (App Router)
- TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Supabase (auth + Postgres)
- Cheerio (recipe URL scraping)
- Vercel deployment

## Key Files
- `src/app/` — App Router pages (planner, recipes, staples, login, auth callback)
- `src/components/` — UI components (app-shell, recipe-form, grocery-list, etc.)
- `src/hooks/` — Data hooks (use-recipes, use-meal-plan, use-staples, use-pantry-config, use-auth)
- `src/lib/` — Business logic (consolidate, suggest, rounding, parse-ingredient, types)
- `src/lib/supabase/` — Supabase client/server/middleware helpers
- `src/data/seed-recipes.ts` — 22 starter recipes seeded on first login
- `supabase-schema.sql` — Database schema (run in Supabase SQL Editor)
- `.env.local` — Supabase URL + anon key (not committed)

## Architecture
- **Auth:** Invite-only via `allowed_emails` table + Supabase magic links
- **Data:** All per-user via RLS (recipes, staples, pantry_config)
- **Recipes:** JSONB ingredients column, seeded on first login
- **Meal planner:** In-memory state (no DB), uses smart overlap algorithm
- **Routing:** App Router pages replaced old single-page Section state pattern
- **Design:** Warm editorial palette (terracotta, cream, sage) with Lora serif + Inter sans

## Current State / Where I Left Off
Phases 1-5 implemented:
1. Supabase foundation (client, server, middleware, schema)
2. Design system (warm editorial palette, Lora + Inter fonts)
3. Auth + routing (login page, callback, middleware redirect, App Router pages)
4. Data layer (hooks refactored from localStorage to Supabase)
5. Recipe CRUD UI (form, URL import via Cheerio/JSON-LD, edit/delete)

**Needs to be done:**
- Create Supabase project and add real credentials to `.env.local`
- Run `supabase-schema.sql` in Supabase SQL Editor
- Populate `allowed_emails` table with invite list
- Phase 6 polish: mobile responsiveness pass, full flow testing, dark mode palette tuning

## Rules for Claude
- Use a random port between 3001-3999 for local dev
- Supabase credentials go in `.env.local` only (never commit)
- All data is per-user via RLS — never bypass
- `recipes.ts` kept for backward compat but `seed-recipes.ts` is the canonical seed source
