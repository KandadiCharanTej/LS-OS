"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Plus,
  Filter,
  DollarSign,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  User,
  Calendar,
  Layers,
  ArrowUpRight,
  List as ListIcon,
  Kanban as KanbanIcon,
  AlertCircle,
  Edit3,
  Trash2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DealStageBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useCRM } from "@/lib/store/crm-store";
import { Deal, DealStage } from "@/types/crm";
import { formatCurrency, formatDate } from "@/lib/utils";

const STAGE_COLUMNS: { stage: DealStage; label: string; color: string }[] = [
  {
    stage: "QUALIFIED_OPPORTUNITY",
    label: "Qualified Opp",
    color: "border-blue-300 bg-blue-50/30",
  },
  {
    stage: "PROPOSAL_SENT",
    label: "Proposal Sent",
    color: "border-purple-300 bg-purple-50/30",
  },
  {
    stage: "NEGOTIATION",
    label: "Negotiation",
    color: "border-amber-300 bg-amber-50/30",
  },
  {
    stage: "VERBAL_COMMITMENT",
    label: "Verbal Commit",
    color: "border-cyan-300 bg-cyan-50/30",
  },
  {
    stage: "DEAL_WON",
    label: "Deal Won (Closed)",
    color: "border-emerald-300 bg-emerald-50/40",
  },
  {
    stage: "DEAL_LOST",
    label: "Deal Lost",
    color: "border-rose-300 bg-rose-50/30",
  },
];

