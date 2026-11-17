// ==============================================================================
// LEADSCORPIO CRM & OUTBOUND OPERATIONS PLATFORM
// Extended Type Definitions & Domain Models
// ==============================================================================

export type UserRole =
  | "SUPER_ADMIN"
  | "FOUNDER"
  | "TEAM_MEMBER"
  | "CLIENT_ADMIN"
  | "CLIENT_MEMBER";

export type ClientStatus =
  | "LEAD"
  | "ONBOARDING"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CHURNED";

export type CampaignStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "ARCHIVED";

// Complete 15-Stage Lead Lifecycle (Section 2)
export type ProspectStatus =
  | "NEW_LEAD"
  | "NEW" // Backward compat
  | "RESEARCHING" // Backward compat
  | "READY_FOR_OUTREACH" // Backward compat
  | "CONTACTED"
  | "CONNECTION_REQUEST_SENT"
  | "CONNECTION_ACCEPTED"
  | "CONNECTED" // Backward compat
  | "OPENING_MESSAGE_SENT"
  | "MESSAGE_SENT" // Backward compat
  | "FOLLOW_UP_SENT"
  | "REPLIED"
  | "INTERESTED"
  | "QUALIFIED"
  | "MEETING_BOOKED"
  | "MEETING_ATTENDED"
  | "PROPOSAL_SENT"
  | "NEGOTIATION"
  | "DEAL_WON"
  | "CONVERTED" // Backward compat
  | "DEAL_LOST"
  | "NOT_INTERESTED"
  | "FOLLOW_UP_REQUIRED"
  | "DISQUALIFIED";

export type LeadSource =
  | "LINKEDIN"
  | "WEBSITE"
  | "REFERRAL"
  | "MANUAL_ENTRY"
  | "COLD_EMAIL"
  | "COLD_CALLING"
  | "WHATSAPP"
  | "OTHER";

export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";

export type ApprovalStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REJECTED";

export type MessageDirection = "OUTBOUND" | "INBOUND";

export type ResponseSentiment =
  | "POSITIVE"
  | "NEGATIVE"
  | "NEUTRAL"
  | "INTERESTED"
  | "NOT_INTERESTED"
  | "OUT_OF_OFFICE"
  | "OTHER"
  | "NEEDS_FOLLOW_UP"
  | "MEETING_REQUESTED";

export type ClientRequestStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type MeetingStatus =
  | "BOOKED"
  | "CONFIRMED"
  | "ATTENDED"
  | "NO_SHOW"
  | "RESCHEDULED"
  | "CANCELLED";

export type MeetingType =
  | "DISCOVERY"
  | "DEMO"
  | "PROPOSAL_REVIEW"
  | "NEGOTIATION"
  | "ACCOUNT_REVIEW";

export type DealStage =
  | "QUALIFIED_OPPORTUNITY"
  | "PROPOSAL_SENT"
  | "NEGOTIATION"
  | "VERBAL_COMMITMENT"
  | "DEAL_WON"
  | "DEAL_LOST";

export type PaymentStatus =
  | "PAID"
  | "PARTIALLY_PAID"
  | "PENDING"
  | "OVERDUE"
  | "CANCELLED";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
  organization_id?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  is_internal: boolean;
  created_at: string;
}

export interface SalesPlaybook {
  summary: string;
  elevator_pitch: string;
  target_decision_makers: string[];
  top_pain_points: string[];
  opening_message_angles: string[];
  objection_handling: Array<{ objection: string; counter: string }>;
  qualification_checklist: string[];
  generated_at: string;
}

export interface Client {
  id: string;
  organization_id?: string;
  name: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  company_size?: string;
  status: ClientStatus;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  assigned_team_member_id?: string;
  assigned_team_member_name?: string;
  
  // Detailed Business Profile (Section 5)
  company_description?: string;
  products_and_services?: string;
  value_proposition?: string;
  competitive_advantage?: string;
  business_model?: string;
  target_geography?: string[];
  pricing_packages?: string;
  business_objectives?: string;
  current_challenges?: string;
  
  // Ideal Customer Profile (ICP)
  icp_description?: string;
  target_industries?: string[];
  target_locations?: string[];
  target_job_titles?: string[];
  target_company_sizes?: string[];
  decision_maker_profiles?: string[];
  buyer_personas?: string[];
  budget_range?: string;
  business_pain_points?: string[];
  buying_signals?: string[];
  disqualification_criteria?: string[];

  // LeadScorpio Service & Retainer Info
  services_provided?: string[];
  linkedin_outreach_strategy?: string;
  active_channels?: string[];
  monthly_deliverables?: string;
  agreed_contract_amount?: number;
  contract_currency?: string;
  contract_duration?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  client_specific_instructions?: string;
  
  // AI Sales Assistant Playbook
  sales_playbook?: SalesPlaybook;

  onboarding_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Computed / aggregated
  active_campaigns_count?: number;
  total_prospects_count?: number;
  meetings_booked_count?: number;
}

