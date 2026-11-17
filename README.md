# LeadScorpio CRM & Outbound Operations Platform

> **Product Category:** B2B CRM + LinkedIn Outbound Lead Generation & Operations Operating System  
> **Brand Identity:** Deep Navy (`#071525`), Copper Orange (`#C65D2E`), Warm White (`#FAF9F6`)  
> **Target Audience:** Internal LeadScorpio Founders/SDRs & Authorized Client Stakeholders  
> **Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase / PostgreSQL (with RLS), Recharts, Lucide Icons

---

## 1. Executive Product Overview

LeadScorpio is a specialized B2B outbound lead generation and pipeline development agency founded on four core operational pillars: **Focus, Patience, Precision, and Persistence** (*"Precision over volume"*).

This application is LeadScorpio's dedicated SaaS operating system. It provides **TWO DISTINCT PORTALS** sharing one secure, unified database architecture:

1. **Internal LeadScorpio Operations Portal (`/app`)**:
   - Executive overview with real conversion rates and pipeline distributions.
   - Client account workspaces with 16-section Ideal Customer Profiles (ICPs) and AI Sales Playbook Generator.
   - Master B2B prospect CRM with 15-stage lifecycle, Table/Kanban views, CSV bulk import/export, and instant "Convert to Deal" workflow.
   - Sales & Deals pipeline (`/app/deals`) tracking INR revenue, weighted pipeline, win rates, and lost reason intelligence.
   - Internal Finance & Retainer Billing engine (`/app/finance`) managing agreements, payment logging, reminders, and 18% GST tax invoices (confidential from clients).
   - LinkedIn campaign management engine with automated conversion formulas.
   - Centralized 3-pane conversation manager for logging manual correspondence and classifying lead sentiment (7 tiers).
   - Task management supporting both List and Kanban board workflows.
   - Operational calendar for tracking booked strategy calls and follow-ups.
   - Executive Weekly Performance Dossiers (`/app/reports`) with client publishing toggle and conversion yield analytics.
   - Team member workload allocation and role-based access.

2. **Client Transparency Portal (`/portal`)**:
   - Organization-isolated workspace strictly limited to the client's own campaigns and prospects.
   - Real-time campaign performance tracking with zero fake analytics.
   - Prospect directory with capability to flag irrelevant records and provide targeting feedback.
   - **Message Approvals Gate:** Human-in-the-loop review workflow where clients inspect, approve, reject, or request changes on LinkedIn connection notes and sequence templates.
   - Read-only transparent audit of active outreach conversations.
   - Client request center for ticketing campaign changes, targeting adjustments, and questions.

---

## 2. Security & Multi-Tenant Architecture

### 2.1 Role-Based Access Control (RBAC)

The platform supports 5 distinct user security roles:
- `SUPER_ADMIN`: System-wide configuration and administrative management.
- `FOUNDER`: Full access across all client workspaces, campaign tracking, and financials.
- `TEAM_MEMBER` (SDR): Execution across assigned client accounts, conversation logging, task completion.
- `CLIENT_ADMIN`: Client executive (e.g. David Miller at Kinetic Flow AI) with full view of their organization's pipeline, messaging approval rights, and ticket submissions.
- `CLIENT_MEMBER`: Stakeholder with read permissions on their organization's metrics and prospects.

### 2.2 PostgreSQL Row Level Security (RLS)

All database tables are fortified with Row Level Security policies located in `supabase/migrations/20261117_init_leadscorpio_schema.sql`:
- Clients can **never** query other clients' records or campaign stats.
- `internal_notes` are strictly quarantined to LeadScorpio internal staff and blocked from the client portal.
- All database entities use UUID v4 primary keys, foreign key constraints, cascade triggers, and composite performance indexes.

---

## 3. LinkedIn Outbound Tracking Formulas

All conversion yield statistics use mathematically rigorous definitions (LeadScorpio Specification 5.4):

$$\text{Connection Acceptance Rate} = \frac{\text{Accepted Connections}}{\text{Connection Requests Sent}} \times 100$$

$$\text{Reply Rate} = \frac{\text{Prospects Who Replied}}{\text{Prospects Messaged}} \times 100$$

$$\text{Positive Reply Rate} = \frac{\text{Positive Replies}}{\text{Prospects Who Replied}} \times 100$$

$$\text{Meeting Conversion Rate} = \frac{\text{Meetings Booked}}{\text{Prospects Who Replied}} \times 100$$

---

## 4. Getting Started & Local Development

### Prerequisites
- Node.js `v18.17+` or `v20+` (tested with Node `v24` and React 19)
- npm `v9+`

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local

# 3. Launch local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the LeadScorpio launchpad.

### Building for Production
```bash
npm run build
npm run start
```

---

## 5. Live Role Persona Switcher (For Evaluation & Demos)

