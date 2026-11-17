"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Search,
  Filter,
  Send,
  Calendar,
  Tag,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { LinkedinIcon } from "@/components/ui/Icons";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProspectStatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { useCRM } from "@/lib/store/crm-store";
import { ResponseSentiment, MessageDirection } from "@/types/crm";

export default function InboxPage() {
  const {
    conversations,
    clients,
    prospects,
    recordManualMessage,
    updateProspect,
  } = useCRM();

  const [selectedConvId, setSelectedConvId] = useState<string>(
    conversations[0]?.id || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("ALL");
  const [sentimentFilter, setSentimentFilter] = useState("ALL");

  // Message composer state
  const [replyContent, setReplyContent] = useState("");
  const [messageDirection, setMessageDirection] =
    useState<MessageDirection>("OUTBOUND");
  const [newSentiment, setNewSentiment] = useState<ResponseSentiment>("POSITIVE");

  const selectedConv =
    conversations.find((c) => c.id === selectedConvId) || conversations[0];
  const associatedProspect = prospects.find(
    (p) => p.id === selectedConv?.prospect_id
  );

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.prospect_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.prospect_company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient =
      clientFilter === "ALL" || c.client_id === clientFilter;
    const matchesSentiment =
      sentimentFilter === "ALL" || c.last_response_sentiment === sentimentFilter;
    return matchesSearch && matchesClient && matchesSentiment;
  });

  const handleSendOrLogMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedConv) return;

    recordManualMessage(
      selectedConv.id,
      replyContent.trim(),
      messageDirection,
      messageDirection === "INBOUND" ? newSentiment : undefined
    );

    // If inbound positive, optionally advance prospect status
    if (messageDirection === "INBOUND" && associatedProspect) {
      if (newSentiment === "MEETING_REQUESTED") {
        updateProspect(associatedProspect.id, { status: "MEETING_BOOKED" });
      } else if (newSentiment === "POSITIVE" || newSentiment === "INTERESTED") {
        updateProspect(associatedProspect.id, { status: "INTERESTED" });
      }
    }

    setReplyContent("");
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-black text-[#071525] tracking-tight flex items-center gap-2">
              Centralized Conversation Management
              <span className="text-[10px] font-mono uppercase bg-[#C65D2E]/10 text-[#C65D2E] px-2 py-0.5 rounded font-semibold">
                Human-in-the-loop
              </span>
            </h1>
            <p className="text-xs text-[#64748B]">
              Log incoming responses, tag lead sentiment, and record outreach follow-ups.
            </p>
          </div>
        </div>

        {/* 3-Pane Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 bg-white rounded-3xl border border-[#071525]/[0.08] shadow-sm overflow-hidden">
          {/* Left Pane: Conversation List (Cols 3) */}
          <div className="md:col-span-3 border-r border-slate-100 flex flex-col h-full bg-[#FAF9F6]/50">
            {/* Filter Search */}
            <div className="p-3 border-b border-slate-100 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C65D2E]"
                />
              </div>

              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-[#071525]"
              >
                <option value="ALL">All Clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConv?.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full p-3 text-left transition-colors flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-white shadow-sm border-l-4 border-l-[#C65D2E]"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#071525] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {conv.prospect_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#071525] truncate">
                          {conv.prospect_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(conv.last_message_at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {conv.prospect_company}
                      </p>
                      <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 italic">
                        &quot;{conv.last_message_preview}&quot;
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Pane: Message Thread & Composer (Cols 6) */}
          <div className="md:col-span-6 flex flex-col h-full bg-white">
            {selectedConv ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-sm text-[#071525]">
                      {selectedConv.prospect_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedConv.prospect_title} • {selectedConv.prospect_company}
                    </p>
                  </div>

                  <a
                    href={selectedConv.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#0A66C2] font-semibold hover:underline"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5" />
                    LinkedIn
                  </a>
                </div>

                {/* Message Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {selectedConv.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${
                        msg.direction === "OUTBOUND"
                          ? "ml-auto items-end"
                          : "mr-auto items-start"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-mono">
                        <span>{msg.sender_name}</span>
                        <span>•</span>
                        <span>
                          {new Date(msg.sent_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.direction === "OUTBOUND"
                            ? "bg-[#071525] text-white rounded-tr-none shadow-sm"
                            : "bg-[#FAF9F6] text-[#071525] border border-slate-200 rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>

                      {msg.sentiment && (
                        <span className="mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          {msg.sentiment}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Log & Composer */}
                <form
                  onSubmit={handleSendOrLogMessage}
                  className="p-3 border-t border-slate-100 bg-[#FAF9F6]/50 space-y-2"
                >
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                    <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                      Log Action As:
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="dir"
                        checked={messageDirection === "OUTBOUND"}
                        onChange={() => setMessageDirection("OUTBOUND")}
                        className="text-[#C65D2E] focus:ring-[#C65D2E]"
                      />
                      <span>Outbound Sent</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="dir"
                        checked={messageDirection === "INBOUND"}
                        onChange={() => setMessageDirection("INBOUND")}
                        className="text-[#C65D2E] focus:ring-[#C65D2E]"
                      />
                      <span>Inbound Reply Received</span>
                    </label>

                    {messageDirection === "INBOUND" && (
                      <select
                        value={newSentiment}
                        onChange={(e) =>
                          setNewSentiment(e.target.value as ResponseSentiment)
                        }
                        className="text-[11px] font-semibold bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-emerald-700 ml-auto"
                      >
                        <option value="POSITIVE">Positive</option>
                        <option value="INTERESTED">Interested</option>
                        <option value="MEETING_REQUESTED">Meeting Requested</option>
                        <option value="NEUTRAL">Neutral</option>
                        <option value="NOT_INTERESTED">Not Interested</option>
                      </select>
                    )}
                  </div>

                  <div className="flex items-end gap-2">
                    <textarea
                      rows={2}
                      required
                      placeholder={
                        messageDirection === "OUTBOUND"
                          ? "Log message copy sent on LinkedIn..."
                          : "Log prospect's reply received..."
                      }
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
                    />
                    <Button type="submit" variant="primary" size="sm" className="h-10">
                      <Send className="w-3.5 h-3.5" /> Log
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center h-full">
                Select a conversation thread to inspect.
              </div>
            )}
          </div>

          {/* Right Pane: Prospect Details & Sentiment (Cols 3) */}
          <div className="md:col-span-3 border-l border-slate-100 p-4 space-y-4 bg-[#FAF9F6]/30 overflow-y-auto">
            {associatedProspect ? (
              <>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Prospect Intelligence
                  </span>
                  <h4 className="font-bold text-sm text-[#071525]">
                    {associatedProspect.full_name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {associatedProspect.job_title}
                  </p>
                  <p className="text-xs text-[#071525] font-semibold mt-1">
                    {associatedProspect.company}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Client</span>
                    <span className="font-semibold text-slate-700">
                      {associatedProspect.client_name}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Stage</span>
                    <ProspectStatusBadge status={associatedProspect.status} />
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Email</span>
                    <span className="font-mono text-slate-600">
                      {associatedProspect.work_email || "Not listed"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Notes</span>
                    <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 text-[11px] leading-relaxed">
                      {associatedProspect.notes || "No notes logged."}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Fast Handoff
                  </span>
                  <Link href={`/app/prospects/${associatedProspect.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Open Full Profile <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                  <Link href="/app/calendar">
                    <Button variant="secondary" size="sm" className="w-full">
                      <Calendar className="w-3.5 h-3.5 mr-1" /> Book Discovery Call
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-400">No prospect mapped.</div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
