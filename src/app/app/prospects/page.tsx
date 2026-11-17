"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  Trash2,
  CheckCircle2,
  Mail,
  Building2,
  MoreVertical,
  CheckSquare,
  ArrowUpDown,
  Kanban as KanbanIcon,
  List as ListIcon,
  TrendingUp,
  Calendar,
  UserCheck,
  DollarSign,
  Edit3,
} from "lucide-react";
import { LinkedinIcon } from "@/components/ui/Icons";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProspectStatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useCRM } from "@/lib/store/crm-store";
import {
  Prospect,
  ProspectStatus,
  PriorityLevel,
  LeadSource,
  DealStage,
} from "@/types/crm";
import { formatCurrency, formatDate } from "@/lib/utils";

const PIPELINE_COLUMNS: {
  title: string;
  stages: ProspectStatus[];
  color: string;
}[] = [
  {
    title: "New & Sourced",
    stages: ["NEW", "NEW_LEAD", "CONTACTED", "READY_FOR_OUTREACH"],
    color: "border-slate-300 bg-slate-50",
  },
  {
    title: "Connection Out",
    stages: ["CONNECTION_REQUEST_SENT", "CONNECTION_ACCEPTED", "CONNECTED"],
    color: "border-blue-300 bg-blue-50/40",
  },
  {
    title: "Messaged & Replied",
    stages: ["OPENING_MESSAGE_SENT", "MESSAGE_SENT", "FOLLOW_UP_SENT", "REPLIED"],
    color: "border-purple-300 bg-purple-50/40",
  },
  {
    title: "Interested / Qualified",
    stages: ["INTERESTED", "QUALIFIED"],
    color: "border-amber-300 bg-amber-50/40",
  },
  {
    title: "Meetings Booked",
    stages: ["MEETING_BOOKED", "MEETING_ATTENDED"],
    color: "border-emerald-300 bg-emerald-50/40",
  },
  {
    title: "Proposal & Deals",
    stages: ["PROPOSAL_SENT", "NEGOTIATION", "DEAL_WON", "DEAL_LOST", "NOT_INTERESTED"],
    color: "border-indigo-300 bg-indigo-50/40",
  },
];

