-- ============================================================================
-- LEADSCORPIO CRM — EMAIL CENTRE & RESEND INTEGRATION SCHEMA
-- Migration: 20261118_email_centre.sql
-- ============================================================================

-- 1. Email Templates Table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('ONBOARDING', 'SALES', 'MEETINGS', 'REPORTS', 'FINANCE', 'GENERAL')),
    subject TEXT NOT NULL,
    preview_text TEXT DEFAULT '',
    html_content TEXT NOT NULL,
    text_content TEXT DEFAULT '',
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Email Messages (History & Outbox)
CREATE TABLE IF NOT EXISTS public.email_messages (
    id TEXT PRIMARY KEY,
    resend_id TEXT,
    to_email TEXT NOT NULL,
    to_name TEXT,
    recipient_company TEXT,
    client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT,
    prospect_id TEXT REFERENCES public.prospects(id) ON DELETE SET NULL,
    prospect_name TEXT,
    sender_name TEXT NOT NULL DEFAULT 'LeadScorpio',
    sender_email TEXT NOT NULL,
    reply_to TEXT,
    cc TEXT[],
    bcc TEXT[],
    subject TEXT NOT NULL,
    preview_text TEXT,
    html_content TEXT NOT NULL,
    text_content TEXT,
    template_id TEXT REFERENCES public.email_templates(id) ON DELETE SET NULL,
    template_name TEXT,
    category TEXT NOT NULL CHECK (category IN ('TRANSACTIONAL', 'MARKETING')),
    status TEXT NOT NULL DEFAULT 'SENT' CHECK (status IN ('DRAFT', 'QUEUED', 'SENT', 'DELIVERED', 'BOUNCED', 'FAILED')),
    error_message TEXT,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    attachments JSONB DEFAULT '[]'::jsonb
);

-- 3. Email Webhook Events Table
CREATE TABLE IF NOT EXISTS public.email_events (
    id TEXT PRIMARY KEY,
    email_id TEXT REFERENCES public.email_messages(id) ON DELETE CASCADE,
    resend_id TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'bounced', 'complained', 'opened', 'clicked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. Email Suppression List (Unsubscribes, Bounces, Complaints)
CREATE TABLE IF NOT EXISTS public.email_suppressions (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL CHECK (reason IN ('UNSUBSCRIBE', 'BOUNCE', 'COMPLAINT')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Email Provider Settings
CREATE TABLE IF NOT EXISTS public.email_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    provider TEXT NOT NULL DEFAULT 'resend',
    api_key_configured BOOLEAN DEFAULT false,
    sender_name TEXT NOT NULL DEFAULT 'LeadScorpio',
    sender_email TEXT NOT NULL DEFAULT 'onboarding@resend.dev',
    reply_to TEXT DEFAULT 'leadscorpioofficial@gmail.com',
    default_footer TEXT DEFAULT 'LeadScorpio • Turn Your Ideal Customers Into Qualified Sales Conversations.',
    is_sandbox_mode BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_email_messages_client_id ON public.email_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_prospect_id ON public.email_messages(prospect_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_status ON public.email_messages(status);
CREATE INDEX IF NOT EXISTS idx_email_messages_created_at ON public.email_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_email_id ON public.email_events(email_id);
CREATE INDEX IF NOT EXISTS idx_email_events_resend_id ON public.email_events(resend_id);
CREATE INDEX IF NOT EXISTS idx_email_suppressions_email ON public.email_suppressions(email);

-- 7. Row Level Security Policies
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal staff manage email_templates" ON public.email_templates FOR ALL TO authenticated USING (true);
CREATE POLICY "Internal staff manage email_messages" ON public.email_messages FOR ALL TO authenticated USING (true);
CREATE POLICY "Internal staff manage email_events" ON public.email_events FOR ALL TO authenticated USING (true);
CREATE POLICY "Internal staff manage email_suppressions" ON public.email_suppressions FOR ALL TO authenticated USING (true);
CREATE POLICY "Internal staff manage email_settings" ON public.email_settings FOR ALL TO authenticated USING (true);
