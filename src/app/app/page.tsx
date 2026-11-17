"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Send,
  UserCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  Clock,
  ChevronRight,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProspectStatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { useCRM } from "@/lib/store/crm-store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function OverviewPage() {
  const { clients, prospects, campaigns, tasks, meetings, conversations } = useCRM();

  // Metrics calculation
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "ACTIVE").length;
  const totalProspects = prospects.length;
  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").length;

  const totalConnSent = prospects.filter((p) =>
    [
      "CONNECTION_REQUEST_SENT",
      "CONNECTED",
      "MESSAGE_SENT",
      "REPLIED",
      "INTERESTED",
      "NOT_INTERESTED",
      "FOLLOW_UP_REQUIRED",
      "QUALIFIED",
      "MEETING_BOOKED",
      "CONVERTED",
    ].includes(p.status)
  ).length;

  const totalConnAccepted = prospects.filter((p) =>
    [
      "CONNECTED",
      "MESSAGE_SENT",
      "REPLIED",
      "INTERESTED",
      "NOT_INTERESTED",
      "FOLLOW_UP_REQUIRED",
      "QUALIFIED",
      "MEETING_BOOKED",
      "CONVERTED",
    ].includes(p.status)
  ).length;

  const totalMsgSent = prospects.filter((p) =>
    [
      "MESSAGE_SENT",
      "REPLIED",
      "INTERESTED",
      "NOT_INTERESTED",
      "FOLLOW_UP_REQUIRED",
      "QUALIFIED",
      "MEETING_BOOKED",
      "CONVERTED",
    ].includes(p.status)
  ).length;

  const totalReplies = prospects.filter((p) =>
    [
      "REPLIED",
      "INTERESTED",
      "NOT_INTERESTED",
      "FOLLOW_UP_REQUIRED",
      "QUALIFIED",
      "MEETING_BOOKED",
      "CONVERTED",
    ].includes(p.status)
  ).length;

  const positiveReplies = prospects.filter((p) =>
    ["INTERESTED", "QUALIFIED", "MEETING_BOOKED", "CONVERTED"].includes(p.status)
  ).length;

  const qualifiedLeads = prospects.filter((p) =>
    ["QUALIFIED", "MEETING_BOOKED", "CONVERTED"].includes(p.status)
  ).length;

  const meetingsBooked = prospects.filter((p) =>
    ["MEETING_BOOKED", "CONVERTED"].includes(p.status)
  ).length;

  const pendingTasks = tasks.filter((t) => t.status !== "COMPLETED").length;
  const overdueTasks = tasks.filter(
    (t) => t.status !== "COMPLETED" && t.status === "OVERDUE"
  ).length;

  // Chart data: Outreach Funnel
  const funnelData = [
    { name: "Prospects", count: totalProspects, fill: "#071525" },
    { name: "Conn. Sent", count: totalConnSent, fill: "#526071" },
    { name: "Connected", count: totalConnAccepted, fill: "#D97B50" },
    { name: "Messaged", count: totalMsgSent, fill: "#A64B24" },
    { name: "Replied", count: totalReplies, fill: "#C65D2E" },
    { name: "Positive", count: positiveReplies, fill: "#10B981" },
    { name: "Meetings", count: meetingsBooked, fill: "#059669" },
  ];

  // Pipeline distribution by status
  const pipelineData = [
    { name: "New / Ready", value: prospects.filter((p) => ["NEW", "RESEARCHING", "READY_FOR_OUTREACH"].includes(p.status)).length, color: "#94A3B8" },
    { name: "Outreach In Flight", value: prospects.filter((p) => ["CONNECTION_REQUEST_SENT", "CONNECTED", "MESSAGE_SENT"].includes(p.status)).length, color: "#C65D2E" },
    { name: "In Conversation", value: prospects.filter((p) => ["REPLIED", "FOLLOW_UP_REQUIRED"].includes(p.status)).length, color: "#F59E0B" },
    { name: "Positive / Qualified", value: prospects.filter((p) => ["INTERESTED", "QUALIFIED"].includes(p.status)).length, color: "#10B981" },
    { name: "Meetings Booked", value: meetingsBooked, color: "#071525" },
  ].filter((item) => item.value > 0);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#071525] tracking-tight">
                Operations Executive Overview
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#C65D2E]/10 text-[#C65D2E] font-semibold">
                Live Data
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Real-time performance across active clients, campaigns, and LinkedIn outreach pipelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/app/prospects">
              <Button variant="primary" size="sm">
                Add New Prospect
              </Button>
            </Link>
            <Link href="/app/reports">
              <Button variant="outline" size="sm">
                Export Reports
              </Button>
            </Link>
          </div>
        </div>

        {/* Top 6 KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#071525]/[0.08] shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Active Clients</span>
              <Building2 className="w-4 h-4 text-[#C65D2E]" />
            </div>
            <div className="text-2xl font-bold text-[#071525]">{activeClients}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              of {totalClients} total accounts
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#071525]/[0.08] shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Active Campaigns</span>
              <Send className="w-4 h-4 text-[#C65D2E]" />
            </div>
            <div className="text-2xl font-bold text-[#071525]">{activeCampaigns}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              LinkedIn channels
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#071525]/[0.08] shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Total Prospects</span>
              <Users className="w-4 h-4 text-[#C65D2E]" />
            </div>
            <div className="text-2xl font-bold text-[#071525]">{totalProspects}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              100% verified ICP
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#071525]/[0.08] shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Positive Replies</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{positiveReplies}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {totalReplies > 0
                ? `${Math.round((positiveReplies / totalReplies) * 100)}% positive rate`
                : "Awaiting replies"}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#071525]/[0.08] shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Meetings Booked</span>
              <Calendar className="w-4 h-4 text-[#C65D2E]" />
            </div>
            <div className="text-2xl font-bold text-[#C65D2E]">{meetingsBooked}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Executive discovery calls
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#071525]/[0.08] shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Pending Tasks</span>
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-[#071525]">{pendingTasks}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {overdueTasks > 0 ? (
                <span className="text-red-500 font-semibold">{overdueTasks} overdue</span>
              ) : (
                "All tasks on track"
              )}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Funnel Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>LinkedIn Outreach Execution Funnel</CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Volume conversion from researched prospect to booked strategy meeting.
                </p>
              </div>
              <span className="text-xs font-mono text-[#C65D2E] bg-[#C65D2E]/10 px-2 py-0.5 rounded">
                Section 5.4 Verified Rates
              </span>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
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
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Prospect Pipeline Stages</CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Current active pipeline distribution.
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pipelineData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#071525",
                        color: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 pt-2">
                {pipelineData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600">{item.name}</span>
                    </span>
                    <span className="font-semibold text-[#071525]">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Performance Comparison & Active Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Comparison Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Client Account Performance</CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Active client workspaces and qualification progress.
                </p>
              </div>
              <Link href="/app/clients" className="text-xs text-[#C65D2E] hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {clients.map((client) => {
                  const clientProspects = prospects.filter((p) => p.client_id === client.id);
                  const clientMeetings = clientProspects.filter((p) =>
                    ["MEETING_BOOKED", "CONVERTED"].includes(p.status)
                  ).length;
                  const clientCamp = campaigns.filter((c) => c.client_id === client.id);

                  return (
                    <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-slate-200 flex items-center justify-center font-bold text-xs text-[#071525]">
                          {client.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/app/clients/${client.id}`} className="font-semibold text-xs text-[#071525] hover:text-[#C65D2E]">
                            {client.name}
                          </Link>
                          <p className="text-[11px] text-slate-500">{client.industry}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <div className="text-xs font-bold text-[#071525]">{clientProspects.length}</div>
                          <div className="text-[10px] text-slate-400">Prospects</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#C65D2E]">{clientMeetings}</div>
                          <div className="text-[10px] text-slate-400">Booked Calls</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-600">{clientCamp.length}</div>
                          <div className="text-[10px] text-slate-400">Campaigns</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Meetings & High Priority Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Booked Meetings</CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Scheduled discovery calls ready for client handoff.
                </p>
              </div>
              <Link href="/app/calendar" className="text-xs text-[#C65D2E] hover:underline flex items-center gap-1">
                Calendar <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="p-4 flex items-start justify-between hover:bg-slate-50/80 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#071525]">
                          {meeting.prospect_name} ({meeting.prospect_company})
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-medium">
                          Confirmed Call
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{meeting.title}</p>
                      <p className="text-[11px] text-slate-400">
                        Client: <strong className="text-slate-600">{meeting.client_name}</strong>
                      </p>
                      {meeting.qualification_notes && (
                        <p className="text-[11px] text-[#C65D2E] bg-[#C65D2E]/5 p-2 rounded-lg mt-1 border border-[#C65D2E]/10">
                          <strong>Intel:</strong> {meeting.qualification_notes}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-[#071525]">
                        {new Date(meeting.scheduled_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-[11px] text-[#C65D2E] font-medium">
                        {new Date(meeting.scheduled_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operational Tasks Quick Bar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Urgent Team Tasks</CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Actionable next steps required across active campaigns.
              </p>
            </div>
            <Link href="/app/tasks">
              <Button variant="outline" size="sm">
                Open Task Board
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#C65D2E]" />
                    <div>
                      <div className="text-xs font-semibold text-[#071525]">{task.title}</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Client: {task.client_name} • Assigned to {task.assigned_to_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={task.priority} />
                    <span className="text-[11px] font-mono text-slate-500">
                      Due {new Date(task.due_date || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

