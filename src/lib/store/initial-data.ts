import {
  UserProfile,
  Client,
  Campaign,
  Prospect,
  Task,
  Meeting,
  Deal,
  ClientFinanceAgreement,
  Invoice,
  WeeklyReport,
  Approval,
  ClientRequest,
  NotificationItem,
  Conversation,
  InternalNote,
  ClientDocument,
} from "@/types/crm";

export const INITIAL_USERS: UserProfile[] = [
  {
    id: "user-founder-charan",
    email: "leadscorpioofficial@gmail.com",
    full_name: "Charan Tej (Founder)",
    role: "FOUNDER",
    phone: "+91 98765 43210",
    organization_id: "org-leadscorpio-hq",
    created_at: "2026-11-01T00:00:00Z",
  },
  {
    id: "user-sdr-operations",
    email: "ops@leadscorpio.com",
    full_name: "LeadScorpio Operations",
    role: "TEAM_MEMBER",
    phone: "+91 98765 43211",
    organization_id: "org-leadscorpio-hq",
    created_at: "2026-11-01T00:00:00Z",
  },
];

export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_CAMPAIGNS: Campaign[] = [];
export const INITIAL_PROSPECTS: Prospect[] = [];
export const INITIAL_DEALS: Deal[] = [];
export const INITIAL_MEETINGS: Meeting[] = [];
export const INITIAL_FINANCE_AGREEMENTS: ClientFinanceAgreement[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_WEEKLY_REPORTS: WeeklyReport[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_APPROVALS: Approval[] = [];
export const INITIAL_CLIENT_REQUESTS: ClientRequest[] = [];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_INTERNAL_NOTES: InternalNote[] = [];
export const INITIAL_DOCUMENTS: ClientDocument[] = [];