To test both portals and role boundaries effortlessly without needing to re-login repeatedly, use the **Persona Switcher** in the top navigation bar:

1. **Alex Vance (`founder@leadscorpio.com`)** — Founder Persona (`/app`)
2. **Marcus Chen (`sdr@leadscorpio.com`)** — Lead SDR Persona (`/app`)
3. **David Miller (`david@kineticflowai.com`)** — Client Admin for *Kinetic Flow AI* (`/portal`)
4. **Priya Sharma (`priya@nitdigital.in`)** — Client Admin for *NIT Digital* (`/portal`)

Clicking on any persona automatically switches the session context, updates role permissions, and navigates to the respective portal.

---

## 6. Database Migrations & Supabase Setup

When deploying with a live Supabase PostgreSQL backend:
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run the foundational migration script in the SQL editor:
   `supabase/migrations/20261117_init_leadscorpio_schema.sql`
3. Run the enterprise expansion migration script:
   `supabase/migrations/20261117_expansion_lead_sales_finance.sql`
4. (Optional) Run the seed script to populate baseline verified accounts:
   `supabase/seed.sql`
5. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

---

## 7. Project Structure

```
LS CRM/
├── .env.example                               # Environment template
├── FEATURE_IMPLEMENTATION_REPORT.md           # Full feature verification audit
├── supabase/
│   ├── migrations/
│   │   ├── 20261117_init_leadscorpio_schema.sql         # 21 initial entities with RLS & indexes
│   │   └── 20261117_expansion_lead_sales_finance.sql    # Deals, finance, invoices, weekly reports & RLS
│   └── seed.sql                               # Demo seeds (Kinetic Flow AI & NIT Digital)
├── public/
│   ├── clients/                               # Client logos
│   └── icon.png, logo-dark.png                # Official brand assets
└── src/
    ├── app/
    │   ├── page.tsx                           # Root launchpad router
    │   ├── login/page.tsx                     # Branded login with 1-click personas
    │   ├── app/                               # INTERNAL FOUNDER PORTAL
    │   │   ├── page.tsx                       # 5.1 Executive Overview
    │   │   ├── clients/                       # 5.2 Client Management (List & 16-section Detail)
    │   │   │   └── [id]/                      # Detail, 16-section ICP & AI Sales Playbook
    │   │   ├── prospects/                     # 5.3 15-Stage Lead CRM (Table/Kanban, CSV, Convert to Deal)
    │   │   ├── deals/                         # 5.4 Sales & Deals Pipeline (INR, Win Rate, Lost Reasons)
    │   │   ├── finance/                       # 5.5 Finance & Billing (Retainers, Payments, 18% GST Invoices)
    │   │   ├── campaigns/                     # 5.6 LinkedIn Outbound Campaigns
    │   │   ├── inbox/                         # 5.7 Unified 3-Pane Conversation Manager
    │   │   ├── tasks/                         # 5.8 List & Kanban Task Board
    │   │   ├── calendar/                      # 5.9 Operational Outreach Calendar
    │   │   ├── reports/                       # 5.10 Weekly Executive Dossiers & Campaign Yield Matrix
    │   │   ├── team/                          # 5.11 Team & RBAC Management
    │   │   ├── notifications/                 # In-App Notification Center
    │   │   └── settings/                      # System, Channel & AI Copilot Settings
    │   └── portal/                            # CLIENT TRANSPARENCY PORTAL
    │       ├── page.tsx                       # 6.1 Client Executive Overview
    │       ├── campaigns/                     # 6.2 My Campaigns
    │       ├── prospects/                     # 6.3 My Prospects (with Feedback & Flagging)
    │       ├── approvals/                     # 6.4 Message Approvals Gate
    │       ├── conversations/                 # 6.5 Conversation Transparency Audit
    │       ├── reports/                       # 6.6 Weekly Dossiers (Published) & Funnel Visualizations
    │       ├── requests/                      # 6.7 Request & Targeting Ticket Hub
    │       └── settings/                      # Client Organization Profile
    ├── components/
    │   ├── layout/                            # AppLayout, ClientLayout, RoleSwitcher
    │   └── ui/                                # Button, Card, Badge, Modal, Icons
    ├── lib/
    │   ├── store/                             # Reactive CRM State Store & Demo Seeds
    │   ├── supabase/                          # Browser & Server Supabase Client Handlers
    │   └── utils.ts                           # INR currency formatting (en-IN) & class merging
    └── types/
        └── crm.ts                             # TypeScript models, enums & interfaces
```

---

## 8. LinkedIn Compliance Notice

As specified in the product architecture, LeadScorpio adheres strictly to platform safety and brand reputation standards:
- **No unauthorized headless browser scrapers** or automated connection bots that violate LinkedIn Terms of Service.
- Workflows support human-assisted execution, personalized note staging, CSV ingestion, and verified official API integrations.

