"use client";

import React, { useState } from "react";
import {
  UserCheck,
  Plus,
  Mail,
  Phone,
  Building2,
  Send,
  CheckCircle2,
  Shield,
  Trash2,
  Edit3,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCRM } from "@/lib/store/crm-store";
import { UserProfile, UserRole } from "@/types/crm";

export default function TeamPage() {
  const { users, clients, campaigns, tasks, prospects, addUser, updateUser, deleteUser } = useCRM();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Invite Form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("TEAM_MEMBER");
  const [assignedClient, setAssignedClient] = useState(clients[0]?.name || "");

  // Edit User State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("TEAM_MEMBER");

  const handleOpenEditUser = (u: UserProfile) => {
    setEditingUser(u);
    setEditFullName(u.full_name);
    setEditEmail(u.email);
    setEditPhone(u.phone || "");
    setEditRole(u.role);
    setIsEditModalOpen(true);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUser(editingUser.id, {
      full_name: editFullName,
      email: editEmail,
      phone: editPhone,
      role: editRole,
    });
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const internalStaff = users.filter(
    (u) =>
      u.role === "SUPER_ADMIN" ||
      u.role === "FOUNDER" ||
      u.role === "TEAM_MEMBER"
  );

  const clientUsers = users.filter(
    (u) => u.role === "CLIENT_ADMIN" || u.role === "CLIENT_MEMBER"
  );

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;
    const client = clients.find((c) => c.name === assignedClient);
    addUser({
      full_name: fullName,
      email,
      phone: phone || "+91 98765 43210",
      role,
      organization_id: role.startsWith("CLIENT") ? (client?.id || "org-client") : "org-leadscorpio-hq",
    });
    setIsInviteModalOpen(false);
    setFullName("");
    setEmail("");
    setPhone("");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#071525] tracking-tight">
              Team & Role-Based Access Control
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Manage internal operators, SDR campaign allocations, and client portal stakeholders.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" /> Invite Team Member
          </Button>
        </div>

        {/* LeadScorpio Internal Team */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#071525] uppercase tracking-wider font-mono">
            LeadScorpio Operations Staff
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {internalStaff.map((member) => {
              const assignedTasks = tasks.filter(
                (t) => t.assigned_to_id === member.id || t.assigned_to_name === member.full_name
              );
              const completedTasks = assignedTasks.filter((t) => t.status === "COMPLETED").length;

              return (
                <Card key={member.id} className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#071525] text-white flex items-center justify-center font-bold text-base shadow-sm">
                        {member.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#071525]">
                          {member.full_name}
                        </h3>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#C65D2E]/10 text-[#C65D2E] font-semibold">
                      {member.role}
                    </span>
                  </div>

                  {/* Workload Stats */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs">
                    <div>
                      <div className="font-bold text-[#071525]">{assignedTasks.length}</div>
                      <div className="text-[10px] text-slate-400">Tasks Total</div>
                    </div>
                    <div>
                      <div className="font-bold text-emerald-600">{completedTasks}</div>
                      <div className="text-[10px] text-slate-400">Completed</div>
                    </div>
                    <div>
                      <div className="font-bold text-[#C65D2E]">{clients.length}</div>
                      <div className="text-[10px] text-slate-400">Workspaces</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {member.phone || "+91 98765 43210"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditUser(member)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                        title="Edit Member"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {member.role !== "FOUNDER" && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove team member "${member.full_name}"?`)) {
                              deleteUser(member.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Client Organization Portal Users */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-[#071525] uppercase tracking-wider font-mono">
            Client Portal Authorized Contacts
          </h2>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {clientUsers.map((clientUser) => (
                  <div
                    key={clientUser.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#071525] flex items-center justify-center font-bold text-xs">
                        {clientUser.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-[#071525]">
                          {clientUser.full_name}
                        </div>
                        <div className="text-slate-500">{clientUser.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700">
                        {clientUser.role}
                      </span>
                      <span className="text-slate-500 font-medium">
                        {clientUser.phone}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite Modal */}
        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          title="Invite New Team Member"
          description="Grant role-based credentials for LeadScorpio internal ops."
          maxWidth="md"
        >
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan Blake"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="jordan@leadscorpio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Security Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              >
                <option value="TEAM_MEMBER">Team Member (SDR Operator)</option>
                <option value="FOUNDER">Founder (Full Administrative Access)</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsInviteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Send Invitation
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingUser(null);
          }}
          title={`Edit Team Member: ${editingUser?.full_name || "Profile"}`}
          description="Update operator details, email, contact phone, and security role."
          maxWidth="md"
        >
          <form onSubmit={handleSaveEditUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Security Role
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              >
                <option value="TEAM_MEMBER">Team Member (SDR Operator)</option>
                <option value="FOUNDER">Founder (Full Administrative Access)</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="CLIENT_ADMIN">Client Admin</option>
                <option value="CLIENT_MEMBER">Client Stakeholder</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

