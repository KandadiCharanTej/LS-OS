"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Video,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCRM } from "@/lib/store/crm-store";

export default function CalendarPage() {
  const { meetings, tasks, clients, prospects, addMeeting } = useCRM();
  const [viewType, setViewType] = useState<"month" | "week" | "day">("month");
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("Discovery Strategy Call");
  const [clientId, setClientId] = useState(clients[0]?.id || "client-kf-ai");
  const [prospectName, setProspectName] = useState("");
  const [prospectCompany, setProspectCompany] = useState("");
  const [date, setDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );
  const [time, setTime] = useState("14:00");
  const [qualificationNotes, setQualificationNotes] = useState("");
  const [meetingUrl, setMeetingUrl] = useState(
    "https://calendly.com/leadscorpioofficial/30min"
  );

  const handleBookMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectName || !prospectCompany) return;

    addMeeting({
      title,
      client_id: clientId,
      client_name: clients.find((c) => c.id === clientId)?.name || "Kinetic Flow AI",
      prospect_name: prospectName,
      prospect_company: prospectCompany,
      scheduled_at: new Date(`${date}T${time}:00Z`).toISOString(),
      duration_minutes: 30,
      meeting_url: meetingUrl,
      qualification_notes: qualificationNotes,
    });

    setIsBookModalOpen(false);
    setProspectName("");
    setProspectCompany("");
    setQualificationNotes("");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#071525] tracking-tight">
              Operational Outreach Calendar
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Executive discovery meetings, follow-up cadence dates, and client pipeline review sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-full p-1 flex items-center gap-1 text-xs">
              {(["month", "week", "day"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewType(mode)}
                  className={`px-3 py-1 rounded-full uppercase font-mono text-[10px] tracking-wider transition-colors ${
                    viewType === mode
                      ? "bg-[#071525] text-white font-bold"
                      : "text-slate-500 hover:text-[#071525]"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsBookModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" /> Log Booked Call
            </Button>
          </div>
        </div>

        {/* Calendar Grid & Scheduled Calls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calendar View (2 Cols) */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle>November 2026 Schedule</CardTitle>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Simple Clean Responsive Monthly Grid */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-slate-400 mb-2 font-semibold">
                <span>SUN</span>
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-xs">
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1;
                  const dayMeetings = meetings.filter((m) => {
                    const d = new Date(m.scheduled_at).getDate();
                    return d === day;
                  });

                  return (
                    <div
                      key={day}
                      className={`min-h-[70px] p-1.5 rounded-xl border transition-colors flex flex-col justify-between ${
                        day === 20 || day === 18
                          ? "bg-[#FAF9F6] border-[#C65D2E]/30"
                          : "bg-white border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <span className="font-mono text-[11px] font-bold text-slate-600 text-right">
                        {day}
                      </span>
                      <div className="space-y-1">
                        {dayMeetings.map((m) => (
                          <div
                            key={m.id}
                            className="bg-[#C65D2E] text-white p-1 rounded-md text-[9px] font-semibold truncate leading-tight"
                            title={`${m.prospect_name} (${m.prospect_company})`}
                          >
                            {m.prospect_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Booked Meetings Stream (1 Col) */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Booked Meetings ({meetings.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-slate-200 text-xs space-y-2 hover:border-[#C65D2E]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-[#071525] block">
                          {meeting.prospect_name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {meeting.prospect_company}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                        Confirmed
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(meeting.scheduled_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(meeting.scheduled_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Client Workspace:{" "}
                      <strong className="text-slate-700">{meeting.client_name}</strong>
                    </div>

                    {meeting.qualification_notes && (
                      <p className="text-[11px] bg-white p-2 rounded-lg border border-slate-100 text-slate-600">
                        <strong className="text-[#C65D2E]">Qualification:</strong>{" "}
                        {meeting.qualification_notes}
                      </p>
                    )}

                    {meeting.meeting_url && (
                      <a
                        href={meeting.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#C65D2E] hover:underline font-semibold pt-1"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Call Room
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Log Meeting Modal */}
        <Modal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          title="Log Booked Discovery Meeting"
          description="Record a scheduled calendar call for client pipeline review."
          maxWidth="md"
        >
          <form onSubmit={handleBookMeeting} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Meeting Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Client Workspace *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Prospect Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Prospect Company *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Freight"
                  value={prospectCompany}
                  onChange={(e) => setProspectCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Meeting URL (Zoom / Google Meet)
              </label>
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Pre-Call Qualification Intel
              </label>
              <textarea
                rows={3}
                placeholder="Key pain points, confirmed budget, current vendors..."
                value={qualificationNotes}
                onChange={(e) => setQualificationNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsBookModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Meeting
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

