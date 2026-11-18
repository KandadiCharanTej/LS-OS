"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileCode2,
  Save,
  ArrowLeft,
  Eye,
  Monitor,
  Smartphone,
  Copy,
  Sparkles,
  Layers,
  Code2,
  CheckCircle2,
  Trash2,
  Plus,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmailNavHeader } from "@/components/email/EmailNavHeader";
import { useCRM } from "@/lib/store/crm-store";
import { EmailTemplate, EmailTemplateCategory } from "@/types/crm";
import { AVAILABLE_VARIABLES, sanitizeHtml } from "@/lib/email/variables";
import { wrapEmailHtml } from "@/lib/email/templates";

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const {
    emailTemplates,
    updateEmailTemplate,
    duplicateEmailTemplate,
    deleteEmailTemplate,
  } = useCRM();

  const template = useMemo(() => {
    return emailTemplates.find((t) => t.id === templateId);
  }, [emailTemplates, templateId]);

  // Mode: "visual" | "html"
  const [editorMode, setEditorMode] = useState<"visual" | "html">("visual");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // State fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState<EmailTemplateCategory>("GENERAL");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  // Visual mode blocks
  const [visualHeading, setVisualHeading] = useState("");
  const [visualParagraph1, setVisualParagraph1] = useState("");
  const [visualParagraph2, setVisualParagraph2] = useState("");
  const [visualCtaText, setVisualCtaText] = useState("Open Portal");
  const [visualCtaUrl, setVisualCtaUrl] = useState("https://leadscorpio.vercel.app/");

  // Save feedback
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setCategory(template.category);
      setSubject(template.subject);
      setPreviewText(template.preview_text || "");
      setHtmlContent(template.html_content);

      // Seed initial visual blocks
      setVisualHeading(`Notice for {{company_name}}`);
      setVisualParagraph1(`Hi {{first_name}},\n\nThank you for choosing LeadScorpio to power your outbound operations.`);
      setVisualParagraph2(`We are excited to work with you and will follow up with verified campaign results.`);
    }
  }, [template]);

  if (!template) {
    return (
      <AppLayout>
        <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-lg font-bold text-[#071525]">Template Not Found</h2>
          <p className="text-xs text-[#64748B]">The template you requested does not exist or was deleted.</p>
          <Link href="/app/email/templates">
            <Button variant="primary" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Return to Templates
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Update HTML when visual controls change
  const handleApplyVisualBlocks = () => {
    const generated = wrapEmailHtml({
      title: subject || name,
      previewText,
      bodyHtml: `
        <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700; color: #071934;">
          ${visualHeading}
        </h2>
        <p style="margin-top: 0; margin-bottom: 16px; white-space: pre-line;">
          ${visualParagraph1}
        </p>
        <p style="margin-bottom: 16px; white-space: pre-line;">
          ${visualParagraph2}
        </p>
      `,
      ctaText: visualCtaText,
      ctaUrl: visualCtaUrl,
    });

    setHtmlContent(generated);
  };

  const handleSave = () => {
    const cleanHtml = sanitizeHtml(htmlContent);

    updateEmailTemplate(template.id, {
      name,
      category,
      subject,
      preview_text: previewText,
      html_content: cleanHtml,
      text_content: cleanHtml.replace(/<[^>]*>?/gm, " ").trim(),
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleDuplicate = () => {
    duplicateEmailTemplate(template.id);
    router.push("/app/email/templates");
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this custom template?")) {
      deleteEmailTemplate(template.id);
      router.push("/app/email/templates");
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#071525]/[0.08]">
          <div className="flex items-center gap-3">
            <Link href="/app/email/templates">
              <button className="p-2 rounded-xl text-slate-500 hover:text-[#071525] hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#071525]">{name}</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold uppercase">
                  {category}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">Template ID: {template.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleDuplicate}>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Duplicate
            </Button>

            {template.is_custom && (
              <Button variant="secondary" size="sm" onClick={handleDelete} className="text-red-600 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="bg-[#C65D2E] hover:bg-[#b04f24] min-w-[120px]"
            >
              {isSaved ? (
                <span className="flex items-center gap-1.5 text-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved!
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-white">
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Editor Settings Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-[#071525]/[0.08] shadow-xs">
          <div>
            <label className="block text-xs font-semibold text-[#071525] mb-1">Template Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#071525] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EmailTemplateCategory)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-white"
            >
              <option value="GENERAL">General</option>
              <option value="SALES">Sales & Outbound</option>
              <option value="ONBOARDING">Onboarding</option>
              <option value="MEETINGS">Meetings</option>
              <option value="REPORTS">Reports</option>
              <option value="FINANCE">Finance & Invoices</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#071525] mb-1">Default Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2"
            />
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setEditorMode("visual")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                editorMode === "visual" ? "bg-white text-[#071525] shadow-xs" : "text-[#64748B]"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#C65D2E]" />
              Visual Block Editor
            </button>
            <button
              onClick={() => setEditorMode("html")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                editorMode === "html" ? "bg-white text-[#071525] shadow-xs" : "text-[#64748B]"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-[#C65D2E]" />
              HTML Source Code
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/app/email/compose?templateId=${template.id}`}>
              <Button variant="secondary" size="sm" className="text-xs">
                Test with Contact in Composer
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Work Area: Left Editor + Right Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Editor (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {editorMode === "visual" ? (
              <Card className="border-[#071525]/[0.08] shadow-sm">
                <CardHeader className="pb-3 border-b border-[#071525]/[0.06]">
                  <CardTitle className="text-xs font-bold text-[#071525]">
                    Visual Content Blocks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#071525] mb-1">
                      Main Heading
                    </label>
                    <input
                      type="text"
                      value={visualHeading}
                      onChange={(e) => setVisualHeading(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#071525] mb-1">
                      First Paragraph (supports {`{{first_name}}`}, {`{{company_name}}`})
                    </label>
                    <textarea
                      rows={4}
                      value={visualParagraph1}
                      onChange={(e) => setVisualParagraph1(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#071525] mb-1">
                      Second Paragraph
                    </label>
                    <textarea
                      rows={3}
                      value={visualParagraph2}
                      onChange={(e) => setVisualParagraph2(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-[#071525] mb-1">
                        CTA Button Label
                      </label>
                      <input
                        type="text"
                        value={visualCtaText}
                        onChange={(e) => setVisualCtaText(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#071525] mb-1">
                        CTA Destination URL
                      </label>
                      <input
                        type="text"
                        value={visualCtaUrl}
                        onChange={(e) => setVisualCtaUrl(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 p-2"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button variant="secondary" size="sm" onClick={handleApplyVisualBlocks} className="w-full">
                      Apply Blocks to HTML Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-[#071525]/[0.08] shadow-sm">
                <CardHeader className="pb-3 border-b border-[#071525]/[0.06] flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-bold text-[#071525]">
                    Full HTML Source Code
                  </CardTitle>
                  <span className="text-[11px] font-mono text-[#64748B]">Inline CSS Responsive Layout</span>
                </CardHeader>
                <CardContent className="p-3">
                  <textarea
                    rows={22}
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 bg-[#FAF9F6] text-[#071525] leading-relaxed focus:outline-hidden focus:border-[#C65D2E]"
                  />
                </CardContent>
              </Card>
            )}

            {/* Variable insertion bar */}
            <div className="bg-white p-3 rounded-xl border border-[#071525]/[0.08]">
              <div className="text-[11px] font-bold text-[#071525] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C65D2E]" />
                Insert Variables:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setHtmlContent((prev) => `${prev} ${v.key}`)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 hover:bg-[#C65D2E]/10 hover:text-[#C65D2E]"
                  >
                    {v.key}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Sandbox Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-[#071525]/[0.08] shadow-sm sticky top-4">
              <CardHeader className="pb-3 border-b border-[#071525]/[0.06] flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-bold text-[#071525] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#C65D2E]" />
                    Live Render Sandbox
                  </CardTitle>
                </div>

                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded ${previewDevice === "desktop" ? "bg-white text-[#071525] shadow-xs" : "text-slate-500"}`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded ${previewDevice === "mobile" ? "bg-white text-[#071525] shadow-xs" : "text-slate-500"}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-4 bg-[#F1F3F5] rounded-b-2xl">
                <div
                  className={`mx-auto bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 ${
                    previewDevice === "mobile" ? "max-w-[340px]" : "w-full"
                  }`}
                >
                  <iframe
                    title="Template Live Preview"
                    srcDoc={htmlContent || "<p>No content</p>"}
                    className="w-full h-[580px] border-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
