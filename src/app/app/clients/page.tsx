"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Plus,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Calendar,
  Briefcase,
  Globe,
  Edit3,
  Trash2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ClientStatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useCRM } from "@/lib/store/crm-store";
import { Client, ClientStatus } from "@/types/crm";

export default function ClientsPage() {
  const { clients, prospects, campaigns, addClient, updateClient, deleteClient } = useCRM();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Edit Client State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editName, setEditName] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editPrimaryContactName, setEditPrimaryContactName] = useState("");
  const [editPrimaryContactEmail, setEditPrimaryContactEmail] = useState("");
  const [editPrimaryContactPhone, setEditPrimaryContactPhone] = useState("");
  const [editCompanySize, setEditCompanySize] = useState("");
  const [editIcpDescription, setEditIcpDescription] = useState("");
  const [editStatus, setEditStatus] = useState<ClientStatus>("ACTIVE");
  const [editTargetLocations, setEditTargetLocations] = useState("");
  const [editTargetIndustries, setEditTargetIndustries] = useState("");
  const [editTargetJobTitles, setEditTargetJobTitles] = useState("");
  const [editValueProposition, setEditValueProposition] = useState("");

  const handleOpenEditClient = (c: Client) => {
    setEditingClient(c);
    setEditName(c.name);
    setEditIndustry(c.industry || "B2B SaaS");
    setEditWebsite(c.website || "");
    setEditPrimaryContactName(c.primary_contact_name || "");
    setEditPrimaryContactEmail(c.primary_contact_email || "");
    setEditPrimaryContactPhone(c.primary_contact_phone || "");
    setEditCompanySize(c.company_size || "11-50 employees");
    setEditIcpDescription(c.icp_description || "");
    setEditStatus(c.status || "ACTIVE");
    setEditTargetLocations(c.target_locations?.join(", ") || "");
    setEditTargetIndustries(c.target_industries?.join(", ") || "");
    setEditTargetJobTitles(c.target_job_titles?.join(", ") || "");
    setEditValueProposition(c.value_proposition || "");
    setIsEditModalOpen(true);
  };

  const handleSaveEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    updateClient(editingClient.id, {
      name: editName,
      industry: editIndustry,
      website: editWebsite,
      primary_contact_name: editPrimaryContactName,
      primary_contact_email: editPrimaryContactEmail,
      primary_contact_phone: editPrimaryContactPhone,
      company_size: editCompanySize,
      icp_description: editIcpDescription,
      status: editStatus,
      target_locations: editTargetLocations.split(",").map((s) => s.trim()).filter(Boolean),
      target_industries: editTargetIndustries.split(",").map((s) => s.trim()).filter(Boolean),
      target_job_titles: editTargetJobTitles.split(",").map((s) => s.trim()).filter(Boolean),
      value_proposition: editValueProposition,
    });
    setIsEditModalOpen(false);
    setEditingClient(null);
  };

  // New Client Form State
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("B2B SaaS");
  const [website, setWebsite] = useState("");
  const [primaryContactName, setPrimaryContactName] = useState("");
  const [primaryContactEmail, setPrimaryContactEmail] = useState("");
  const [companySize, setCompanySize] = useState("11-50 employees");
  const [icpDescription, setIcpDescription] = useState("");

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.primary_contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addClient({
      name,
      industry,
      website,
      primary_contact_name: primaryContactName,
      primary_contact_email: primaryContactEmail,
      company_size: companySize,
      icp_description: icpDescription,
      status: "ACTIVE",
    });

    setIsAddModalOpen(false);
    setName("");
    setWebsite("");
    setPrimaryContactName("");
    setPrimaryContactEmail("");
    setIcpDescription("");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#071525] tracking-tight">
              Client Accounts & Workspaces
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Manage client organizations, targeting parameters, assigned SDRs, and outbound campaigns.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add New Client
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#071525]/[0.08] shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients by name, contact, industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 focus:border-[#C65D2E]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl px-3 py-2 text-[#071525] focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ONBOARDING">Onboarding</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Clients Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClients.map((client) => {
            const clientProspects = prospects.filter((p) => p.client_id === client.id);
            const clientCampaigns = campaigns.filter((c) => c.client_id === client.id);
            const clientMeetings = clientProspects.filter((p) =>
              ["MEETING_BOOKED", "CONVERTED"].includes(p.status)
            ).length;

            return (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] border border-[#071525]/10 flex items-center justify-center p-2 overflow-hidden">
                        {client.logo_url ? (
                          <Image
                            src={client.logo_url}
                            alt={client.name}
                            width={44}
                            height={44}
                            className="object-contain"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-[#C65D2E]" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-[#071525]">
                          {client.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {client.industry} • {client.company_size}
                        </p>
                      </div>
                    </div>

                    <ClientStatusBadge status={client.status} />
                  </div>

                  {/* ICP Description */}
                  {client.icp_description && (
                    <p className="text-xs text-slate-600 bg-[#FAF9F6] p-3 rounded-xl border border-slate-100 line-clamp-2">
                      <strong className="text-[#071525]">Target ICP:</strong> {client.icp_description}
                    </p>
                  )}

                  {/* Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center">
                    <div>
                      <div className="text-sm font-bold text-[#071525]">
                        {clientCampaigns.length}
                      </div>
                      <div className="text-[10px] text-slate-400">Campaigns</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#071525]">
                        {clientProspects.length}
                      </div>
                      <div className="text-[10px] text-slate-400">Prospects</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#C65D2E]">
                        {clientMeetings}
                      </div>
                      <div className="text-[10px] text-slate-400">Booked Calls</div>
                    </div>
                  </div>

                  {/* Contact Info & Footer Link */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <div>
                      Contact:{" "}
                      <strong className="text-slate-700">
                        {client.primary_contact_name || "Unassigned"}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditClient(client)}
                        title="Edit Client"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete client "${client.name}" and all associated records?`)) {
                            deleteClient(client.id);
                          }
                        }}
                        title="Delete Client"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <Link href={`/app/clients/${client.id}`}>
                        <Button variant="outline" size="sm">
                          Open Workspace <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredClients.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#071525]">No Client Workspaces Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Get started by onboarding your first B2B outbound client account with custom ICP parameters.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" /> Onboard First Client
            </Button>
          </div>
        )}

        {/* Add Client Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Onboard New Client Workspace"
          description="Create an isolated workspace with custom ICP specifications and targeting criteria."
          maxWidth="lg"
        >
          <form onSubmit={handleCreateClient} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Global Systems"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 focus:border-[#C65D2E]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="B2B SaaS">B2B SaaS</option>
                  <option value="AI & Automation Agencies">AI & Automation</option>
                  <option value="IT & Software Services">IT & Software Services</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                  <option value="Coaching & B2B Consulting">Coaching & Consulting</option>
                  <option value="Healthcare Tech">Healthcare Tech</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Company Size
                </label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Primary Contact Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={primaryContactName}
                  onChange={(e) => setPrimaryContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Primary Contact Email
                </label>
                <input
                  type="email"
                  placeholder="john@company.com"
                  value={primaryContactEmail}
                  onChange={(e) => setPrimaryContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Company Website URL
              </label>
              <input
                type="url"
                placeholder="https://company.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Ideal Customer Profile (ICP) Brief
              </label>
              <textarea
                rows={3}
                placeholder="Describe target market segments, titles, pain points, and company size requirements..."
                value={icpDescription}
                onChange={(e) => setIcpDescription(e.target.value)}
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
                Save Client Workspace
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Client Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingClient(null);
          }}
          title={`Edit Client Workspace: ${editingClient?.name || "Client Details"}`}
          description="Update company details, primary contacts, and targeting criteria."
          maxWidth="lg"
        >
          <form onSubmit={handleSaveEditClient} className="space-y-4">
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

            <div className="grid grid-cols-3 gap-3">
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

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ClientStatus)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ONBOARDING">ONBOARDING</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="COMPLETED">COMPLETED</option>
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
                  placeholder="e.g. United States, Canada, India"
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
                  placeholder="e.g. Founder, CEO, VP Sales"
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
                placeholder="What makes the client unique in their market?"
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
                rows={2}
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
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingClient(null);
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

