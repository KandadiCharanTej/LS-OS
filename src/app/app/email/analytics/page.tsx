"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  BarChart2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  MousePointerClick,
  Info,
  ShieldCheck,
  Send,
  PieChart,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmailNavHeader } from "@/components/email/EmailNavHeader";
import { useCRM } from "@/lib/store/crm-store";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function EmailAnalyticsPage() {
  const { emailMessages, emailTemplates } = useCRM();

  // Computations
  const totalSent = emailMessages.filter((m) => m.status === "SENT" || m.status === "DELIVERED").length;
  const totalDelivered = emailMessages.filter((m) => m.status === "DELIVERED").length;
  const totalFailed = emailMessages.filter((m) => m.status === "FAILED").length;
  const totalBounced = emailMessages.filter((m) => m.status === "BOUNCED").length;
  const totalOpened = emailMessages.filter((m) => Boolean(m.opened_at)).length;
  const totalClicked = emailMessages.filter((m) => Boolean(m.clicked_at)).length;

  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : "100.0";
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0.0";
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : "0.0";

  // Category breakdown
  const transactionalCount = emailMessages.filter((m) => m.category === "TRANSACTIONAL").length;
  const marketingCount = emailMessages.filter((m) => m.category === "MARKETING").length;

  // Template breakdown data
  const templateBreakdown = useMemo(() => {
    return emailTemplates.map((t) => {
      const msgs = emailMessages.filter((m) => m.template_id === t.id);
      const sent = msgs.filter((m) => m.status === "SENT" || m.status === "DELIVERED").length;
      const opened = msgs.filter((m) => Boolean(m.opened_at)).length;
      const clicked = msgs.filter((m) => Boolean(m.clicked_at)).length;
      return {
        name: t.name.length > 18 ? `${t.name.slice(0, 16)}...` : t.name,
        fullName: t.name,
        sent,
        opened,
        clicked,
      };
    }).filter((t) => t.sent > 0 || emailMessages.length === 0);
  }, [emailTemplates, emailMessages]);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <EmailNavHeader
          title="Email Delivery & Engagement Analytics"
          subtitle="Real-time performance indicators, delivery success ratios, and interaction tracking."
        />

        {/* Privacy & Estimation Notice */}
        <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-blue-950">Provider Tracking Transparency Notice</div>
            <p className="mt-0.5 leading-relaxed text-blue-800">
              Email open tracking uses standard 1x1 tracking pixels. Due to privacy protections (such as Apple Mail Privacy Protection and corporate proxy image blocking), open counts are treated as <strong>estimated engagement signals</strong> rather than conclusive proof of human reading. Delivery statuses are verified directly via Resend webhooks.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-[#071525]/[0.08] shadow-sm">
            <CardContent className="p-4">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Delivery Rate</span>
              <div className="text-2xl font-bold text-emerald-600 mt-2">{deliveryRate}%</div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">{totalDelivered} of {totalSent} confirmed delivered</p>
            </CardContent>
          </Card>

          <Card className="border-[#071525]/[0.08] shadow-sm">
            <CardContent className="p-4">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Est. Open Rate</span>
              <div className="text-2xl font-bold text-blue-600 mt-2">{openRate}%</div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">{totalOpened} total open signals</p>
            </CardContent>
          </Card>

          <Card className="border-[#071525]/[0.08] shadow-sm">
            <CardContent className="p-4">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Click-Through</span>
              <div className="text-2xl font-bold text-purple-600 mt-2">{clickRate}%</div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">{totalClicked} link click events</p>
            </CardContent>
          </Card>

          <Card className="border-[#071525]/[0.08] shadow-sm">
            <CardContent className="p-4">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Bounce & Failure</span>
              <div className="text-2xl font-bold text-amber-600 mt-2">{totalBounced + totalFailed}</div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">{totalBounced} bounced, {totalFailed} failed</p>
            </CardContent>
          </Card>
        </div>

        {/* Template Comparison Chart */}
        <Card className="border-[#071525]/[0.08] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#071525]/[0.06]">
            <div>
              <CardTitle className="text-base font-bold text-[#071525] flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#C65D2E]" />
                Template Performance Comparison
              </CardTitle>
              <p className="text-xs text-[#64748B] mt-0.5">Dispatches vs Open signals by template</p>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {templateBreakdown.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No email activity recorded yet to compare templates.
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={templateBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748B" }} angle={-15} textAnchor="end" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#071525",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                    <Bar dataKey="sent" name="Sent" fill="#071934" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="opened" name="Opened (Est)" fill="#C65D2E" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="clicked" name="Clicked" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories & Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-[#071525]/[0.08] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#071525]/[0.06]">
              <CardTitle className="text-sm font-bold text-[#071525]">
                Dispatch Breakdown by Compliance Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-[#071525]">Transactional / Business</div>
                  <div className="text-[11px] text-[#64748B]">Invoices, Kickoffs, Meeting Confirmations, Reports</div>
                </div>
                <div className="text-lg font-bold text-[#071525]">{transactionalCount}</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                <div>
                  <div className="text-xs font-bold text-purple-900">Marketing & Promotional</div>
                  <div className="text-[11px] text-purple-700">Service Introductions, Follow-ups (Opt-out enforced)</div>
                </div>
                <div className="text-lg font-bold text-purple-900">{marketingCount}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#071525]/[0.08] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#071525]/[0.06]">
              <CardTitle className="text-sm font-bold text-[#071525] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Deliverability & Reputation Guard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs text-[#2D3748]">
              <p>
                LeadScorpio enforces strict one-to-one human-reviewed sending to maintain flawless inbox placement.
              </p>
              <ul className="space-y-1.5 pl-4 list-disc text-slate-600 text-[11px]">
                <li>Bounce protection automatically adds rejected addresses to suppression.</li>
                <li>Zero unreviewed batch blasts to protect sender reputation.</li>
                <li>Inline CSS ensures consistency across Outlook, Apple Mail, and Gmail.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
