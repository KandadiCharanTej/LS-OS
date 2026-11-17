"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Clock,
  Send,
  Building2,
  ExternalLink,
} from "lucide-react";
import { LinkedinIcon } from "@/components/ui/Icons";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCRM } from "@/lib/store/crm-store";

export default function ClientConversationsPage() {
  const { currentUser, clients, conversations } = useCRM();

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

  const clientConversations = conversations.filter(
    (c) => c.client_id === client.id
  );

  const [selectedConvId, setSelectedConvId] = useState<string>(
    clientConversations[0]?.id || ""
  );
  const [searchTerm, setSearchTerm] = useState("");

  const selectedConv =
    clientConversations.find((c) => c.id === selectedConvId) ||
    clientConversations[0];

  const filteredConversations = clientConversations.filter(
    (c) =>
      c.prospect_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.prospect_company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ClientLayout>
      <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
        <div>
          <h1 className="text-xl font-black text-[#071525] tracking-tight">
            Outreach Conversations Transparency
          </h1>
          <p className="text-xs text-[#64748B]">
            Transparent audit of active LinkedIn correspondence conducted on behalf of {client.name}.
          </p>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Left: Contact List (Cols 4) */}
          <div className="md:col-span-4 border-r border-slate-100 flex flex-col h-full bg-[#FAF9F6]/50">
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No conversation threads found.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = conv.id === selectedConv?.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 ${
                        isSelected
                          ? "bg-white shadow-sm border-l-4 border-l-[#C65D2E]"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-[#071525] text-white flex items-center justify-center font-bold text-xs shrink-0">
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
                })
              )}
            </div>
          </div>

          {/* Right: Message Stream (Cols 8) */}
          <div className="md:col-span-8 flex flex-col h-full bg-white">
            {selectedConv ? (
              <>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-sm text-[#071525]">
                      {selectedConv.prospect_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedConv.prospect_title} at {selectedConv.prospect_company}
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

                <div className="flex-1 p-6 overflow-y-auto space-y-4">
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
                        className={`p-4 rounded-2xl text-xs leading-relaxed ${
                          msg.direction === "OUTBOUND"
                            ? "bg-[#071525] text-white rounded-tr-none shadow-sm"
                            : "bg-[#FAF9F6] text-[#071525] border border-slate-200 rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>

                      {msg.sentiment && (
                        <span className="mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          Sentiment: {msg.sentiment}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-slate-100 bg-[#FAF9F6]/50 text-center text-xs text-slate-400 font-mono">
                  Read-only view for client audit and quality assurance.
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center h-full">
                Select a thread to view.
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