const ALL_STAGES_SELECT: { label: string; value: ProspectStatus }[] = [
  { label: "New Lead", value: "NEW_LEAD" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Connection Request Sent", value: "CONNECTION_REQUEST_SENT" },
  { label: "Connection Accepted", value: "CONNECTION_ACCEPTED" },
  { label: "Opening Message Sent", value: "OPENING_MESSAGE_SENT" },
  { label: "Replied", value: "REPLIED" },
  { label: "Interested", value: "INTERESTED" },
  { label: "Qualified", value: "QUALIFIED" },
  { label: "Meeting Booked", value: "MEETING_BOOKED" },
  { label: "Meeting Attended", value: "MEETING_ATTENDED" },
  { label: "Proposal Sent", value: "PROPOSAL_SENT" },
  { label: "Negotiation", value: "NEGOTIATION" },
  { label: "Deal Won", value: "DEAL_WON" },
  { label: "Deal Lost", value: "DEAL_LOST" },
  { label: "Not Interested", value: "NOT_INTERESTED" },
];

export default function ProspectsPage() {
  const {
    prospects,
    clients,
    campaigns,
    users,
    addProspect,
    updateProspect,
    updateProspectStatus,
    batchUpdateProspectStatus,
    deleteProspect,
    addDeal,
  } = useCRM();

  // View state
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("ALL");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");

  // Selection for batch actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isConvertToDealOpen, setIsConvertToDealOpen] = useState(false);
  const [selectedProspectForDeal, setSelectedProspectForDeal] = useState<Prospect | null>(null);
  const [csvContent, setCsvContent] = useState("");

  // New Prospect Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [location, setLocation] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id || "client-kf-ai");
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id || "");
  const [status, setStatus] = useState<ProspectStatus>("NEW_LEAD");
  const [priority, setPriority] = useState<PriorityLevel>("MEDIUM");
  const [leadSource, setLeadSource] = useState<LeadSource>("LINKEDIN");
  const [addedBy, setAddedBy] = useState("Charan Tej");
  const [customerBudget, setCustomerBudget] = useState("");
  const [expectedDealValue, setExpectedDealValue] = useState("");
  const [reasonForAdding, setReasonForAdding] = useState("");
  const [nextFollowupDate, setNextFollowupDate] = useState("");
  const [notes, setNotes] = useState("");

  // Convert to Deal Form State
  const [dealTitle, setDealTitle] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [dealStage, setDealStage] = useState<DealStage>("QUALIFIED_OPPORTUNITY");
  const [dealClosingDate, setDealClosingDate] = useState("");
  const [dealServiceSold, setDealServiceSold] = useState("Enterprise AI Solutions");
  const [dealOwner, setDealOwner] = useState("Charan Tej");

  // Edit Prospect Form State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editJobTitle, setEditJobTitle] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editLinkedinUrl, setEditLinkedinUrl] = useState("");
  const [editWorkEmail, setEditWorkEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editClientId, setEditClientId] = useState("");
  const [editCampaignId, setEditCampaignId] = useState("");
  const [editStatus, setEditStatus] = useState<ProspectStatus>("NEW_LEAD");
  const [editLeadSource, setEditLeadSource] = useState<LeadSource>("LINKEDIN");
  const [editAddedBy, setEditAddedBy] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [editDealValue, setEditDealValue] = useState("");
  const [editReason, setEditReason] = useState("");
  const [editFollowupDate, setEditFollowupDate] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const handleOpenEdit = (p: Prospect) => {
    setEditingProspect(p);
    setEditFirstName(p.first_name || "");
    setEditLastName(p.last_name || "");
    setEditJobTitle(p.job_title || "");
    setEditCompany(p.company || "");
    setEditLinkedinUrl(p.linkedin_url || "");
    setEditWorkEmail(p.work_email || p.email || "");
    setEditPhone(p.phone || "");
    setEditClientId(p.client_id || "");
    setEditCampaignId(p.campaign_id || "");
    setEditStatus(p.status || "NEW_LEAD");
    setEditLeadSource((p.lead_source as LeadSource) || "LINKEDIN");
    setEditAddedBy(p.added_by || p.lead_added_by || "");
    setEditBudget(p.budget ? String(p.budget) : "");
    setEditDealValue(p.deal_value ? String(p.deal_value) : "");
    setEditReason(p.qualification_reason || p.purpose_reason || "");
    setEditFollowupDate(p.next_followup_date || "");
    setEditNotes(p.notes || "");
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProspect) return;
    const client = clients.find((c) => c.id === editClientId);
    const campaign = campaigns.find((c) => c.id === editCampaignId);
    updateProspect(editingProspect.id, {
      first_name: editFirstName,
      last_name: editLastName,
      full_name: `${editFirstName} ${editLastName}`.trim(),
      job_title: editJobTitle,
      company: editCompany,
      linkedin_url: editLinkedinUrl,
      work_email: editWorkEmail,
      email: editWorkEmail,
      phone: editPhone,
      client_id: editClientId,
      client_name: client?.name || editingProspect.client_name,
      campaign_id: editCampaignId,
      campaign_name: campaign?.name || editingProspect.campaign_name,
      status: editStatus,
      lead_source: editLeadSource,
      added_by: editAddedBy,
      lead_added_by: editAddedBy,
      budget: editBudget ? Number(editBudget) : undefined,
      deal_value: editDealValue ? Number(editDealValue) : undefined,
      qualification_reason: editReason,
      purpose_reason: editReason,
      next_followup_date: editFollowupDate,
      notes: editNotes,
    });
    setIsEditModalOpen(false);
    setEditingProspect(null);
  };

  // Filtered List
  const filteredProspects = prospects.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.work_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClient =
      selectedClient === "ALL" || p.client_id === selectedClient;
    const matchesCampaign =
      selectedCampaign === "ALL" || p.campaign_id === selectedCampaign;
    const matchesStatus =
      selectedStatus === "ALL" || p.status === selectedStatus;
    const matchesSource =
      selectedSource === "ALL" || p.lead_source === selectedSource;
    const matchesPriority =
      selectedPriority === "ALL" || p.priority === selectedPriority;

    return (
      matchesSearch &&
      matchesClient &&
      matchesCampaign &&
      matchesStatus &&
      matchesSource &&
      matchesPriority
    );
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProspects.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchStatus = (newStatus: ProspectStatus) => {
    if (selectedIds.length === 0) return;
    batchUpdateProspectStatus(selectedIds, newStatus);
    setSelectedIds([]);
  };

  const handleCreateProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !company || !linkedinUrl) return;

    addProspect({
      first_name: firstName,
      last_name: lastName,
      job_title: jobTitle,
      company,
      linkedin_url: linkedinUrl,
      work_email: workEmail,
      location,
      client_id: clientId,
      campaign_id: campaignId,
      status,
      priority,
      lead_source: leadSource,
      added_by: addedBy,
      owner_name: addedBy,
      customer_budget: customerBudget ? parseFloat(customerBudget) : undefined,
      expected_deal_value: expectedDealValue ? parseFloat(expectedDealValue) : undefined,
      reason_for_adding: reasonForAdding,
      next_followup_date: nextFollowupDate || undefined,
      notes,
    });

    setIsAddModalOpen(false);
    // Reset form
    setFirstName("");
    setLastName("");
    setJobTitle("");
    setCompany("");
    setLinkedinUrl("");
    setWorkEmail("");
    setLocation("");
    setCustomerBudget("");
    setExpectedDealValue("");
    setReasonForAdding("");
    setNextFollowupDate("");
    setNotes("");
  };

  const handleOpenConvertToDeal = (prospect: Prospect) => {
    setSelectedProspectForDeal(prospect);
    setDealTitle(`${prospect.company} — Pipeline Expansion`);
    setDealValue(
      prospect.expected_deal_value?.toString() ||
        prospect.customer_budget?.toString() ||
        "1000000"
    );
    setDealStage("QUALIFIED_OPPORTUNITY");
    setDealOwner(prospect.owner_name || "Charan Tej");
    // Default closing date 30 days out
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setDealClosingDate(d.toISOString().split("T")[0]);
    setIsConvertToDealOpen(true);
  };

  const handleSaveDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProspectForDeal) return;

    addDeal({
      client_id: selectedProspectForDeal.client_id,
      client_name: selectedProspectForDeal.client_name,
      prospect_id: selectedProspectForDeal.id,
      prospect_name: selectedProspectForDeal.full_name,
      prospect_company: selectedProspectForDeal.company,
      title: dealTitle,
      expected_value: parseFloat(dealValue) || 1000000,
      customer_budget: selectedProspectForDeal.customer_budget || parseFloat(dealValue) || 1000000,
      currency: "INR",
      stage: dealStage,
      probability:
        dealStage === "PROPOSAL_SENT"
          ? 60
          : dealStage === "NEGOTIATION"
          ? 80
          : dealStage === "DEAL_WON"
          ? 100
          : 40,
      service_sold: dealServiceSold,
      owner_name: dealOwner,
      expected_closing_date: dealClosingDate,
      notes: `Deal generated via LeadScorpio outreach from prospect: ${selectedProspectForDeal.full_name}`,
    });

    // Advance prospect to qualified / deal stage
    updateProspectStatus(
      selectedProspectForDeal.id,
      dealStage === "DEAL_WON" ? "DEAL_WON" : "QUALIFIED"
    );

    setIsConvertToDealOpen(false);
    setSelectedProspectForDeal(null);
  };

  const handleCsvImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    const lines = csvContent.trim().split("\n");
    let count = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
      if (parts.length >= 4) {
        addProspect({
          first_name: parts[0] || "Prospect",
          last_name: parts[1] || "",
          job_title: parts[2] || "Executive",
          company: parts[3] || "Company",
          linkedin_url: parts[4] || "https://linkedin.com",
          work_email: parts[5] || "",
          client_id: clientId,
          campaign_id: campaignId,
          status: "NEW_LEAD",
          priority: "MEDIUM",
          lead_source: "LINKEDIN",
          added_by: "CSV Import",
        });
        count++;
      }
    }

    alert(`Successfully imported ${count} prospects.`);
    setIsImportModalOpen(false);
    setCsvContent("");
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Full Name",
      "Job Title",
      "Company",
      "LinkedIn URL",
      "Work Email",
      "Status",
      "Lead Source",
      "Customer Budget (INR)",
      "Expected Deal Value (INR)",
      "Added By",
      "Next Follow-up",
      "Priority",
      "Client",
      "Campaign",
    ];

    const rows = filteredProspects.map((p) => [
      p.id,
      `"${p.full_name}"`,
      `"${p.job_title}"`,
      `"${p.company}"`,
      `"${p.linkedin_url}"`,
      `"${p.work_email || ""}"`,
      p.status,
      p.lead_source || "LINKEDIN",
      p.customer_budget || 0,
      p.expected_deal_value || 0,
      `"${p.added_by || ""}"`,
      p.next_followup_date || "",
      p.priority,
      `"${p.client_name}"`,
      `"${p.campaign_name || ""}"`,
    ]);

    const csvData = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leadscorpio_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#071525] tracking-tight">
                Advanced Lead Management System
              </h1>
              <span className="text-[11px] font-mono font-bold bg-[#C65D2E]/10 text-[#C65D2E] px-2 py-0.5 rounded-full border border-[#C65D2E]/20">
                {filteredProspects.length} Active Records
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              End-to-end 15-stage pipeline: attribution tracking, budget & value quantification, LinkedIn cadence, and direct deal conversion.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-xs">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "table"
                    ? "bg-[#071525] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ListIcon className="w-3.5 h-3.5" />
                Table
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "kanban"
                    ? "bg-[#071525] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <KanbanIcon className="w-3.5 h-3.5" />
                Pipeline Kanban
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload className="w-3.5 h-3.5" />
              Import CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#071525]/[0.08] shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, company, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            {/* Client Filter */}
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl px-3 py-1.5 text-[#071525] focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
            >
              <option value="ALL">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Lead Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl px-3 py-1.5 text-[#071525] focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
            >
              <option value="ALL">All Lead Sources</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="WEBSITE">Website</option>
              <option value="REFERRAL">Referral</option>
              <option value="COLD_EMAIL">Cold Email</option>
              <option value="COLD_CALLING">Cold Calling</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="MANUAL_ENTRY">Manual Entry</option>
              <option value="OTHER">Other</option>
            </select>

            {/* Lifecycle Stage Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl px-3 py-1.5 text-[#071525] focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
            >
              <option value="ALL">All 15 Pipeline Stages</option>
              {ALL_STAGES_SELECT.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl px-3 py-1.5 text-[#071525] focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Bulk Selection Action Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-2.5 bg-[#071525] text-white rounded-xl text-xs animate-in fade-in">
              <span className="font-medium">
                {selectedIds.length} leads selected
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Batch Update:</span>
                <button
                  onClick={() => handleBatchStatus("CONNECTION_REQUEST_SENT")}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[11px]"
                >
                  Mark Conn. Sent
                </button>
                <button
                  onClick={() => handleBatchStatus("CONNECTION_ACCEPTED")}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[11px]"
                >
                  Mark Conn. Accepted
                </button>
                <button
                  onClick={() => handleBatchStatus("REPLIED")}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[11px]"
                >
                  Mark Replied
                </button>
                <button
                  onClick={() => handleBatchStatus("QUALIFIED")}
                  className="px-2.5 py-1 bg-[#C65D2E] hover:bg-[#A64B24] rounded-lg text-[11px] font-semibold"
                >
                  Mark Qualified
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Content: Table or Kanban */}
        {viewMode === "table" ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#071525]">
                <thead className="bg-[#FAF9F6] border-b border-[#071525]/[0.08] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === filteredProspects.length &&
                          filteredProspects.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-[#C65D2E] focus:ring-[#C65D2E]"
                      />
                    </th>
                    <th className="p-4">Lead & Organization</th>
                    <th className="p-4">Client / Campaign</th>
                    <th className="p-4">Source & Attribution</th>
                    <th className="p-4">Budget / Deal Value</th>
                    <th className="p-4">Pipeline Stage</th>
                    <th className="p-4">Next Follow-Up</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#071525]/[0.04]">
                  {filteredProspects.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No leads match the selected search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProspects.map((prospect) => {
                      const isSelected = selectedIds.includes(prospect.id);
                      return (
                        <tr
                          key={prospect.id}
                          className={`hover:bg-[#FAF9F6]/80 transition-colors ${
                            isSelected ? "bg-[#C65D2E]/[0.03]" : ""
                          }`}
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(prospect.id)}
                              className="rounded border-slate-300 text-[#C65D2E] focus:ring-[#C65D2E]"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#071525] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {prospect.first_name[0]}
                                {prospect.last_name[0]}
                              </div>
                              <div>
                                <Link
                                  href={`/app/prospects/${prospect.id}`}
                                  className="font-bold text-[#071525] hover:text-[#C65D2E] transition-colors"
                                >
                                  {prospect.full_name}
                                </Link>
                                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                  <span>{prospect.job_title}</span>
                                  <span>•</span>
                                  <span className="text-[#071525] font-semibold">
                                    {prospect.company}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-[#071525]">
                              {prospect.client_name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {prospect.campaign_name || "General Outbound"}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-[10px] uppercase font-semibold">
                              {prospect.lead_source || "LINKEDIN"}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              By: {prospect.added_by || "Team"}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-mono font-bold text-[#071525]">
                              {formatCurrency(
                                prospect.customer_budget || prospect.expected_deal_value || 0
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {prospect.expected_deal_value ? "Valuation" : "Est. Budget"}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <ProspectStatusBadge status={prospect.status} />
                              <div>
                                <select
                                  value={prospect.status}
                                  onChange={(e) =>
                                    updateProspectStatus(
                                      prospect.id,
                                      e.target.value as ProspectStatus
                                    )
                                  }
                                  className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 mt-1 focus:ring-1 focus:ring-[#C65D2E]"
                                >
                                  {ALL_STAGES_SELECT.map((s) => (
                                    <option key={s.value} value={s.value}>
                                      {s.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-[11px] font-mono text-slate-600">
                              {prospect.next_followup_date || "—"}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Convert to Deal Quick Button */}
                              <button
                                onClick={() => handleOpenConvertToDeal(prospect)}
                                title="Convert to Sales Deal"
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-semibold border border-emerald-200 inline-flex items-center gap-1 transition-colors"
                              >
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                                Deal
                              </button>
                              <button
                                onClick={() => handleOpenEdit(prospect)}
                                title="Edit Prospect Details"
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold border border-slate-200 inline-flex items-center gap-1 transition-colors"
                              >
                                <Edit3 className="w-3 h-3 text-slate-600" />
                                Edit Details
                              </button>
                              <button
                                onClick={() => deleteProspect(prospect.id)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                                title="Delete Prospect"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          /* Kanban Board View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
            {PIPELINE_COLUMNS.map((col, idx) => {
              const leadsInCol = filteredProspects.filter((p) =>
                col.stages.includes(p.status)
              );
              const totalVal = leadsInCol.reduce(
                (sum, p) => sum + (p.customer_budget || p.expected_deal_value || 0),
                0
              );

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-3 flex flex-col gap-3 min-h-[480px] ${col.color}`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                    <div>
                      <h3 className="text-xs font-black text-[#071525] uppercase tracking-wide">
                        {col.title}
                      </h3>
                      <div className="text-[10px] font-mono text-slate-500 font-semibold">
                        {formatCurrency(totalVal)}
                      </div>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-white text-[#071525] font-mono font-bold text-[10px] flex items-center justify-center border border-slate-200 shadow-xs">
                      {leadsInCol.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2.5 overflow-y-auto max-h-[640px] pr-1">
                    {leadsInCol.length === 0 ? (
                      <div className="p-4 text-center text-[11px] text-slate-400 bg-white/40 rounded-xl border border-dashed border-slate-200">
                        No leads in stage
                      </div>
                    ) : (
                      leadsInCol.map((lead) => (
                        <div
                          key={lead.id}
                          className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <Link
                                href={`/app/prospects/${lead.id}`}
                                className="font-bold text-xs text-[#071525] group-hover:text-[#C65D2E] transition-colors line-clamp-1"
                              >
                                {lead.full_name}
                              </Link>
                              <p className="text-[10px] text-slate-500 line-clamp-1 font-medium">
                                {lead.job_title}
                              </p>
                              <p className="text-[11px] font-semibold text-[#071525] line-clamp-1">
                                {lead.company}
                              </p>
                            </div>
                            <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold shrink-0">
                              {lead.lead_source || "LINKEDIN"}
                            </span>
                          </div>

                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            <span className="font-mono font-bold text-[#071525]">
                              {formatCurrency(
                                lead.customer_budget || lead.expected_deal_value || 0
                              )}
                            </span>
                            <span className="text-slate-500 font-medium">
                              {lead.client_name}
                            </span>
                          </div>

                          {/* Quick stage transition */}
                          <div className="pt-1 flex items-center justify-between gap-1">
                            <select
                              value={lead.status}
                              onChange={(e) =>
                                updateProspectStatus(
                                  lead.id,
                                  e.target.value as ProspectStatus
                                )
                              }
                              className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 w-full"
                            >
                              {ALL_STAGES_SELECT.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => handleOpenConvertToDeal(lead)}
                              title="Convert to Deal"
                              className="px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200 shrink-0"
                            >
                              Deal
                            </button>
                            <button
                              onClick={() => handleOpenEdit(lead)}
                              title="Edit Prospect"
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold border border-slate-200 shrink-0 inline-flex items-center gap-0.5"
                            >
                              <Edit3 className="w-2.5 h-2.5" />
                              Edit
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Prospect / Lead Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Qualified Lead"
          description="Enter lead details, attribution, source, customer budget, and map to a client outbound campaign."
          maxWidth="lg"
        >
          <form onSubmit={handleCreateProspect} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Operating Officer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech Solutions"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  LinkedIn Profile URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Work Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="lead@company.com"
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            {/* Attribution & Source Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Lead Source *
                </label>
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value as LeadSource)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="WEBSITE">Website</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="COLD_EMAIL">Cold Email</option>
                  <option value="COLD_CALLING">Cold Calling</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="MANUAL_ENTRY">Manual Entry</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Lead Added By *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Team Member Name"
                  value={addedBy}
                  onChange={(e) => setAddedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Next Follow-Up Date
                </label>
                <input
                  type="date"
                  value={nextFollowupDate}
                  onChange={(e) => setNextFollowupDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            {/* Financial Quantification in INR */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Customer Budget (₹ INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1000000 (for ₹10,00,000)"
                  value={customerBudget}
                  onChange={(e) => setCustomerBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Expected Deal Value (₹ INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1200000 (for ₹12,00,000)"
                  value={expectedDealValue}
                  onChange={(e) => setExpectedDealValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 font-mono"
                />
              </div>
            </div>

            {/* Client Assignment */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Target Client *
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
                  Initial Stage
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProspectStatus)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  {ALL_STAGES_SELECT.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Reason / Purpose for Adding
              </label>
              <input
                type="text"
                placeholder="e.g. Scaling enterprise operations team, looking for automation"
                value={reasonForAdding}
                onChange={(e) => setReasonForAdding(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Outreach Research Notes
              </label>
              <textarea
                rows={2}
                placeholder="Key trigger events, technology stack, mutual connections..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
              />
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
                Save Lead Record
              </Button>
            </div>
          </form>
        </Modal>

        {/* Convert to Deal Modal */}
        <Modal
          isOpen={isConvertToDealOpen}
          onClose={() => setIsConvertToDealOpen(false)}
          title="Convert Lead into Sales Pipeline Deal"
          description={`Convert ${selectedProspectForDeal?.full_name} (${selectedProspectForDeal?.company}) into an active client deal.`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveDeal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Deal Title *
              </label>
              <input
                type="text"
                required
                value={dealTitle}
                onChange={(e) => setDealTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Expected Deal Value (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Initial Deal Stage *
                </label>
                <select
                  value={dealStage}
                  onChange={(e) => setDealStage(e.target.value as DealStage)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="QUALIFIED_OPPORTUNITY">Qualified Opportunity</option>
                  <option value="PROPOSAL_SENT">Proposal Sent</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="VERBAL_COMMITMENT">Verbal Commitment</option>
                  <option value="DEAL_WON">Deal Won (Closed)</option>
                  <option value="DEAL_LOST">Deal Lost</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Service / Product Sold *
                </label>
                <input
                  type="text"
                  required
                  value={dealServiceSold}
                  onChange={(e) => setDealServiceSold(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Expected Closing Date *
                </label>
                <input
                  type="date"
                  required
                  value={dealClosingDate}
                  onChange={(e) => setDealClosingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Deal Owner *
              </label>
              <input
                type="text"
                required
                value={dealOwner}
                onChange={(e) => setDealOwner(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsConvertToDealOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Create Pipeline Deal
              </Button>
            </div>
          </form>
        </Modal>

        {/* CSV Import Modal */}
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Import Prospects from CSV"
          description="Paste raw CSV content with header: First Name, Last Name, Job Title, Company, LinkedIn URL, Work Email"
          maxWidth="lg"
        >
          <form onSubmit={handleCsvImport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Target Client Workspace
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
                CSV Data
              </label>
              <textarea
                rows={6}
                required
                placeholder="First Name,Last Name,Job Title,Company,LinkedIn URL,Work Email&#10;Arun,Menon,VP Engineering,Quantix Tech,https://linkedin.com/in/arunmenon,arun@quantix.io"
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsImportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Run CSV Import
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Prospect Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProspect(null);
          }}
          title={`Edit Prospect: ${editingProspect?.full_name || "Lead Details"}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Company *
                </label>
                <input
                  type="text"
                  required
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={editJobTitle}
                  onChange={(e) => setEditJobTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editWorkEmail}
                  onChange={(e) => setEditWorkEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={editLinkedinUrl}
                  onChange={(e) => setEditLinkedinUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Pipeline Stage (15 Stages)
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ProspectStatus)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  {ALL_STAGES_SELECT.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Lead Source
                </label>
                <select
                  value={editLeadSource}
                  onChange={(e) => setEditLeadSource(e.target.value as LeadSource)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="LINKEDIN">LinkedIn Outreach</option>
                  <option value="COLD_EMAIL">Cold Email</option>
                  <option value="COLD_CALL">Cold Call</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="WEBSITE">Website Form</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="MANUAL_ENTRY">Manual Entry</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Lead Added By
                </label>
                <input
                  type="text"
                  value={editAddedBy}
                  onChange={(e) => setEditAddedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Estimated Budget (₹)
                </label>
                <input
                  type="number"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Next Follow-up Date
                </label>
                <input
                  type="date"
                  value={editFollowupDate}
                  onChange={(e) => setEditFollowupDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Qualification Reason / Context
              </label>
              <input
                type="text"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Notes & Activity History
              </label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProspect(null);
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
