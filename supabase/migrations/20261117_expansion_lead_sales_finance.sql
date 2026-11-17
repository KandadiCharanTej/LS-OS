-- ==============================================================================
-- LEADSCORPIO CRM & OUTBOUND OPERATIONS PLATFORM
-- Feature Expansion: Deals, Internal Finance, Invoices & Weekly Reports
-- Date: November 2026
-- ==============================================================================

-- 1. Extended Enums
DO $$ BEGIN
  CREATE TYPE deal_stage AS ENUM (
    'QUALIFIED_OPPORTUNITY',
    'PROPOSAL_SENT',
    'NEGOTIATION',
    'VERBAL_COMMITMENT',
    'DEAL_WON',
    'DEAL_LOST'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'PAID',
    'PARTIALLY_PAID',
    'PENDING',
    'OVERDUE',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM (
    'DRAFT',
    'SENT',
    'PAID',
    'OVERDUE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE meeting_type AS ENUM (
    'DISCOVERY',
    'DEMO',
    'PROPOSAL_REVIEW',
    'NEGOTIATION',
    'ACCOUNT_REVIEW'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Extended Client Business & ICP columns
ALTER TABLE clients 
  ADD COLUMN IF NOT EXISTS business_model TEXT,
  ADD COLUMN IF NOT EXISTS pricing_packages TEXT,
  ADD COLUMN IF NOT EXISTS business_objectives TEXT,
  ADD COLUMN IF NOT EXISTS current_challenges TEXT,
  ADD COLUMN IF NOT EXISTS buyer_personas TEXT[],
  ADD COLUMN IF NOT EXISTS budget_range TEXT,
  ADD COLUMN IF NOT EXISTS business_pain_points TEXT[],
  ADD COLUMN IF NOT EXISTS buying_signals TEXT[],
  ADD COLUMN IF NOT EXISTS disqualification_criteria TEXT[],
  ADD COLUMN IF NOT EXISTS agreed_contract_amount NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contract_currency VARCHAR(10) DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS contract_duration TEXT,
  ADD COLUMN IF NOT EXISTS contract_start_date DATE,
  ADD COLUMN IF NOT EXISTS contract_end_date DATE,
  ADD COLUMN IF NOT EXISTS sales_playbook JSONB;

-- 3. Extended Prospects columns
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS added_by_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS reason_for_adding TEXT,
  ADD COLUMN IF NOT EXISTS budget NUMERIC(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deal_value NUMERIC(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';

-- 4. Deals Table (Sales Pipeline)
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
  owner_name VARCHAR(255) NOT NULL,
  service_offered TEXT,
  expected_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  customer_budget NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'INR',
  expected_close_date DATE,
  stage deal_stage NOT NULL DEFAULT 'QUALIFIED_OPPORTUNITY',
  probability INT NOT NULL DEFAULT 50,
  final_value NUMERIC(14,2),
  status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'WON', 'LOST'
  lost_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LeadScorpio Internal Finance & Invoices
CREATE TABLE IF NOT EXISTS client_finance_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_purchased TEXT NOT NULL,
  agreed_contract_amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  total_paid NUMERIC(12,2) DEFAULT 0,
  pending_amount NUMERIC(12,2) DEFAULT 0,
  payment_due_date DATE,
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  contract_start_date DATE,
  contract_end_date DATE,
  reminders_sent_count INT DEFAULT 0,
  last_reminder_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agreement_id UUID REFERENCES client_finance_agreements(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  payment_method VARCHAR(50) NOT NULL,
  reference_id VARCHAR(100) NOT NULL,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  recorded_by VARCHAR(255) NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_billing_address TEXT NOT NULL,
  client_gstin VARCHAR(50),
  client_email VARCHAR(255) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 18,
  tax_amount NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  payment_instructions TEXT,
  status invoice_status NOT NULL DEFAULT 'SENT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INT DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  amount NUMERIC(12,2) NOT NULL
);

-- 6. Weekly Reports Table
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  reporting_period VARCHAR(100) NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by VARCHAR(255) NOT NULL,
  metrics JSONB NOT NULL,
  strategy_observations TEXT,
  challenges TEXT,
  next_week_action_plan TEXT,
  shared_with_client BOOLEAN DEFAULT TRUE
);

-- 7. Security Policies (RLS)
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_finance_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- Staff full access
CREATE POLICY "Deals staff full access" ON deals FOR ALL USING (is_leadscorpio_staff());
CREATE POLICY "Weekly reports staff full access" ON weekly_reports FOR ALL USING (is_leadscorpio_staff());

-- Clients can only see their own deals and shared weekly reports
CREATE POLICY "Deals client read access" ON deals FOR SELECT USING (client_id = get_user_client_id());
CREATE POLICY "Weekly reports client read access" ON weekly_reports FOR SELECT USING (client_id = get_user_client_id() AND shared_with_client = TRUE);

-- Internal Finance is strictly staff only! NEVER exposed to clients
CREATE POLICY "Finance agreements staff only" ON client_finance_agreements FOR ALL USING (is_leadscorpio_staff());
CREATE POLICY "Payments staff only" ON payment_records FOR ALL USING (is_leadscorpio_staff());
CREATE POLICY "Invoices staff only" ON invoices FOR ALL USING (is_leadscorpio_staff());
CREATE POLICY "Invoice items staff only" ON invoice_items FOR ALL USING (is_leadscorpio_staff());

