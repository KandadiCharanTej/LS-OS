"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Send,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingUp,
  FileCheck,
  ChevronRight,
  HelpCircle,
  Building2,
} from "lucide-react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CampaignStatusBadge, ProspectStatusBadge } from "@/components/ui/Badge";
import { useCRM } from "@/lib/store/crm-store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ClientPortalOverview() {
  const { currentUser, clients, campaigns, prospects, meetings, approvals } =
    useCRM();

  // Multi-tenant client isolation: Get the active client record
  const currentClientId = currentUser.organization_id || "client-kf-ai";
  const client =
    clients.find((c) => c.id === currentClientId) || clients[0];

  if (!client) {
    return (
      <ClientLayout>
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 my-8">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-[#071525]">No Client Account Connected</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You do not have an active client workspace linked to this session. Please contact LeadScorpio support or switch to an authorized client account.
          </p>
          <div className="mt-4">
            <Link href="/app">
              <Button variant="primary" size="sm">
                Go to LeadScorpio Operations Portal
              </Button>
            </Link>
          </div>
        </div>
      </ClientLayout>
    );
  }

  const clientCampaigns = campaigns.filter((c) => c.client_id === client.id);
  const clientProspects = prospects.filter((p) => p.client_id === client.id);
  const clientMeetings = meetings.filter((m) => m.client_id === client.id);
  const pendingApprovals = approvals.filter(
    (a) => a.client_id === client.id && a.status === "PENDING_REVIEW"
  );

  // Outreach Metrics for this specific client only
  const totalResearched = clientProspects.length;
  const connSent = clientProspects.filter((p) =>
    [
      "CONNECTION_REQUEST_SENT",
      "CONNECTION_ACCEPTED",
      "CONNECTED",
      "OPENING_MESSAGE_SENT",
      "MESSAGE_SENT",
      "FOLLOW_UP_SENT",
      "REPLIED",
      "INTERESTED",
      "NOT_INTERESTED",
      "QUALIFIED",
      "MEETING_BOOKED",
      "MEETING_ATTENDED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "DEAL_WON",
    ].includes(p.status)
  ).length;

  const connAccepted = clientProspects.filter((p) =>
    [
      "CONNECTION_ACCEPTED",
      "CONNECTED",
      "OPENING_MESSAGE_SENT",
      "MESSAGE_SENT",
      "FOLLOW_UP_SENT",
      "REPLIED",
      "INTERESTED",
      "QUALIFIED",
      "MEETING_BOOKED",
      "MEETING_ATTENDED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "DEAL_WON",
    ].includes(p.status)
  ).length;

  const messagesSent = clientProspects.filter((p) =>
    [
      "OPENING_MESSAGE_SENT",
      "MESSAGE_SENT",
      "FOLLOW_UP_SENT",
      "REPLIED",
      "INTERESTED",
      "QUALIFIED",
      "MEETING_BOOKED",
      "MEETING_ATTENDED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "DEAL_WON",
    ].includes(p.status)
  ).length;

  const totalReplies = clientProspects.filter((p) =>
    [
      "REPLIED",
      "INTERESTED",
      "QUALIFIED",
      "MEETING_BOOKED",
      "MEETING_ATTENDED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "DEAL_WON",
    ].includes(p.status)
  ).length;

  const positiveReplies = clientProspects.filter((p) =>
    [
      "INTERESTED",
      "QUALIFIED",
      "MEETING_BOOKED",
      "MEETING_ATTENDED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "DEAL_WON",
    ].includes(p.status)
  ).length;

  const qualifiedLeads = clientProspects.filter((p) =>
    [
      "QUALIFIED",
      "MEETING_BOOKED",
      "MEETING_ATTENDED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "DEAL_WON",
    ].includes(p.status)
  ).length;

  const bookedCalls = clientProspects.filter((p) =>
    [
      "MEETING_BOOKED",
      "MEETING_ATTENDED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "DEAL_WON",
    ].includes(p.status)
  ).length;

  const acceptanceRate =
    connSent > 0 ? Math.round((connAccepted / connSent) * 100) : 0;
  const replyRate =
    messagesSent > 0 ? Math.round((totalReplies / messagesSent) * 100) : 0;

  const funnelChartData = [
    { stage: "Researched", count: totalResearched },
    { stage: "Conn. Sent", count: connSent },
    { stage: "Connected", count: connAccepted },
    { stage: "Messaged", count: messagesSent },
    { stage: "Replies", count: totalReplies },
    { stage: "Calls Booked", count: bookedCalls },
  ];

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-[#071525] text-white p-6 sm:p-8 rounded-3xl shadow-[0_16px_40px_rgba(7,21,37,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <span className="text-[11px] font-mono tracking-widest text-[#C65D2E] uppercase font-bold">
              Client Transparency Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {currentUser.full_name}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Here is your live LinkedIn outreach progress for{" "}
              <strong className="text-white">{client.name}</strong>. Every prospect,
              message, and booked call is tracked with full transparency.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Link href="/portal/requests">
              <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white hover:text-[#071525]">
                <HelpCircle className="w-3.5 h-3.5 mr-1" />
                Submit Request
              </Button>
            </Link>
            <Link href="/portal/approvals">
              <Button variant="primary" size="sm">
                <FileCheck className="w-3.5 h-3.5 mr-1" />
                Review Copy ({pendingApprovals.length})
              </Button>
            </Link>
          </div>
        </div>

        {/* Pending Approval Notification Banner */}
        {pendingApprovals.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#C65D2E]/10 border border-[#C65D2E]/30 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-[#071525]">
              <span className="w-3 h-3 rounded-full bg-[#C65D2E] animate-pulse shrink-0" />
              <span>
                <strong>Action Required:</strong> You have{" "}
                <strong>{pendingApprovals.length} outreach message drafts</strong> awaiting your review and approval.
              </span>
            </div>
            <Link href="/portal/approvals">
              <Button variant="primary" size="sm">
                Review Now
              </Button>
            </Link>
          </div>
        )}

        {/* 6 Core Client Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
              Prospects Targeted
            </div>
            <div className="text-2xl font-black text-[#071525]">
              {totalResearched}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Strict ICP</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
              Connections Sent
            </div>
            <div className="text-2xl font-black text-[#071525]">{connSent}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Personalized notes</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
              Acceptance Rate
            </div>
            <div className="text-2xl font-black text-[#C65D2E]">
              {acceptanceRate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {connAccepted} accepted
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
              Replies Received
            </div>
            <div className="text-2xl font-black text-[#071525]">
              {totalReplies}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              {replyRate}% reply rate
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
              Positive Replies
            </div>
            <div className="text-2xl font-black text-emerald-600">
              {positiveReplies}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">High purchase intent</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
              Meetings Booked
            </div>
            <div className="text-2xl font-black text-[#C65D2E]">
              {bookedCalls}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Strategy calls</div>
          </div>
        </div>

        {/* Charts & Campaign Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Campaign Conversion Progress</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Outbound funnel performance across verified decision-makers.
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                    <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#64748B" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#071525",
                        color: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="#C65D2E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Booked Meetings Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Discovery Calls</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Qualified prospects handed off to your team.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {clientMeetings.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No upcoming meetings currently booked.
                </div>
              ) : (
                clientMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-[#FAF9F6] border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-[#071525]">
                      <span>{m.prospect_name}</span>
                      <span className="text-[10px] font-mono text-[#C65D2E]">
                        {new Date(m.scheduled_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{m.prospect_company}</p>
                    {m.qualification_notes && (
                      <p className="text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 mt-1">
                        <strong>Notes:</strong> {m.qualification_notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Campaigns List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Outbound Campaigns ({clientCampaigns.length})</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted LinkedIn campaigns executed by LeadScorpio on your behalf.
              </p>
            </div>
            <Link href="/portal/campaigns">
              <Button variant="outline" size="sm">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {clientCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#071525]">{camp.name}</h4>
                      <CampaignStatusBadge status={camp.status} />
                    </div>
                    <p className="text-slate-500 max-w-xl">{camp.objective}</p>
                  </div>

                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <div className="font-black text-sm text-[#071525]">{camp.acceptance_rate}%</div>
                      <div className="text-[10px] text-slate-400">Accept %</div>
                    </div>
                    <div>
                      <div className="font-black text-sm text-emerald-600">{camp.reply_rate}%</div>
                      <div className="text-[10px] text-slate-400">Reply %</div>
                    </div>
                    <div>
                      <div className="font-black text-sm text-[#C65D2E]">{camp.meetings_booked_count}</div>
                      <div className="text-[10px] text-slate-400">Calls</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}

