"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Send,
  Users,
  MessageSquare,
  CheckCircle2,
  BarChart3,
  HelpCircle,
  Settings,
  Menu,
  X,
  ArrowLeft,
  Building2,
} from "lucide-react";
import { useCRM } from "@/lib/store/crm-store";
import { RoleSwitcher } from "./RoleSwitcher";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { approvals, clientRequests, currentUser, clients } = useCRM();

  // Find current client org
  const clientOrgId =
    currentUser.organization_id || "client-kf-ai";
  const clientRecord =
    clients.find((c) => c.id === clientOrgId) || clients[0];

  const pendingApprovalsCount = approvals.filter(
    (a) => a.client_id === clientRecord?.id && a.status === "PENDING_REVIEW"
  ).length;

  const openRequestsCount = clientRequests.filter(
    (r) => r.client_id === clientRecord?.id && r.status !== "CLOSED" && r.status !== "RESOLVED"
  ).length;

  const navItems = [
    { label: "Overview", href: "/portal", icon: LayoutDashboard },
    { label: "My Campaigns", href: "/portal/campaigns", icon: Send },
    { label: "My Prospects", href: "/portal/prospects", icon: Users },
    { label: "Conversations", href: "/portal/conversations", icon: MessageSquare },
    {
      label: "Approvals",
      href: "/portal/approvals",
      icon: CheckCircle2,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { label: "Reports", href: "/portal/reports", icon: BarChart3 },
    {
      label: "Requests",
      href: "/portal/requests",
      icon: HelpCircle,
      badge: openRequestsCount > 0 ? openRequestsCount : undefined,
    },
    { label: "Settings", href: "/portal/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF9F6]">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Clean Professional Client Portal) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#071525]/[0.08] flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Client Organization Header */}
        <div className="px-6 py-5 border-b border-[#071525]/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF9F6] border border-[#071525]/10 flex items-center justify-center p-1.5 overflow-hidden">
              {clientRecord?.logo_url ? (
                <Image
                  src={clientRecord.logo_url}
                  alt={clientRecord.name}
                  width={36}
                  height={36}
                  className="object-contain"
                />
              ) : (
                <Building2 className="w-5 h-5 text-[#C65D2E]" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#071525] truncate max-w-[120px]">
                {clientRecord?.name || "Client Portal"}
              </h2>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Campaign
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            Client Portal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/portal" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#C65D2E] text-white shadow-[0_4px_16px_rgba(198,93,46,0.25)] font-semibold"
                    : "text-slate-600 hover:text-[#071525] hover:bg-[#071525]/[0.03]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#C65D2E]/10 text-[#C65D2E] font-semibold"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Client Footer */}
        <div className="p-4 border-t border-[#071525]/[0.06] space-y-3 bg-[#FAF9F6]/50">
          <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg border border-[#071525]/[0.06]">
            <Image
              src="/icon.png"
              alt="LeadScorpio"
              width={16}
              height={16}
              className="object-contain"
            />
            <span className="text-[10px] text-slate-500 font-mono">
              Powered by LeadScorpio Outbound
            </span>
          </div>

          <Link
            href="/app"
            className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-500 hover:text-[#C65D2E] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Switch to Internal Ops
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#071525]/[0.08] flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-black"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-slate-400">Workspace / </span>
              <span className="text-xs font-semibold text-[#071525]">
                {clientRecord?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RoleSwitcher />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAF9F6]">
          {children}
        </main>
      </div>
    </div>
  );
}

