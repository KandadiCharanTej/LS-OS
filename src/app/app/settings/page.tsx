"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Settings,
  Database,
  Shield,
  Key,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Server,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCRM } from "@/lib/store/crm-store";

export default function SettingsPage() {
  const { resetToDemoData, clearAllData } = useCRM();
  const [aiProvider, setAiProvider] = useState("gemini");
  const [humanReviewGate, setHumanReviewGate] = useState(true);

  const handleResetData = () => {
    if (confirm("Reset all CRM data back to clean slate (zero fake records)?")) {
      clearAllData();
      alert("Database reset to clean state.");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-[#071525] tracking-tight">
            System & Operations Settings
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Global LeadScorpio configuration, AI integration, channels, and database status.
          </p>
        </div>

        {/* 1. Brand & Organization Identity */}
        <Card>
          <CardHeader>
            <CardTitle>Organization & Brand Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#071525] flex items-center justify-center p-2 border border-[#C65D2E]/30">
                <Image
                  src="/icon.png"
                  alt="LeadScorpio Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#071525]">LeadScorpio</h3>
                <p className="text-slate-500">
                  Precision Outbound Lead Generation & Pipeline Development SaaS
                </p>
                <div className="flex items-center gap-3 mt-1 font-mono text-[11px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#071525]" />
                    Deep Navy (#071525)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C65D2E]" />
                    Copper (#C65D2E)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FAF9F6] border border-slate-300" />
                    Warm White (#FAF9F6)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Channel Architecture */}
        <Card>
          <CardHeader>
            <CardTitle>Outbound Channels Architecture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-xl border border-[#C65D2E]/30 bg-[#C65D2E]/5 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-bold text-[#071525]">
                  <span>LinkedIn Outreach Engine</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                    V1 Active
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  High-touch decision-maker research, connection notes, and human-in-the-loop tracking.
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between opacity-80">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-bold text-[#071525]">
                  <span>Cold Email Sequencing</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 font-semibold">
                    V2 Ready
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Domain reputation warmup routines, automated follow-up cadences.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Architecture Built</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between opacity-80">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-bold text-[#071525]">
                  <span>Cold Calling & WhatsApp Outreach</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 font-semibold">
                    V2 Ready
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Direct phone dials and international mobile conversational follow-ups.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Architecture Built</span>
            </div>
          </CardContent>
        </Card>

        {/* 3. AI Message Copilot & Human Gate (Section 9) */}
        <Card>
          <CardHeader>
            <CardTitle>AI Message Copilot & Review Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="block font-semibold text-[#071525]">
                AI Model Provider Abstraction
              </label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full sm:w-72 px-3 py-2 rounded-xl bg-[#FAF9F6] border border-slate-200 text-xs"
              >
                <option value="gemini">Google Gemini 2.5 Flash / Pro (Default)</option>
                <option value="openai">OpenAI GPT-4o / Mini</option>
              </select>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-900">
                  Mandatory Human Review Gate Enforced
                </span>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  Per LeadScorpio Section 9 specifications, AI will never automatically dispatch messages.
                  All connection notes and sequences must pass through the Client Approval Gate and SDR inspection.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Database & Demo Data Reset */}
        <Card>
          <CardHeader>
            <CardTitle>Database Management & Demo State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-[#FAF9F6]">
              <div className="space-y-0.5">
                <span className="font-bold text-[#071525] block">
                  PostgreSQL / Supabase Schema Status
                </span>
                <p className="text-slate-500 text-[11px]">
                  Dual-mode active: Local reactive in-memory state with complete PostgreSQL migrations ready.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 font-semibold">
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span className="font-bold text-[#071525] block">
                  Clear & Reset Database
                </span>
                <p className="text-slate-500 text-[11px]">
                  Purge all records and reset the system to a clean state with zero fake data.
                </p>
              </div>

              <Button variant="danger" size="sm" onClick={handleResetData}>
                <RotateCcw className="w-3.5 h-3.5" /> Clean Slate Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

