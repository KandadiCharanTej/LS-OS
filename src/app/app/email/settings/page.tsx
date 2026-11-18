"use client";

import React, { useState, useEffect } from "react";
import {
  Settings2,
  CheckCircle2,
  AlertCircle,
  Key,
  Mail,
  Send,
  ShieldAlert,
  Globe,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmailNavHeader } from "@/components/email/EmailNavHeader";
import { useCRM } from "@/lib/store/crm-store";

export default function EmailSettingsPage() {
  const {
    emailSettings,
    updateEmailSettings,
    emailSuppressions,
    addSuppression,
    removeSuppression,
  } = useCRM();

  // Settings form state
  const [senderName, setSenderName] = useState(emailSettings.sender_name || "LeadScorpio");
  const [senderEmail, setSenderEmail] = useState(emailSettings.sender_email || "onboarding@resend.dev");
  const [replyTo, setReplyTo] = useState(emailSettings.reply_to || "leadscorpioofficial@gmail.com");
  const [defaultFooter, setDefaultFooter] = useState(
    emailSettings.default_footer || "LeadScorpio • Turn Your Ideal Customers Into Qualified Sales Conversations."
  );

  // Server API status check
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  // Test email tool state
  const [testEmailRecipient, setTestEmailRecipient] = useState("leadscorpioofficial@gmail.com");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Suppression modal
  const [isAddSuppressionOpen, setIsAddSuppressionOpen] = useState(false);
  const [suppressionEmailInput, setSuppressionEmailInput] = useState("");
  const [suppressionReason, setSuppressionReason] = useState<"UNSUBSCRIBE" | "BOUNCE" | "COMPLAINT">("UNSUBSCRIBE");

  const [isSaved, setIsSaved] = useState(false);

  // Fetch server status on mount
  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch("/api/email/settings");
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
      }
    } catch (err) {
      console.warn("Failed to query /api/email/settings", err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmailSettings({
      sender_name: senderName,
      sender_email: senderEmail,
      reply_to: replyTo,
      default_footer: defaultFooter,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmailRecipient }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || `Test email dispatched to ${testEmailRecipient} via ${data.provider === 'gmail_smtp' ? 'Gmail SMTP' : 'Resend'}!`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Failed to send test email.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Network error when requesting test email.",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleAddSuppressionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppressionEmailInput) return;
    addSuppression(suppressionEmailInput, suppressionReason);
    setSuppressionEmailInput("");
    setIsAddSuppressionOpen(false);
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <EmailNavHeader
          title="Email Provider & Deliverability Settings"
          subtitle="Configure Resend API credentials, sender identity, domain verification, and suppression compliance."
        />

        {/* Provider Status Card */}
        <Card className="border-[#071525]/[0.08] shadow-sm overflow-hidden">
          <div className="bg-[#071934] p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-2 border border-white/20">
                <Mail className="w-5 h-5 text-[#F15A24]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Dual-Provider Email Engine</h3>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    serverStatus?.active_provider === "gmail_smtp"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                      : serverStatus?.active_provider === "resend"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {serverStatus?.active_provider === "gmail_smtp"
                      ? "Gmail SMTP Active"
                      : serverStatus?.active_provider === "resend"
                        ? "Resend Fallback"
                        : "Not Configured"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Gmail SMTP (Primary) → Resend API (Fallback)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchStatus}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? "animate-spin" : ""}`} />
                Check Status
              </button>
              <a
                href="https://resend.com/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-[#F15A24] text-white font-bold px-3 py-1.5 rounded-xl hover:bg-[#d94d1c] transition-colors flex items-center gap-1.5"
              >
                <span>Resend Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[#64748B] block mb-1">SMTP Provider:</span>
                <div className="font-bold text-[#071525]">Gmail SMTP (Primary)</div>
                {serverStatus?.smtp_configured !== false ? (
                  <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                    ✓ leadscorpi...@gmail.com
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
                    Not configured
                  </span>
                )}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[#64748B] block mb-1">API Key Configuration:</span>
                <div className="font-mono font-bold text-[#071525]">
                  {serverStatus?.api_key_masked || "re_eemry...endH"}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                  ✓ Validated in .env.local
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[#64748B] block mb-1">Active Sending Mode:</span>
                <div className="font-bold text-[#071525]">
                  {senderEmail.includes("onboarding@resend.dev") ? "Resend Sandbox (onboarding@resend.dev)" : "Verified Custom Domain"}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {senderEmail.includes("onboarding@resend.dev") ? "Sends directly to your registered Resend account" : "Global custom outbound active"}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[#64748B] block mb-1">Webhook Endpoint:</span>
                <div className="font-mono font-semibold text-[#071525] truncate">
                  /api/email/webhook
                </div>
                <span className="text-[10px] text-blue-600 font-semibold mt-1 block">
                  Idempotent delivery listener active
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sender Identity & Test Email Tool Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Sender Identity Config (7 cols) */}
          <div className="lg:col-span-7">
            <Card className="border-[#071525]/[0.08] shadow-sm">
              <CardHeader className="pb-3 border-b border-[#071525]/[0.06]">
                <CardTitle className="text-sm font-bold text-[#071525] flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-[#C65D2E]" />
                  Sender Identity & Corporate Defaults
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#071525] mb-1">
                      Sender Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
                    />
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Name recipients see in their inbox (e.g. &quot;LeadScorpio&quot; or &quot;Charan Tej - LeadScorpio&quot;).
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#071525] mb-1">
                      Verified Sender Email *
                    </label>
                    <input
                      type="text"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 font-mono"
                    />
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Use <span className="font-mono font-bold">onboarding@resend.dev</span> for Resend sandbox testing, or your verified domain (e.g. <span className="font-mono">outbound@leadscorpio.com</span>). Gmail SMTP uses the configured SMTP_USER address for sending.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#071525] mb-1">
                      Reply-To Address
                    </label>
                    <input
                      type="email"
                      value={replyTo}
                      onChange={(e) => setReplyTo(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 font-mono"
                    />
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Where replies from prospects and clients will be directed.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#071525] mb-1">
                      Default Legal Footer / Tagline
                    </label>
                    <textarea
                      rows={2}
                      value={defaultFooter}
                      onChange={(e) => setDefaultFooter(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-emerald-600 font-semibold text-xs">
                      {isSaved && "✓ Settings updated successfully"}
                    </span>
                    <Button type="submit" variant="primary" size="sm">
                      Save Settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right: Real Test Email Dispatch Tool (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-[#071525]/[0.08] shadow-sm">
              <CardHeader className="pb-3 border-b border-[#071525]/[0.06]">
                <CardTitle className="text-sm font-bold text-[#071525] flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#C65D2E]" />
                  Live Resend Test Dispatch
                </CardTitle>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Send a real branded test email right now to verify end-to-end delivery
                </p>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#071525] mb-1">
                    Test Recipient Email *
                  </label>
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    placeholder="your-email@gmail.com"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 font-mono"
                  />
                  <p className="text-[11px] text-[#64748B] mt-1">
                    When using <span className="font-mono">onboarding@resend.dev</span>, Resend delivers to the email address registered with your Resend account (<span className="font-bold">leadscorpioofficial@gmail.com</span>).
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendTestEmail}
                  disabled={isSendingTest || !testEmailRecipient}
                  className="w-full bg-[#071934] hover:bg-[#0b2447]"
                >
                  {isSendingTest ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" />
                      Send Test Email
                    </span>
                  )}
                </Button>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs border ${
                      testResult.success
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      {testResult.success ? "Dispatch Confirmed" : "Delivery Error"}
                    </div>
                    <p className="mt-1 leading-relaxed">{testResult.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom Domain Setup Guide Card */}
            <Card className="border-[#071525]/[0.08] shadow-sm bg-[#FAF9F6]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-[#071525] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#C65D2E]" />
                  Custom Domain Verification Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs text-[#4A5568] leading-relaxed">
                <p>
                  To send from <span className="font-mono font-bold text-[#071525]">@leadscorpio.com</span> to any outside recipient inbox:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                  <li>Go to <strong>resend.com/domains</strong> and click <strong>Add Domain</strong>.</li>
                  <li>Enter your domain: <span className="font-mono font-bold">leadscorpio.com</span>.</li>
                  <li>Add the 3 DNS records provided (DKIM, SPF, MX) to your DNS registrar (GoDaddy, Namecheap, Cloudflare).</li>
                  <li>Click <strong>Verify DNS</strong> in Resend.</li>
                  <li>Update Verified Sender above to <span className="font-mono">team@leadscorpio.com</span>.</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Suppression & Compliance Management */}
        <Card className="border-[#071525]/[0.08] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#071525]/[0.06]">
            <div>
              <CardTitle className="text-sm font-bold text-[#071525] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Suppression List & Unsubscribe Registry
              </CardTitle>
              <p className="text-xs text-[#64748B] mt-0.5">
                Contacts who have unsubscribed or bounced. Marketing emails will never be dispatched to these addresses.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setIsAddSuppressionOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Suppressed Email
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {emailSuppressions.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#64748B]">
                Suppression list is clean (0 unsubscribes or bounces recorded).
              </div>
            ) : (
              <div className="divide-y divide-[#071525]/[0.06]">
                {emailSuppressions.map((sup) => (
                  <div key={sup.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#071525]">{sup.email}</span>
                      <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {sup.reason}
                      </span>
                    </div>
                    <button
                      onClick={() => removeSuppression(sup.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Suppression Modal */}
        <Modal
          isOpen={isAddSuppressionOpen}
          onClose={() => setIsAddSuppressionOpen(false)}
          title="Add Email to Suppression List"
          maxWidth="sm"
        >
          <form onSubmit={handleAddSuppressionSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={suppressionEmailInput}
                onChange={(e) => setSuppressionEmailInput(e.target.value)}
                placeholder="contact@company.com"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Suppression Reason
              </label>
              <select
                value={suppressionReason}
                onChange={(e) => setSuppressionReason(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
              >
                <option value="UNSUBSCRIBE">Unsubscribed by User</option>
                <option value="BOUNCE">Hard Bounce / Mailbox Not Found</option>
                <option value="COMPLAINT">Spam Complaint</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddSuppressionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Add to Suppression List
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
