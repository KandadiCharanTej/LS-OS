"use client";

import React from "react";
import Link from "next/link";
import {
  Send,
  Target,
  Calendar,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  Building2,
} from "lucide-react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CampaignStatusBadge } from "@/components/ui/Badge";
import { useCRM } from "@/lib/store/crm-store";

export default function ClientCampaignsPage() {
  const { currentUser, clients, campaigns } = useCRM();

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

  const clientCampaigns = campaigns.filter((c) => c.client_id === client.id);

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#071525] tracking-tight">
              My Active Campaigns
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Campaign objectives, target criteria, and verified outbound progress for {client.name}.
            </p>
          </div>

          <Link href="/portal/requests">
            <Button variant="outline" size="sm">
              <HelpCircle className="w-3.5 h-3.5" /> Request Campaign Change
            </Button>
          </Link>
        </div>

        {/* Campaign Cards */}
        <div className="space-y-6">
          {clientCampaigns.map((camp) => (
            <Card key={camp.id} className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#071525] text-white uppercase font-semibold">
                      LinkedIn Engine
                    </span>
                    <h3 className="font-bold text-lg text-[#071525]">
                      {camp.name}
                    </h3>
                    <CampaignStatusBadge status={camp.status} />
                  </div>
                  <p className="text-xs text-slate-500">
                    SDR Lead:{" "}
                    <span className="text-[#C65D2E] font-medium">
                      {camp.assigned_team_member_name}
                    </span>
                  </p>
                  <p className="text-xs text-slate-600 pt-1 leading-relaxed max-w-2xl">
                    {camp.objective}
                  </p>
                </div>

                <div className="text-right text-xs text-slate-400 font-mono">
                  <span>
                    {camp.start_date} to {camp.end_date || "Ongoing"}
                  </span>
                </div>
              </div>

              {/* Conversion Stats Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-[#FAF9F6] rounded-2xl border border-slate-100 text-center text-xs">
                <div>
                  <div className="font-black text-sm text-[#071525]">
                    {camp.prospects_count}
                  </div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">
                    Target Roster
                  </div>
                </div>

                <div>
                  <div className="font-black text-sm text-[#071525]">
                    {camp.connection_requests_sent}
                  </div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">
                    Requests Sent
                  </div>
                </div>

                <div>
                  <div className="font-black text-sm text-[#C65D2E]">
                    {camp.acceptance_rate}%
                  </div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">
                    Acceptance Rate
                  </div>
                </div>

                <div>
                  <div className="font-black text-sm text-[#071525]">
                    {camp.messages_sent}
                  </div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">
                    Messaged
                  </div>
                </div>

                <div>
                  <div className="font-black text-sm text-emerald-600">
                    {camp.reply_rate}%
                  </div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">
                    Reply Rate
                  </div>
                </div>

                <div>
                  <div className="font-black text-sm text-[#C65D2E]">
                    {camp.meetings_booked_count}
                  </div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">
                    Calls Booked
                  </div>
                </div>
              </div>

              {/* Targeting specs */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-600">
                <Target className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-[#071525]">Audience:</span>
                {camp.target_job_titles?.map((title) => (
                  <span
                    key={title}
                    className="px-2.5 py-0.5 bg-white border border-slate-200 rounded-lg text-[11px] text-[#C65D2E] font-medium"
                  >
                    {title}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}