export default function DealsPage() {
  const { deals, clients, prospects, meetings, addDeal, updateDeal, updateDealStage, deleteDeal } = useCRM();

  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [selectedClient, setSelectedClient] = useState<string>("ALL");
  const [selectedStage, setSelectedStage] = useState<string>("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLostReasonModalOpen, setIsLostReasonModalOpen] = useState(false);
  const [dealToMarkLost, setDealToMarkLost] = useState<Deal | null>(null);
  const [lostReason, setLostReason] = useState("");

  // Edit Deal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [editDealTitle, setEditDealTitle] = useState("");
  const [editDealClientId, setEditDealClientId] = useState("");
  const [editDealProspectCompany, setEditDealProspectCompany] = useState("");
  const [editDealProspectName, setEditDealProspectName] = useState("");
  const [editDealValue, setEditDealValue] = useState("");
  const [editDealStage, setEditDealStage] = useState<DealStage>("QUALIFIED_OPPORTUNITY");
  const [editDealProbability, setEditDealProbability] = useState("50");
  const [editDealClosingDate, setEditDealClosingDate] = useState("");
  const [editDealNotes, setEditDealNotes] = useState("");

  const handleOpenEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setEditDealTitle(deal.name || deal.title || "");
    setEditDealClientId(deal.client_id || "");
    setEditDealProspectCompany(deal.prospect_company || "");
    setEditDealProspectName(deal.prospect_name || "");
    setEditDealValue(String(deal.final_deal_value || deal.expected_value || ""));
    setEditDealStage(deal.stage);
    setEditDealProbability(String(deal.probability || 50));
    setEditDealClosingDate(deal.expected_closing_date || "");
    setEditDealNotes(deal.notes || "");
    setIsEditModalOpen(true);
  };

  const handleSaveEditDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal) return;
    const client = clients.find((c) => c.id === editDealClientId);
    updateDeal(editingDeal.id, {
      name: editDealTitle,
      title: editDealTitle,
      client_id: editDealClientId,
      client_name: client?.name || editingDeal.client_name,
      prospect_company: editDealProspectCompany,
      prospect_name: editDealProspectName,
      expected_value: Number(editDealValue) || 0,
      final_deal_value: Number(editDealValue) || 0,
      stage: editDealStage,
      probability: Number(editDealProbability) || 50,
      expected_closing_date: editDealClosingDate,
      notes: editDealNotes,
    });
    setIsEditModalOpen(false);
    setEditingDeal(null);
  };

  // New Deal Form State
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [prospectId, setProspectId] = useState("");
  const [expectedValue, setExpectedValue] = useState("");
  const [customerBudget, setCustomerBudget] = useState("");
  const [stage, setStage] = useState<DealStage>("QUALIFIED_OPPORTUNITY");
  const [serviceSold, setServiceSold] = useState("Enterprise AI & Automation Suite");
  const [ownerName, setOwnerName] = useState("Charan Tej");
  const [expectedClosingDate, setExpectedClosingDate] = useState("");
  const [notes, setNotes] = useState("");

  // Filtered Deals
  const filteredDeals = deals.filter((d) => {
    const matchesClient = selectedClient === "ALL" || d.client_id === selectedClient;
    const matchesStage = selectedStage === "ALL" || d.stage === selectedStage;
    return matchesClient && matchesStage;
  });

  // Analytics Metrics
  const totalDeals = deals.length;
  const wonDeals = deals.filter((d) => d.stage === "DEAL_WON");
  const lostDeals = deals.filter((d) => d.stage === "DEAL_LOST");
  const openDeals = deals.filter(
    (d) => d.stage !== "DEAL_WON" && d.stage !== "DEAL_LOST"
  );

  const totalWonRevenue = wonDeals.reduce(
    (acc, d) => acc + (d.final_deal_value || d.expected_value),
    0
  );

  const totalPipelineValue = openDeals.reduce(
    (acc, d) => acc + d.expected_value,
    0
  );

  const weightedPipelineValue = openDeals.reduce(
    (acc, d) => acc + (d.expected_value * (d.probability || 50)) / 100,
    0
  );

  const avgDealSize =
    deals.length > 0
      ? deals.reduce((acc, d) => acc + d.expected_value, 0) / deals.length
      : 0;

  // Conversion calculations
  const totalLeads = prospects.length || 1;
  const leadToDealConversion = ((totalDeals / totalLeads) * 100).toFixed(1);
  const totalAttendedMeetings =
    meetings.filter((m) => m.status === "ATTENDED" || m.status === "BOOKED").length || 1;
  const meetingToDealConversion = ((totalDeals / totalAttendedMeetings) * 100).toFixed(1);

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === clientId);
    const prospect = prospects.find((p) => p.id === prospectId);

    addDeal({
      client_id: clientId,
      client_name: client ? client.name : "Client",
      prospect_id: prospectId || undefined,
      prospect_name: prospect ? prospect.full_name : undefined,
      prospect_company: prospect ? prospect.company : undefined,
      title,
      expected_value: parseFloat(expectedValue) || 1000000,
      customer_budget: customerBudget ? parseFloat(customerBudget) : undefined,
      currency: "INR",
      stage,
      probability:
        stage === "PROPOSAL_SENT"
          ? 60
          : stage === "NEGOTIATION"
          ? 80
          : stage === "DEAL_WON"
          ? 100
          : 30,
      service_sold: serviceSold,
      owner_name: ownerName,
      expected_closing_date: expectedClosingDate,
      notes,
    });

    setIsAddModalOpen(false);
    setTitle("");
    setExpectedValue("");
    setCustomerBudget("");
    setNotes("");
  };

  const handleStageChange = (deal: Deal, newStage: DealStage) => {
    if (newStage === "DEAL_LOST") {
      setDealToMarkLost(deal);
      setIsLostReasonModalOpen(true);
    } else {
      updateDealStage(deal.id, newStage);
    }
  };

  const handleConfirmMarkLost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealToMarkLost) return;
    updateDealStage(dealToMarkLost.id, "DEAL_LOST", lostReason);
    setIsLostReasonModalOpen(false);
    setDealToMarkLost(null);
    setLostReason("");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#071525] tracking-tight">
                Client Sales Pipeline & Deals
              </h1>
              <span className="text-[11px] font-mono font-bold bg-[#C65D2E]/10 text-[#C65D2E] px-2 py-0.5 rounded-full border border-[#C65D2E]/20">
                {openDeals.length} Open Opportunities
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Qualified revenue opportunities generated for clients via LeadScorpio outbound campaigns.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-xs">
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
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Deal
            </Button>
          </div>
        </div>

        {/* Sales Dashboard KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-[#C65D2E]">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Pipeline Value
                </span>
                <TrendingUp className="w-4 h-4 text-[#C65D2E]" />
              </div>
              <div className="text-xl font-black text-[#071525] font-mono">
                {formatCurrency(totalPipelineValue)}
              </div>
              <p className="text-[11px] text-slate-500">
                {openDeals.length} active opportunities across clients
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Weighted Pipeline
                </span>
                <Layers className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-black text-[#071525] font-mono">
                {formatCurrency(weightedPipelineValue)}
              </div>
              <p className="text-[11px] text-slate-500">
                Probability-adjusted expected realization
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Won Revenue
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-black text-emerald-700 font-mono">
                {formatCurrency(totalWonRevenue)}
              </div>
              <p className="text-[11px] text-slate-500">
                {wonDeals.length} closed won contracts (actual revenue)
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Avg Deal Size & Win Rate
                </span>
                <Briefcase className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-xl font-black text-[#071525] font-mono">
                {formatCurrency(avgDealSize)}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Mtg-to-Deal: {meetingToDealConversion}% • L-to-D: {leadToDealConversion}%
              </p>
            </CardContent>
          </Card>
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
              <option value="ALL">All Client Portfolios</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl px-3 py-1.5 text-[#071525] focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
            >
              <option value="ALL">All Deal Stages</option>
              {STAGE_COLUMNS.map((col) => (
                <option key={col.stage} value={col.stage}>
                  {col.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-mono font-medium">
            Showing <span className="font-bold text-[#071525]">{filteredDeals.length}</span> deals
          </div>
        </div>

        {/* Content View: Kanban or Table */}
        {viewMode === "kanban" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
            {STAGE_COLUMNS.map((col) => {
              const stageDeals = filteredDeals.filter((d) => d.stage === col.stage);
              const columnTotal = stageDeals.reduce(
                (sum, d) => sum + (d.final_deal_value || d.expected_value),
                0
              );

              return (
                <div
                  key={col.stage}
                  className={`rounded-2xl border p-3 flex flex-col gap-3 min-h-[500px] ${col.color}`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                    <div>
                      <h3 className="text-xs font-black text-[#071525] uppercase tracking-wide">
                        {col.label}
                      </h3>
                      <div className="text-[10px] font-mono text-slate-500 font-semibold">
                        {formatCurrency(columnTotal)}
                      </div>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-white text-[#071525] font-mono font-bold text-[10px] flex items-center justify-center border border-slate-200 shadow-xs">
                      {stageDeals.length}
                    </span>
                  </div>

                  {/* Deals Cards */}
                  <div className="space-y-2.5 overflow-y-auto max-h-[640px] pr-1">
                    {stageDeals.length === 0 ? (
                      <div className="p-4 text-center text-[11px] text-slate-400 bg-white/40 rounded-xl border border-dashed border-slate-200">
                        No deals in stage
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <div
                          key={deal.id}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2.5"
                        >
                          <div>
                            <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                              {deal.client_name}
                            </span>
                            <h4 className="font-bold text-xs text-[#071525] mt-1 line-clamp-1">
                              {deal.name || deal.title}
                            </h4>
                            {deal.prospect_company && (
                              <p className="text-[11px] text-slate-500 font-medium">
                                {deal.prospect_company} {deal.prospect_name ? `(${deal.prospect_name})` : ""}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="text-[9px] text-slate-400 uppercase font-mono font-semibold">
                                Deal Value
                              </div>
                              <div className="font-mono font-black text-[#071525] text-xs">
                                {formatCurrency(deal.final_deal_value || deal.expected_value)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] text-slate-400 uppercase font-mono font-semibold">
                                Prob.
                              </div>
                              <div className="font-mono font-bold text-slate-700 text-xs">
                                {deal.probability}%
                              </div>
                            </div>
                          </div>

                          {/* Stage Transition Control */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            <select
                              value={deal.stage}
                              onChange={(e) =>
                                handleStageChange(deal, e.target.value as DealStage)
                              }
                              className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 w-full"
                            >
                              {STAGE_COLUMNS.map((c) => (
                                <option key={c.stage} value={c.stage}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleOpenEditDeal(deal)}
                              title="Edit Deal"
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete deal "${deal.name || deal.title}"?`)) {
                                  deleteDeal(deal.id);
                                }
                              }}
                              title="Delete Deal"
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {deal.reason_lost && (
                            <div className="p-2 bg-rose-50 text-rose-700 rounded-lg text-[10px] border border-rose-200">
                              <span className="font-bold">Loss Reason:</span> {deal.reason_lost}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#071525]">
                <thead className="bg-[#FAF9F6] border-b border-[#071525]/[0.08] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Deal Title & Service</th>
                    <th className="p-4">Client Portfolio</th>
                    <th className="p-4">Prospect / Organization</th>
                    <th className="p-4">Deal Value (INR)</th>
                    <th className="p-4">Probability</th>
                    <th className="p-4">Stage</th>
                    <th className="p-4">Closing Date</th>
                    <th className="p-4">Owner</th>
                    <th className="p-4 text-right">Stage Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#071525]/[0.04]">
                  {filteredDeals.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No deals match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDeals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-[#FAF9F6]/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-[#071525]">{deal.name || deal.title}</div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {deal.service_sold || "Outreach Services"}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-[#071525]">
                            {deal.client_name}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-[#071525]">
                            {deal.prospect_company || "—"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {deal.prospect_name || ""}
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-[#071525]">
                          {formatCurrency(deal.final_deal_value || deal.expected_value)}
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-700">
                          {deal.probability}%
                        </td>
                        <td className="p-4">
                          <DealStageBadge stage={deal.stage} />
                        </td>
                        <td className="p-4 font-mono text-slate-600">
                          {deal.expected_closing_date
                            ? formatDate(deal.expected_closing_date)
                            : "—"}
                        </td>
                        <td className="p-4 text-slate-700 font-medium">
                          {deal.owner_name}
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <select
                              value={deal.stage}
                              onChange={(e) =>
                                handleStageChange(deal, e.target.value as DealStage)
                              }
                              className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:ring-1 focus:ring-[#C65D2E]"
                            >
                              {STAGE_COLUMNS.map((c) => (
                                <option key={c.stage} value={c.stage}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleOpenEditDeal(deal)}
                              title="Edit Deal"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete deal "${deal.name || deal.title}"?`)) {
                                  deleteDeal(deal.id);
                                }
                              }}
                              title="Delete Deal"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Add Deal Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Sales Pipeline Deal"
          description="Track high-intent opportunities originating from LeadScorpio outbound outreach."
          maxWidth="md"
        >
          <form onSubmit={handleCreateDeal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Deal Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Tech — Enterprise Tier Expansion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Client Organization *
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
                  Link Prospect (Optional)
                </label>
                <select
                  value={prospectId}
                  onChange={(e) => setProspectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="">None / Standalone Deal</option>
                  {prospects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.company})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Expected Deal Value (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="1000000"
                  value={expectedValue}
                  onChange={(e) => setExpectedValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Customer Budget (₹ INR)
                </label>
                <input
                  type="number"
                  placeholder="1000000"
                  value={customerBudget}
                  onChange={(e) => setCustomerBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Initial Deal Stage *
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as DealStage)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  {STAGE_COLUMNS.map((col) => (
                    <option key={col.stage} value={col.stage}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Target Closing Date
                </label>
                <input
                  type="date"
                  value={expectedClosingDate}
                  onChange={(e) => setExpectedClosingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
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
                  placeholder="e.g. AI Workflow Consulting"
                  value={serviceSold}
                  onChange={(e) => setServiceSold(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Deal Owner *
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Opportunity Notes
              </label>
              <textarea
                rows={2}
                placeholder="Scope of work, key stakeholders, budget timeline..."
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
                Save Sales Deal
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Deal Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingDeal(null);
          }}
          title={`Edit Sales Deal: ${editingDeal?.name || editingDeal?.title || "Deal Details"}`}
          description="Update pipeline deal value, closing date, probability, and scope notes."
          maxWidth="md"
        >
          <form onSubmit={handleSaveEditDeal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Deal Title / Opportunity Name *
              </label>
              <input
                type="text"
                required
                value={editDealTitle}
                onChange={(e) => setEditDealTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Client Account *
                </label>
                <select
                  value={editDealClientId}
                  onChange={(e) => setEditDealClientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="">Select Client Account</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Prospect Company
                </label>
                <input
                  type="text"
                  value={editDealProspectCompany}
                  onChange={(e) => setEditDealProspectCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Deal Value (INR ₹) *
                </label>
                <input
                  type="number"
                  required
                  value={editDealValue}
                  onChange={(e) => setEditDealValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Probability (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editDealProbability}
                  onChange={(e) => setEditDealProbability(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Closing Date
                </label>
                <input
                  type="date"
                  value={editDealClosingDate}
                  onChange={(e) => setEditDealClosingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Deal Stage
              </label>
              <select
                value={editDealStage}
                onChange={(e) => setEditDealStage(e.target.value as DealStage)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              >
                {STAGE_COLUMNS.map((c) => (
                  <option key={c.stage} value={c.stage}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Opportunity Notes
              </label>
              <textarea
                rows={2}
                value={editDealNotes}
                onChange={(e) => setEditDealNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingDeal(null);
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

        {/* Reason Lost Modal */}
        <Modal
          isOpen={isLostReasonModalOpen}
          onClose={() => setIsLostReasonModalOpen(false)}
          title="Mark Deal as Lost"
          description={`Please provide the primary reason for losing: ${dealToMarkLost?.name || dealToMarkLost?.title}`}
          maxWidth="sm"
        >
          <form onSubmit={handleConfirmMarkLost} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Reason for Losing Deal *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Budget cut, chosen competitor, postponed to Q3..."
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsLostReasonModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm">
                Confirm Mark Lost
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

