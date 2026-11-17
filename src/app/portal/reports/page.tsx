"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FileText,
  Clock,
  Eye,
  Sparkles,
  Building2,
} from "lucide-react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCRM } from "@/lib/store/crm-store";
import { WeeklyReport } from "@/types/crm";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ClientReportsPage() {
  const { currentUser, clients, campaigns, prospects, weeklyReports } = useCRM();

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
            You do not have an active client workspace linked to this session.
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

  const clientProspects = prospects.filter((p) => p.client_id === client.id);
  const clientCampaigns = campaigns.filter((c) => c.client_id === client.id);
  const clientSharedReports = weeklyReports.filter(
    (r) => r.client_id === client.id && r.is_shared_with_client
  );

  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);

  // Outreach Metrics
  const totalResearched = clientProspects.length;
  const connSent = clientProspects.filter((p) =>
    [
      "CONNECTION_REQUEST_SENT",
      "CONNECTION_ACCEPTED",
      "CONNECTED",
      "OPENING_MESSAGE_SENT",
      "MESSAGE_SENT",
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

  const replies = clientProspects.filter((p) =>
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

  const positive = clientProspects.filter((p) =>
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

  const meetings = clientProspects.filter((p) =>
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
    messagesSent > 0 ? Math.round((replies / messagesSent) * 100) : 0;

  const chartData = [
    { name: "Prospects", count: totalResearched },
    { name: "Conn. Sent", count: connSent },
    { name: "Accepted", count: connAccepted },
    { name: "Messaged", count: messagesSent },
    { name: "Replies", count: replies },
    { name: "Positive", count: positive },
    { name: "Booked Calls", count: meetings },
  ];

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#071525] tracking-tight">
              Campaign Performance & Weekly Reports
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Verified ROI, acceptance rates, and booked sales conversations for {client.name}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Acceptance Rate
            </span>
            <div className="text-3xl font-black text-[#C65D2E]">
              {acceptanceRate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {connAccepted} of {connSent} accepted
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Response Rate
            </span>
            <div className="text-3xl font-black text-[#071525]">
              {replyRate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {replies} replies from {messagesSent} messaged
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Positive Inquiries
            </span>
            <div className="text-3xl font-black text-emerald-600">
              {positive}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              High-intent leads
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Booked Meetings
            </span>
            <div className="text-3xl font-black text-[#C65D2E]">
              {meetings}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Executive sales meetings
            </div>
          </div>
        </div>

        {/* Funnel Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Outbound Funnel Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} />
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

        {/* Weekly Executive Dossiers Published by LeadScorpio Team */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C65D2E]" />
              Official Weekly Executive Dossiers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientSharedReports.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Your weekly performance dossier is being compiled by the LeadScorpio operations team.
              </div>
            ) : (
              clientSharedReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-bold text-sm text-[#071525]">
                      {report.report_title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(report.period_start)} – {formatDate(report.period_end)} • Compiled by {report.prepared_by}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs font-mono hidden md:block">
                      <span className="text-slate-500">Meetings: </span>
                      <strong className="text-[#C65D2E]">{report.meeting_metrics.booked} booked</strong>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Dossier
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* View Weekly Report Modal */}
        {selectedReport && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedReport(null)}
            title={selectedReport.report_title || selectedReport.reporting_period || "Weekly Performance Dossier"}
            description={`Reporting Period: ${formatDate(selectedReport.period_start || "")} to ${formatDate(selectedReport.period_end || "")}`}
            maxWidth="lg"
          >
            <div className="space-y-5 text-xs text-[#071525] p-2">
              {/* Outreach Metrics */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                  1. Outreach & Response Metrics
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono">
                  <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Requests</span>
                    <span className="text-base font-black">
                      {selectedReport.outreach_metrics?.connection_requests_sent ?? selectedReport.metrics?.conn_sent ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Accepted</span>
                    <span className="text-base font-black">
                      {selectedReport.outreach_metrics?.connection_requests_accepted ?? selectedReport.metrics?.conn_accepted ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Accept %</span>
                    <span className="text-base font-black text-[#C65D2E]">
                      {selectedReport.outreach_metrics?.acceptance_rate ??
                        Math.round(((selectedReport.metrics?.conn_accepted || 0) / (selectedReport.metrics?.conn_sent || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Messaged</span>
                    <span className="text-base font-black">
                      {selectedReport.outreach_metrics?.opening_messages_sent ?? selectedReport.metrics?.opening_sent ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Replies</span>
                    <span className="text-base font-black">
                      {selectedReport.outreach_metrics?.replies_received ?? selectedReport.metrics?.replies ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Reply %</span>
                    <span className="text-base font-black text-emerald-600">
                      {selectedReport.outreach_metrics?.reply_rate ?? selectedReport.metrics?.reply_rate ?? 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Meetings & Generated Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-[#FAF9F6] rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Meetings Outcome
                  </span>
                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between">
                      <span>Booked Calls:</span>
                      <span className="font-bold">
                        {selectedReport.meeting_metrics?.booked ?? selectedReport.metrics?.meetings_booked ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Attended:</span>
                      <span className="font-bold text-emerald-700">
                        {selectedReport.meeting_metrics?.attended ?? selectedReport.metrics?.meetings_attended ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Qualified Opportunities:</span>
                      <span className="font-bold text-[#C65D2E]">
                        {selectedReport.meeting_metrics?.qualified ?? selectedReport.metrics?.qualified_leads ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF9F6] rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Pipeline Financials
                  </span>
                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between">
                      <span>Active Pipeline Generated:</span>
                      <span className="font-bold">
                        {formatCurrency(
                          selectedReport.deal_metrics?.pipeline_value_generated ??
                            selectedReport.metrics?.pipeline_value ??
                            0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deals Won:</span>
                      <span className="font-bold text-emerald-700">
                        {selectedReport.deal_metrics?.deals_won_count ?? selectedReport.metrics?.deals_won ?? 0} (
                        {formatCurrency(
                          selectedReport.deal_metrics?.total_won_value ??
                            selectedReport.metrics?.won_value ??
                            0
                        )})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-3">
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/60">
                  <span className="font-bold text-blue-900 block mb-1">Observations:</span>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedReport.observations || selectedReport.strategy_observations}
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/60">
                  <span className="font-bold text-emerald-900 block mb-1">
                    LeadScorpio Action Plan for Next Week:
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedReport.action_plan || selectedReport.next_week_action_plan}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="w-3.5 h-3.5" />
                  Print Dossier
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </ClientLayout>
  );
}
