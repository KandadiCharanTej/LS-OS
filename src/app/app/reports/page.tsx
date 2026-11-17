"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Building2,
  TrendingUp,
  Filter,
  CheckCircle2,
  Share2,
  Plus,
  Eye,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
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
  Legend,
} from "recharts";

export default function ReportsPage() {
  const {
    clients,
    campaigns,
    prospects,
    weeklyReports,
    generateWeeklyReport,
    toggleShareWeeklyReport,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<"weekly_reports" | "campaign_matrix">("weekly_reports");
  const [selectedClient, setSelectedClient] = useState("ALL");
  const [dateRange, setDateRange] = useState("THIS_MONTH");

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedReportForView, setSelectedReportForView] = useState<WeeklyReport | null>(null);

  // New Report Form
  const [genClientId, setGenClientId] = useState(clients[0]?.id || "");
  const [periodStart, setPeriodStart] = useState("2026-11-10");
  const [periodEnd, setPeriodEnd] = useState("2026-11-16");

  const filteredCampaigns = campaigns.filter(
    (c) => selectedClient === "ALL" || c.client_id === selectedClient
  );

  const filteredProspects = prospects.filter(
    (p) => selectedClient === "ALL" || p.client_id === selectedClient
  );

  const filteredWeeklyReports = weeklyReports.filter(
    (r) => selectedClient === "ALL" || r.client_id === selectedClient
  );

  // Aggregated totals
  const totalResearched = filteredProspects.length;
  const connSent = filteredProspects.filter((p) =>
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

  const connAccepted = filteredProspects.filter((p) =>
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

  const messaged = filteredProspects.filter((p) =>
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

  const replies = filteredProspects.filter((p) =>
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

  const positive = filteredProspects.filter((p) =>
    ["INTERESTED", "QUALIFIED", "MEETING_BOOKED", "MEETING_ATTENDED", "PROPOSAL_SENT", "NEGOTIATION", "DEAL_WON"].includes(p.status)
  ).length;

  const meetings = filteredProspects.filter((p) =>
    ["MEETING_BOOKED", "MEETING_ATTENDED", "PROPOSAL_SENT", "NEGOTIATION", "DEAL_WON"].includes(p.status)
  ).length;

  const avgAcceptanceRate =
    connSent > 0 ? Math.round((connAccepted / connSent) * 100) : 0;
  const avgReplyRate =
    messaged > 0 ? Math.round((replies / messaged) * 100) : 0;

  // Chart data: Comparative campaign metrics
  const chartData = filteredCampaigns.map((c) => ({
    name: c.name.length > 20 ? c.name.slice(0, 18) + "..." : c.name,
    "Conn. Sent": c.connection_requests_sent,
    Accepted: c.connections_accepted,
    Replies: c.replies_count,
    Meetings: c.meetings_booked_count,
  }));

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      "Campaign Name",
      "Client",
      "Conn. Sent",
      "Accepted",
      "Acceptance Rate (%)",
      "Messages Sent",
      "Replies",
      "Reply Rate (%)",
      "Positive Replies",
      "Meetings Booked",
    ];

    const rows = filteredCampaigns.map((c) => [
      `"${c.name}"`,
      `"${c.client_name}"`,
      c.connection_requests_sent,
      c.connections_accepted,
      c.acceptance_rate,
      c.messages_sent,
      c.replies_count,
      c.reply_rate,
      c.positive_replies_count,
      c.meetings_booked_count,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leadscorpio_performance_report_${Date.now()}.csv`;
    link.click();
  };

  const handleCreateWeeklyReport = (e: React.FormEvent) => {
    e.preventDefault();
    const rep = generateWeeklyReport(genClientId, periodStart, periodEnd);
    setIsGenerateModalOpen(false);
    setSelectedReportForView(rep);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#071525] tracking-tight">
                Executive Performance & Client Reports
              </h1>
              <span className="text-[11px] font-mono font-bold bg-[#C65D2E]/10 text-[#C65D2E] px-2 py-0.5 rounded-full border border-[#C65D2E]/20">
                Automated Engine
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Multi-dimensional reporting across LinkedIn outreach activity, meetings, sales pipeline, and client dossiers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGenerateModalOpen(true)}
              className="border-[#C65D2E]/30 text-[#C65D2E] hover:bg-[#C65D2E]/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Weekly Dossier
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5" /> Print PDF
            </Button>
            <Button variant="primary" size="sm" onClick={handleExportCSV}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("weekly_reports")}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 px-1 flex items-center gap-2 ${
              activeTab === "weekly_reports"
                ? "border-[#C65D2E] text-[#C65D2E]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            Weekly Executive Dossiers ({filteredWeeklyReports.length})
          </button>
          <button
            onClick={() => setActiveTab("campaign_matrix")}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 px-1 flex items-center gap-2 ${
              activeTab === "campaign_matrix"
                ? "border-[#C65D2E] text-[#C65D2E]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Comparative Campaign Matrix & Charts
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#071525]/[0.08] shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl px-3 py-1.5 text-[#071525] focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
            >
              <option value="ALL">All Clients (Consolidated)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl px-3 py-1.5 text-[#071525] focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
            >
              <option value="THIS_MONTH">Current Month (November 2026)</option>
              <option value="LAST_30">Last 30 Days</option>
              <option value="ALL_TIME">All Time</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {filteredCampaigns.length} campaigns analyzed
          </div>
        </div>

        {/* Tab 1: Weekly Executive Dossiers */}
        {activeTab === "weekly_reports" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWeeklyReports.map((report) => (
                <Card
                  key={report.id}
                  className="hover:shadow-md transition-all border border-slate-200 flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                          {report.client_name}
                        </span>
                        <CardTitle className="text-sm mt-1.5 font-bold text-[#071525]">
                          {report.report_title}
                        </CardTitle>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          report.is_shared_with_client
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {report.is_shared_with_client ? "Live in Portal" : "Draft (Internal)"}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {report.period_start && report.period_end
                        ? `${formatDate(report.period_start)} – ${formatDate(report.period_end)}`
                        : report.reporting_period}
                    </div>

                    {/* Quick Metric Pills */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#FAF9F6] rounded-xl text-center text-xs font-mono">
                      <div>
                        <div className="text-slate-400 text-[9px] uppercase">Conn. Sent</div>
                        <div className="font-bold text-[#071525]">
                          {report.outreach_metrics?.connection_requests_sent ?? report.metrics?.conn_sent ?? 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[9px] uppercase">Replies</div>
                        <div className="font-bold text-emerald-600">
                          {report.outreach_metrics?.replies_received ?? report.metrics?.replies ?? 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[9px] uppercase">Meetings</div>
                        <div className="font-bold text-[#C65D2E]">
                          {report.meeting_metrics?.booked ?? report.metrics?.meetings_booked ?? 0}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReportForView(report)}
                        className="text-xs text-[#071525] font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Dossier
                      </Button>

                      <button
                        onClick={() => toggleShareWeeklyReport(report.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                          report.is_shared_with_client
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            : "bg-[#C65D2E] hover:bg-[#A64B24] text-white"
                        }`}
                      >
                        <Share2 className="w-3 h-3" />
                        {report.is_shared_with_client ? "Unshare" : "Push to Portal"}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Comparative Campaign Matrix */}
        {activeTab === "campaign_matrix" && (
          <div className="space-y-6">
            {/* Summary Metric Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-mono block mb-1">
                  Prospects Researched
                </span>
                <div className="text-2xl font-black text-[#071525]">{totalResearched}</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-mono block mb-1">
                  Conn. Sent
                </span>
                <div className="text-2xl font-black text-[#071525]">{connSent}</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-mono block mb-1">
                  Acceptance Rate
                </span>
                <div className="text-2xl font-black text-[#C65D2E]">{avgAcceptanceRate}%</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-mono block mb-1">
                  Messages Sent
                </span>
                <div className="text-2xl font-black text-[#071525]">{messaged}</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-mono block mb-1">
                  Positive Replies
                </span>
                <div className="text-2xl font-black text-emerald-600">{positive}</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-mono block mb-1">
                  Meetings Booked
                </span>
                <div className="text-2xl font-black text-[#C65D2E]">{meetings}</div>
              </div>
            </div>

            {/* Comparative Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Comparative Campaign Conversion Yield</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#071525",
                          color: "#fff",
                          borderRadius: "12px",
                          border: "none",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                      <Bar dataKey="Conn. Sent" fill="#526071" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Accepted" fill="#D97B50" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Replies" fill="#C65D2E" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Meetings" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Breakdown Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Campaign Yield Matrix</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#071525]">
                    <thead className="bg-[#FAF9F6] border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Campaign Name</th>
                        <th className="p-4">Client</th>
                        <th className="p-4 text-center">Conn. Sent</th>
                        <th className="p-4 text-center">Accepted</th>
                        <th className="p-4 text-center">Accept %</th>
                        <th className="p-4 text-center">Messaged</th>
                        <th className="p-4 text-center">Replies</th>
                        <th className="p-4 text-center">Reply %</th>
                        <th className="p-4 text-center font-bold text-[#C65D2E]">Calls Booked</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCampaigns.map((camp) => (
                        <tr key={camp.id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold text-[#071525]">{camp.name}</td>
                          <td className="p-4 text-slate-600">{camp.client_name}</td>
                          <td className="p-4 text-center font-mono">{camp.connection_requests_sent}</td>
                          <td className="p-4 text-center font-mono">{camp.connections_accepted}</td>
                          <td className="p-4 text-center font-bold text-[#C65D2E]">
                            {camp.acceptance_rate}%
                          </td>
                          <td className="p-4 text-center font-mono">{camp.messages_sent}</td>
                          <td className="p-4 text-center font-mono">{camp.replies_count}</td>
                          <td className="p-4 text-center font-bold text-emerald-600">
                            {camp.reply_rate}%
                          </td>
                          <td className="p-4 text-center font-black text-[#C65D2E] text-sm">
                            {camp.meetings_booked_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Generate Weekly Dossier Modal */}
        <Modal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          title="Synthesize Executive Weekly Report"
          description="Aggregate verified outreach, meetings, and deals directly from the database into a formal dossier."
          maxWidth="md"
        >
          <form onSubmit={handleCreateWeeklyReport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Client Organization *
              </label>
              <select
                value={genClientId}
                onChange={(e) => setGenClientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Period Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Period End Date *
                </label>
                <input
                  type="date"
                  required
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsGenerateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Compile Report
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Weekly Report Dossier Modal */}
        {selectedReportForView && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedReportForView(null)}
            title={selectedReportForView.report_title || selectedReportForView.reporting_period || "Weekly Report"}
            description={`Reporting Period: ${formatDate(selectedReportForView.period_start || "")} to ${formatDate(selectedReportForView.period_end || "")} • Client: ${selectedReportForView.client_name}`}
            maxWidth="lg"
          >
            <div className="space-y-6 text-xs text-[#071525] p-2">
              {/* Header Info */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Prepared By</span>
                  <div className="font-bold">{selectedReportForView.prepared_by}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleShareWeeklyReport(selectedReportForView.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors ${
                      selectedReportForView.is_shared_with_client
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-[#071525] text-white"
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {selectedReportForView.is_shared_with_client
                      ? "Visible to Client"
                      : "Publish to Client"}
                  </button>
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </Button>
                </div>
              </div>

              {/* Outreach Metrics */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                  1. Outreach & Engagement Metrics
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono">
                  <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Requests</span>
                    <span className="text-base font-black">
                      {selectedReportForView.outreach_metrics?.connection_requests_sent ?? selectedReportForView.metrics?.conn_sent ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Accepted</span>
                    <span className="text-base font-black">
                      {selectedReportForView.outreach_metrics?.connection_requests_accepted ?? selectedReportForView.metrics?.conn_accepted ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Accept %</span>
                    <span className="text-base font-black text-[#C65D2E]">
                      {selectedReportForView.outreach_metrics?.acceptance_rate ??
                        Math.round(((selectedReportForView.metrics?.conn_accepted || 0) / (selectedReportForView.metrics?.conn_sent || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Messaged</span>
                    <span className="text-base font-black">
                      {selectedReportForView.outreach_metrics?.opening_messages_sent ?? selectedReportForView.metrics?.opening_sent ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Replies</span>
                    <span className="text-base font-black">
                      {selectedReportForView.outreach_metrics?.replies_received ?? selectedReportForView.metrics?.replies ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Reply %</span>
                    <span className="text-base font-black text-emerald-600">
                      {selectedReportForView.outreach_metrics?.reply_rate ?? selectedReportForView.metrics?.reply_rate ?? 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Reply Classification Breakdown */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                  2. Sentiment & Reply Classification
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                    <span className="text-[9px] block uppercase font-bold">Interested</span>
                    <span className="text-sm font-black">
                      {selectedReportForView.reply_classification?.interested ?? selectedReportForView.metrics?.interested_leads ?? 0}
                    </span>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-xl border border-blue-200 text-blue-900">
                    <span className="text-[9px] block uppercase font-bold">Positive</span>
                    <span className="text-sm font-black">
                      {selectedReportForView.reply_classification?.positive ?? selectedReportForView.metrics?.positive_replies ?? 0}
                    </span>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                    <span className="text-[9px] block uppercase font-bold">Neutral / OOO</span>
                    <span className="text-sm font-black">
                      {(selectedReportForView.reply_classification?.neutral || 0) +
                        (selectedReportForView.reply_classification?.out_of_office || 0) ||
                        (selectedReportForView.metrics?.neutral_replies || 0)}
                    </span>
                  </div>
                  <div className="p-2 bg-rose-50 rounded-xl border border-rose-200 text-rose-900">
                    <span className="text-[9px] block uppercase font-bold">Not Interested</span>
                    <span className="text-sm font-black">
                      {selectedReportForView.reply_classification?.not_interested ?? selectedReportForView.metrics?.negative_replies ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Meetings & Sales Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-[#FAF9F6] rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Meetings Cadence
                  </span>
                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between">
                      <span>Meetings Booked:</span>
                      <span className="font-bold">
                        {selectedReportForView.meeting_metrics?.booked ?? selectedReportForView.metrics?.meetings_booked ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meetings Attended:</span>
                      <span className="font-bold text-emerald-700">
                        {selectedReportForView.meeting_metrics?.attended ?? selectedReportForView.metrics?.meetings_attended ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Qualified Discovery:</span>
                      <span className="font-bold text-[#C65D2E]">
                        {selectedReportForView.meeting_metrics?.qualified ?? selectedReportForView.metrics?.qualified_leads ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF9F6] rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Pipeline Financials (INR)
                  </span>
                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between">
                      <span>Active Pipeline Generated:</span>
                      <span className="font-bold">
                        {formatCurrency(
                          selectedReportForView.deal_metrics?.pipeline_value_generated ??
                            selectedReportForView.metrics?.pipeline_value ??
                            0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Closed Deals Won:</span>
                      <span className="font-bold text-emerald-700">
                        {selectedReportForView.deal_metrics?.deals_won_count ?? selectedReportForView.metrics?.deals_won ?? 0} (
                        {formatCurrency(
                          selectedReportForView.deal_metrics?.total_won_value ??
                            selectedReportForView.metrics?.won_value ??
                            0
                        )})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategic Insights & Action Plan */}
              <div className="space-y-3">
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/60">
                  <span className="font-bold text-blue-900 block mb-1">Key Observations:</span>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedReportForView.observations || selectedReportForView.strategy_observations}
                  </p>
                </div>

                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60">
                  <span className="font-bold text-amber-900 block mb-1">
                    Challenges & Campaign Bottlenecks:
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedReportForView.challenges}
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/60">
                  <span className="font-bold text-emerald-900 block mb-1">
                    Next Week&apos;s Action Plan:
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedReportForView.action_plan || selectedReportForView.next_week_action_plan}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-200">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedReportForView(null)}
                >
                  Close Dossier
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
