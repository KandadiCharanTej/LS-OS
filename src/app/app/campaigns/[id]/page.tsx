"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Target,
  Building2,
  Plus,
  MessageSquare,
  BarChart3,
  Trash2,
  Clock,
} from "lucide-react";
import { LinkedinIcon } from "@/components/ui/Icons";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CampaignStatusBadge, ProspectStatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { useCRM } from "@/lib/store/crm-store";
import { CampaignStatus } from "@/types/crm";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id as string;
  const { campaigns, prospects, updateCampaign, deleteCampaign } = useCRM();

  const campaign =
    campaigns.find((c) => c.id === campaignId) || campaigns[0];

  if (!campaign) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <p className="text-sm text-slate-500">Campaign not found.</p>
          <Link href="/app/campaigns" className="mt-4 inline-block text-xs text-[#C65D2E]">
            Back to Campaigns
          </Link>
        </div>
      </AppLayout>
    );
  }

  const campProspects = prospects.filter((p) => p.campaign_id === campaign.id);

  const handleStatusChange = (newStatus: CampaignStatus) => {
    updateCampaign(campaign.id, { status: newStatus });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete campaign "${campaign.name}"?`)) {
      deleteCampaign(campaign.id);
      router.push("/app/campaigns");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/app/campaigns"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#071525] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all campaigns
        </Link>

        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#071525]/[0.08] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#071525] text-white uppercase font-semibold">
                LinkedIn Outreach
              </span>
              <h1 className="text-2xl font-black text-[#071525] tracking-tight">
                {campaign.name}
              </h1>
              <CampaignStatusBadge status={campaign.status} />
            </div>
            <p className="text-xs text-slate-500">
              Client: <strong className="text-slate-800">{campaign.client_name}</strong> • SDR:{" "}
              <span className="text-[#C65D2E] font-medium">{campaign.assigned_team_member_name}</span>
            </p>
            <p className="text-xs text-slate-600 pt-1 leading-relaxed max-w-3xl">
              {campaign.objective}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={campaign.status}
              onChange={(e) => handleStatusChange(e.target.value as CampaignStatus)}
              className="text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl px-3 py-2 text-[#071525] font-medium focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Verified Conversion Formulas Cards (Section 5.4) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#071525]/[0.08] shadow-sm text-center">
            <div className="text-xs text-slate-500 font-medium mb-1">
              Connection Acceptance Rate
            </div>
            <div className="text-3xl font-black text-[#C65D2E]">
              {campaign.acceptance_rate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {campaign.connections_accepted} accepted / {campaign.connection_requests_sent} sent
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#071525]/[0.08] shadow-sm text-center">
            <div className="text-xs text-slate-500 font-medium mb-1">
              Reply Rate
            </div>
            <div className="text-3xl font-black text-[#071525]">
              {campaign.reply_rate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {campaign.replies_count} replies / {campaign.messages_sent} messaged
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#071525]/[0.08] shadow-sm text-center">
            <div className="text-xs text-slate-500 font-medium mb-1">
              Positive Reply Rate
            </div>
            <div className="text-3xl font-black text-emerald-600">
              {campaign.positive_reply_rate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {campaign.positive_replies_count} positive / {campaign.replies_count} replies
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#071525]/[0.08] shadow-sm text-center">
            <div className="text-xs text-slate-500 font-medium mb-1">
              Meeting Conversion Rate
            </div>
            <div className="text-3xl font-black text-[#C65D2E]">
              {campaign.meeting_conversion_rate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {campaign.meetings_booked_count} booked / {campaign.replies_count} replies
            </div>
          </div>
        </div>

        {/* Campaign Prospects List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Campaign Prospect Roster ({campProspects.length})</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Target prospects assigned to this specific campaign cadence.
              </p>
            </div>

            <Link href="/app/prospects">
              <Button variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5" /> Add Prospect
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {campProspects.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No prospects assigned to this campaign yet.
                </div>
              ) : (
                campProspects.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
                  >
                    <div>
                      <Link
                        href={`/app/prospects/${p.id}`}
                        className="font-bold text-[#071525] hover:text-[#C65D2E]"
                      >
                        {p.full_name}
                      </Link>
                      <p className="text-slate-500 mt-0.5">
                        {p.job_title} at {p.company} • {p.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <ProspectStatusBadge status={p.status} />
                      <a
                        href={p.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0A66C2] hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <LinkedinIcon className="w-3.5 h-3.5" />
                        Profile
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
