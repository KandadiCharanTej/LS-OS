"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCRM } from "@/lib/store/crm-store";
import { UserProfile } from "@/types/crm";

export default function LoginPage() {
  const router = useRouter();
  const { users, setCurrentUser } = useCRM();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      const match = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (match) {
        setCurrentUser(match);
        if (match.role === "CLIENT_ADMIN" || match.role === "CLIENT_MEMBER") {
          router.push("/portal");
        } else {
          router.push("/app");
        }
      } else {
        setErrorMessage("Invalid credentials. Try one-click demo personas below.");
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickLogin = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === "CLIENT_ADMIN" || user.role === "CLIENT_MEMBER") {
      router.push("/portal");
    } else {
      router.push("/app");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#071525] flex items-center justify-center p-2 border border-[#C65D2E]/30 shadow-md">
            <Image
              src="/icon.png"
              alt="LeadScorpio Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#071525]">
            LeadScorpio
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-[#071525]">
          Sign in to your CRM Portal
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Enter your credentials or choose a pre-configured role below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-[0_16px_40px_rgba(7,21,37,0.06)] sm:rounded-3xl border border-[#071525]/10 sm:px-10 space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#071525] mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="leadscorpioofficial@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 focus:border-[#C65D2E]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[#071525]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "To reset your password, contact your LeadScorpio Super Admin at ops@leadscorpio.com"
                    )
                  }
                  className="text-[11px] text-[#C65D2E] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 focus:border-[#C65D2E]"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Personas */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Persona Logins
            </div>

            <div className="grid grid-cols-1 gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-[#C65D2E]/40 hover:bg-[#FAF9F6] text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#071525]/5 flex items-center justify-center font-bold text-[10px] text-[#071525] group-hover:bg-[#C65D2E] group-hover:text-white transition-colors">
                      {u.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#071525]">
                        {u.full_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {u.role}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#C65D2E] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

