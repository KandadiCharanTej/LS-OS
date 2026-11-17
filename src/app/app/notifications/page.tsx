"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Calendar,
  MessageSquare,
  HelpCircle,
  FileCheck,
  Check,
  Trash2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCRM } from "@/lib/store/crm-store";

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } =
    useCRM();
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const filteredNotifications = notifications.filter((n) =>
    filter === "UNREAD" ? !n.is_read : true
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#071525] tracking-tight">
              Operational Notifications & Alerts
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Real-time events from LinkedIn campaigns, booked discovery meetings, and message approvals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllNotificationsRead}
            >
              <Check className="w-3.5 h-3.5" /> Mark All as Read
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === "ALL"
                ? "bg-[#071525] text-white"
                : "text-slate-500 hover:text-[#071525]"
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("UNREAD")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === "UNREAD"
                ? "bg-[#071525] text-white"
                : "text-slate-500 hover:text-[#071525]"
            }`}
          >
            Unread ({notifications.filter((n) => !n.is_read).length})
          </button>
        </div>

        {/* List */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No notifications found.
                </div>
              ) : (
                filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                      !n.is_read ? "bg-[#C65D2E]/5" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-[#C65D2E]">
                        {n.type === "MEETING_BOOKED" && <Calendar className="w-4 h-4" />}
                        {n.type === "POSITIVE_REPLY" && <MessageSquare className="w-4 h-4" />}
                        {n.type === "APPROVAL_REQUESTED" && <FileCheck className="w-4 h-4" />}
                        {n.type === "TASK_ASSIGNED" && <CheckCircle2 className="w-4 h-4" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-[#071525]">
                            {n.title}
                          </h4>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-[#C65D2E]" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {n.link_url && (
                        <Link href={n.link_url}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            View
                          </Button>
                        </Link>
                      )}
                      {!n.is_read && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="text-xs text-slate-400 hover:text-slate-700 p-1"
                          title="Mark read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

