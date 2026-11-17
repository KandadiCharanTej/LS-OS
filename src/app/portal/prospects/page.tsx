"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Flag,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Building2,
} from "lucide-react";
import { LinkedinIcon } from "@/components/ui/Icons";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProspectStatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useCRM } from "@/lib/store/crm-store";
import { Prospect } from "@/types/crm";

export default function ClientProspectsPage() {
  const { currentUser, clients, prospects, flagProspectClientFeedback } =
    useCRM();

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

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Flag Modal State
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(
    null
  );
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [feedbackNotes, setFeedbackNotes] = useState("");

  const clientProspects = prospects.filter((p) => {
    const isOurClient = p.client_id === client.id;
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || p.status === statusFilter;
    return isOurClient && matchesSearch && matchesStatus;
  });

  const handleOpenFlagModal = (p: Prospect) => {
    setSelectedProspect(p);
    setFeedbackNotes(p.client_feedback_notes || "");
    setIsFlagModalOpen(true);
  };

  const handleSubmitFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProspect) return;

    flagProspectClientFeedback(selectedProspect.id, true, feedbackNotes);
    setIsFlagModalOpen(false);
    setSelectedProspect(null);
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#071525] tracking-tight">
              Target Prospects Roster
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Verified decision-makers engaged on your behalf. Flag any accounts outside your ideal criteria.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by prospect name, title, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Stage:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl px-3 py-2 text-[#071525]"
            >
              <option value="ALL">All Stages</option>
              <option value="READY_FOR_OUTREACH">Ready</option>
              <option value="CONNECTION_REQUEST_SENT">Connection Sent</option>
              <option value="CONNECTED">Connected</option>
              <option value="MESSAGE_SENT">Message Sent</option>
              <option value="REPLIED">Replied</option>
              <option value="INTERESTED">Interested</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="MEETING_BOOKED">Meeting Booked</option>
            </select>
          </div>
        </div>

        {/* Prospects Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#071525]">
                <thead className="bg-[#FAF9F6] border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Decision-Maker</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Outreach Stage</th>
                    <th className="p-4">LinkedIn Profile</th>
                    <th className="p-4 text-right">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientProspects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No prospects found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    clientProspects.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-[#071525] flex items-center gap-1.5">
                            {p.full_name}
                            {p.is_flagged_by_client && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-100 text-red-700 font-semibold font-mono">
                                Flagged
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {p.job_title}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-slate-800">
                          {p.company}
                        </td>
                        <td className="p-4 text-slate-500">
                          {p.location || "United States"}
                        </td>
                        <td className="p-4">
                          <ProspectStatusBadge status={p.status} />
                        </td>
                        <td className="p-4">
                          <a
                            href={p.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#0A66C2] font-semibold hover:underline"
                          >
                            <LinkedinIcon className="w-3.5 h-3.5" />
                            View Profile
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleOpenFlagModal(p)}
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Flag as irrelevant or give feedback"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            <span className="text-[11px]">
                              {p.is_flagged_by_client ? "Edit Flag" : "Flag"}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Flag Prospect Modal */}
        <Modal
          isOpen={isFlagModalOpen}
          onClose={() => setIsFlagModalOpen(false)}
          title={`Flag Prospect: ${selectedProspect?.full_name}`}
          description="Let LeadScorpio know why this prospect doesn't match your criteria so we refine future targeting."
          maxWidth="md"
        >
          <form onSubmit={handleSubmitFlag} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Feedback / Disqualification Reason
              </label>
              <textarea
                rows={4}
                required
                placeholder="e.g. Company size is too small (<10 FTEs), or this title doesn't own software purchasing..."
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsFlagModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm">
                Submit Feedback
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ClientLayout>
  );
}
