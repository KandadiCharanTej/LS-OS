"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Edit3,
} from "lucide-react";
import { LinkedinIcon } from "@/components/ui/Icons";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProspectStatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { useCRM } from "@/lib/store/crm-store";
import { ProspectStatus, PriorityLevel } from "@/types/crm";

export default function ProspectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const prospectId = params?.id as string;
  const { prospects, updateProspect, conversations, addMeeting } = useCRM();

  const prospect = prospects.find((p) => p.id === prospectId) || prospects[0];

  const [isEditing, setIsEditing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ProspectStatus>(
    prospect?.status || "NEW"
  );
  const [currentPriority, setCurrentPriority] = useState<PriorityLevel>(
    prospect?.priority || "MEDIUM"
  );
  const [notes, setNotes] = useState(prospect?.notes || "");
  const [actionLogNote, setActionLogNote] = useState("");

  if (!prospect) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <p className="text-sm text-slate-500">Prospect record not found.</p>
          <Link href="/app/prospects" className="mt-4 inline-block text-xs text-[#C65D2E]">
            Back to Prospects
          </Link>
        </div>
      </AppLayout>
    );
  }

  const handleStatusChange = (newStatus: ProspectStatus) => {
    setCurrentStatus(newStatus);
    updateProspect(prospect.id, {
      status: newStatus,
      priority: currentPriority,
    });
  };

  const handleSaveNotes = () => {
    updateProspect(prospect.id, { notes });
    setIsEditing(false);
  };

  // Find associated conversation if any
  const conversation = conversations.find((c) => c.prospect_id === prospect.id);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/app/prospects"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#071525] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all prospects
        </Link>

        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#071525]/[0.08] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#071525] text-white flex items-center justify-center font-bold text-xl shadow-md border border-[#C65D2E]/20">
              {prospect.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-[#071525] tracking-tight">
                  {prospect.full_name}
                </h1>
                <ProspectStatusBadge status={prospect.status} />
                <PriorityBadge priority={prospect.priority} />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {prospect.job_title} at <strong className="text-slate-700">{prospect.company}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <a
                  href={prospect.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#0A66C2] hover:underline font-semibold"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                  View LinkedIn Profile
                  <ExternalLink className="w-3 h-3" />
                </a>
                {prospect.work_email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {prospect.work_email}
                  </span>
                )}
                {prospect.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {prospect.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {conversation && (
              <Link href="/app/inbox">
                <Button variant="primary" size="sm">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Open Conversation Thread
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Workflow Lifecycle Step Indicator */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-bold text-[#071525] uppercase tracking-wider text-[11px]">
              LinkedIn Outreach Pipeline Stage
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              Click step to advance status
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs text-center font-medium">
            {[
              { id: "READY_FOR_OUTREACH", label: "1. Ready" },
              { id: "CONNECTION_REQUEST_SENT", label: "2. Conn. Sent" },
              { id: "CONNECTED", label: "3. Connected" },
              { id: "MESSAGE_SENT", label: "4. Messaged" },
              { id: "REPLIED", label: "5. Replied" },
              { id: "QUALIFIED", label: "6. Qualified" },
              { id: "MEETING_BOOKED", label: "7. Meeting Booked" },
            ].map((step) => {
              const isActive = prospect.status === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => handleStatusChange(step.id as ProspectStatus)}
                  className={`p-2.5 rounded-xl border transition-all text-left sm:text-center ${
                    isActive
                      ? "bg-[#C65D2E] text-white border-[#C65D2E] shadow-sm font-bold"
                      : "bg-[#FAF9F6] text-slate-600 border-slate-200 hover:border-[#C65D2E]/40"
                  }`}
                >
                  <div className="truncate">{step.label}</div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* 2-Column Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Intelligence, Notes & Company Profile */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Research Notes & Pre-Call Intelligence</CardTitle>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs text-[#C65D2E] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditing ? "Cancel" : "Edit Notes"}
                </button>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      rows={5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 rounded-xl bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 text-xs"
                    />
                    <Button variant="primary" size="sm" onClick={handleSaveNotes}>
                      Save Intel
                    </Button>
                  </div>
                ) : (
                  <p className="text-slate-600 leading-relaxed bg-[#FAF9F6] p-4 rounded-xl border border-slate-100">
                    {prospect.notes || "No specific research notes logged yet."}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Conversation Log Preview */}
            {conversation ? (
              <Card>
                <CardHeader>
                  <CardTitle>Logged Conversation Messages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {conversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-2xl text-xs space-y-1 ${
                        msg.direction === "OUTBOUND"
                          ? "bg-[#071525]/5 border border-[#071525]/10 ml-8"
                          : "bg-[#C65D2E]/10 border border-[#C65D2E]/20 mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-[#071525]">{msg.sender_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(msg.sent_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{msg.content}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card className="p-6 text-center text-xs text-slate-500">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No messages recorded for this prospect yet. Log responses in the unified Inbox.
              </Card>
            )}
          </div>

          {/* Right Column: Campaign Mapping & Metadata */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Association</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Client Workspace</span>
                  <span className="font-bold text-[#071525]">{prospect.client_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Campaign</span>
                  <span className="font-bold text-[#C65D2E]">{prospect.campaign_name || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Team Member</span>
                  <span className="font-semibold text-slate-700">
                    {prospect.assigned_team_member_name || "Marcus Chen"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Lead Source</span>
                  <span className="text-slate-600">{prospect.lead_source}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Last Activity Recorded</span>
                  <span className="font-mono text-slate-600">
                    {new Date(prospect.last_activity_date).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4 space-y-2">
              <span className="text-xs font-bold text-[#071525] block mb-2">
                Quick Pipeline Actions
              </span>
              <button
                onClick={() => handleStatusChange("CONNECTION_REQUEST_SENT")}
                className="w-full text-left px-3 py-2 rounded-xl border border-slate-200 hover:border-[#C65D2E]/40 hover:bg-[#FAF9F6] text-xs font-medium text-slate-700 transition-colors"
              >
                Log Connection Request Sent
              </button>
              <button
                onClick={() => handleStatusChange("CONNECTED")}
                className="w-full text-left px-3 py-2 rounded-xl border border-slate-200 hover:border-[#C65D2E]/40 hover:bg-[#FAF9F6] text-xs font-medium text-slate-700 transition-colors"
              >
                Log Connection Accepted
              </button>
              <button
                onClick={() => handleStatusChange("INTERESTED")}
                className="w-full text-left px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-xs font-medium text-emerald-800 transition-colors"
              >
                Tag as Positive / Interested
              </button>
              <button
                onClick={() => handleStatusChange("MEETING_BOOKED")}
                className="w-full text-left px-3 py-2 rounded-xl border border-[#C65D2E]/30 bg-[#C65D2E]/5 hover:bg-[#C65D2E]/10 text-xs font-bold text-[#C65D2E] transition-colors"
              >
                Confirm Meeting Booked
              </button>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
