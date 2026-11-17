-- ==============================================================================
-- LEADSCORPIO CRM & OUTBOUND OPERATIONS PLATFORM
-- Demo Seed Data (Kinetic Flow AI & NIT Digital)
-- Clearly identifiable DEMO DATA with full relational consistency
-- ==============================================================================

-- 1. Organizations
INSERT INTO organizations (id, name, slug, is_internal)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'LeadScorpio Internal Ops', 'leadscorpio-hq', TRUE),
  ('22222222-2222-2222-2222-222222222222', 'Kinetic Flow AI', 'kinetic-flow-ai', FALSE),
  ('33333333-3333-3333-3333-333333333333', 'NIT Digital', 'nit-digital', FALSE)
ON CONFLICT (id) DO NOTHING;

-- 2. Profiles (LeadScorpio Founders, Team Members & Client Admins)
INSERT INTO profiles (id, email, full_name, role, phone)
VALUES
  ('aaaa1111-0000-0000-0000-000000000001', 'founder@leadscorpio.com', 'Alex Vance (Founder)', 'FOUNDER', '+1-555-019-2831'),
  ('aaaa1111-0000-0000-0000-000000000002', 'sdr@leadscorpio.com', 'Marcus Chen (Lead SDR)', 'TEAM_MEMBER', '+1-555-019-2832'),
  ('bbbb2222-0000-0000-0000-000000000001', 'david@kineticflowai.com', 'David Miller (CEO - Kinetic Flow AI)', 'CLIENT_ADMIN', '+1-555-024-9101'),
  ('cccc3333-0000-0000-0000-000000000001', 'priya@nitdigital.in', 'Priya Sharma (VP Growth - NIT Digital)', 'CLIENT_ADMIN', '+91-98200-11223')
ON CONFLICT (id) DO NOTHING;

