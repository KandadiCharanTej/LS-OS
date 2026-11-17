"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Send,
  Building2,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCRM } from "@/lib/store/crm-store";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { users, setCurrentUser } = useCRM();
  const router = useRouter();

  const handleLaunch = (userId: string, targetPath: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
    router.push(targetPath);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#071525] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-[#071525]/[0.08] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#071525] flex items-center justify-center p-2 border border-[#C65D2E]/30">
              <Image
                src="/icon.png"
                alt="LeadScorpio Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#071525]">
                LeadScorpio
              </span>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-mono uppercase bg-[#C65D2E]/10 text-[#C65D2E] font-semibold rounded">
                CRM & Outbound Ops
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleLaunch(users[0]?.id || "user-founder-charan", "/app")}
            >
              Enter Founder Portal <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#071525]/[0.08] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#C65D2E] animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#071525]">
              V1 LinkedIn Outbound Engine
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#071525] tracking-tight leading-[1.1]">
            Turn Your Ideal Customers Into{" "}
            <span className="text-[#C65D2E]">Qualified Conversations.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            The dedicated operations operating system for LeadScorpio. Manage B2B clients,
            track human-assisted LinkedIn outreach, review message copy, and hand off
            booked sales calls with zero fake metrics.
          </p>

          {/* Quick Portal Launch Cards */}
          <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            {/* Internal Ops Card */}
            <div className="bg-[#071525] text-white rounded-3xl p-8 border border-white/10 shadow-[0_20px_50px_rgba(7,21,37,0.3)] flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C65D2E]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#C65D2E] border border-white/10">
                  <ShieldCheck className="w-6 h-6 text-[#C65D2E]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Internal LeadScorpio Portal
                  </h3>
                  <p className="text-xs text-[#8B96A5] mt-1">
                    For Founders & SDR Team Members
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C65D2E]" />
                    Multi-client workspace & campaign tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C65D2E]" />
                    Prospect CRM with CSV import & batch actions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C65D2E]" />
                    Unified inbox with manual reply logging & sentiment
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C65D2E]" />
                    Kanban tasks & operational calendar
                  </li>
                </ul>
              </div>

              <div className="pt-6 space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleLaunch(users[0]?.id || "user-founder-charan", "/app")}
                >
                  Enter as Charan Tej (Founder) <ArrowRight className="w-4 h-4" />
                </Button>
                <button
                  onClick={() => handleLaunch(users[1]?.id || "user-sdr-operations", "/app")}
                  className="w-full text-center text-xs text-slate-400 hover:text-white py-1 transition-colors"
                >
                  or launch as LeadScorpio Operations
                </button>
              </div>
            </div>

            {/* Client Portal Card */}
            <div className="bg-white rounded-3xl p-8 border border-[#071525]/10 shadow-[0_16px_36px_rgba(7,21,37,0.05)] flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#C65D2E]/10 flex items-center justify-center text-[#C65D2E] border border-[#C65D2E]/20">
                  <Building2 className="w-6 h-6 text-[#C65D2E]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#071525]">
                    Client Transparency Portal
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Isolated Organization Experience
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    Live campaign progress & verified metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    Message approval gate (approve / reject copy)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    Prospect visibility with flagging & feedback
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    Strict multi-tenant security & data isolation
                  </li>
                </ul>
              </div>

              <div className="pt-6 space-y-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => router.push("/portal")}
                >
                  Enter Client Transparency Portal <ArrowRight className="w-4 h-4" />
                </Button>
                <div className="w-full text-center text-xs text-slate-400 py-1">
                  Access restricted to authenticated client stakeholders
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#071525]/[0.08] py-8 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 LeadScorpio. Precision Outbound Lead Generation SaaS.</p>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>Deep Navy #071525</span>
            <span>Copper #C65D2E</span>
            <span>Warm White #FAF9F6</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

