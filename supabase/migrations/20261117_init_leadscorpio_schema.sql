-- ==============================================================================
-- LEADSCORPIO CRM & OUTBOUND OPERATIONS PLATFORM
-- Initial Schema Migration & RLS Security Policies
-- Date: November 2026
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- ------------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'SUPER_ADMIN',
    'FOUNDER',
    'TEAM_MEMBER',
    'CLIENT_ADMIN',
    'CLIENT_MEMBER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE client_status AS ENUM (
    'LEAD',
    'ONBOARDING',
    'ACTIVE',
    'PAUSED',
    'COMPLETED',
    'CHURNED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'APPROVED',
    'ACTIVE',
    'PAUSED',
    'COMPLETED',
    'ARCHIVED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE prospect_status AS ENUM (
    'NEW',
    'RESEARCHING',
    'READY_FOR_OUTREACH',
    'CONNECTION_REQUEST_SENT',
    'CONNECTED',
    'MESSAGE_SENT',
    'REPLIED',
    'INTERESTED',
    'NOT_INTERESTED',
    'FOLLOW_UP_REQUIRED',
    'QUALIFIED',
    'MEETING_BOOKED',
    'CONVERTED',
    'DISQUALIFIED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'COMPLETED',
    'OVERDUE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM (
    'PENDING_REVIEW',
    'APPROVED',
    'CHANGES_REQUESTED',
    'REJECTED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE message_direction AS ENUM (
    'OUTBOUND',
    'INBOUND'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE response_sentiment AS ENUM (
    'POSITIVE',
    'NEGATIVE',
    'NEUTRAL',
    'INTERESTED',
    'NOT_INTERESTED',
    'NEEDS_FOLLOW_UP',
    'MEETING_REQUESTED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE client_request_status AS ENUM (
    'OPEN',
    'UNDER_REVIEW',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 2. ORGANIZATIONS & PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- True for LeadScorpio HQ, False for client orgs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(50),
  role user_role NOT NULL DEFAULT 'TEAM_MEMBER',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, organization_id)
);