export interface Campaign {
  id: string;
  client_id: string;
  client_name?: string;
  name: string;
  description?: string;
  objective?: string;
  channel: "LINKEDIN" | "COLD_EMAIL" | "COLD_CALLING" | "WHATSAPP";
  status: CampaignStatus;
  target_audience?: string;
  target_industry?: string;
  target_job_titles?: string[];
  target_geography?: string[];
  company_size?: string;
  icp_details?: string;
  start_date?: string;
  end_date?: string;
  daily_outreach_limit?: number;
  assigned_team_member_id?: string;
  assigned_team_member_name?: string;
  created_at: string;
  updated_at: string;
  // Computed metrics
  prospects_count?: number;
  connection_requests_sent?: number;
  connections_accepted?: number;
  opening_messages_sent?: number;
  follow_up_messages_sent?: number;
  messages_sent?: number;
  replies_count?: number;
  positive_replies_count?: number;
  neutral_replies_count?: number;
  negative_replies_count?: number;
  out_of_office_count?: number;
  qualified_count?: number;
  meetings_booked_count?: number;
  // Derived rates (percentages 0-100)
  acceptance_rate?: number;
  reply_rate?: number;
  positive_reply_rate?: number;
  meeting_conversion_rate?: number;
}

export interface Prospect {
  id: string;
  client_id: string;
  client_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  assigned_team_member_id?: string;
  assigned_team_member_name?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  job_title: string;
  company: string;
  company_website?: string;
  linkedin_url: string;
  work_email?: string;
  email?: string;
  phone_number?: string;
  phone?: string;
  industry?: string;
  location?: string;
  company_size?: string;
  company_description?: string;
  
  // Extended Lead Attribution (Section 2)
  lead_source: LeadSource | string;
  added_by?: string;
  lead_added_by?: string;
  added_by_name?: string;
  owner_name?: string;
  reason_for_adding?: string;
  qualification_reason?: string;
  purpose_reason?: string;
  budget?: number; // e.g. 1000000
  customer_budget?: number;
  deal_value?: number;
  expected_deal_value?: number;
  currency?: string; // 'INR' | 'USD'
  
  status: ProspectStatus;
  priority: PriorityLevel;
  notes?: string;
  last_activity_date: string;
  next_follow_up_date?: string;
  next_followup_date?: string;
  created_at: string;
  updated_at: string;
  // Client feedback flag
  is_flagged_by_client?: boolean;
  client_feedback_notes?: string;
}

export interface ProspectActivity {
  id: string;
  prospect_id: string;
  prospect_name?: string;
  campaign_id?: string;
  user_id?: string;
  user_name?: string;
  activity_type:
    | "STAGE_CHANGED"
    | "RESEARCH"
    | "CONNECTION_REQUEST_SENT"
    | "CONNECTION_ACCEPTED"
    | "OPENING_MESSAGE_SENT"
    | "MESSAGE_SENT"
    | "FOLLOW_UP_SENT"
    | "REPLY_RECEIVED"
    | "SENTIMENT_UPDATED"
    | "QUALIFIED"
    | "MEETING_BOOKED"
    | "MEETING_ATTENDED"
    | "PROPOSAL_SENT"
    | "DEAL_WON"
    | "DEAL_LOST"
    | "NOTE_ADDED";
  previous_stage?: string;
  new_stage?: string;
  notes?: string;
  outcome?: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: MessageDirection;
  sender_name: string;
  content: string;
  is_manual_entry: boolean;
  sentiment?: ResponseSentiment;
  sent_at: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  prospect_id: string;
  prospect_name: string;
  prospect_title: string;
  prospect_company: string;
  prospect_avatar?: string;
  linkedin_url: string;
  client_id: string;
  client_name: string;
  campaign_id?: string;
  campaign_name?: string;
  assigned_user_id?: string;
  channel: string;
  last_message_at: string;
  last_message_preview?: string;
  last_response_sentiment?: ResponseSentiment;
  is_unread: boolean;
  messages: Message[];
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to_id?: string;
  assigned_to_name?: string;
  created_by_id?: string;
  client_id?: string;
  client_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  prospect_id?: string;
  prospect_name?: string;
  priority: PriorityLevel;
  status: TaskStatus;
  due_date?: string;
  completed_at?: string;
  created_at: string;
}

