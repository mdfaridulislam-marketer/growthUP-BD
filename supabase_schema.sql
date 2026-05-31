-- ══════════════════════════════════════════════════
-- GrowthUp Pro — Supabase Database Schema
-- Supabase Dashboard → SQL Editor এ এটা run করুন
-- ══════════════════════════════════════════════════

-- ── Table 1: profiles (Supabase auth এর extension) ──
CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT,
  email            TEXT UNIQUE NOT NULL,
  plan             TEXT DEFAULT 'free'
                   CHECK (plan IN ('free', 'pro', 'business')),
  plan_expires_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Table 2: usage tracking ──
CREATE TABLE IF NOT EXISTS public.usage (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  section     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Table 3: subscriptions ──
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan         TEXT NOT NULL,
  amount       INTEGER,
  payment_ref  TEXT,
  status       TEXT DEFAULT 'pending'
               CHECK (status IN ('pending', 'active', 'failed', 'cancelled', 'expired')),
  starts_at    TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Index for faster usage queries ──
CREATE INDEX IF NOT EXISTS usage_user_id_created_at_idx ON public.usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);

-- ── Auto-create profile on signup ──
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: নতুন user sign up করলে automatically profile তৈরি হবে
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Row Level Security (RLS) — গুরুত্বপূর্ণ! ──
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: শুধু নিজের profile দেখতে পারবে
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role সব কিছু করতে পারবে (backend এর জন্য)
CREATE POLICY "Service role full access profiles"
  ON public.profiles FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access usage"
  ON public.usage FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- ══════════════════════════════════════════════════
-- Run complete! এখন:
-- 1. Supabase Dashboard → Authentication → Providers → Email চালু করুন
-- 2. "Confirm email" OFF করুন (শুরুতে সহজ করতে)
-- ══════════════════════════════════════════════════
