"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Building2,
  Users,
  Send,
  Inbox,
  CheckSquare,
  Calendar,
  BarChart3,
  UserCheck,
  Bell,
  Settings,
  Menu,
  X,
  Search,
  Plus,
  ExternalLink,
  TrendingUp,
  CreditCard,
  Mail,
} from "lucide-react";
import { useCRM } from "@/lib/store/crm-store";
import { RoleSwitcher } from "./RoleSwitcher";
import { Button } from "../ui/Button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { notifications, prospects, deals, tasks, currentUser } = useCRM();

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const pendingTasksCount = tasks.filter((t) => t.status !== "COMPLETED").length;
  const openDealsCount = deals.filter((d) => d.stage !== "DEAL_WON" && d.stage !== "DEAL_LOST").length;

  const navItems = [
    { label: "Overview", href: "/app", icon: LayoutDashboard },
    { label: "Clients", href: "/app/clients", icon: Building2 },
    { label: "Prospects", href: "/app/prospects", icon: Users, badge: prospects.length },
    { label: "Campaigns", href: "/app/campaigns", icon: Send },
    { label: "Sales & Deals", href: "/app/deals", icon: TrendingUp, badge: openDealsCount > 0 ? openDealsCount : undefined },
    { label: "Inbox", href: "/app/inbox", icon: Inbox },
    { label: "Email Centre", href: "/app/email", icon: Mail },
    {
      label: "Tasks",
      href: "/app/tasks",
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    { label: "Calendar", href: "/app/calendar", icon: Calendar },
    { label: "Reports", href: "/app/reports", icon: BarChart3 },
    { label: "Finance & Billing", href: "/app/finance", icon: CreditCard },
    { label: "Team", href: "/app/team", icon: UserCheck },
    {
      label: "Notifications",
      href: "/app/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { label: "Settings", href: "/app/settings", icon: Settings },
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

      {/* Sidebar (Deep Navy #071525) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#071525] text-white flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
          <Link href="/app" className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#C65D2E]/10 flex items-center justify-center p-1 border border-[#C65D2E]/30">
              <Image
                src="/icon.png"
                alt="LeadScorpio Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-[#FAF9F6] flex items-center gap-1.5">
                LeadScorpio
                <span className="text-[10px] font-mono uppercase bg-[#C65D2E] text-white px-1.5 py-0.2 rounded font-semibold">
                  OPS
                </span>
              </div>
              <p className="text-[11px] text-[#8B96A5] tracking-wide font-mono">
                Precision Outbound
              </p>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono tracking-widest text-[#8B96A5] uppercase">
            Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/app" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#C65D2E] text-white shadow-[0_4px_16px_rgba(198,93,46,0.35)] font-semibold"
                    : "text-[#8B96A5] hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-[#8B96A5]"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with Client Portal Link */}
        <div className="p-4 border-t border-white/[0.08] space-y-3">
          <Link
            href="/portal"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors border border-white/[0.06]"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Preview Client Portal
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#C65D2E] flex items-center justify-center font-bold text-xs text-white">
              {currentUser.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser.full_name}
              </p>
              <p className="text-[10px] font-mono text-[#8B96A5] truncate">
                {currentUser.role}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[#071525]/[0.08] flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-black"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Search */}
            <div className="relative hidden sm:block w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search prospects, clients, campaigns..."
                className="w-full pl-9 pr-4 py-1.5 rounded-full text-xs bg-[#FAF9F6] border border-[#071525]/10 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 focus:border-[#C65D2E]"
              />
            </div>
          </div>

          {/* Top Actions & Role Persona Switcher */}
          <div className="flex items-center gap-3">
            <Link href="/app/prospects">
              <Button size="sm" variant="primary" className="hidden sm:inline-flex">
                <Plus className="w-3.5 h-3.5" />
                Add Prospect
              </Button>
            </Link>

            <Link
              href="/app/notifications"
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C65D2E]" />
              )}
            </Link>

            {/* Persona Switcher */}
            <RoleSwitcher />
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAF9F6]">
          {children}
        </main>
      </div>
    </div>
  );
}

