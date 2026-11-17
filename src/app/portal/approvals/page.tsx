"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  Send,
  FileCheck,
  AlertCircle,
  CornerDownRight,
  Building2,
} from "lucide-react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useCRM } from "@/lib/store/crm-store";
import { Approval, ApprovalStatus } from "@/types/crm";

export default function ClientApprovalsPage() {
  const { currentUser, clients, approvals, reviewApproval } = useCRM();

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

  const clientApprovals = approvals.filter(
    (a) => a.client_id === client.id
  );

  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(
    null
  );
  const [commentText, setCommentText] = useState("");
  const [reviewAction, setReviewAction] = useState<ApprovalStatus>("APPROVED");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleOpenReview = (appr: Approval, action: ApprovalStatus) => {
    setSelectedApproval(appr);
    setReviewAction(action);
    setCommentText("");
    setIsReviewModalOpen(true);
  };

  const handleConfirmReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval) return;

    reviewApproval(selectedApproval.id, reviewAction, commentText);
    setIsReviewModalOpen(false);
    setSelectedApproval(null);
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-[#071525] tracking-tight">
            Outreach Copy Approvals
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Review and approve personalized LinkedIn connection notes and messaging sequences prior to dispatch.
          </p>
        </div>

        {/* Approvals List */}
        <div className="space-y-6">
          {clientApprovals.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              No messaging copy awaiting approval at this time.
            </Card>
          ) : (
            clientApprovals.map((appr) => {
              const isPending = appr.status === "PENDING_REVIEW";
              return (
                <Card
                  key={appr.id}
                  className={`p-6 space-y-4 border ${
                    isPending
                      ? "border-[#C65D2E]/40 shadow-md bg-white"
                      : "border-slate-200 bg-[#FAF9F6]/40"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#071525] text-white font-semibold">
                          {appr.item_type.replace(/_/g, " ")}
                        </span>
                        <h3 className="font-bold text-sm text-[#071525]">
                          {appr.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500">
                        Campaign: {appr.campaign_name} • Requested by:{" "}
                        <strong className="text-slate-700">
                          {appr.requested_by_name}
                        </strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          appr.status === "APPROVED"
                            ? "success"
                            : appr.status === "PENDING_REVIEW"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {appr.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>

                  {/* Message Copy Box */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs font-mono leading-relaxed text-[#071525] relative shadow-inner">
                    <span className="text-[9px] uppercase font-mono text-slate-400 block mb-1">
                      Outreach Draft Copy
                    </span>
                    {appr.content}
                  </div>

                  {/* Previous Feedback & Comments Thread */}
                  {appr.comments && appr.comments.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase font-mono">
                        Review History & Comments
                      </span>
                      {appr.comments.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-start gap-2 text-xs bg-white p-3 rounded-xl border border-slate-100"
                        >
                          <CornerDownRight className="w-3.5 h-3.5 text-[#C65D2E] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-[#071525]">
                              {c.user_name}
                            </span>
                            <p className="text-slate-600 mt-0.5">{c.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions Bar */}
                  {isPending && (
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleOpenReview(appr, "CHANGES_REQUESTED")
                        }
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Request Changes
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleOpenReview(appr, "REJECTED")}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenReview(appr, "APPROVED")}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve for Outreach
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* Review Action Modal */}
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title={`Confirm Review: ${reviewAction.replace(/_/g, " ")}`}
          description="Add notes or suggestions for the LeadScorpio outbound team."
          maxWidth="md"
        >
          <form onSubmit={handleConfirmReview} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Feedback Notes & Instructions
              </label>
              <textarea
                rows={4}
                placeholder={
                  reviewAction === "APPROVED"
                    ? "Optional notes or enthusiasm..."
                    : "Explain specifically what copy edits or metric angle you prefer..."
                }
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={reviewAction === "APPROVED" ? "primary" : "secondary"}
                size="sm"
              >
                Submit Decision
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ClientLayout>
  );
}