export interface Meeting {
  id: string;
  client_id: string;
  client_name?: string;
  campaign_id?: string;
  prospect_id: string;
  prospect_name: string;
  prospect_company: string;
  title: string;
  meeting_type: MeetingType;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url?: string;
  meeting_owner_name: string;
  status: MeetingStatus;
  is_qualified: boolean;
  qualification_notes?: string;
  feedback?: string;
  next_steps?: string;
  booked_by_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface Deal {
  id: string;
  name: string;
  title?: string;
  client_id: string;
  client_name: string;
  prospect_id?: string;
  prospect_name?: string;
  prospect_company?: string;
  owner_name: string;
  service_offered: string;
  service_sold?: string;
  expected_value: number; // e.g. 1000000
  customer_budget?: number;
  currency: string; // 'INR' | 'USD'
  expected_close_date: string;
  expected_closing_date?: string;
  stage: DealStage;
  probability: number; // 0 - 100%
  final_value?: number;
  final_deal_value?: number;
  status: "OPEN" | "WON" | "LOST";
  lost_reason?: string;
  reason_lost?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientFinanceAgreement {
  id: string;
  client_id: string;
  client_name: string;
  service_purchased: string;
  agreed_contract_amount: number;
  total_contract_value?: number;
  pricing_model?: string;
  billing_cycle?: string;
  currency: string;
  total_paid: number;
  pending_amount: number;
  payment_due_date: string;
  next_payment_due?: string;
  payment_status: PaymentStatus;
  contract_start_date: string;
  contract_end_date: string;
  reminders_sent_count: number;
  last_reminder_date?: string;
  notes?: string;
  payment_history: PaymentRecord[];
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  client_id: string;
  amount: number;
  currency: string;
  payment_method: "BANK_TRANSFER" | "UPI" | "STRIPE" | "WIRE";
  reference_id: string;
  paid_at: string;
  recorded_by: string;
  notes?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  total?: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  client_billing_address?: string;
  client_gstin?: string;
  client_email?: string;
  invoice_date?: string;
  issue_date?: string;
  due_date: string;
  items?: InvoiceLineItem[];
  line_items?: InvoiceLineItem[];
  subtotal: number;
  tax_rate?: number; // e.g. 18 for 18% GST
  tax_amount?: number;
  tax?: number;
  total_amount: number;
  currency: string;
  payment_instructions?: string;
  notes?: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
  created_at: string;
}

export interface WeeklyReportMetrics {
  conn_sent: number;
  conn_accepted: number;
  opening_sent: number;
  followups_sent: number;
  replies: number;
  reply_rate: number;
  positive_replies: number;
  neutral_replies: number;
  negative_replies: number;
  interested_leads: number;
  qualified_leads: number;
  meetings_booked: number;
  meetings_attended: number;
  meetings_no_show: number;
  deals_created: number;
  deals_won: number;
  pipeline_value: number;
  won_value: number;
}

export interface WeeklyReport {
  id: string;
  client_id: string;
  client_name: string;
  campaign_id?: string;
  campaign_name?: string;
  report_title?: string;
  period_start?: string;
  period_end?: string;
  reporting_period: string; // e.g. "Week 46, Nov 10 - Nov 16, 2026"
  generated_at: string;
  generated_by: string;
  prepared_by?: string;
  metrics: WeeklyReportMetrics;
  outreach_metrics?: any;
  reply_classification?: any;
  meeting_metrics?: any;
  deal_metrics?: any;
  strategy_observations: string;
  observations?: string;
  challenges: string;
  next_week_action_plan: string;
  action_plan?: string;
  shared_with_client: boolean;
  is_shared_with_client?: boolean;
}

export interface Approval {
  id: string;
  client_id: string;
  client_name?: string;
  campaign_id: string;
  campaign_name?: string;
  title: string;
  item_type:
    | "CONNECTION_REQUEST_COPY"
    | "INITIAL_MESSAGE_COPY"
    | "FOLLOW_UP_1"
    | "FOLLOW_UP_2"
    | "TARGET_LIST";
  content: string;
  version: number;
  status: ApprovalStatus;
  requested_by_name?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  feedback_comment?: string;
  comments: ApprovalComment[];
  created_at: string;
  updated_at: string;
}

export interface ApprovalComment {
  id: string;
  approval_id: string;
  user_name: string;
  user_role: UserRole;
  comment: string;
  created_at: string;
}

export interface ClientRequest {
  id: string;
  client_id: string;
  client_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  title: string;
  category:
    | "CAMPAIGN_CHANGE"
    | "TARGET_AUDIENCE_UPDATE"
    | "PROSPECT_CORRECTION"
    | "GENERAL_QUESTION"
    | "SUPPORT";
  description: string;
  priority: PriorityLevel;
  status: ClientRequestStatus;
  submitted_by_name: string;
  assigned_to_name?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type:
    | "POSITIVE_REPLY"
    | "MEETING_BOOKED"
    | "APPROVAL_REQUESTED"
    | "APPROVAL_STATUS"
    | "TASK_ASSIGNED"
    | "CLIENT_REQUEST"
    | "PAYMENT_DUE"
    | "DEAL_WON"
    | "SYSTEM";
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface InternalNote {
  id: string;
  client_id?: string;
  prospect_id?: string;
  campaign_id?: string;
  author_name: string;
  author_role: string;
  note: string;
  created_at: string;
}

export interface ClientDocument {
  id: string;
  client_id: string;
  name: string;
  file_url: string;
  file_size_bytes: number;
  mime_type: string;
  uploaded_by_name: string;
  created_at: string;
}
