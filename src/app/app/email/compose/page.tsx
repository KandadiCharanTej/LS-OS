"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Send,
  Save,
  Eye,
  Smartphone,
  Monitor,
  AlertTriangle,
  Paperclip,
  CheckCircle2,
  X,
  FileCode2,
  Users,
  Building2,
  Tag,
  HelpCircle,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmailNavHeader } from "@/components/email/EmailNavHeader";
import { useCRM } from "@/lib/store/crm-store";
import {
  AVAILABLE_VARIABLES,
  renderEmailVariables,
  findUnresolvedVariables,
} from "@/lib/email/variables";
import { EmailCategory } from "@/types/crm";

function ComposeEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    clients,
    prospects,
    invoices,
    emailTemplates,
    emailSettings,
    currentUser,
    sendEmailAction,
    saveDraftEmail,
    emailSuppressions,
  } = useCRM();

  // Contact selection mode
  const [recipientMode, setRecipientMode] = useState<"MANUAL" | "CRM">("MANUAL");
  const [selectedProspectId, setSelectedProspectId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  // Email form fields
  const [toEmail, setToEmail] = useState("");
  const [toName, setToName] = useState("");
  const [toCompany, setToCompany] = useState("");
  const [category, setCategory] = useState<EmailCategory>("TRANSACTIONAL");
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [senderName, setSenderName] = useState(emailSettings.sender_name || "LeadScorpio");
  const [senderEmail, setSenderEmail] = useState(emailSettings.sender_email || "onboarding@resend.dev");
  const [replyTo, setReplyTo] = useState(emailSettings.reply_to || "leadscorpioofficial@gmail.com");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  // CC / BCC
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");

  // Attachments
  const [attachmentName, setAttachmentName] = useState("");

  // Preview Mode
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  // Modals & Status
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccessMessage, setSendSuccessMessage] = useState("");

  // Handle URL prefill parameters
  useEffect(() => {
    const qTo = searchParams.get("to");
    const qName = searchParams.get("name");
    const qCompany = searchParams.get("company");
    const qProspectId = searchParams.get("prospectId");
    const qClientId = searchParams.get("clientId");
    const qTemplateId = searchParams.get("templateId");
    const qInvoiceId = searchParams.get("invoiceId");

    if (qTo) setToEmail(qTo);
    if (qName) setToName(qName);
    if (qCompany) setToCompany(qCompany);

    if (qProspectId) {
      setRecipientMode("CRM");
      setSelectedProspectId(qProspectId);
      const p = prospects.find((item) => item.id === qProspectId);
      if (p) {
        setToEmail(p.work_email || p.email || "");
        setToName(p.full_name);
        setToCompany(p.company);
        setSelectedClientId(p.client_id || "");
      }
    } else if (qClientId) {
      setSelectedClientId(qClientId);
    }

    if (qTemplateId) {
      handleSelectTemplate(qTemplateId);
    }

    if (qInvoiceId) {
      const inv = invoices.find((i) => i.id === qInvoiceId);
      if (inv) {
        setToEmail(inv.client_email || "");
        setToCompany(inv.client_name || "");
        // Default to invoice template
        const invoiceTpl = emailTemplates.find((t) => t.id === "tpl-invoice-email");
        if (invoiceTpl) {
          handleSelectTemplate(invoiceTpl.id, {
            invoice_number: inv.invoice_number,
            invoice_amount: `₹${inv.total_amount.toLocaleString("en-IN")}`,
            payment_due_date: inv.due_date,
            company_name: inv.client_name,
            client_name: inv.client_name,
          });
        }
      }
    }
  }, [searchParams, prospects, invoices, emailTemplates]);

  // Sync recipient when choosing from CRM Prospects
  const handleSelectProspect = (prospectId: string) => {
    setSelectedProspectId(prospectId);
    if (!prospectId) return;
    const p = prospects.find((item) => item.id === prospectId);
    if (p) {
      setToEmail(p.work_email || p.email || "");
      setToName(p.full_name);
      setToCompany(p.company);
      if (p.client_id) setSelectedClientId(p.client_id);
    }
  };

  // Sync recipient when choosing from CRM Clients
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    if (!clientId) return;
    const c = clients.find((item) => item.id === clientId);
    if (c) {
      setToCompany(c.name);
      if (!toEmail) {
        // Fallback default
        setToEmail(`contact@${c.website?.replace(/https?:\/\//, "").replace(/\/.*$/, "") || "client.com"}`);
      }
    }
  };

  // Context map for variable rendering
  const personalizationContext = useMemo(() => {
    const selectedProspect = prospects.find((p) => p.id === selectedProspectId);
    const selectedClient = clients.find((c) => c.id === selectedClientId);

    const fName = toName ? toName.trim().split(/\s+/)[0] : selectedProspect?.first_name || "Valued Client";
    const lName = toName ? toName.trim().split(/\s+/).slice(1).join(" ") : selectedProspect?.last_name || "";

    return {
      first_name: fName,
      last_name: lName,
      full_name: toName || selectedProspect?.full_name || "Valued Client",
      company_name: toCompany || selectedProspect?.company || selectedClient?.name || "Your Company",
      client_name: selectedClient?.name || "Client Workspace",
      service_name: selectedClient?.products_and_services || "B2B Outbound Lead Generation",
      meeting_date: "Thursday, Nov 26, 2026",
      meeting_time: "03:30 PM IST",
      meeting_url: "https://meet.google.com/ls-demo",
      invoice_number: "INV-2026-0042",
      invoice_amount: "₹85,000",
      payment_due_date: "Nov 30, 2026",
      sender_name: senderName,
      sender_email: senderEmail,
      unsubscribe_link: "https://leadscorpio.vercel.app/unsubscribe",
    };
  }, [toName, toCompany, selectedProspectId, selectedClientId, prospects, clients, senderName, senderEmail]);

  // Template selection
  const handleSelectTemplate = (tplId: string, extraContext?: Record<string, string>) => {
    setSelectedTemplateId(tplId);
    const tpl = emailTemplates.find((t) => t.id === tplId);
    if (!tpl) return;

    const mergedCtx = { ...personalizationContext, ...(extraContext || {}) };
    setSubject(renderEmailVariables(tpl.subject, mergedCtx));
    setHtmlContent(renderEmailVariables(tpl.html_content, mergedCtx));
  };

  // Insert variable into active editor
  const handleInsertVariable = (varKey: string) => {
    setHtmlContent((prev) => `${prev}\n<p>${varKey}</p>`);
  };

  // Rendered HTML preview
  const renderedPreviewHtml = useMemo(() => {
    return renderEmailVariables(htmlContent, personalizationContext);
  }, [htmlContent, personalizationContext]);

  // Unresolved variables detector
  const unresolvedVars = useMemo(() => {
    return findUnresolvedVariables(`${subject} ${htmlContent}`);
  }, [subject, htmlContent]);

  // Suppression list warning
  const isRecipientSuppressed = useMemo(() => {
    if (!toEmail) return false;
    return emailSuppressions.some((s) => s.email.toLowerCase() === toEmail.trim().toLowerCase());
  }, [toEmail, emailSuppressions]);

  // Send action execution
  const handleConfirmSend = async () => {
    setIsSending(true);
    setSendError("");
    setSendSuccessMessage("");

    try {
      const ccArray = ccInput
        ? ccInput.split(",").map((e) => e.trim()).filter((e) => e.includes("@"))
        : undefined;
      const bccArray = bccInput
        ? bccInput.split(",").map((e) => e.trim()).filter((e) => e.includes("@"))
        : undefined;

      const attachments = attachmentName
        ? [{ filename: attachmentName, content: "Sample attached PDF document." }]
        : undefined;

      const result = await sendEmailAction({
        to: toEmail.trim(),
        to_name: toName.trim(),
        recipient_company: toCompany.trim(),
        client_id: selectedClientId || undefined,
        client_name: clients.find((c) => c.id === selectedClientId)?.name,
        prospect_id: selectedProspectId || undefined,
        prospect_name: toName,
        sender_name: senderName,
        sender_email: senderEmail,
        reply_to: replyTo,
        cc: ccArray,
        bcc: bccArray,
        subject: subject.trim(),
        html_content: renderedPreviewHtml,
        category,
        template_id: selectedTemplateId || undefined,
        template_name: emailTemplates.find((t) => t.id === selectedTemplateId)?.name,
        attachments,
      });

      if (!result.success) {
        setSendError(result.error || "Failed to dispatch email through Resend.");
      } else {
        setSendSuccessMessage(
          `Email sent successfully via Resend! (Message ID: ${result.resend_id || "resend-ok"})`
        );
        setTimeout(() => {
          setIsReviewModalOpen(false);
          router.push("/app/email/history");
        }, 1500);
      }
    } catch (err: any) {
      setSendError(err.message || "An unexpected error occurred during dispatch.");
    } finally {
      setIsSending(false);
    }
  };

  // Save Draft
  const handleSaveDraft = () => {
    saveDraftEmail({
      to: toEmail.trim(),
      to_name: toName.trim(),
      recipient_company: toCompany.trim(),
      client_id: selectedClientId || undefined,
      client_name: clients.find((c) => c.id === selectedClientId)?.name,
      prospect_id: selectedProspectId || undefined,
      prospect_name: toName,
      subject: subject || "Untitled Draft",
      html_content: htmlContent,
      category,
      sender_name: senderName,
      sender_email: senderEmail,
      reply_to: replyTo,
      template_id: selectedTemplateId || undefined,
    });
    router.push("/app/email/history");
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <EmailNavHeader
          title="Compose Email"
          subtitle="One-to-one executive email dispatch with inline personalization and verified delivery."
          action={
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleSaveDraft}>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Draft
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsReviewModalOpen(true)}
                disabled={!toEmail || !subject || !htmlContent}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Review & Send
              </Button>
            </div>
          }
        />

        {/* Suppression Warning Banner */}
        {isRecipientSuppressed && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-900">Recipient is on Suppression List</h4>
              <p className="text-xs text-red-700 mt-0.5">
                {toEmail} has unsubscribed or previously bounced. Marketing emails will be blocked automatically.
              </p>
            </div>
          </div>
        )}

        {/* Warning if unresolved variables exist */}
        {unresolvedVars.length > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Unresolved Placeholders Detected</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                The content contains unreplaced variables:{" "}
                <span className="font-mono font-bold">{unresolvedVars.join(", ")}</span>. These will appear as raw text to the recipient unless resolved or populated.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Composer Controls & Editor (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Recipient Card */}
            <Card className="border-[#071525]/[0.08] shadow-sm">
              <CardHeader className="pb-3 border-b border-[#071525]/[0.06]">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-[#071525] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#C65D2E]" />
                    Recipient & Association
                  </CardTitle>

                  {/* Recipient Source Mode Switcher */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setRecipientMode("MANUAL")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        recipientMode === "MANUAL" ? "bg-white text-[#071525] shadow-xs" : "text-[#64748B]"
                      }`}
                    >
                      Manual Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipientMode("CRM")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        recipientMode === "CRM" ? "bg-white text-[#071525] shadow-xs" : "text-[#64748B]"
                      }`}
                    >
                      CRM Contact
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3.5">
                {recipientMode === "CRM" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#071525] mb-1">
                        Select Lead / Prospect
                      </label>
                      <select
                        value={selectedProspectId}
                        onChange={(e) => handleSelectProspect(e.target.value)}
                        className="w-full text-xs rounded-xl border border-[#071525]/15 p-2.5 bg-white text-[#071525] focus:outline-hidden focus:border-[#C65D2E]"
                      >
                        <option value="">-- Choose from Prospects ({prospects.length}) --</option>
                        {prospects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.full_name} ({p.company}) — {p.work_email || p.email || "No email"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#071525] mb-1">
                        Select Associated Client
                      </label>
                      <select
                        value={selectedClientId}
                        onChange={(e) => handleSelectClient(e.target.value)}
                        className="w-full text-xs rounded-xl border border-[#071525]/15 p-2.5 bg-white text-[#071525] focus:outline-hidden focus:border-[#C65D2E]"
                      >
                        <option value="">-- Optional Client Link --</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : null}

                {/* Recipient Details Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-[#071525] mb-1">
                      Recipient Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. client@acme.com"
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      className="w-full text-xs rounded-xl border border-[#071525]/15 p-2.5 bg-white text-[#071525] focus:outline-hidden focus:border-[#C65D2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#071525] mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={toName}
                      onChange={(e) => setToName(e.target.value)}
                      className="w-full text-xs rounded-xl border border-[#071525]/15 p-2.5 bg-white text-[#071525] focus:outline-hidden focus:border-[#C65D2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#071525] mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={toCompany}
                      onChange={(e) => setToCompany(e.target.value)}
                      className="w-full text-xs rounded-xl border border-[#071525]/15 p-2.5 bg-white text-[#071525] focus:outline-hidden focus:border-[#C65D2E]"
                    />
                  </div>
                </div>

                {/* CC / BCC Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCcBcc(!showCcBcc)}
                    className="text-[11px] font-semibold text-[#C65D2E] hover:underline"
                  >
                    {showCcBcc ? "− Hide CC & BCC" : "+ Add CC / BCC"}
                  </button>

                  {showCcBcc && (
                    <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-[11px] text-[#64748B] mb-1">CC (Comma-separated)</label>
                        <input
                          type="text"
                          placeholder="ops@client.com, advisor@firm.com"
                          value={ccInput}
                          onChange={(e) => setCcInput(e.target.value)}
                          className="w-full text-xs rounded-lg border border-[#071525]/15 p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#64748B] mb-1">BCC (Comma-separated)</label>
                        <input
                          type="text"
                          placeholder="archive@leadscorpio.com"
                          value={bccInput}
                          onChange={(e) => setBccInput(e.target.value)}
                          className="w-full text-xs rounded-lg border border-[#071525]/15 p-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Template Selector & Category */}
            <Card className="border-[#071525]/[0.08] shadow-sm">
              <CardContent className="p-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#071525] mb-1 flex items-center justify-between">
                      <span>Choose Template</span>
                      <Link href="/app/email/templates" className="text-[10px] text-[#C65D2E] hover:underline">
                        Manage Library
                      </Link>
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => handleSelectTemplate(e.target.value)}
                      className="w-full text-xs rounded-xl border border-[#071525]/15 p-2.5 bg-white text-[#071525] focus:outline-hidden focus:border-[#C65D2E]"
                    >
                      <option value="">-- Blank / Custom Content --</option>
                      {emailTemplates.map((t) => (
                        <option key={t.id} value={t.id}>
                          [{t.category}] {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#071525] mb-1">
                      Email Category (Compliance)
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as EmailCategory)}
                      className="w-full text-xs rounded-xl border border-[#071525]/15 p-2.5 bg-white text-[#071525] focus:outline-hidden focus:border-[#C65D2E]"
                    >
                      <option value="TRANSACTIONAL">Business / Transactional (Invoices, Updates, Calls)</option>
                      <option value="MARKETING">Marketing / Promotional (Requires Opt-in & Unsubscribe)</option>
                    </select>
                  </div>
                </div>

                {/* Subject Line */}
                <div>
                  <label className="block text-xs font-semibold text-[#071525] mb-1">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter engaging email subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs font-semibold rounded-xl border border-[#071525]/15 p-2.5 bg-white text-[#071525] focus:outline-hidden focus:border-[#C65D2E]"
                  />
                </div>

                {/* Sender Identity Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#071525]/[0.06]">
                  <div>
                    <label className="block text-[10px] text-[#64748B] mb-0.5">Sender Name</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#64748B] mb-0.5">From Address</label>
                    <input
                      type="text"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#64748B] mb-0.5">Reply-To</label>
                    <input
                      type="text"
                      value={replyTo}
                      onChange={(e) => setReplyTo(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-1.5 font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variable Insertion Quick Pills */}
            <div className="bg-white p-3 rounded-2xl border border-[#071525]/[0.08] shadow-xs">
              <div className="text-[11px] font-bold text-[#071525] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C65D2E]" />
                Insert Personalization Placeholder (Click to add):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_VARIABLES.slice(0, 9).map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => handleInsertVariable(v.key)}
                    className="px-2 py-1 rounded-md text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 hover:bg-[#C65D2E]/10 hover:text-[#C65D2E] transition-colors border border-slate-200"
                    title={`${v.label}: sample value "${v.sampleValue}"`}
                  >
                    {v.key}
                  </button>
                ))}
              </div>
            </div>

            {/* HTML Content Body Editor */}
            <Card className="border-[#071525]/[0.08] shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-[#071525]/[0.06]">
                <CardTitle className="text-xs font-bold text-[#071525]">
                  Email HTML Content & Layout
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="PDF Attachment URL or name..."
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      className="text-[11px] rounded-lg border border-slate-200 px-2 py-1 w-48"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <textarea
                  rows={14}
                  required
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="Paste or write HTML email content with inline styles..."
                  className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#C65D2E] leading-relaxed bg-[#FAF9F6]/40 text-[#071525]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Responsive Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-[#071525]/[0.08] shadow-sm sticky top-4">
              <CardHeader className="pb-3 border-b border-[#071525]/[0.06] flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-bold text-[#071525] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#C65D2E]" />
                    Live Personalized Preview
                  </CardTitle>
                  <p className="text-[10px] text-[#64748B]">Previewing with actual contact variables</p>
                </div>

                {/* Desktop / Mobile Switcher */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-md transition-all ${
                      previewDevice === "desktop" ? "bg-white text-[#071525] shadow-xs" : "text-[#64748B]"
                    }`}
                    title="Desktop View (600px)"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-md transition-all ${
                      previewDevice === "mobile" ? "bg-white text-[#071525] shadow-xs" : "text-[#64748B]"
                    }`}
                    title="Mobile View (375px)"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-4 bg-[#F1F3F5] rounded-b-2xl">
                {/* Simulated Email Envelope Header */}
                <div className="bg-white p-3 rounded-t-xl border-b border-slate-200 text-xs space-y-1 mb-2 shadow-xs">
                  <div className="text-[11px] text-[#64748B]">
                    <strong className="text-[#071525]">From:</strong> {senderName} &lt;{senderEmail}&gt;
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    <strong className="text-[#071525]">To:</strong> {toName || "Recipient"} &lt;{toEmail || "recipient@example.com"}&gt;
                  </div>
                  <div className="text-xs font-bold text-[#071525] pt-1 truncate">
                    {subject || "Untitled Email"}
                  </div>
                </div>

                {/* Rendered HTML inside preview frame */}
                <div
                  className={`mx-auto bg-white rounded-b-xl shadow-md overflow-hidden transition-all duration-200 ${
                    previewDevice === "mobile" ? "max-w-[340px]" : "w-full"
                  }`}
                  style={{ minHeight: "440px" }}
                >
                  <iframe
                    title="Email Preview"
                    srcDoc={renderedPreviewHtml || "<div style='padding:20px;font-family:sans-serif;color:#999;text-align:center;'>Empty email body. Select a template or write HTML.</div>"}
                    className="w-full h-[520px] border-none bg-white"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Human Review & Confirmation Modal */}
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title="Review & Confirm Email Dispatch"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <p className="text-xs text-[#64748B]">
              Please review all outbound details before final sending. This email will be sent via Resend API to the recipient inbox.
            </p>

            <div className="bg-[#FAF9F6] border border-[#071525]/10 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Recipient:</span>
                <span className="font-bold text-[#071525]">{toName ? `${toName} (${toEmail})` : toEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Company:</span>
                <span className="font-semibold text-[#071525]">{toCompany || "None Specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Sender Identity:</span>
                <span className="text-[#071525]">{senderName} &lt;{senderEmail}&gt;</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Reply-To:</span>
                <span className="text-[#071525]">{replyTo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Subject:</span>
                <span className="font-semibold text-[#071525]">{subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Category:</span>
                <span className="font-semibold px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800">
                  {category}
                </span>
              </div>
            </div>

            {sendError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-200">
                {sendError}
              </div>
            )}

            {sendSuccessMessage && (
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs border border-emerald-200 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {sendSuccessMessage}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsReviewModalOpen(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmSend}
                disabled={isSending}
                className="bg-[#C65D2E] hover:bg-[#b04f24]"
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending via Resend...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    Send Email Now
                  </span>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default function ComposeEmailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading Email Composer...</div>}>
      <ComposeEmailContent />
    </Suspense>
  );
}
