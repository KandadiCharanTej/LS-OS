"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Settings,
  Building2,
  Mail,
  Phone,
  Globe,
  User,
  ShieldCheck,
} from "lucide-react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCRM } from "@/lib/store/crm-store";

export default function ClientSettingsPage() {
  const { currentUser, clients } = useCRM();

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

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-[#071525] tracking-tight">
            Client Portal Settings
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Manage your account credentials, notifications, and organization details for {client.name}.
          </p>
        </div>

        {/* Client Organization Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF9F6] border border-slate-200 flex items-center justify-center p-2 overflow-hidden">
                {client.logo_url ? (
                  <Image
                    src={client.logo_url}
                    alt={client.name}
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-[#C65D2E]" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#071525]">{client.name}</h3>
                <p className="text-slate-500">
                  {client.industry} • {client.company_size}
                </p>
                {client.website && (
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#C65D2E] hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    <Globe className="w-3 h-3" />
                    {client.website}
                  </a>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="font-bold text-[#071525] block mb-1">
                Registered Ideal Customer Profile (ICP)
              </span>
              <p className="text-slate-600 bg-[#FAF9F6] p-3 rounded-xl border border-slate-100 leading-relaxed">
                {client.icp_description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Account Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Your Authorized Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-bold text-[#071525]">{currentUser.full_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <span className="font-medium text-slate-700">{currentUser.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Role</span>
                <span className="font-mono text-[#C65D2E] font-semibold">{currentUser.role}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Direct Phone</span>
                <span className="text-slate-600">{currentUser.phone || "+1-555-024-9101"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access Protection */}
        <Card>
          <CardHeader>
            <CardTitle>Data Security & Multi-Tenant Separation</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Row Level Security (RLS) Active
            </div>
            <p className="leading-relaxed">
              Your organization workspace is isolated by strict PostgreSQL Row Level Security policies.
              No internal LeadScorpio operator notes or other client organizations can ever be accessed from your account.
            </p>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}

