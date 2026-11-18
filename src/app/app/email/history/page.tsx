"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  Mail,
  Building2,
  Users,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmailNavHeader } from "@/components/email/EmailNavHeader";
import { useCRM } from "@/lib/store/crm-store";
import { EmailMessage, EmailStatus } from "@/types/crm";
import { formatDate } from "@/lib/utils";

export default function EmailHistoryPage() {
  const { emailMessages, deleteEmailMessage, clients, prospects } = useCRM();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedClient, setSelectedClient] = useState<string>("ALL");

  // Selected email for viewing details modal
  const [viewingEmail, setViewingEmail] = useState<EmailMessage | null>(null);

  const filteredEmails = useMemo(() => {
    return emailMessages.filter((msg) => {
      const matchesSearch =
        searchTerm === "" ||
        msg.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.to_name && msg.to_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.resend_id && msg.resend_id.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = selectedStatus === "ALL" || msg.status === selectedStatus;
      const matchesCategory = selectedCategory === "ALL" || msg.category === selectedCategory;
      const matchesClient = selectedClient === "ALL" || msg.client_id === selectedClient;

      return matchesSearch && matchesStatus && matchesCategory && matchesClient;
    });
  }, [emailMessages, searchTerm, selectedStatus, selectedCategory, selectedClient]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this email record from history?")) {
      deleteEmailMessage(id);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <EmailNavHeader
          title="Outbox & Delivery History"
          subtitle="Real-time audit log of all emails dispatched via Resend, including delivery status, provider message IDs, and errors."
        />

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-[#071525]/[0.08] shadow-[0_2px_8px_rgba(7,21,37,0.03)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by recipient, subject, or Resend ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-[#071525] focus:outline-hidden focus:border-[#C65D2E]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 p-2 bg-white text-[#071525]"
            >
              <option value="ALL">All Statuses</option>
              <option value="SENT">Sent</option>
              <option value="DELIVERED">Delivered</option>
              <option value="FAILED">Failed</option>
              <option value="BOUNCED">Bounced</option>
              <option value="DRAFT">Draft</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 p-2 bg-white text-[#071525]"
            >
              <option value="ALL">All Categories</option>
              <option value="TRANSACTIONAL">Transactional</option>
              <option value="MARKETING">Marketing</option>
            </select>

            {/* Client Filter */}
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 p-2 bg-white text-[#071525]"
            >
              <option value="ALL">All Clients ({clients.length})</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-semibold text-[#64748B]">
            Showing {filteredEmails.length} of {emailMessages.length} records
          </div>
        </div>

        {/* Emails Table */}
        <Card className="border-[#071525]/[0.08] shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {filteredEmails.length === 0 ? (
              <div className="p-12 text-center">
                <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                <h4 className="text-sm font-bold text-[#071525]">No emails found</h4>
                <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                  {emailMessages.length === 0
                    ? "No emails have been sent yet. Click 'Compose' to dispatch your first email."
                    : "No emails matched your active search or filters."}
                </p>
                <div className="mt-4">
                  <Link href="/app/email/compose">
                    <Button variant="primary" size="sm">
                      Compose Email
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F6] border-b border-[#071525]/[0.06] text-[#64748B] uppercase font-mono text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Recipient</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Association</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Provider</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#071525]/[0.06]">
                    {filteredEmails.map((msg) => (
                      <tr
                        key={msg.id}
                        onClick={() => setViewingEmail(msg)}
                        className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                      >
                        {/* Recipient */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#071525]">
                            {msg.to_name || msg.to}
                          </div>
                          <div className="text-[11px] text-[#64748B] font-mono">
                            {msg.to}
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-[#071525] truncate">
                            {msg.subject}
                          </div>
                          {msg.template_name && (
                            <div className="text-[10px] text-[#C65D2E] truncate">
                              Template: {msg.template_name}
                            </div>
                          )}
                        </td>

                        {/* Association */}
                        <td className="py-3 px-4">
                          {msg.client_name ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#071525] font-medium">
                              <Building2 className="w-3 h-3 text-[#64748B]" />
                              {msg.client_name}
                            </span>
                          ) : msg.prospect_name ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#071525] font-medium">
                              <Users className="w-3 h-3 text-[#64748B]" />
                              {msg.prospect_name}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              msg.category === "MARKETING"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {msg.category}
                          </span>
                        </td>

                        {/* Provider */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              msg.provider === "gmail_smtp"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : msg.provider === "resend"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {msg.provider === "gmail_smtp" ? "Gmail SMTP" : msg.provider === "resend" ? "Resend" : "Simulated"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              msg.status === "DELIVERED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : msg.status === "SENT"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : msg.status === "FAILED"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : msg.status === "BOUNCED"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-50 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {msg.status === "DELIVERED" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : msg.status === "FAILED" ? (
                              <XCircle className="w-3 h-3" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            {msg.status}
                          </span>
                          {msg.error_message && (
                            <div className="text-[10px] text-red-600 truncate max-w-[140px] mt-0.5">
                              {msg.error_message}
                            </div>
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="py-3 px-4 text-[11px] font-mono text-[#64748B]">
                          {formatDate(msg.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingEmail(msg);
                              }}
                              className="p-1 rounded-md text-slate-500 hover:text-[#071525] hover:bg-slate-100"
                              title="View Email"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(msg.id, e)}
                              className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Email Details Modal */}
        {viewingEmail && (
          <Modal
            isOpen={Boolean(viewingEmail)}
            onClose={() => setViewingEmail(null)}
            title={`Email Details: ${viewingEmail.subject}`}
            maxWidth="xl"
          >
            <div className="space-y-4">
              {/* Metadata bar */}
              <div className="bg-[#FAF9F6] border border-[#071525]/10 rounded-xl p-3.5 space-y-1.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#64748B]">To:</span>{" "}
                    <strong className="text-[#071525]">
                      {viewingEmail.to_name ? `${viewingEmail.to_name} <${viewingEmail.to}>` : viewingEmail.to}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#64748B]">From:</span>{" "}
                    <span className="text-[#071525] font-mono">
                      {viewingEmail.sender_name} &lt;{viewingEmail.sender_email}&gt;
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#64748B]">Status:</span>{" "}
                    <span className="font-bold text-[#071525]">{viewingEmail.status}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Provider Used:</span>{" "}
                    <span
                      className={`font-semibold text-[11px] px-2 py-0.5 rounded ${
                        viewingEmail.provider === "gmail_smtp"
                          ? "bg-emerald-100 text-emerald-800"
                          : viewingEmail.provider === "resend"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {viewingEmail.provider === "gmail_smtp"
                        ? "Gmail SMTP (Primary)"
                        : viewingEmail.provider === "resend"
                        ? "Resend (Fallback)"
                        : "Simulated"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#64748B]">Message / Resend ID:</span>{" "}
                    <span className="font-mono text-[11px] text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
                      {viewingEmail.resend_id || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Dispatched At:</span>{" "}
                    <span className="text-[#071525]">
                      {viewingEmail.sent_at ? new Date(viewingEmail.sent_at).toLocaleString() : "Pending"}
                    </span>
                  </div>
                </div>

                {viewingEmail.error_message && (
                  <div className="text-red-700 bg-red-50 p-2 rounded-lg font-mono text-[11px] border border-red-200">
                    <strong>Error:</strong> {viewingEmail.error_message}
                  </div>
                )}
              </div>

              {/* Rendered Email Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                <iframe
                  title="Sent Email Content"
                  srcDoc={viewingEmail.html_content}
                  className="w-full h-[480px] border-none bg-white"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <Link href={`/app/email/compose?to=${encodeURIComponent(viewingEmail.to)}&subject=${encodeURIComponent(`Re: ${viewingEmail.subject}`)}`}>
                  <Button variant="secondary" size="sm">
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Send Follow-up
                  </Button>
                </Link>

                <Button variant="primary" size="sm" onClick={() => setViewingEmail(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
