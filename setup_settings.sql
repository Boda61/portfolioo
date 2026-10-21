-- ==========================================================
-- PORTFOLIO SETTINGS & CONTENT TABLE
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.portfolio_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for portfolio visitors)
DROP POLICY IF EXISTS "Public can view portfolio settings" ON public.portfolio_settings;
CREATE POLICY "Public can view portfolio settings"
    ON public.portfolio_settings
    FOR SELECT
    USING (true);

-- Allow authenticated admins to insert, update, delete
DROP POLICY IF EXISTS "Admins can manage portfolio settings" ON public.portfolio_settings;
CREATE POLICY "Admins can manage portfolio settings"
    ON public.portfolio_settings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
