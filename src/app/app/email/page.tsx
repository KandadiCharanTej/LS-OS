"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  MousePointerClick,
  FileCode2,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Filter,
  Calendar,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmailNavHeader } from "@/components/email/EmailNavHeader";
import { useCRM } from "@/lib/store/crm-store";
import { formatDate } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function EmailDashboardPage() {
  const { emailMessages, emailTemplates } = useCRM();
  const [timeRange, setTimeRange] = useState<"ALL" | "30D" | "7D" | "TODAY">("ALL");

  // Filter messages based on time range
  const filteredMessages = useMemo(() => {
    const now = Date.now();
    return emailMessages.filter((m) => {
      const msgTime = new Date(m.created_at).getTime();
      if (timeRange === "TODAY") {
        return now - msgTime <= 24 * 60 * 60 * 1000;
      }
      if (timeRange === "7D") {
        return now - msgTime <= 7 * 24 * 60 * 60 * 1000;
      }
      if (timeRange === "30D") {
        return now - msgTime <= 30 * 24 * 60 * 60 * 1000;
      }
      return true;
    });
  }, [emailMessages, timeRange]);

  // Aggregate Real Metrics
  const totalSent = filteredMessages.filter((m) => m.status === "SENT" || m.status === "DELIVERED").length;
  const totalDelivered = filteredMessages.filter((m) => m.status === "DELIVERED").length;
  const totalFailed = filteredMessages.filter((m) => m.status === "FAILED").length;
  const totalBounced = filteredMessages.filter((m) => m.status === "BOUNCED").length;
  const totalOpened = filteredMessages.filter((m) => Boolean(m.opened_at)).length;
  const totalClicked = filteredMessages.filter((m) => Boolean(m.clicked_at)).length;

  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 100;
  const estimatedOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;

  // Build trend chart data from actual days
  const chartData = useMemo(() => {
    const days: { [dateStr: string]: { date: string; sent: number; delivered: number; failed: number } } = {};
    const count = timeRange === "TODAY" ? 1 : timeRange === "7D" ? 7 : 14;

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().slice(5, 10); // MM-DD
      days[key] = { date: key, sent: 0, delivered: 0, failed: 0 };
    }

    filteredMessages.forEach((m) => {
      const key = m.created_at.slice(5, 10);
      if (days[key]) {
        if (m.status === "SENT" || m.status === "DELIVERED") days[key].sent += 1;
        if (m.status === "DELIVERED") days[key].delivered += 1;
        if (m.status === "FAILED" || m.status === "BOUNCED") days[key].failed += 1;
      }
    });

    return Object.values(days);
  }, [filteredMessages, timeRange]);

  // Most used templates
  const templateUsage = useMemo(() => {
    const counts: { [tplId: string]: number } = {};
    emailMessages.forEach((m) => {
      if (m.template_id) {
        counts[m.template_id] = (counts[m.template_id] || 0) + 1;
      }
    });
    return emailTemplates
      .map((t) => ({ ...t, count: counts[t.id] || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [emailMessages, emailTemplates]);

  const recentEmails = emailMessages.slice(0, 5);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <EmailNavHeader />

        {/* Date Filter & Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#071525]/[0.08] shadow-[0_2px_8px_rgba(7,21,37,0.03)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#071525]">
            <Calendar className="w-4 h-4 text-[#C65D2E]" />
            <span>Reporting Interval:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {(
              [
                { label: "All Time", value: "ALL" },
                { label: "Last 30 Days", value: "30D" },
                { label: "Last 7 Days", value: "7D" },
                { label: "Today", value: "TODAY" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimeRange(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  timeRange === opt.value
                    ? "bg-[#071525] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#071525] hover:bg-[#071525]/[0.04]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Metric KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Total Sent */}
          <Card className="border-[#071525]/[0.08] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Total Sent</span>
                <Send className="w-4 h-4 text-[#C65D2E]" />
              </div>
              <div className="text-2xl font-bold text-[#071525] mt-2">{totalSent}</div>
              <p className="text-[11px] text-[#94A3B8] mt-1 font-mono">Dispatched via Resend</p>
            </CardContent>
          </Card>

          {/* Delivered */}
          <Card className="border-[#071525]/[0.08] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Delivered</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 mt-2">{totalDelivered}</div>
              <p className="text-[11px] text-emerald-700/80 mt-1 font-mono">{deliveryRate}% delivery rate</p>
            </CardContent>
          </Card>

          {/* Failed / Errors */}
          <Card className="border-[#071525]/[0.08] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Failed</span>
                <XCircle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-red-600 mt-2">{totalFailed}</div>
              <p className="text-[11px] text-red-500/80 mt-1 font-mono">API / syntax errors</p>
            </CardContent>
          </Card>

          {/* Bounces */}
          <Card className="border-[#071525]/[0.08] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Bounced</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-600 mt-2">{totalBounced}</div>
              <p className="text-[11px] text-amber-600/80 mt-1 font-mono">Mailbox rejected</p>
            </CardContent>
          </Card>

          {/* Estimated Opens */}
          <Card className="border-[#071525]/[0.08] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Open Signals</span>
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-[#071525] mt-2">{totalOpened}</div>
              <p className="text-[11px] text-blue-600 mt-1 font-mono">{estimatedOpenRate}% est. open rate</p>
            </CardContent>
          </Card>

          {/* Click Events */}
          <Card className="border-[#071525]/[0.08] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Clicks</span>
                <MousePointerClick className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-[#071525] mt-2">{totalClicked}</div>
              <p className="text-[11px] text-purple-600 mt-1 font-mono">{clickRate}% click-through</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart + Most Used Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart (2 columns) */}
          <Card className="lg:col-span-2 border-[#071525]/[0.08] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#071525]/[0.06]">
              <div>
                <CardTitle className="text-base font-bold text-[#071525] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#C65D2E]" />
                  Outbound Email Volume Trend
                </CardTitle>
                <p className="text-xs text-[#64748B] mt-0.5">Real email dispatch history across time</p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {timeRange}
              </span>
            </CardHeader>
            <CardContent className="p-5">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="emailSentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C65D2E" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#C65D2E" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="emailDeliveredGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#071525",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sent"
                      name="Sent"
                      stroke="#C65D2E"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#emailSentGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="delivered"
                      name="Delivered"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#emailDeliveredGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Template Launchpad (1 column) */}
          <Card className="border-[#071525]/[0.08] shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#071525]/[0.06]">
              <CardTitle className="text-base font-bold text-[#071525] flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-[#C65D2E]" />
                Top Email Templates
              </CardTitle>
              <Link href="/app/email/templates" className="text-xs text-[#C65D2E] hover:underline font-semibold">
                View All (12)
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
              <div className="space-y-2.5">
                {templateUsage.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-3 rounded-xl border border-[#071525]/[0.06] hover:border-[#C65D2E]/40 hover:bg-[#FAF9F6] transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-[#071525] truncate">{tpl.name}</div>
                      <div className="text-[10px] text-[#64748B] truncate mt-0.5">{tpl.subject}</div>
                    </div>
                    <Link href={`/app/email/compose?templateId=${tpl.id}`}>
                      <Button variant="secondary" size="sm" className="h-7 text-[11px] px-2.5 shrink-0">
                        Use
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#071525]/[0.06] text-center">
                <Link href="/app/email/compose">
                  <Button variant="primary" size="sm" className="w-full">
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Open Composer
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Outbound Activity Feed */}
        <Card className="border-[#071525]/[0.08] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#071525]/[0.06]">
            <div>
              <CardTitle className="text-base font-bold text-[#071525] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C65D2E]" />
                Recent Outbound Activity
              </CardTitle>
              <p className="text-xs text-[#64748B] mt-0.5">Most recent emails dispatched through Resend</p>
            </div>
            <Link href="/app/email/history" className="text-xs font-semibold text-[#C65D2E] hover:underline">
              View Complete History ({emailMessages.length})
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentEmails.length === 0 ? (
              <div className="p-8 text-center">
                <Send className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                <h4 className="text-sm font-bold text-[#071525]">No emails sent yet</h4>
                <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                  Your outbox is completely clean. Click &quot;Compose Email&quot; to send your first branded LeadScorpio email.
                </p>
                <div className="mt-4">
                  <Link href="/app/email/compose">
                    <Button variant="primary" size="sm">
                      Compose First Email
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#071525]/[0.06]">
                {recentEmails.map((msg) => (
                  <div key={msg.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          msg.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-700"
                            : msg.status === "SENT"
                            ? "bg-blue-100 text-blue-700"
                            : msg.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {msg.status === "DELIVERED" ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : msg.status === "FAILED" ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#071525] truncate">
                            {msg.to_name ? `${msg.to_name} (${msg.to})` : msg.to}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              msg.category === "MARKETING"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {msg.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] truncate mt-0.5">{msg.subject}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-4">
                      <div className="text-[11px] font-mono text-[#64748B]">
                        {formatDate(msg.created_at)}
                      </div>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                          msg.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : msg.status === "SENT"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : msg.status === "FAILED"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-slate-50 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
