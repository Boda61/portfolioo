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

-- ==========================================================
-- STORAGE BUCKET: portfolio-images
-- Run this if you want to store uploaded images in Supabase Storage
-- ==========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public can view uploaded images
DROP POLICY IF EXISTS "Public can view portfolio images" ON storage.objects;
CREATE POLICY "Public can view portfolio images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'portfolio-images');

-- Authenticated admins can upload images
DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
CREATE POLICY "Authenticated users can upload portfolio images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'portfolio-images');

-- Authenticated admins can update/delete images
DROP POLICY IF EXISTS "Authenticated users can update portfolio images" ON storage.objects;
CREATE POLICY "Authenticated users can update portfolio images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'portfolio-images');