-- ------------------------------------------------------------------------------
-- 3. CLIENTS & CONTACTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  website VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  status client_status NOT NULL DEFAULT 'ONBOARDING',
  primary_contact_name VARCHAR(255),
  primary_contact_email VARCHAR(255),
  primary_contact_phone VARCHAR(50),
  assigned_team_member_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Target ICP details
  icp_description TEXT,
  target_industries TEXT[],
  target_locations TEXT[],
  target_job_titles TEXT[],
  target_company_sizes TEXT[],
  products_and_services TEXT,
  
  onboarding_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role_title VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. CAMPAIGNS & CAMPAIGN MEMBERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  objective TEXT,
  channel VARCHAR(50) DEFAULT 'LINKEDIN',
  status campaign_status NOT NULL DEFAULT 'DRAFT',
  
  -- Targeting specs
  target_audience TEXT,
  target_industry VARCHAR(255),
  target_job_titles TEXT[],
  target_geography TEXT[],
  company_size VARCHAR(100),
  icp_details TEXT,
  
  start_date DATE,
  end_date DATE,
  assigned_team_member_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_role VARCHAR(100) DEFAULT 'SDR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 5. PROSPECTS & ACTIVITIES (CORE MODULE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  assigned_team_member_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  job_title VARCHAR(255),
  company VARCHAR(255) NOT NULL,
  company_website VARCHAR(255),
  linkedin_url TEXT NOT NULL,
  work_email VARCHAR(255),
  phone_number VARCHAR(50),
  industry VARCHAR(100),
  location VARCHAR(150),
  company_size VARCHAR(50),
  company_description TEXT,
  lead_source VARCHAR(100) DEFAULT 'LinkedIn Sales Navigator',
  
  status prospect_status NOT NULL DEFAULT 'NEW',
  priority priority_level NOT NULL DEFAULT 'MEDIUM',
  notes TEXT,
  
  last_activity_date TIMESTAMPTZ DEFAULT NOW(),
  next_follow_up_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prospect_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  activity_type VARCHAR(100) NOT NULL, -- 'RESEARCH', 'CONNECTION_REQUEST_SENT', 'CONNECTION_ACCEPTED', 'MESSAGE_SENT', 'REPLY_RECEIVED', etc.
  notes TEXT,
  outcome VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. CONVERSATIONS & MESSAGES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  channel VARCHAR(50) DEFAULT 'LINKEDIN',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_response_sentiment response_sentiment,
  is_unread BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction message_direction NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_manual_entry BOOLEAN DEFAULT TRUE, -- Distinguish manual vs sync
  sentiment response_sentiment,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. TASKS & FOLLOW-UPS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
  priority priority_level NOT NULL DEFAULT 'MEDIUM',
  status task_status NOT NULL DEFAULT 'TODO',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. MEETINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 30,
  meeting_url TEXT,
  status VARCHAR(50) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'COMPLETED', 'RESCHEDULED', 'NO_SHOW', 'CANCELLED'
  qualification_notes TEXT,
  booked_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. APPROVALS & APPROVAL COMMENTS (CLIENT COLLABORATION)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  item_type VARCHAR(100) NOT NULL, -- 'CONNECTION_REQUEST_COPY', 'INITIAL_MESSAGE_COPY', 'FOLLOW_UP_1', 'FOLLOW_UP_2', 'TARGET_LIST'
  content TEXT NOT NULL,
  version INT DEFAULT 1,
  status approval_status NOT NULL DEFAULT 'PENDING_REVIEW',
  requested_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_id UUID NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. CLIENT REQUESTS (TICKETING / FEEDBACK)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'CAMPAIGN_CHANGE', 'TARGET_AUDIENCE_UPDATE', 'PROSPECT_CORRECTION', 'GENERAL_QUESTION', 'SUPPORT'
  description TEXT NOT NULL,
  priority priority_level NOT NULL DEFAULT 'MEDIUM',
  status client_request_status NOT NULL DEFAULT 'OPEN',
  submitted_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. NOTIFICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(100) NOT NULL, -- 'POSITIVE_REPLY', 'MEETING_BOOKED', 'APPROVAL_REQUESTED', 'APPROVAL_STATUS', 'TASK_ASSIGNED', etc.
  link_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. INTERNAL NOTES, DOCUMENTS & AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS internal_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),
  uploaded_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 13. INDEXES FOR HIGH QUERY EFFICIENCY
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_prospects_client_id ON prospects(client_id);
CREATE INDEX IF NOT EXISTS idx_prospects_campaign_id ON prospects(campaign_id);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_assigned_user ON prospects(assigned_team_member_id);
CREATE INDEX IF NOT EXISTS idx_activities_prospect_id ON prospect_activities(prospect_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_conversations_prospect ON conversations(prospect_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

-- ------------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Is current user LeadScorpio Staff (Super Admin, Founder, Team Member)
CREATE OR REPLACE FUNCTION is_leadscorpio_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('SUPER_ADMIN', 'FOUNDER', 'TEAM_MEMBER')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Get current user's client_id if they are a client user
CREATE OR REPLACE FUNCTION get_user_client_id()
RETURNS UUID AS $$
DECLARE
  v_client_id UUID;
BEGIN
  SELECT c.id INTO v_client_id
  FROM clients c
  INNER JOIN memberships m ON m.organization_id = c.organization_id
  WHERE m.user_id = auth.uid()
  LIMIT 1;
  
  RETURN v_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policy: Staff can see all profiles; Clients can only see their own profile and assigned staff
CREATE POLICY "Profiles visibility policy" ON profiles
  FOR SELECT USING (
    id = auth.uid() OR is_leadscorpio_staff()
  );

CREATE POLICY "Profiles update policy" ON profiles
  FOR UPDATE USING (
    id = auth.uid() OR is_leadscorpio_staff()
  );

-- Clients Policy: Staff sees all; Clients see only their own client record
CREATE POLICY "Clients staff full access" ON clients
  FOR ALL USING (is_leadscorpio_staff());

CREATE POLICY "Clients client self access" ON clients
  FOR SELECT USING (
    id = get_user_client_id()
  );

-- Campaigns Policy: Staff full access; Clients can view campaigns for their organization
CREATE POLICY "Campaigns staff full access" ON campaigns
  FOR ALL USING (is_leadscorpio_staff());

CREATE POLICY "Campaigns client read access" ON campaigns
  FOR SELECT USING (
    client_id = get_user_client_id()
  );

-- Prospects Policy: Staff full access; Clients can view prospects belonging to their client_id
CREATE POLICY "Prospects staff full access" ON prospects
  FOR ALL USING (is_leadscorpio_staff());

CREATE POLICY "Prospects client read access" ON prospects
  FOR SELECT USING (
    client_id = get_user_client_id()
  );

-- Approvals Policy: Staff full access; Clients can view and update their own approvals (Approve/Reject)
CREATE POLICY "Approvals staff full access" ON approvals
  FOR ALL USING (is_leadscorpio_staff());

CREATE POLICY "Approvals client read access" ON approvals
  FOR SELECT USING (
    client_id = get_user_client_id()
  );

CREATE POLICY "Approvals client update access" ON approvals
  FOR UPDATE USING (
    client_id = get_user_client_id()
  );

-- Client Requests Policy: Staff full access; Clients can insert and view their own requests
CREATE POLICY "Requests staff full access" ON client_requests
  FOR ALL USING (is_leadscorpio_staff());

CREATE POLICY "Requests client access" ON client_requests
  FOR ALL USING (
    client_id = get_user_client_id()
  );

-- Notifications Policy: Users can only see and update their own notifications
CREATE POLICY "Notifications user policy" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Internal Notes Policy: Strictly staff only! Never accessible by clients
CREATE POLICY "Internal notes staff only" ON internal_notes
  FOR ALL USING (is_leadscorpio_staff());

