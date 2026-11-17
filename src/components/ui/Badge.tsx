import * as React from "react";
import { cn } from "@/lib/utils";
import {
  ProspectStatus,
  PriorityLevel,
  CampaignStatus,
  ClientStatus,
  PaymentStatus,
  DealStage,
  MeetingStatus,
} from "@/types/crm";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "copper"
    | "navy"
    | "success"
    | "warning"
    | "danger"
    | "neutral"
    | "outline";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-[#071525]/5 text-[#071525] border border-[#071525]/10",
    copper: "bg-[#C65D2E]/10 text-[#C65D2E] border border-[#C65D2E]/20 font-medium",
    navy: "bg-[#071525] text-[#FAF9F6] border border-[#071525]",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200",
    outline: "bg-white text-slate-600 border border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function ProspectStatusBadge({ status }: { status: ProspectStatus }) {
  const mapping: Record<
    string,
    { label: string; variant: BadgeProps["variant"] }
  > = {
    NEW_LEAD: { label: "1. New Lead", variant: "neutral" },
    NEW: { label: "1. New Lead", variant: "neutral" },
    CONTACTED: { label: "2. Contacted", variant: "default" },
    RESEARCHING: { label: "2. Researching", variant: "default" },
    READY_FOR_OUTREACH: { label: "3. Ready for Outreach", variant: "copper" },
    CONNECTION_REQUEST_SENT: { label: "3. Conn. Sent", variant: "warning" },
    CONNECTION_ACCEPTED: { label: "4. Connected", variant: "copper" },
    CONNECTED: { label: "4. Connected", variant: "copper" },
    OPENING_MESSAGE_SENT: { label: "5. Opening Sent", variant: "default" },
    MESSAGE_SENT: { label: "5. Opening Sent", variant: "default" },
    REPLIED: { label: "6. Replied", variant: "warning" },
    INTERESTED: { label: "7. Interested", variant: "success" },
    QUALIFIED: { label: "8. Qualified", variant: "success" },
    MEETING_BOOKED: { label: "9. Meeting Booked", variant: "copper" },
    MEETING_ATTENDED: { label: "10. Meeting Attended", variant: "copper" },
    PROPOSAL_SENT: { label: "11. Proposal Sent", variant: "warning" },
    NEGOTIATION: { label: "12. Negotiation", variant: "warning" },
    DEAL_WON: { label: "13. Deal Won", variant: "success" },
    CONVERTED: { label: "13. Deal Won", variant: "success" },
    DEAL_LOST: { label: "14. Deal Lost", variant: "danger" },
    DISQUALIFIED: { label: "14. Deal Lost", variant: "danger" },
    NOT_INTERESTED: { label: "15. Not Interested", variant: "neutral" },
    FOLLOW_UP_REQUIRED: { label: "Follow-up Needed", variant: "warning" },
  };

  const current = mapping[status] || { label: status, variant: "neutral" };
  return <Badge variant={current.variant}>{current.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  const mapping: Record<
    PriorityLevel,
    { label: string; variant: BadgeProps["variant"] }
  > = {
    LOW: { label: "Low", variant: "neutral" },
    MEDIUM: { label: "Medium", variant: "default" },
    HIGH: { label: "High", variant: "warning" },
    URGENT: { label: "Urgent", variant: "danger" },
  };

  const current = mapping[priority] || { label: priority, variant: "neutral" };
  return <Badge variant={current.variant}>{current.label}</Badge>;
}

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const mapping: Record<
    CampaignStatus,
    { label: string; variant: BadgeProps["variant"] }
  > = {
    DRAFT: { label: "Draft", variant: "neutral" },
    PENDING_APPROVAL: { label: "Pending Approval", variant: "warning" },
    APPROVED: { label: "Approved", variant: "success" },
    ACTIVE: { label: "Active", variant: "copper" },
    PAUSED: { label: "Paused", variant: "neutral" },
    COMPLETED: { label: "Completed", variant: "success" },
    ARCHIVED: { label: "Archived", variant: "neutral" },
  };

  const current = mapping[status] || { label: status, variant: "neutral" };
  return <Badge variant={current.variant}>{current.label}</Badge>;
}

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const mapping: Record<
    ClientStatus,
    { label: string; variant: BadgeProps["variant"] }
  > = {
    LEAD: { label: "Lead", variant: "neutral" },
    ONBOARDING: { label: "Onboarding", variant: "warning" },
    ACTIVE: { label: "Active", variant: "success" },
    PAUSED: { label: "Paused", variant: "warning" },
    COMPLETED: { label: "Completed", variant: "neutral" },
    CHURNED: { label: "Churned", variant: "danger" },
  };

  const current = mapping[status] || { label: status, variant: "neutral" };
  return <Badge variant={current.variant}>{current.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const mapping: Record<
    PaymentStatus,
    { label: string; variant: BadgeProps["variant"] }
  > = {
    PAID: { label: "Paid", variant: "success" },
    PARTIALLY_PAID: { label: "Partially Paid", variant: "warning" },
    PENDING: { label: "Pending Due", variant: "copper" },
    OVERDUE: { label: "Overdue", variant: "danger" },
    CANCELLED: { label: "Cancelled", variant: "neutral" },
  };

  const current = mapping[status] || { label: status, variant: "neutral" };
  return <Badge variant={current.variant}>{current.label}</Badge>;
}

export function DealStageBadge({ stage }: { stage: DealStage }) {
  const mapping: Record<
    DealStage,
    { label: string; variant: BadgeProps["variant"] }
  > = {
    QUALIFIED_OPPORTUNITY: { label: "Opportunity", variant: "default" },
    PROPOSAL_SENT: { label: "Proposal Sent", variant: "warning" },
    NEGOTIATION: { label: "Negotiation", variant: "copper" },
    VERBAL_COMMITMENT: { label: "Verbal Commitment", variant: "copper" },
    DEAL_WON: { label: "Won Deal", variant: "success" },
    DEAL_LOST: { label: "Lost Deal", variant: "danger" },
  };

  const current = mapping[stage] || { label: stage, variant: "neutral" };
  return <Badge variant={current.variant}>{current.label}</Badge>;
}

export function MeetingStatusBadge({ status }: { status: MeetingStatus }) {
  const mapping: Record<
    MeetingStatus,
    { label: string; variant: BadgeProps["variant"] }
  > = {
    BOOKED: { label: "Booked", variant: "copper" },
    CONFIRMED: { label: "Confirmed", variant: "copper" },
    ATTENDED: { label: "Attended", variant: "success" },
    NO_SHOW: { label: "No Show", variant: "danger" },
    RESCHEDULED: { label: "Rescheduled", variant: "warning" },
    CANCELLED: { label: "Cancelled", variant: "neutral" },
  };

  const current = mapping[status] || { label: status, variant: "neutral" };
  return <Badge variant={current.variant}>{current.label}</Badge>;
}
