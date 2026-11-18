"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  DollarSign,
  Download,
  Printer,
  Calendar,
  FileText,
  Trash2,
  Eye,
  CheckSquare,
  ShieldCheck,
  Edit3,
  Mail,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PaymentStatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useCRM } from "@/lib/store/crm-store";
import {
  ClientFinanceAgreement,
  Invoice,
  InvoiceLineItem,
  PaymentRecord,
} from "@/types/crm";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function FinancePage() {
  const {
    financeAgreements,
    invoices,
    clients,
    addFinanceAgreement,
    updateFinanceAgreement,
    deleteFinanceAgreement,
    recordPayment,
    sendPaymentReminder,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updateInvoiceStatus,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<"agreements" | "invoices">("agreements");

  // Add Retainer Modal State
  const [isAddAgreementOpen, setIsAddAgreementOpen] = useState(false);
  const [agreementClientId, setAgreementClientId] = useState(clients[0]?.id || "");
  const [agreementAmount, setAgreementAmount] = useState("");
  const [agreementBillingCycle, setAgreementBillingCycle] = useState("MONTHLY");
  const [agreementPricingModel, setAgreementPricingModel] = useState("Monthly Retainer");
  const [agreementDueDate, setAgreementDueDate] = useState("");
  const [agreementNotes, setAgreementNotes] = useState("");

  // Edit Retainer Modal State
  const [isEditAgreementOpen, setIsEditAgreementOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<ClientFinanceAgreement | null>(null);
  const [editAgreementAmount, setEditAgreementAmount] = useState("");
  const [editAgreementTotalPaid, setEditAgreementTotalPaid] = useState("");
  const [editAgreementBillingCycle, setEditAgreementBillingCycle] = useState("MONTHLY");
  const [editAgreementStatus, setEditAgreementStatus] = useState("PENDING");
  const [editAgreementDueDate, setEditAgreementDueDate] = useState("");
  const [editAgreementNotes, setEditAgreementNotes] = useState("");

  const handleOpenEditAgreement = (agreement: ClientFinanceAgreement) => {
    setEditingAgreement(agreement);
    setEditAgreementAmount(String(agreement.agreed_contract_amount || agreement.total_contract_value || ""));
    setEditAgreementTotalPaid(String(agreement.total_paid || 0));
    setEditAgreementBillingCycle(agreement.billing_cycle || "MONTHLY");
    setEditAgreementStatus(agreement.payment_status || "PENDING");
    setEditAgreementDueDate(agreement.next_payment_due || agreement.payment_due_date || "");
    setEditAgreementNotes(agreement.notes || "");
    setIsEditAgreementOpen(true);
  };

  const handleSaveEditAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgreement) return;
    const totalVal = Number(editAgreementAmount) || 0;
    const paidVal = Number(editAgreementTotalPaid) || 0;
    updateFinanceAgreement(editingAgreement.id, {
      agreed_contract_amount: totalVal,
      total_contract_value: totalVal,
      total_paid: paidVal,
      billing_cycle: editAgreementBillingCycle as any,
      payment_status: editAgreementStatus as any,
      payment_due_date: editAgreementDueDate,
      next_payment_due: editAgreementDueDate,
      notes: editAgreementNotes,
    });
    setIsEditAgreementOpen(false);
    setEditingAgreement(null);
  };

  const handleCreateAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === agreementClientId);
    const amountVal = Number(agreementAmount) || 0;
    addFinanceAgreement({
      client_id: agreementClientId,
      client_name: client?.name || "Client",
      agreed_contract_amount: amountVal,
      total_contract_value: amountVal,
      billing_cycle: agreementBillingCycle as any,
      pricing_model: agreementPricingModel,
      payment_due_date: agreementDueDate,
      next_payment_due: agreementDueDate,
      notes: agreementNotes,
      payment_status: "PENDING",
      total_paid: 0,
    });
    setIsAddAgreementOpen(false);
    setAgreementAmount("");
    setAgreementNotes("");
  };

  // Modals
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedAgreementForPayment, setSelectedAgreementForPayment] =
    useState<ClientFinanceAgreement | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [transactionRef, setTransactionRef] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [invoiceClientId, setInvoiceClientId] = useState(clients[0]?.id || "");
  const [invoiceNumber, setInvoiceNumber] = useState(
    `LS-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`
  );
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [invoiceLineItems, setInvoiceLineItems] = useState<
    { description: string; quantity: number; unit_price: number }[]
  >([
    {
      description: "Monthly LinkedIn Precision Outreach Retainer",
      quantity: 1,
      unit_price: 150000,
    },
  ]);
  const [invoiceNotes, setInvoiceNotes] = useState(
    "Net 15 days payment terms. Bank transfers only."
  );

  // View Invoice Modal for Printing
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Finance Aggregations
  const totalContractRevenue = financeAgreements.reduce(
    (acc, a) => acc + (a.total_contract_value || a.agreed_contract_amount || 0),
    0
  );
  const totalCollectedRevenue = financeAgreements.reduce(
    (acc, a) => acc + a.total_paid,
    0
  );
  const totalPendingDues = financeAgreements.reduce(
    (acc, a) => acc + a.pending_amount,
    0
  );
  const overdueAgreements = financeAgreements.filter(
    (a) => a.payment_status === "OVERDUE"
  );

  const handleOpenRecordPayment = (agreement: ClientFinanceAgreement) => {
    setSelectedAgreementForPayment(agreement);
    setPaymentAmount(agreement.pending_amount.toString());
    setTransactionRef(`TXN-${Date.now().toString().slice(-6)}`);
    setIsRecordPaymentOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgreementForPayment) return;

    recordPayment(
      selectedAgreementForPayment.id,
      parseFloat(paymentAmount) || 0,
      paymentMethod as any,
      transactionRef,
      paymentNotes
    );

    setIsRecordPaymentOpen(false);
    setSelectedAgreementForPayment(null);
    setPaymentAmount("");
    setPaymentNotes("");
  };

  const handleAddLineItem = () => {
    setInvoiceLineItems([
      ...invoiceLineItems,
      { description: "Lead Generation Addon", quantity: 1, unit_price: 25000 },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (invoiceLineItems.length === 1) return;
    setInvoiceLineItems(invoiceLineItems.filter((_, i) => i !== index));
  };

  const handleUpdateLineItem = (
    index: number,
    field: "description" | "quantity" | "unit_price",
    value: any
  ) => {
    const updated = [...invoiceLineItems];
    updated[index] = { ...updated[index], [field]: value };
    setInvoiceLineItems(updated);
  };

  const calculateSubtotal = () =>
    invoiceLineItems.reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.unit_price || 0),
      0
    );

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === invoiceClientId);
    if (!client) return;

    const subtotal = calculateSubtotal();
    const tax = Math.round(subtotal * 0.18); // 18% GST standard in India
    const total = subtotal + tax;

    const lineItems: InvoiceLineItem[] = invoiceLineItems.map((item, idx) => ({
      id: `li-${Date.now()}-${idx}`,
      description: item.description,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      amount: Number(item.quantity) * Number(item.unit_price),
      total: Number(item.quantity) * Number(item.unit_price),
    }));

    createInvoice({
      invoice_number: invoiceNumber,
      client_id: client.id,
      client_name: client.name,
      issue_date: new Date().toISOString().split("T")[0],
      due_date: invoiceDueDate || new Date().toISOString().split("T")[0],
      currency: "INR",
      subtotal,
      tax,
      total_amount: total,
      status: "SENT",
      line_items: lineItems,
      notes: invoiceNotes,
    });

    setIsCreateInvoiceOpen(false);
    // Refresh next invoice number
    setInvoiceNumber(
      `LS-${new Date().getFullYear()}-${String(invoices.length + 2).padStart(3, "0")}`
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#071525] tracking-tight">
                Internal Finance & Billing
              </h1>
              <span className="text-[11px] font-mono font-bold bg-[#C65D2E]/10 text-[#C65D2E] px-2 py-0.5 rounded-full border border-[#C65D2E]/20">
                Confidential • Internal Only
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              LeadScorpio agency retainer agreements, collections, payment reminders, and GST-compliant invoicing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActiveTab("agreements");
                setIsAddAgreementOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Client Retainer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab("invoices");
                setIsCreateInvoiceOpen(true);
              }}
            >
              <Receipt className="w-3.5 h-3.5" />
              Generate Invoice
            </Button>
          </div>
        </div>

        {/* Financial KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-[#071525]">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Contract Revenue
                </span>
                <DollarSign className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-xl font-black text-[#071525] font-mono">
                {formatCurrency(totalContractRevenue)}
              </div>
              <p className="text-[11px] text-slate-500">
                Active retainer contracts
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-600">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Collected
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-700 font-mono">
                {formatCurrency(totalCollectedRevenue)}
              </div>
              <p className="text-[11px] text-slate-500">
                Direct bank receipts credited
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#C65D2E]">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pending Dues
                </span>
                <Clock className="w-4 h-4 text-[#C65D2E]" />
              </div>
              <div className="text-xl font-black text-[#C65D2E] font-mono">
                {formatCurrency(totalPendingDues)}
              </div>
              <p className="text-[11px] text-slate-500">
                Awaiting client disbursement
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Overdue Accounts
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-xl font-black text-rose-700 font-mono">
                {overdueAgreements.length}
              </div>
              <p className="text-[11px] text-slate-500">
                Require immediate follow-up
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("agreements")}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 px-1 flex items-center gap-2 ${
              activeTab === "agreements"
                ? "border-[#C65D2E] text-[#C65D2E]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Client Retainer Agreements ({financeAgreements.length})
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 px-1 flex items-center gap-2 ${
              activeTab === "invoices"
                ? "border-[#C65D2E] text-[#C65D2E]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Receipt className="w-4 h-4" />
            Tax Invoices & Billing ({invoices.length})
          </button>
        </div>

        {/* Tab 1: Client Retainer Agreements */}
        {activeTab === "agreements" && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#071525]">
                <thead className="bg-[#FAF9F6] border-b border-[#071525]/[0.08] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Client Organization</th>
                    <th className="p-4">Pricing Model</th>
                    <th className="p-4">Contract Value</th>
                    <th className="p-4">Paid to Date</th>
                    <th className="p-4">Pending Dues</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Next Due Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#071525]/[0.04]">
                  {financeAgreements.map((agreement) => (
                    <tr
                      key={agreement.id}
                      className="hover:bg-[#FAF9F6]/80 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-[#071525]">
                          {agreement.client_name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {agreement.billing_cycle || "Monthly"} Retainer
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-[10px] uppercase font-semibold">
                          {(agreement.pricing_model || "MONTHLY_RETAINER").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-[#071525]">
                        {formatCurrency(agreement.total_contract_value || agreement.agreed_contract_amount)}
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-700">
                        {formatCurrency(agreement.total_paid)}
                      </td>
                      <td className="p-4 font-mono font-bold text-[#C65D2E]">
                        {formatCurrency(agreement.pending_amount)}
                      </td>
                      <td className="p-4">
                        <PaymentStatusBadge status={agreement.payment_status} />
                      </td>
                      <td className="p-4 font-mono text-slate-600">
                        {agreement.next_payment_due || agreement.payment_due_date
                          ? formatDate(agreement.next_payment_due || agreement.payment_due_date)
                          : "—"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenRecordPayment(agreement)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            Record Payment
                          </button>
                          <button
                            onClick={() => sendPaymentReminder(agreement.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#071525] rounded-lg text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                            title="Sends notification & updates reminder timestamp"
                          >
                            <Send className="w-3 h-3 text-[#C65D2E]" />
                            Reminder ({agreement.reminders_sent_count})
                          </button>
                          <Link
                            href={`/app/email/compose?clientId=${agreement.client_id}&templateId=tpl-payment-reminder&company=${encodeURIComponent(agreement.client_name)}`}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-semibold border border-amber-200 inline-flex items-center gap-1 transition-colors"
                            title="Send Branded Email Reminder"
                          >
                            <Mail className="w-3 h-3 text-amber-600" />
                            Email Reminder
                          </Link>
                          <button
                            onClick={() => handleOpenEditAgreement(agreement)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                            title="Edit Retainer Agreement"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete retainer agreement for "${agreement.client_name}"?`)) {
                                deleteFinanceAgreement(agreement.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete Retainer Agreement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 2: Invoices */}
        {activeTab === "invoices" && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#071525]">
                <thead className="bg-[#FAF9F6] border-b border-[#071525]/[0.08] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Issue Date</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Subtotal</th>
                    <th className="p-4">GST (18%)</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#071525]/[0.04]">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-[#FAF9F6]/80 transition-colors"
                    >
                      <td className="p-4 font-mono font-bold text-[#071525]">
                        {inv.invoice_number}
                      </td>
                      <td className="p-4 font-semibold text-[#071525]">
                        {inv.client_name}
                      </td>
                      <td className="p-4 font-mono text-slate-600">
                        {formatDate(inv.issue_date || inv.invoice_date || "")}
                      </td>
                      <td className="p-4 font-mono text-slate-600">
                        {formatDate(inv.due_date)}
                      </td>
                      <td className="p-4 font-mono text-slate-700">
                        {formatCurrency(inv.subtotal)}
                      </td>
                      <td className="p-4 font-mono text-slate-700">
                        {formatCurrency(inv.tax || inv.tax_amount || 0)}
                      </td>
                      <td className="p-4 font-mono font-black text-[#071525]">
                        {formatCurrency(inv.total_amount)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            inv.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : inv.status === "SENT"
                              ? "bg-blue-100 text-blue-800"
                              : inv.status === "OVERDUE"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/app/email/compose?invoiceId=${inv.id}&to=${encodeURIComponent(inv.client_email || "")}&company=${encodeURIComponent(inv.client_name || "")}`}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold border border-blue-200 inline-flex items-center gap-1 transition-colors"
                            title="Email Invoice to Client"
                          >
                            <Mail className="w-3 h-3 text-blue-600" />
                            Email
                          </Link>
                          <button
                            onClick={() => setViewingInvoice(inv)}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
                            title="View / Print Tax Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {inv.status !== "PAID" && (
                            <button
                              onClick={() => updateInvoiceStatus(inv.id, "PAID")}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[11px] font-semibold border border-emerald-200"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Delete invoice ${inv.invoice_number}?`)) {
                                deleteInvoice(inv.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Record Payment Modal */}
        <Modal
          isOpen={isRecordPaymentOpen}
          onClose={() => setIsRecordPaymentOpen(false)}
          title="Record Client Retainer Payment"
          description={`Record incoming bank disbursement for ${selectedAgreementForPayment?.client_name}`}
          maxWidth="md"
        >
          <form onSubmit={handleSavePayment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Payment Amount (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="BANK_TRANSFER">Bank Wire / NEFT / RTGS</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="STRIPE">Stripe / Card</option>
                  <option value="OTHER">Cheque / Cash</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Transaction Reference ID *
              </label>
              <input
                type="text"
                required
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Receipt / Bank Notes
              </label>
              <textarea
                rows={2}
                placeholder="Disbursement confirmed by client finance director..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsRecordPaymentOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Confirm Payment Receipt
              </Button>
            </div>
          </form>
        </Modal>

        {/* Generate Invoice Modal */}
        <Modal
          isOpen={isCreateInvoiceOpen}
          onClose={() => setIsCreateInvoiceOpen(false)}
          title="Generate Professional GST Invoice"
          description="Create and issue an itemized tax invoice to client account."
          maxWidth="lg"
        >
          <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Invoice Number *
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Client Account *
                </label>
                <select
                  value={invoiceClientId}
                  onChange={(e) => setInvoiceClientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={invoiceDueDate}
                  onChange={(e) => setInvoiceDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#071525] uppercase tracking-wider">
                  Itemized Services
                </span>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="text-xs font-bold text-[#C65D2E] hover:underline"
                >
                  + Add Line Item
                </button>
              </div>

              {invoiceLineItems.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center bg-[#FAF9F6] p-2 rounded-xl border border-slate-200"
                >
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="Service Description"
                      value={item.description}
                      onChange={(e) =>
                        handleUpdateLineItem(idx, "description", e.target.value)
                      }
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateLineItem(idx, "quantity", e.target.value)
                      }
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="Unit Price (INR)"
                      value={item.unit_price}
                      onChange={(e) =>
                        handleUpdateLineItem(idx, "unit_price", e.target.value)
                      }
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono font-bold"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(idx)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Invoice Totals */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%):</span>
                <span>{formatCurrency(Math.round(calculateSubtotal() * 0.18))}</span>
              </div>
              <div className="flex justify-between font-bold text-[#071525] text-sm pt-1 border-t border-slate-200">
                <span>Total Amount Due:</span>
                <span className="text-[#C65D2E]">
                  {formatCurrency(
                    calculateSubtotal() + Math.round(calculateSubtotal() * 0.18)
                  )}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Payment Instructions / Notes
              </label>
              <textarea
                rows={2}
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateInvoiceOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Issue & Save Invoice
              </Button>
            </div>
          </form>
        </Modal>

        {/* View / Print Invoice Modal */}
        {viewingInvoice && (
          <Modal
            isOpen={true}
            onClose={() => setViewingInvoice(null)}
            title={`Tax Invoice — ${viewingInvoice.invoice_number}`}
            description="Client Copy • Official LeadScorpio Tax Document"
            maxWidth="lg"
          >
            <div className="space-y-6 p-4 bg-white border border-slate-200 rounded-2xl print:border-none">
              {/* Invoice Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <div className="text-xl font-black text-[#071525] tracking-tight">
                    LeadScorpio Technologies Pvt Ltd
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Precision Outbound Operations & B2B Pipeline Infrastructure
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    GSTIN: 36AAACL1234F1Z8 • Hyderabad, Telangana, India
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black font-mono text-[#C65D2E]">
                    {viewingInvoice.invoice_number}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Issue: {formatDate(viewingInvoice.issue_date || viewingInvoice.invoice_date || "")}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Due: {formatDate(viewingInvoice.due_date)}
                  </div>
                </div>
              </div>

              {/* Billed To */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                  Billed To
                </span>
                <div className="text-sm font-bold text-[#071525]">
                  {viewingInvoice.client_name}
                </div>
                <div className="text-xs text-slate-500">Corporate Account</div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF9F6] border-y border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(viewingInvoice.line_items || viewingInvoice.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-medium text-[#071525]">
                        {item.description}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#071525]">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Calculations */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(viewingInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18%):</span>
                    <span>{formatCurrency(viewingInvoice.tax || viewingInvoice.tax_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-[#071525] pt-2 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span className="text-[#C65D2E]">
                      {formatCurrency(viewingInvoice.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remittance & Bank Info */}
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-slate-200 text-[11px] space-y-1">
                <div className="font-bold text-[#071525]">Bank Remittance Details:</div>
                <div className="text-slate-600 font-mono">
                  Bank: HDFC Bank Ltd • Account: 50200088991234 • IFSC: HDFC0000123
                </div>
                <div className="text-slate-600 font-mono">
                  UPI ID: leadscorpio@hdfcbank
                </div>
              </div>

              {/* Print Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setViewingInvoice(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Add Retainer Agreement Modal */}
        <Modal
          isOpen={isAddAgreementOpen}
          onClose={() => setIsAddAgreementOpen(false)}
          title="Add Client Retainer Agreement"
          description="Record a client service agreement, monthly billing terms, and collection target."
          maxWidth="md"
        >
          <form onSubmit={handleCreateAgreement} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Client Account *
              </label>
              <select
                required
                value={agreementClientId}
                onChange={(e) => setAgreementClientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              >
                <option value="">Select Client Account</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Agreed Retainer Amount (INR ₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 250000"
                  value={agreementAmount}
                  onChange={(e) => setAgreementAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Billing Cycle
                </label>
                <select
                  value={agreementBillingCycle}
                  onChange={(e) => setAgreementBillingCycle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUAL">Annual</option>
                  <option value="PROJECT_BASED">Project Based</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Pricing Model
                </label>
                <input
                  type="text"
                  value={agreementPricingModel}
                  onChange={(e) => setAgreementPricingModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={agreementDueDate}
                  onChange={(e) => setAgreementDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Contract Notes
              </label>
              <textarea
                rows={2}
                placeholder="Deliverables, scope notes, payment terms..."
                value={agreementNotes}
                onChange={(e) => setAgreementNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddAgreementOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Retainer Agreement
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Retainer Agreement Modal */}
        <Modal
          isOpen={isEditAgreementOpen}
          onClose={() => {
            setIsEditAgreementOpen(false);
            setEditingAgreement(null);
          }}
          title={`Edit Retainer Agreement: ${editingAgreement?.client_name || "Contract Details"}`}
          description="Update contract value, collections, billing cycle, and due dates."
          maxWidth="md"
        >
          <form onSubmit={handleSaveEditAgreement} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Contract Value (INR ₹) *
                </label>
                <input
                  type="number"
                  required
                  value={editAgreementAmount}
                  onChange={(e) => setEditAgreementAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Total Paid to Date (INR ₹)
                </label>
                <input
                  type="number"
                  value={editAgreementTotalPaid}
                  onChange={(e) => setEditAgreementTotalPaid(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Billing Cycle
                </label>
                <select
                  value={editAgreementBillingCycle}
                  onChange={(e) => setEditAgreementBillingCycle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUAL">Annual</option>
                  <option value="PROJECT_BASED">Project Based</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Payment Status
                </label>
                <select
                  value={editAgreementStatus}
                  onChange={(e) => setEditAgreementStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                  <option value="PAID">PAID</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Next Payment Due Date
              </label>
              <input
                type="date"
                value={editAgreementDueDate}
                onChange={(e) => setEditAgreementDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Notes
              </label>
              <textarea
                rows={2}
                value={editAgreementNotes}
                onChange={(e) => setEditAgreementNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditAgreementOpen(false);
                  setEditingAgreement(null);
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

