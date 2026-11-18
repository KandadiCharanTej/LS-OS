"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  FileCode2,
  SendHorizontal,
  BarChart2,
  Settings2,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EmailNavHeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmailNavHeader({
  title = "Email Centre",
  subtitle = "High-precision Resend outbound delivery, verified corporate templates, and delivery analytics.",
  action,
}: EmailNavHeaderProps) {
  const pathname = usePathname();

  const tabs = [
    { label: "Dashboard", href: "/app/email", icon: LayoutDashboard },
    { label: "Compose", href: "/app/email/compose", icon: PenSquare },
    { label: "Templates", href: "/app/email/templates", icon: FileCode2 },
    { label: "Sent & Outbox", href: "/app/email/history", icon: SendHorizontal },
    { label: "Analytics", href: "/app/email/analytics", icon: BarChart2 },
    { label: "Settings", href: "/app/email/settings", icon: Settings2 },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#071525]/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#071525]">{title}</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resend Active
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {action || (
            pathname !== "/app/email/compose" && (
              <Link href="/app/email/compose">
                <Button variant="primary" size="sm" className="shadow-[0_4px_16px_rgba(198,93,46,0.25)]">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Compose Email
                </Button>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Secondary Sub-navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#071525] text-white shadow-[0_2px_10px_rgba(7,21,37,0.15)]"
                  : "text-[#64748B] hover:text-[#071525] hover:bg-[#071525]/[0.04]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#C65D2E]" : "text-[#94A3B8]"}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
