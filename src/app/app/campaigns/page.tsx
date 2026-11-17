"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Send,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  Target,
  Building2,
  Edit3,
  Trash2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CampaignStatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useCRM } from "@/lib/store/crm-store";
import { Campaign, CampaignStatus } from "@/types/crm";

export default function CampaignsPage() {
  const { campaigns, clients, addCampaign, updateCampaign, deleteCampaign } = useCRM();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [clientFilter, setClientFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Edit Campaign State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editName, setEditName] = useState("");
  const [editClientId, setEditClientId] = useState("");
  const [editStatus, setEditStatus] = useState<CampaignStatus>("ACTIVE");
  const [editObjective, setEditObjective] = useState("");
  const [editTargetAudience, setEditTargetAudience] = useState("");
  const [editTargetIndustry, setEditTargetIndustry] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editDailyLimit, setEditDailyLimit] = useState("50");

  const handleOpenEditCampaign = (c: Campaign) => {
    setEditingCampaign(c);
    setEditName(c.name);
    setEditClientId(c.client_id);
    setEditStatus(c.status);
    setEditObjective(c.objective || "");
    setEditTargetAudience(c.target_audience || "");
    setEditTargetIndustry(c.target_industry || "B2B SaaS");
    setEditStartDate(c.start_date || "");
    setEditEndDate(c.end_date || "");
    setEditDailyLimit(String(c.daily_outreach_limit || 50));
    setIsEditModalOpen(true);
  };

  const handleSaveEditCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    const client = clients.find((cl) => cl.id === editClientId);
    updateCampaign(editingCampaign.id, {
      name: editName,
      client_id: editClientId,
      client_name: client?.name || editingCampaign.client_name,
      status: editStatus,
      objective: editObjective,
      target_audience: editTargetAudience,
      target_industry: editTargetIndustry,
      start_date: editStartDate,
      end_date: editEndDate,
      daily_outreach_limit: Number(editDailyLimit) || 50,
    });
    setIsEditModalOpen(false);
    setEditingCampaign(null);
  };

  // New Campaign Form State
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id || "client-kf-ai");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("B2B SaaS");
  const [targetAudience, setTargetAudience] = useState("");
  const [jobTitlesInput, setJobTitlesInput] = useState("VP of Operations, COO");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");

  const filteredCampaigns = campaigns.filter((camp) => {
    const matchesSearch =
      camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || camp.status === statusFilter;
    const matchesClient =
      clientFilter === "ALL" || camp.client_id === clientFilter;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addCampaign({
      name,
      client_id: clientId,
      description,
      objective,
      target_industry: targetIndustry,
      target_audience: targetAudience,
      target_job_titles: jobTitlesInput.split(",").map((s) => s.trim()),
      start_date: startDate,
      end_date: endDate || undefined,
      channel: "LINKEDIN",
      status: "ACTIVE",
    });

    setIsAddModalOpen(false);
    setName("");
    setDescription("");
    setObjective("");
    setTargetAudience("");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#071525] tracking-tight">
              LinkedIn Outreach Campaigns
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Primary outbound operational engine. Track connection rates, reply yields, and conversion metrics.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#071525]/[0.08] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns by name or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl px-3 py-2 text-[#071525] focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
            >
              <option value="ALL">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl px-3 py-2 text-[#071525] focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredCampaigns.map((camp) => (
            <Card key={camp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#071525] text-white uppercase font-semibold">
                        LinkedIn
                      </span>
                      <h3 className="font-bold text-lg text-[#071525]">
                        {camp.name}
                      </h3>
                      <CampaignStatusBadge status={camp.status} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Client: <strong className="text-slate-800">{camp.client_name}</strong> • SDR Lead:{" "}
                      <span className="text-[#C65D2E] font-medium">{camp.assigned_team_member_name}</span>
                    </p>
                    <p className="text-xs text-slate-600 pt-1 leading-relaxed max-w-3xl">
                      {camp.objective}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditCampaign(camp)}
                      title="Edit Campaign"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete campaign "${camp.name}"?`)) {
                          deleteCampaign(camp.id);
                        }
                      }}
                      title="Delete Campaign"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Link href={`/app/campaigns/${camp.id}`}>
                      <Button variant="outline" size="sm">
                        Campaign Details <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Quantitative Outreach Funnel Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-[#FAF9F6] rounded-2xl border border-slate-100 text-center">
                  <div>
                    <div className="text-base font-black text-[#071525]">
                      {camp.prospects_count || 0}
                    </div>
                    <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">
                      Target Pool
                    </div>
                  </div>

                  <div>
                    <div className="text-base font-black text-[#071525]">
                      {camp.connection_requests_sent || 0}
                    </div>
                    <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">
                      Conn. Sent
                    </div>
                  </div>

                  <div>
                    <div className="text-base font-black text-[#C65D2E]">
                      {camp.acceptance_rate}%
                    </div>
                    <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">
                      Acceptance
                    </div>
                  </div>

                  <div>
                    <div className="text-base font-black text-[#071525]">
                      {camp.messages_sent || 0}
                    </div>
                    <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">
                      Messages
                    </div>
                  </div>

                  <div>
                    <div className="text-base font-black text-emerald-600">
                      {camp.reply_rate}%
                    </div>
                    <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">
                      Reply Rate
                    </div>
                  </div>

                  <div>
                    <div className="text-base font-black text-[#C65D2E]">
                      {camp.meetings_booked_count || 0}
                    </div>
                    <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">
                      Calls Booked
                    </div>
                  </div>
                </div>

                {/* Target Specs Footer */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-slate-400" />
                    <span>Targeting:</span>
                    {camp.target_job_titles?.map((title) => (
                      <span key={title} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 text-[11px]">
                        {title}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 mt-2 sm:mt-0">
                    <Calendar className="w-3 h-3" />
                    <span>{camp.start_date} to {camp.end_date || "Ongoing"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Send className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#071525]">No Outreach Campaigns Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create a targeted LinkedIn outreach campaign to engage ICP prospects and generate qualified appointments.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" /> Create First Campaign
            </Button>
          </div>
        )}

        {/* Add Campaign Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create LinkedIn Outbound Campaign"
          description="Configure target personas, client assignment, and outbound milestones."
          maxWidth="lg"
        >
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Campaign Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. US FinTech & Logistics COO Outreach"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Client Workspace *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Campaign Objective *
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Book 15 qualified discovery calls per month with VPs of Operations in US Mid-Market."
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Target Industry
                </label>
                <input
                  type="text"
                  placeholder="e.g. Logistics & Supply Chain"
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Target Job Titles (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="COO, VP of Operations"
                  value={jobTitlesInput}
                  onChange={(e) => setJobTitlesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Launch Campaign
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Campaign Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCampaign(null);
          }}
          title={`Edit Campaign: ${editingCampaign?.name || "Campaign Details"}`}
          description="Update campaign parameters, status, target audience, and dates."
          maxWidth="lg"
        >
          <form onSubmit={handleSaveEditCampaign} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Campaign Name *
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Client Account *
                </label>
                <select
                  value={editClientId}
                  onChange={(e) => setEditClientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="">Select Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Campaign Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as CampaignStatus)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Objective & Scope
              </label>
              <textarea
                rows={2}
                value={editObjective}
                onChange={(e) => setEditObjective(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Target Industry
                </label>
                <input
                  type="text"
                  value={editTargetIndustry}
                  onChange={(e) => setEditTargetIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Daily Outreach Limit
                </label>
                <input
                  type="number"
                  value={editDailyLimit}
                  onChange={(e) => setEditDailyLimit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCampaign(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

