"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileCode2,
  Plus,
  Eye,
  Copy,
  Edit3,
  Trash2,
  ExternalLink,
  Send,
  Sparkles,
  Smartphone,
  Monitor,
  Tag,
  Check,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmailNavHeader } from "@/components/email/EmailNavHeader";
import { useCRM } from "@/lib/store/crm-store";
import { EmailTemplate, EmailTemplateCategory } from "@/types/crm";
import { formatDate } from "@/lib/utils";

export default function EmailTemplatesPage() {
  const {
    emailTemplates,
    addEmailTemplate,
    deleteEmailTemplate,
    duplicateEmailTemplate,
  } = useCRM();

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Create Template Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTplName, setNewTplName] = useState("");
  const [newTplCategory, setNewTplCategory] = useState<EmailTemplateCategory>("GENERAL");
  const [newTplSubject, setNewTplSubject] = useState("");
  const [newTplPreviewText, setNewTplPreviewText] = useState("");

  const filteredTemplates = useMemo(() => {
    return emailTemplates.filter((t) => {
      const matchesCat = selectedCategory === "ALL" || t.category === selectedCategory;
      const matchesSearch =
        searchTerm === "" ||
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [emailTemplates, selectedCategory, searchTerm]);

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplName || !newTplSubject) return;

    addEmailTemplate({
      name: newTplName,
      category: newTplCategory,
      subject: newTplSubject,
      preview_text: newTplPreviewText,
      html_content: `
        <h2 style="color: #071934; font-size: 20px;">${newTplName}</h2>
        <p>Hi {{first_name}},</p>
        <p>Thank you for connecting with LeadScorpio.</p>
        <p>Best regards,<br><strong>{{sender_name}}</strong></p>
      `,
      text_content: `Hi {{first_name}},\n\nThank you for connecting with LeadScorpio.\n\nBest regards,\n{{sender_name}}`,
    });

    setIsCreateModalOpen(false);
    setNewTplName("");
    setNewTplSubject("");
    setNewTplPreviewText("");
  };

  const categories = [
    { label: "All Templates", value: "ALL" },
    { label: "Onboarding", value: "ONBOARDING" },
    { label: "Sales & Outbound", value: "SALES" },
    { label: "Meetings", value: "MEETINGS" },
    { label: "Reports", value: "REPORTS" },
    { label: "Finance & Invoices", value: "FINANCE" },
    { label: "General", value: "GENERAL" },
  ];

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <EmailNavHeader
          title="Email Templates Library"
          subtitle="12 production-grade responsive HTML email templates with LeadScorpio brand guidelines."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="shadow-[0_4px_16px_rgba(198,93,46,0.25)]"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Custom Template
            </Button>
          }
        />

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#071525]/[0.08] shadow-[0_2px_8px_rgba(7,21,37,0.03)]">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat.value
                    ? "bg-[#071525] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#071525] hover:bg-[#071525]/[0.04]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-1.5 text-[#071525] focus:outline-hidden focus:border-[#C65D2E]"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tpl) => (
            <Card
              key={tpl.id}
              className="border-[#071525]/[0.08] hover:border-[#C65D2E]/40 shadow-sm transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Header banner on card */}
                <div className="bg-[#071934] p-4 text-white flex items-center justify-between border-b border-white/[0.08]">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode2 className="w-4 h-4 text-[#F15A24] shrink-0" />
                    <span className="text-xs font-bold truncate">{tpl.name}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-[#F15A24] text-white px-2 py-0.5 rounded font-bold shrink-0">
                    {tpl.category}
                  </span>
                </div>

                {/* Card Content */}
                <CardContent className="p-4 space-y-2.5">
                  <div>
                    <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                      Subject Line:
                    </div>
                    <div className="text-xs font-bold text-[#071525] mt-0.5 line-clamp-1">
                      {tpl.subject}
                    </div>
                  </div>

                  {tpl.preview_text && (
                    <div>
                      <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                        Preheader:
                      </div>
                      <div className="text-xs text-[#64748B] line-clamp-1 mt-0.5">
                        {tpl.preview_text}
                      </div>
                    </div>
                  )}

                  {/* Thumbnail snippet */}
                  <div className="bg-[#FAF9F6] border border-slate-200 rounded-xl p-3 text-[11px] font-mono text-slate-600 h-20 overflow-hidden relative">
                    <div className="opacity-70 leading-relaxed line-clamp-3">
                      {tpl.text_content || tpl.html_content.replace(/<[^>]*>?/gm, "").slice(0, 140)}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#FAF9F6] to-transparent pointer-events-none" />
                  </div>
                </CardContent>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3 bg-slate-50 border-t border-[#071525]/[0.06] flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewTemplate(tpl)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#071525] hover:bg-white transition-colors"
                    title="Quick Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => duplicateEmailTemplate(tpl.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#071525] hover:bg-white transition-colors"
                    title="Duplicate Template"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <Link href={`/app/email/templates/${tpl.id}`}>
                    <button
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#071525] hover:bg-white transition-colors"
                      title="Edit in Template Builder"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </Link>

                  {tpl.is_custom && (
                    <button
                      onClick={() => deleteEmailTemplate(tpl.id)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Custom Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <Link href={`/app/email/compose?templateId=${tpl.id}`}>
                  <Button variant="primary" size="sm" className="h-7 text-xs px-3">
                    <Send className="w-3 h-3 mr-1" />
                    Use
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Template Preview Modal */}
        {previewTemplate && (
          <Modal
            isOpen={Boolean(previewTemplate)}
            onClose={() => setPreviewTemplate(null)}
            title={`Preview: ${previewTemplate.name}`}
            maxWidth="xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 p-2 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-[#071525]">Subject:</span> {previewTemplate.subject}
                </div>

                <div className="flex items-center bg-white p-0.5 rounded-lg shadow-2xs">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded ${previewDevice === "desktop" ? "bg-slate-200 text-[#071525]" : "text-slate-500"}`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded ${previewDevice === "mobile" ? "bg-slate-200 text-[#071525]" : "text-slate-500"}`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                className={`mx-auto bg-white rounded-xl shadow-inner overflow-hidden border border-slate-200 ${
                  previewDevice === "mobile" ? "max-w-[360px]" : "w-full"
                }`}
              >
                <iframe
                  title="Template Preview"
                  srcDoc={previewTemplate.html_content}
                  className="w-full h-[520px] border-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="secondary" size="sm" onClick={() => setPreviewTemplate(null)}>
                  Close
                </Button>
                <Link href={`/app/email/compose?templateId=${previewTemplate.id}`}>
                  <Button variant="primary" size="sm">
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Use in Composer
                  </Button>
                </Link>
              </div>
            </div>
          </Modal>
        )}

        {/* Create Custom Template Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Custom HTML Template"
          maxWidth="md"
        >
          <form onSubmit={handleCreateTemplate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Template Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Q4 Executive Briefing"
                value={newTplName}
                onChange={(e) => setNewTplName(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Category
              </label>
              <select
                value={newTplCategory}
                onChange={(e) => setNewTplCategory(e.target.value as EmailTemplateCategory)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
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
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Default Subject Line *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Executive Update regarding {{company_name}}"
                value={newTplSubject}
                onChange={(e) => setNewTplSubject(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Preheader / Preview Text
              </label>
              <input
                type="text"
                placeholder="Short preview visible in recipient inbox..."
                value={newTplPreviewText}
                onChange={(e) => setNewTplPreviewText(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Create & Open Editor
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