-- 3. Memberships
INSERT INTO memberships (user_id, organization_id, role)
VALUES
  ('aaaa1111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'FOUNDER'),
  ('aaaa1111-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'TEAM_MEMBER'),
  ('bbbb2222-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'CLIENT_ADMIN'),
  ('cccc3333-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'CLIENT_ADMIN')
ON CONFLICT DO NOTHING;

-- 4. Clients
INSERT INTO clients (
  id, organization_id, name, logo_url, website, industry, company_size, status,
  primary_contact_name, primary_contact_email, primary_contact_phone, assigned_team_member_id,
  icp_description, target_industries, target_locations, target_job_titles, target_company_sizes, products_and_services,
  onboarding_date, notes
)
VALUES
(
  'c1111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Kinetic Flow AI',
  '/clients/kinetic-flow-ai.png',
  'https://www.kineticflowai.com',
  'AI & Workflow Automation',
  '11-50 employees',
  'ACTIVE',
  'David Miller',
  'david@kineticflowai.com',
  '+1-555-024-9101',
  'aaaa1111-0000-0000-0000-000000000002',
  'Mid-market B2B companies looking to automate customer ops and manual back-office tasks using AI voice & document agents.',
  ARRAY['B2B SaaS', 'Financial Services', 'Logistics & Supply Chain', 'Healthcare Tech'],
  ARRAY['United States', 'Canada', 'United Kingdom'],
  ARRAY['VP of Operations', 'COO', 'Chief Technology Officer', 'Head of Customer Experience'],
  ARRAY['50-500 employees', '20-50 employees'],
  'Enterprise AI voice receptionists, autonomous document extraction, and custom CRM automation workflows.',
  '2026-10-01',
  'High priority client with strict qualification criteria on budget ($25k+ ACV).'
),
(
  'c2222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  'NIT Digital',
  '/clients/nitdigital.png',
  'https://nitdigital.in',
  'IT & Software Engineering Services',
  '51-200 employees',
  'ACTIVE',
  'Priya Sharma',
  'priya@nitdigital.in',
  '+91-98200-11223',
  'aaaa1111-0000-0000-0000-000000000002',
  'B2B SaaS and product startups in North America and Europe seeking offshore dedicated engineering squads and cloud modernization.',
  ARRAY['B2B SaaS', 'Fintech', 'HealthTech', 'E-commerce Platforms'],
  ARRAY['United States', 'United Kingdom', 'Germany', 'Australia'],
  ARRAY['Founder & CEO', 'Chief Technology Officer', 'VP of Engineering', 'Head of Product'],
  ARRAY['10-100 employees', '100-500 employees'],
  'Dedicated full-stack engineering pods, React/Next.js modernization, AWS cloud infrastructure migration.',
  '2026-10-15',
  'Targeting Series A & B technology founders needing engineering bandwidth.'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Campaigns
INSERT INTO campaigns (
  id, client_id, name, description, objective, channel, status,
  target_audience, target_industry, target_job_titles, target_geography, company_size,
  start_date, end_date, assigned_team_member_id
)
VALUES
(
  'camp1111-1111-1111-1111-111111111111',
  'c1111111-1111-1111-1111-111111111111',
  'Kinetic Flow - US FinTech & Logistics COO Outreach',
  'Executive outbound targeting Operations leaders facing high support costs.',
  'Book 15 qualified discovery calls per month with VPs of Operations in US Mid-Market.',
  'LINKEDIN',
  'ACTIVE',
  'US-based COOs and Ops VPs at fast-growing logistics & fintech firms',
  'Logistics & Financial Services',
  ARRAY['COO', 'VP of Operations', 'Director of Customer Experience'],
  ARRAY['United States'],
  '50-500 employees',
  '2026-11-01',
  '2026-12-31',
  'aaaa1111-0000-0000-0000-000000000002'
),
(
  'camp2222-2222-2222-2222-222222222222',
  'c2222222-2222-2222-2222-222222222222',
  'NIT Digital - North America SaaS Engineering Pods',
  'Strategic outreach to funded SaaS founders experiencing developer hiring bottlenecks.',
  'Generate 12 qualified software development partner meetings.',
  'LINKEDIN',
  'ACTIVE',
  'CTOs and Founders of Seed & Series A SaaS startups',
  'B2B SaaS & Enterprise Software',
  ARRAY['CTO', 'VP Engineering', 'Founder & CEO'],
  ARRAY['United States', 'Canada'],
  '10-100 employees',
  '2026-11-05',
  '2026-12-20',
  'aaaa1111-0000-0000-0000-000000000002'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Demo Prospects
INSERT INTO prospects (
  id, client_id, campaign_id, assigned_team_member_id,
  first_name, last_name, job_title, company, company_website,
  linkedin_url, work_email, industry, location, company_size, status, priority, notes
)
VALUES
(
  'p1111111-0001-0000-0000-000000000001',
  'c1111111-1111-1111-1111-111111111111',
  'camp1111-1111-1111-1111-111111111111',
  'aaaa1111-0000-0000-0000-000000000002',
  'Sarah', 'Jenkins', 'VP of Customer Operations', 'Apex Freight Systems', 'https://apexfreight.com',
  'https://www.linkedin.com/in/sarahjenkins-ops', 's.jenkins@apexfreight.com', 'Logistics & Supply Chain', 'Chicago, IL', '150 employees',
  'MEETING_BOOKED', 'HIGH', 'Demo booked for Thursday 2 PM EST. Very interested in automating freight tracking inquiries.'
),
(
  'p1111111-0002-0000-0000-000000000002',
  'c1111111-1111-1111-1111-111111111111',
  'camp1111-1111-1111-1111-111111111111',
  'aaaa1111-0000-0000-0000-000000000002',
  'Robert', 'Sterling', 'Chief Operating Officer', 'TruePay Financial', 'https://truepay.io',
  'https://www.linkedin.com/in/robertsterling-coo', 'robert@truepay.io', 'Financial Services', 'New York, NY', '220 employees',
  'INTERESTED', 'HIGH', 'Replied positively asking about HIPAA/SOC2 compliance for AI document processing.'
),
(
  'p1111111-0003-0000-0000-000000000003',
  'c1111111-1111-1111-1111-111111111111',
  'camp1111-1111-1111-1111-111111111111',
  'aaaa1111-0000-0000-0000-000000000002',
  'Elena', 'Rostova', 'Head of Support Architecture', 'OmniShip Global', 'https://omniship.com',
  'https://www.linkedin.com/in/elena-rostova-ship', 'elena.r@omniship.com', 'Logistics', 'Atlanta, GA', '80 employees',
  'CONNECTED', 'MEDIUM', 'Accepted connection yesterday; follow-up 1 scheduled.'
),
(
  'p2222222-0001-0000-0000-000000000001',
  'c2222222-2222-2222-2222-222222222222',
  'camp2222-2222-2222-2222-222222222222',
  'aaaa1111-0000-0000-0000-000000000002',
  'Michael', 'Thorne', 'Co-Founder & CTO', 'Stratum Cloud', 'https://stratumcloud.io',
  'https://www.linkedin.com/in/michaelthorne-cto', 'mthorne@stratumcloud.io', 'B2B SaaS', 'Austin, TX', '45 employees',
  'QUALIFIED', 'HIGH', 'Currently scaling engineering team. Needs 2 senior React + Node.js developers for 6 months.'
),
(
  'p2222222-0002-0000-0000-000000000002',
  'c2222222-2222-2222-2222-222222222222',
  'camp2222-2222-2222-2222-222222222222',
  'aaaa1111-0000-0000-0000-000000000002',
  'Amanda', 'Cole', 'VP of Engineering', 'HealthPulse Solutions', 'https://healthpulsetech.com',
  'https://www.linkedin.com/in/amandacole-eng', 'acole@healthpulsetech.com', 'HealthTech', 'Boston, MA', '95 employees',
  'MESSAGE_SENT', 'MEDIUM', 'Outreach sent on Nov 14 highlighting HIPAA certified engineering experience.'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Tasks
INSERT INTO tasks (
  id, title, description, assigned_to_id, created_by_id, client_id, campaign_id, prospect_id, priority, status, due_date
)
VALUES
(
  't1111111-1111-1111-1111-111111111111',
  'Send calendar invite & prep brief for Sarah Jenkins (Apex Freight)',
  'Confirm Calendly appointment on Zoom and prepare brief on their cargo tracking volume.',
  'aaaa1111-0000-0000-0000-000000000002',
  'aaaa1111-0000-0000-0000-000000000001',
  'c1111111-1111-1111-1111-111111111111',
  'camp1111-1111-1111-1111-111111111111',
  'p1111111-0001-0000-0000-000000000001',
  'URGENT',
  'TODO',
  NOW() + INTERVAL '1 day'
),
(
  't2222222-2222-2222-2222-222222222222',
  'Follow up with Robert Sterling regarding SOC2 security overview',
  'Robert requested details on security guarantees before booking executive demo call.',
  'aaaa1111-0000-0000-0000-000000000002',
  'aaaa1111-0000-0000-0000-000000000001',
  'c1111111-1111-1111-1111-111111111111',
  'camp1111-1111-1111-1111-111111111111',
  'p1111111-0002-0000-0000-000000000002',
  'HIGH',
  'IN_PROGRESS',
  NOW() + INTERVAL '2 days'
),
(
  't3333333-3333-3333-3333-333333333333',
  'Research 25 new SaaS CTO prospects in Boston & Austin',
  'Expand NIT Digital target pool for engineering pod campaign.',
  'aaaa1111-0000-0000-0000-000000000002',
  'aaaa1111-0000-0000-0000-000000000001',
  'c2222222-2222-2222-2222-222222222222',
  'camp2222-2222-2222-2222-222222222222',
  NULL,
  'MEDIUM',
  'TODO',
  NOW() + INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;

-- 8. Approvals (Client Portal Messaging Approval Gate)
INSERT INTO approvals (
  id, client_id, campaign_id, title, item_type, content, version, status, requested_by_id
)
VALUES
(
  'app11111-1111-1111-1111-111111111111',
  'c1111111-1111-1111-1111-111111111111',
  'camp1111-1111-1111-1111-111111111111',
  'US FinTech & Logistics COO - Initial Outreach Angle #2',
  'INITIAL_MESSAGE_COPY',
  'Hi {{first_name}}, saw your recent expansion into multi-modal dispatch at {{company}}. Curious if handling peak inquiry spikes is putting pressure on your dispatch operations team? We recently helped a logistics peer automate 62% of repetitive tier-1 customer inquiries using conversational voice agents without expanding headcount. Would you be open to a 10-minute peer exchange next Tuesday?',
  1,
  'APPROVED',
  'aaaa1111-0000-0000-0000-000000000002'
),
(
  'app22222-2222-2222-2222-222222222222',
  'c2222222-2222-2222-2222-222222222222',
  'camp2222-2222-2222-2222-222222222222',
  'SaaS CTO Pods - Connection Request Note',
  'CONNECTION_REQUEST_COPY',
  'Hi {{first_name}} — noticed you are leading engineering at {{company}}. We help venture-backed SaaS teams spin up senior React/Node squads to ship features 2x faster without long hiring cycles. Thought it would be great to connect!',
  1,
  'PENDING_REVIEW',
  'aaaa1111-0000-0000-0000-000000000002'
)
ON CONFLICT (id) DO NOTHING;

-- 9. Client Requests
INSERT INTO client_requests (
  id, client_id, campaign_id, title, category, description, priority, status, submitted_by_id
)
VALUES
(
  'req11111-1111-1111-1111-111111111111',
  'c1111111-1111-1111-1111-111111111111',
  'camp1111-1111-1111-1111-111111111111',
  'Exclude companies under $10M ARR from next batch',
  'TARGET_AUDIENCE_UPDATE',
  'We noticed a couple of leads have fewer than 25 employees. We want to prioritize accounts with at least 50 employees and $10M ARR for higher ACV closing.',
  'HIGH',
  'IN_PROGRESS',
  'bbbb2222-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

-- 10. Notifications
INSERT INTO notifications (
  id, user_id, title, message, type, link_url, is_read
)
VALUES
(
  'n1111111-1111-1111-1111-111111111111',
  'aaaa1111-0000-0000-0000-000000000001',
  'New Meeting Booked! (Apex Freight)',
  'Sarah Jenkins (VP Customer Ops, Apex Freight) confirmed discovery meeting for Kinetic Flow AI.',
  'MEETING_BOOKED',
  '/app/prospects/p1111111-0001-0000-0000-000000000001',
  FALSE
),
(
  'n2222222-2222-2222-2222-222222222222',
  'cccc3333-0000-0000-0000-000000000001',
  'Outreach Copy Awaiting Approval',
  'LeadScorpio team submitted a new LinkedIn Connection Request copy for your campaign.',
  'APPROVAL_REQUESTED',
  '/portal/approvals',
  FALSE
)
ON CONFLICT (id) DO NOTHING;

