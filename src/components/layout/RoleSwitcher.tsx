"use client";

import React, { useState } from "react";
import { useCRM } from "@/lib/store/crm-store";
import { UserProfile } from "@/types/crm";
import { ShieldCheck, RotateCcw, UserCheck, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function RoleSwitcher() {
  const { users, currentUser, setCurrentUser, clearAllData } = useCRM();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    setIsOpen(false);
    if (user.role === "CLIENT_ADMIN" || user.role === "CLIENT_MEMBER") {
      router.push("/portal");
    } else {
      router.push("/app");
    }
  };

  const handleReset = () => {
    if (confirm("Reset CRM database to a fresh clean state?")) {
      clearAllData();
      alert("Database reset to clean state.");
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[#071525]/5 hover:bg-[#071525]/10 border border-[#071525]/10 text-[#071525] transition-all"
        >
          <div className="w-2 h-2 rounded-full bg-[#C65D2E] animate-pulse" />
          <span className="font-semibold text-[#071525]">
            {currentUser.full_name}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#C65D2E]/10 text-[#C65D2E] font-mono uppercase">
            {currentUser.role}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={handleReset}
          title="Reset Demo Records"
          className="p-1.5 rounded-full text-slate-500 hover:text-[#C65D2E] hover:bg-[#C65D2E]/10 border border-transparent hover:border-[#C65D2E]/20 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#071525]/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#071525]">
                <ShieldCheck className="w-4 h-4 text-[#C65D2E]" />
                Switch Portal Persona
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Test role-based access control and client isolation.
              </p>
            </div>

            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono tracking-wider uppercase text-slate-400">
                Internal Ops Team
              </div>
              {users
                .filter(
                  (u) => u.role === "FOUNDER" || u.role === "TEAM_MEMBER"
                )
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      currentUser.id === u.id
                        ? "bg-[#C65D2E]/10 text-[#C65D2E] font-semibold"
                        : "text-[#071525] hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{u.full_name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </div>
                    {currentUser.id === u.id && (
                      <UserCheck className="w-4 h-4 text-[#C65D2E]" />
                    )}
                  </button>
                ))}

              <div className="px-2 pt-2 pb-1 text-[10px] font-mono tracking-wider uppercase text-slate-400 border-t border-slate-100">
                Client Organization Logins
              </div>
              {users
                .filter(
                  (u) => u.role === "CLIENT_ADMIN" || u.role === "CLIENT_MEMBER"
                )
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      currentUser.id === u.id
                        ? "bg-[#C65D2E]/10 text-[#C65D2E] font-semibold"
                        : "text-[#071525] hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{u.full_name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </div>
                    {currentUser.id === u.id && (
                      <UserCheck className="w-4 h-4 text-[#C65D2E]" />
                    )}
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

