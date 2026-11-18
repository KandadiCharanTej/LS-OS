"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  ArrowLeft,
  Send,
  Users,
  MessageSquare,
  CheckSquare,
  FileText,
  Lock,
  Globe,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Receipt,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  ClientStatusBadge,
  ProspectStatusBadge,
  PriorityBadge,
  CampaignStatusBadge,
  DealStageBadge,
  PaymentStatusBadge,
} from "@/components/ui/Badge";
import { useCRM } from "@/lib/store/crm-store";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;
  const {
    clients,
    campaigns,
    prospects,
    tasks,
    conversations,
    internalNotes,
    documents,
    deals,
    financeAgreements,
    invoices,
    emailMessages,
    generateSalesPlaybook,
    updateClient,
    deleteClient,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "icp"
    | "playbook"
    | "deals"
    | "campaigns"
    | "prospects"
    | "finance"
    | "notes"
    | "emails"
  >("overview");

  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false);

  // Edit Client State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editPrimaryContactName, setEditPrimaryContactName] = useState("");
  const [editPrimaryContactEmail, setEditPrimaryContactEmail] = useState("");
  const [editPrimaryContactPhone, setEditPrimaryContactPhone] = useState("");
  const [editCompanySize, setEditCompanySize] = useState("");
  const [editIcpDescription, setEditIcpDescription] = useState("");
  const [editTargetLocations, setEditTargetLocations] = useState("");
  const [editTargetJobTitles, setEditTargetJobTitles] = useState("");
  const [editValueProposition, setEditValueProposition] = useState("");

  const handleOpenEdit = () => {
    if (!client) return;
    setEditName(client.name);
    setEditIndustry(client.industry || "B2B SaaS");
    setEditWebsite(client.website || "");
    setEditPrimaryContactName(client.primary_contact_name || "");
    setEditPrimaryContactEmail(client.primary_contact_email || "");
    setEditPrimaryContactPhone(client.primary_contact_phone || "");
    setEditCompanySize(client.company_size || "11-50 employees");
    setEditIcpDescription(client.icp_description || "");
    setEditTargetLocations(client.target_locations?.join(", ") || "");
    setEditTargetJobTitles(client.target_job_titles?.join(", ") || "");
    setEditValueProposition(client.value_proposition || "");
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    updateClient(client.id, {
      name: editName,
      industry: editIndustry,
      website: editWebsite,
      primary_contact_name: editPrimaryContactName,
      primary_contact_email: editPrimaryContactEmail,
      primary_contact_phone: editPrimaryContactPhone,
      company_size: editCompanySize,
      icp_description: editIcpDescription,
      target_locations: editTargetLocations.split(",").map((s) => s.trim()).filter(Boolean),
      target_job_titles: editTargetJobTitles.split(",").map((s) => s.trim()).filter(Boolean),
      value_proposition: editValueProposition,
    });
    setIsEditModalOpen(false);
  };

  const client = clients.find((c) => c.id === clientId) || clients[0];
  if (!client) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <p className="text-sm text-slate-500">Client workspace not found.</p>
          <Link href="/app/clients" className="mt-4 inline-block text-xs text-[#C65D2E]">
            Back to Clients List
          </Link>
        </div>
      </AppLayout>
    );
  }

  const clientCampaigns = campaigns.filter((c) => c.client_id === client.id);
  const clientProspects = prospects.filter((p) => p.client_id === client.id);
  const clientTasks = tasks.filter((t) => t.client_id === client.id);
  const clientDeals = deals.filter((d) => d.client_id === client.id);
  const clientAgreement = financeAgreements.find((a) => a.client_id === client.id);
  const clientInvoices = invoices.filter((i) => i.client_id === client.id);
  const clientNotes = internalNotes.filter((n) => n.client_id === client.id);
  const clientEmails = emailMessages.filter((m) => m.client_id === client.id || m.recipient_company?.toLowerCase() === client.name.toLowerCase());

  // Client Playbook
  const currentPlaybook = client.sales_playbook;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete or archive ${client.name}?`)) {
      deleteClient(client.id);
      router.push("/app/clients");
    }
  };

  const handleGeneratePlaybook = () => {
    setIsGeneratingPlaybook(true);
    setTimeout(() => {
      generateSalesPlaybook(client.id);
      setIsGeneratingPlaybook(false);
    }, 600);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/app/clients"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#071525] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all client accounts
        </Link>

        {/* Client Top Header Banner */}
        <div className="bg-white p-6 rounded-3xl border border-[#071525]/[0.08] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF9F6] border border-[#071525]/10 flex items-center justify-center p-2 overflow-hidden shadow-inner shrink-0">
              {client.logo_url ? (
                <Image
                  src={client.logo_url}
                  alt={client.name}
                  width={56}
                  height={56}
                  className="object-contain"
                />
              ) : (
                <Building2 className="w-8 h-8 text-[#C65D2E]" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#071525] tracking-tight">
                  {client.name}
                </h1>
                <ClientStatusBadge status={client.status} />
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {client.industry}
                </span>
                <span>•</span>
                <span>{client.company_size}</span>
                {client.website && (
                  <>
                    <span>•</span>
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C65D2E] hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      Website
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/app/email/compose?clientId=${client.id}&company=${encodeURIComponent(client.name)}`}>
              <Button
                variant="primary"
                size="sm"
                className="bg-[#C65D2E] hover:bg-[#b04f24]"
              >
                <Mail className="w-3.5 h-3.5" />
                Send Email
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenEdit}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab("playbook");
                handleGeneratePlaybook();
              }}
              disabled={isGeneratingPlaybook}
              className="border-[#C65D2E]/30 text-[#C65D2E] hover:bg-[#C65D2E]/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGeneratingPlaybook ? "Synthesizing AI Playbook..." : "Generate AI Playbook"}
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5" />
              Archive
            </Button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-medium">
          {[
            { id: "overview", label: "Overview & Contacts" },
            { id: "icp", label: "ICP Architecture" },
            { id: "playbook", label: "AI Sales Intelligence" },
            { id: "deals", label: `Sales Deals (${clientDeals.length})` },
            { id: "campaigns", label: `Campaigns (${clientCampaigns.length})` },
            { id: "prospects", label: `Leads (${clientProspects.length})` },
            { id: "finance", label: "Retainer & Finance" },
            { id: "emails", label: `Email History (${clientEmails.length})` },
            { id: "notes", label: `Internal Notes (${clientNotes.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#071525] text-white font-semibold shadow-sm"
                  : "text-slate-500 hover:text-[#071525] hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview & Contacts */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 space-y-4">
              <CardHeader>
                <CardTitle>Company Details & Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">
                    Products & Solutions
                  </span>
                  <p className="text-slate-600 bg-[#FAF9F6] p-3 rounded-xl border border-slate-100">
                    {client.products_and_services || "Enterprise B2B services."}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">
                    Value Proposition & Unique Selling Proposition
                  </span>
                  <p className="text-slate-600 bg-[#FAF9F6] p-3 rounded-xl border border-slate-100">
                    {client.value_proposition || "Proprietary high-impact technology suite."}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">
                    Competitive Advantage
                  </span>
                  <p className="text-slate-600 bg-[#FAF9F6] p-3 rounded-xl border border-slate-100">
                    {client.competitive_advantage || "Rapid deployment, deep customization, verified ROI."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Primary Stakeholder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#C65D2E]/10 text-[#C65D2E] font-bold flex items-center justify-center">
                    {client.primary_contact_name?.slice(0, 2).toUpperCase() || "C"}
                  </span>
                  <div>
                    <div className="font-semibold text-[#071525]">
                      {client.primary_contact_name || "Primary Contact"}
                    </div>
                    <div className="text-[11px] text-slate-400">Client Executive</div>
                  </div>
                </div>

                <div className="pt-2 space-y-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.primary_contact_email || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.primary_contact_phone || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Onboarded: {client.onboarding_date || "2026-10-01"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2: ICP Architecture */}
        {activeTab === "icp" && (
          <Card>
            <CardHeader>
              <CardTitle>Ideal Customer Profile (ICP) Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-xs">
              <div>
                <span className="font-semibold text-[#071525] block mb-1">
                  Core ICP Objective & Pain Points
                </span>
                <p className="text-slate-600 bg-[#FAF9F6] p-4 rounded-xl border border-slate-100 text-sm leading-relaxed">
                  {client.icp_description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="font-semibold text-[#071525] block mb-2">
                    Target Industries
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {client.target_industries?.map((ind) => (
                      <span
                        key={ind}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-[#071525] block mb-2">
                    Target Job Titles
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {client.target_job_titles?.map((title) => (
                      <span
                        key={title}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[#C65D2E] font-medium"
                      >
                        {title}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-[#071525] block mb-2">
                    Target Geographies
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {client.target_locations?.map((loc) => (
                      <span
                        key={loc}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-[#071525] block mb-2">
                    Target Company Size
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {client.target_company_sizes?.map((size) => (
                      <span
                        key={size}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: AI Sales Playbook */}
        {activeTab === "playbook" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-linear-to-r from-[#071525] to-[#122b48] text-white p-5 rounded-3xl">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C65D2E]" />
                  AI Client Intelligence & Sales Playbook
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Synthesized automatically from {client.name}&apos;s ICP, target decision-makers, and market positioning.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleGeneratePlaybook}
                disabled={isGeneratingPlaybook}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isGeneratingPlaybook ? "animate-spin" : ""}`}
                />
                Refresh Playbook
              </Button>
            </div>

            {currentPlaybook ? (
              <div className="space-y-6">
                {/* Executive Summary & Elevator Pitch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                        Executive Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-700 leading-relaxed">
                      {currentPlaybook.summary}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                        High-Converting Elevator Pitch
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-700 leading-relaxed font-medium bg-[#FAF9F6] p-4 rounded-xl border border-slate-100">
                      &quot;{currentPlaybook.elevator_pitch}&quot;
                    </CardContent>
                  </Card>
                </div>

                {/* Key Pain Points & Decision Makers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                        Top Pain Points Solved
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {currentPlaybook.top_pain_points?.map((pain, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs text-slate-700 p-2.5 bg-rose-50/40 border border-rose-100 rounded-xl"
                        >
                          <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
    {i + 1}
                          </span>
                          <span>{pain}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                        Target Decision Makers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {currentPlaybook.target_decision_makers?.map((dm, i) => (
                                                <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-slate-700 p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl"
                        >
                          <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="font-semibold">{dm}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Opening Message Angles */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                      Tested Opening Message Copy & Hooks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentPlaybook.opening_message_angles?.map((angle, i) => (
                      <div
                        key={i}
                        className="p-3.5 bg-[#FAF9F6] border border-slate-200 rounded-xl space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#071525] uppercase tracking-wide">
                            Angle {i + 1}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-mono bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                          {angle}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Objection Handling & Counters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                      Objection Handling Matrix
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentPlaybook.objection_handling?.map((item, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-200 bg-white"
                      >
                        <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/60">
                          <span className="text-[10px] font-bold uppercase text-amber-800 font-mono">
                            Common Objection
                          </span>
                          <p className="text-xs font-semibold text-[#071525] mt-1">
                            &quot;{item.objection}&quot;
                          </p>
                        </div>
                        <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/60">
                          <span className="text-[10px] font-bold uppercase text-emerald-800 font-mono">
                            Recommended Counter-Response
                          </span>
                          <p className="text-xs text-slate-700 mt-1">
                            {item.counter}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Lead Qualification Checklist */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                      LeadScorpio Qualification Checklist (BANT Criteria)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {currentPlaybook.qualification_checklist?.map((check, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-slate-700 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{check}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                Click &quot;Generate AI Playbook&quot; to synthesize sales intelligence from this client&apos;s ICP.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Sales Deals */}
        {activeTab === "deals" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#071525]">
                Deals Generated for {client.name}
              </h3>
              <Link href="/app/deals">
                <Button variant="primary" size="sm">
                  <Plus className="w-3.5 h-3.5" />
                  Create Deal
                </Button>
              </Link>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#071525]">
                  <thead className="bg-[#FAF9F6] border-b border-[#071525]/[0.08] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Deal Title</th>
                      <th className="p-4">Prospect</th>
                      <th className="p-4">Expected Value</th>
                      <th className="p-4">Probability</th>
                      <th className="p-4">Stage</th>
                      <th className="p-4">Target Close</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#071525]/[0.04]">
                    {clientDeals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          No active deals recorded for this client.
                        </td>
                      </tr>
                    ) : (
                      clientDeals.map((deal) => (
                        <tr key={deal.id} className="hover:bg-[#FAF9F6]/80 transition-colors">
                          <td className="p-4 font-bold text-[#071525]">{deal.name || deal.title}</td>
                          <td className="p-4 text-slate-600">{deal.prospect_company || "—"}</td>
                          <td className="p-4 font-mono font-bold text-[#071525]">
                            {formatCurrency(deal.final_value || deal.final_deal_value || deal.expected_value)}
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-700">
                            {deal.probability}%
                          </td>
                          <td className="p-4">
                            <DealStageBadge stage={deal.stage} />
                          </td>
                          <td className="p-4 font-mono text-slate-600">
                            {deal.expected_close_date || deal.expected_closing_date
                              ? formatDate(deal.expected_close_date || deal.expected_closing_date || "")
                              : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 5: Campaigns */}
        {activeTab === "campaigns" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#071525]">Active Outbound Campaigns</h3>
              <Link href="/app/campaigns">
                <Button variant="primary" size="sm">
                  <Plus className="w-3.5 h-3.5" />
                  Create Campaign
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientCampaigns.map((camp) => (
                <Card key={camp.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#071525]">{camp.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{camp.description}</p>
                    </div>
                    <CampaignStatusBadge status={camp.status} />
                  </div>

                  <div className="grid grid-cols-4 gap-2 py-2 border-y border-slate-100 text-center text-xs">
                    <div>
                      <div className="font-bold text-[#071525]">{camp.connection_requests_sent}</div>
                      <div className="text-[10px] text-slate-400">Conn. Sent</div>
                    </div>
                    <div>
                      <div className="font-bold text-[#C65D2E]">{camp.acceptance_rate}%</div>
                      <div className="text-[10px] text-slate-400">Accept %</div>
                    </div>
                    <div>
                      <div className="font-bold text-emerald-600">{camp.reply_rate}%</div>
                      <div className="text-[10px] text-slate-400">Reply %</div>
                    </div>
                    <div>
                      <div className="font-bold text-[#071525]">{camp.meetings_booked_count}</div>
                      <div className="text-[10px] text-slate-400">Meetings</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Started {camp.start_date}
                    </span>
                    <Link href={`/app/campaigns/${camp.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Prospects */}
        {activeTab === "prospects" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assigned Leads ({clientProspects.length})</CardTitle>
              <Link href="/app/prospects">
                <Button variant="primary" size="sm">
                  Add Lead
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {clientProspects.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 text-xs"
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
                        rel="noreferrer"
                        className="text-[#C65D2E] hover:underline"
                      >
                        LinkedIn
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 7: Finance & Retainer */}
        {activeTab === "finance" && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Confidential Internal Ledger:</strong> Retainer terms, billing disbursements, and invoice records below are strictly hidden from the Client Portal.
              </span>
            </div>

            {clientAgreement ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      Contract Value
                    </span>
                    <div className="text-lg font-black text-[#071525] font-mono">
                      {formatCurrency(clientAgreement.total_contract_value || clientAgreement.agreed_contract_amount || 0)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {clientAgreement.billing_cycle || "Monthly"} Retainer
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      Total Paid
                    </span>
                    <div className="text-lg font-black text-emerald-700 font-mono">
                      {formatCurrency(clientAgreement.total_paid)}
                    </div>
                    <div className="text-[10px] text-slate-500">Receipts credited</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      Pending Dues
                    </span>
                    <div className="text-lg font-black text-[#C65D2E] font-mono">
                      {formatCurrency(clientAgreement.pending_amount)}
                    </div>
                    <div className="text-[10px] text-slate-500">Next due: {clientAgreement.next_payment_due || clientAgreement.payment_due_date || "N/A"}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      Account Status
                    </span>
                    <div>
                      <PaymentStatusBadge status={clientAgreement.payment_status} />
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Reminders Sent: {clientAgreement.reminders_sent_count}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed">
                No active retainer agreement on file for this client.
              </div>
            )}

            {/* Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>Invoices Issued to {client.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#071525]">
                    <thead className="bg-[#FAF9F6] border-b border-[#071525]/[0.08] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Invoice #</th>
                        <th className="p-4">Issue Date</th>
                        <th className="p-4">Due Date</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#071525]/[0.04]">
                      {clientInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400">
                            No invoices generated for this client yet.
                          </td>
                        </tr>
                      ) : (
                        clientInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-[#FAF9F6]/80 transition-colors">
                            <td className="p-4 font-mono font-bold text-[#071525]">
                              {inv.invoice_number}
                            </td>
                            <td className="p-4 font-mono text-slate-600">
                              {formatDate(inv.issue_date || inv.invoice_date || "")}
                            </td>
                            <td className="p-4 font-mono text-slate-600">
                              {formatDate(inv.due_date)}
                            </td>
                            <td className="p-4 font-mono font-black text-[#071525]">
                              {formatCurrency(inv.total_amount)}
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  inv.status === "PAID"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 8: Internal Notes */}
        {activeTab === "notes" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Internal LeadScorpio Notes</CardTitle>
                <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                  <Lock className="w-3 h-3" /> Staff Only — Never visible in Client Portal
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {clientNotes.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-xl bg-[#FAF9F6] border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-semibold text-[#071525]">
                    <span>
                      {n.author_name} ({n.author_role})
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600">{n.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tab 9: Email History */}
        {activeTab === "emails" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <CardTitle className="text-base font-bold text-[#071525] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C65D2E]" />
                  Client Email Communication Log
                </CardTitle>
                <p className="text-xs text-[#64748B] mt-0.5">
                  All transactional and outbound emails dispatched to {client.name}
                </p>
              </div>
              <Link href={`/app/email/compose?clientId=${client.id}&company=${encodeURIComponent(client.name)}`}>
                <Button variant="primary" size="sm">
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Compose New Email
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {clientEmails.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-[#071525]">No emails dispatched to this client yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Send kickoff messages, agreements, or weekly reports directly from LeadScorpio CRM.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {clientEmails.map((msg) => (
                    <div key={msg.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 text-xs">
                      <div className="space-y-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#071525]">{msg.subject}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-slate-100 text-slate-700">
                            {msg.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          To: {msg.to_name || msg.to} &lt;{msg.to}&gt; • By: {msg.sender_name}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          msg.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : msg.status === "SENT"
                            ? "bg-blue-100 text-blue-800"
                            : msg.status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {msg.status}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {formatDate(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {/* Edit Client Profile Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Client Workspace: ${client.name}`}
          description="Update company details, primary contacts, and ICP targeting criteria."
          maxWidth="lg"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Industry / Category *
                </label>
                <input
                  type="text"
                  required
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Primary Contact Name
                </label>
                <input
                  type="text"
                  value={editPrimaryContactName}
                  onChange={(e) => setEditPrimaryContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={editPrimaryContactEmail}
                  onChange={(e) => setEditPrimaryContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={editPrimaryContactPhone}
                  onChange={(e) => setEditPrimaryContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Company Website URL
                </label>
                <input
                  type="url"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Company Size
                </label>
                <select
                  value={editCompanySize}
                  onChange={(e) => setEditCompanySize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="1-10 employees">1-10 employees</option>
                  <option value="11-50 employees">11-50 employees</option>
                  <option value="51-200 employees">51-200 employees</option>
                  <option value="201-500 employees">201-500 employees</option>
                  <option value="500+ employees">500+ employees</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Target Geographies (comma-separated)
                </label>
                <input
                  type="text"
                  value={editTargetLocations}
                  onChange={(e) => setEditTargetLocations(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Target Job Titles (comma-separated)
                </label>
                <input
                  type="text"
                  value={editTargetJobTitles}
                  onChange={(e) => setEditTargetJobTitles(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Value Proposition & Differentiator
              </label>
              <input
                type="text"
                value={editValueProposition}
                onChange={(e) => setEditValueProposition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Target ICP Description
              </label>
              <textarea
                rows={3}
                value={editIcpDescription}
                onChange={(e) => setEditIcpDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
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
