"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Building2,
} from "lucide-react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useCRM } from "@/lib/store/crm-store";
import { PriorityLevel } from "@/types/crm";

export default function ClientRequestsPage() {
  const { currentUser, clients, clientRequests, addClientRequest } = useCRM();

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

  const requests = clientRequests.filter((r) => r.client_id === client.id);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<
    | "CAMPAIGN_CHANGE"
    | "TARGET_AUDIENCE_UPDATE"
    | "PROSPECT_CORRECTION"
    | "GENERAL_QUESTION"
    | "SUPPORT"
  >("TARGET_AUDIENCE_UPDATE");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("MEDIUM");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    addClientRequest({
      client_id: client.id,
      title,
      category,
      description,
      priority,
    });

    setIsSubmitModalOpen(false);
    setTitle("");
    setDescription("");
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#071525] tracking-tight">
              Client Requests & Targeting Updates
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Submit adjustments to campaign targeting, account requirements, or ask support questions.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSubmitModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" /> Submit New Request
          </Button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              No active requests submitted yet.
            </Card>
          ) : (
            requests.map((req) => (
              <Card key={req.id} className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase bg-[#071525] text-white px-2 py-0.5 rounded font-semibold">
                        {req.category.replace(/_/g, " ")}
                      </span>
                      <h3 className="font-bold text-sm text-[#071525]">
                        {req.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {req.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        req.status === "RESOLVED" || req.status === "CLOSED"
                          ? "bg-emerald-100 text-emerald-800"
                          : req.status === "IN_PROGRESS"
                          ? "bg-[#C65D2E]/10 text-[#C65D2E]"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {req.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {req.resolution_notes && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-0.5">
                    <span className="font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      LeadScorpio Operations Resolution:
                    </span>
                    <p className="text-[11px]">{req.resolution_notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                  <span>Submitted by {req.submitted_by_name}</span>
                  <span>
                    {new Date(req.created_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Submit Request Modal */}
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          title="Submit Campaign or Targeting Request"
          description="Directly notify the LeadScorpio outbound team handling your account."
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Request Subject *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Exclude companies under $10M ARR from next batch"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="TARGET_AUDIENCE_UPDATE">Target Audience Update</option>
                  <option value="CAMPAIGN_CHANGE">Campaign Change</option>
                  <option value="PROSPECT_CORRECTION">Prospect Correction</option>
                  <option value="GENERAL_QUESTION">General Question</option>
                  <option value="SUPPORT">Support</option>
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
                Detailed Instructions *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Specify exact industries to exclude, title adjustments, or requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsSubmitModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ClientLayout>
  );
}

