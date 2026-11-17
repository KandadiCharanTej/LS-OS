"use client";

import { useState, useEffect } from "react";
import {
  UserProfile,
  Client,
  Campaign,
  Prospect,
  ProspectStatus,
  ProspectActivity,
  Task,
  Meeting,
  Deal,
  DealStage,
  ClientFinanceAgreement,
  PaymentRecord,
  Invoice,
  WeeklyReport,
  Approval,
  ApprovalStatus,
  ClientRequest,
  ClientRequestStatus,
  NotificationItem,
  Conversation,
  Message,
  ResponseSentiment,
  InternalNote,
  ClientDocument,
} from "@/types/crm";
import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_CAMPAIGNS,
  INITIAL_PROSPECTS,
  INITIAL_DEALS,
  INITIAL_MEETINGS,
  INITIAL_FINANCE_AGREEMENTS,
  INITIAL_INVOICES,
  INITIAL_WEEKLY_REPORTS,
  INITIAL_TASKS,
  INITIAL_APPROVALS,
  INITIAL_CLIENT_REQUESTS,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_INTERNAL_NOTES,
  INITIAL_DOCUMENTS,
} from "./initial-data";

export interface CRMState {
  currentUser: UserProfile;
  users: UserProfile[];
  clients: Client[];
  campaigns: Campaign[];
  prospects: Prospect[];
  deals: Deal[];
  meetings: Meeting[];
  financeAgreements: ClientFinanceAgreement[];
  invoices: Invoice[];
  weeklyReports: WeeklyReport[];
  activities: ProspectActivity[];
  tasks: Task[];
  approvals: Approval[];
  clientRequests: ClientRequest[];
  conversations: Conversation[];
  notifications: NotificationItem[];
  internalNotes: InternalNote[];
  documents: ClientDocument[];
}

const STORAGE_KEY = "leadscorpio_crm_v3_clean_store";

function computeCampaignMetrics(campaign: Campaign, prospects: Prospect[]): Campaign {
  const campProspects = prospects.filter((p) => p.campaign_id === campaign.id);
  const total = campProspects.length;

  // Outreach tracking counts
  const connSent = campProspects.filter((p) =>
    [
      "CONNECTION_REQUEST_SENT",
      "CONNECTION_ACCEPTED",
      "CONNECTED",
      "OPENING_MESSAGE_SENT",
      "MESSAGE_SENT",
      "REPLIED",
      "INTERESTED",
      "QUALIFIED",
      "MEETING_BOOKED",
      "MEETING_ATTENDED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "DEAL_WON",
      "CONVERTED",
      "DEAL_LOST",
      "NOT_INTERESTED",
    ].includes(p.status)
  ).length;

  const connAccepted = campProspects.filter((p) =>
    [
      "CONNECTION_ACCEPTED",
      "CONNECTED",
      "OPENING_MESSAGE_SENT",
      "MESSAGE_SENT",
      "REPLIED",
      "INTERESTED",
      "QUALIFIED",
      "MEETING_BOOKED",
      "MEETING_ATTENDED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "DEAL_WON",
      "CONVERTED",
      "DEAL_LOST",
      "NOT_INTERESTED",
    ].includes(p.status)
  ).length;

  const openingSent = campProspects.filter((p) =>
    [
      "OPENING_MESSAGE_SENT",
      "MESSAGE_SENT",
      "REPLIED",
      "INTERESTED",
      "QUALIFIED",
      "MEETING_BOOKED",
      "MEETING_ATTENDED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "DEAL_WON",
      "CONVERTED",
      "DEAL_LOST",
      "NOT_INTERESTED",
    ].includes(p.status)
  ).length;

  const replied = campProspects.filter((p) =>
    [
      "REPLIED",
      "INTERESTED",
      "QUALIFIED",
      "MEETING_BOOKED",
      "MEETING_ATTENDED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "DEAL_WON",
      "CONVERTED",
      "DEAL_LOST",
      "NOT_INTERESTED",
    ].includes(p.status)
  ).length;

  const positive = campProspects.filter((p) =>
    [
      "INTERESTED",
      "QUALIFIED",
      "MEETING_BOOKED",
      "MEETING_ATTENDED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "DEAL_WON",
      "CONVERTED",
    ].includes(p.status)
  ).length;

  const neutral = campProspects.filter((p) => p.status === "REPLIED").length;
  const negative = campProspects.filter((p) =>
    ["NOT_INTERESTED", "DEAL_LOST", "DISQUALIFIED"].includes(p.status)
  ).length;

  const qualified = campProspects.filter((p) =>
    [
      "QUALIFIED",
      "MEETING_BOOKED",
      "MEETING_ATTENDED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "DEAL_WON",
      "CONVERTED",
    ].includes(p.status)
  ).length;

  const meetings = campProspects.filter((p) =>
    [
      "MEETING_BOOKED",
      "MEETING_ATTENDED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "DEAL_WON",
      "CONVERTED",
    ].includes(p.status)
  ).length;

  // Precise conversion formulas (Section 3 & 5.4)
  const acceptanceRate = connSent > 0 ? Math.round((connAccepted / connSent) * 100) : 0;
  const replyRate = openingSent > 0 ? Math.round((replied / openingSent) * 100) : 0;
  const positiveReplyRate = replied > 0 ? Math.round((positive / replied) * 100) : 0;
  const meetingConversionRate = replied > 0 ? Math.round((meetings / replied) * 100) : 0;

  return {
    ...campaign,
    prospects_count: total,
    connection_requests_sent: connSent,
    connections_accepted: connAccepted,
    opening_messages_sent: openingSent,
    messages_sent: openingSent,
    replies_count: replied,
    positive_replies_count: positive,
    neutral_replies_count: neutral,
    negative_replies_count: negative,
    qualified_count: qualified,
    meetings_booked_count: meetings,
    acceptance_rate: acceptanceRate,
    reply_rate: replyRate,
    positive_reply_rate: positiveReplyRate,
    meeting_conversion_rate: meetingConversionRate,
  };
}

function getInitialState(): CRMState {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.deals && parsed.financeAgreements && parsed.invoices) {
          parsed.campaigns = parsed.campaigns.map((c: Campaign) =>
            computeCampaignMetrics(c, parsed.prospects)
          );
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to read localStorage CRM state, using initial seeds", e);
    }
  }

  // Baseline seeds
  const seededCampaigns = INITIAL_CAMPAIGNS.map((c) =>
    computeCampaignMetrics(c, INITIAL_PROSPECTS)
  );

  return {
    currentUser: INITIAL_USERS[0], // Default Alex Vance (FOUNDER)
    users: INITIAL_USERS,
    clients: INITIAL_CLIENTS,
    campaigns: seededCampaigns,
    prospects: INITIAL_PROSPECTS,
    deals: INITIAL_DEALS,
    meetings: INITIAL_MEETINGS,
    financeAgreements: INITIAL_FINANCE_AGREEMENTS,
    invoices: INITIAL_INVOICES,
    weeklyReports: INITIAL_WEEKLY_REPORTS,
    activities: [],
    tasks: INITIAL_TASKS,
    approvals: INITIAL_APPROVALS,
    clientRequests: INITIAL_CLIENT_REQUESTS,
    conversations: INITIAL_CONVERSATIONS,
    notifications: INITIAL_NOTIFICATIONS,
    internalNotes: INITIAL_INTERNAL_NOTES,
    documents: INITIAL_DOCUMENTS,
  };
}

let globalState: CRMState = getInitialState();
const listeners = new Set<(state: CRMState) => void>();

function notify() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
    } catch (e) {
      console.warn("Failed to save CRM state to localStorage", e);
    }
  }
  listeners.forEach((listener) => listener(globalState));
}

export function useCRM() {
  const [state, setState] = useState<CRMState>(globalState);

  useEffect(() => {
    setState(globalState);
    const listener = (newState: CRMState) => setState({ ...newState });
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Actions
  const setCurrentUser = (user: UserProfile) => {
    globalState = { ...globalState, currentUser: user };
    notify();
  };

  const resetToDemoData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    const freshCampaigns = INITIAL_CAMPAIGNS.map((c) =>
      computeCampaignMetrics(c, INITIAL_PROSPECTS)
    );
    globalState = {
      currentUser: INITIAL_USERS[0],
      users: INITIAL_USERS,
      clients: INITIAL_CLIENTS,
      campaigns: freshCampaigns,
      prospects: INITIAL_PROSPECTS,
      deals: INITIAL_DEALS,
      meetings: INITIAL_MEETINGS,
      financeAgreements: INITIAL_FINANCE_AGREEMENTS,
      invoices: INITIAL_INVOICES,
      weeklyReports: INITIAL_WEEKLY_REPORTS,
      activities: [],
      tasks: INITIAL_TASKS,
      approvals: INITIAL_APPROVALS,
      clientRequests: INITIAL_CLIENT_REQUESTS,
      conversations: INITIAL_CONVERSATIONS,
      notifications: INITIAL_NOTIFICATIONS,
      internalNotes: INITIAL_INTERNAL_NOTES,
      documents: INITIAL_DOCUMENTS,
    };
    notify();
  };

  // 1. Client CRUD & AI Sales Playbook Generator
  const addClient = (clientData: Partial<Client>) => {
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: clientData.name || "Untitled Client",
      status: clientData.status || "ONBOARDING",
      industry: clientData.industry || "B2B SaaS",
      company_size: clientData.company_size || "11-50 employees",
      website: clientData.website || "",
      primary_contact_name: clientData.primary_contact_name || "",
      primary_contact_email: clientData.primary_contact_email || "",
      primary_contact_phone: clientData.primary_contact_phone || "",
      assigned_team_member_name: clientData.assigned_team_member_name || "Marcus Chen",
      company_description: clientData.company_description || "",
      products_and_services: clientData.products_and_services || "",
      business_model: clientData.business_model || "B2B Retainer",
      pricing_packages: clientData.pricing_packages || "Standard Package",
      icp_description: clientData.icp_description || "",
      target_industries: clientData.target_industries || ["B2B SaaS"],
      target_locations: clientData.target_locations || ["United States"],
      target_job_titles: clientData.target_job_titles || ["Founder & CEO", "VP of Sales"],
      target_company_sizes: clientData.target_company_sizes || ["10-100 employees"],
      budget_range: clientData.budget_range || "₹10,00,000 - ₹25,00,000",
      agreed_contract_amount: clientData.agreed_contract_amount || 250000,
      contract_currency: "INR",
      onboarding_date: clientData.onboarding_date || new Date().toISOString().split("T")[0],
      notes: clientData.notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Auto-create initial finance agreement
    const newAgreement: ClientFinanceAgreement = {
      id: `fin-${newClient.id}`,
      client_id: newClient.id,
      client_name: newClient.name,
      service_purchased: "LinkedIn Outbound + Lead Qualification Retainer",
      agreed_contract_amount: newClient.agreed_contract_amount || 250000,
      currency: "INR",
      total_paid: 0,
      pending_amount: newClient.agreed_contract_amount || 250000,
      payment_due_date: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
      payment_status: "PENDING",
      contract_start_date: newClient.onboarding_date || new Date().toISOString().split("T")[0],
      contract_end_date: new Date(Date.now() + 86400000 * 90).toISOString().split("T")[0],
      reminders_sent_count: 0,
      payment_history: [],
      created_at: new Date().toISOString(),
    };

    globalState = {
      ...globalState,
      clients: [newClient, ...globalState.clients],
      financeAgreements: [newAgreement, ...globalState.financeAgreements],
    };
    notify();
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    globalState = {
      ...globalState,
      clients: globalState.clients.map((c) =>
        c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
      ),
    };
    notify();
  };

  const generateSalesPlaybook = (clientId: string) => {
    const client = globalState.clients.find((c) => c.id === clientId);
    if (!client) return;

    const playbook = {
      summary: `${client.name} solves core operational bottlenecks for ${client.industry} companies by delivering ${client.products_and_services || "specialized B2B capabilities"}.`,
      elevator_pitch: `We partner with ${client.target_industries?.[0] || "industry"} leaders to eliminate manual overhead and streamline execution with predictable ROI.`,
      target_decision_makers: client.target_job_titles || ["COO", "VP Operations", "Head of Tech"],
      top_pain_points: client.business_pain_points?.length
        ? client.business_pain_points
        : [
            "High manual headcount and operational review overhead",
            "Slowing sprint velocity or customer support turnaround",
            "Lack of specialized bandwidth for custom workflows",
          ],
      opening_message_angles: [
        `Hi {{first_name}}, noticed you're directing operations at {{company}}. Curious if peak ticket volume is putting pressure on your team this quarter?`,
        `Hi {{first_name}} — saw {{company}}'s recent growth in ${client.target_industries?.[0] || "the space"}. We recently helped a peer automate 60%+ of tier-1 inquiries. Would you be open to a 10-minute peer exchange?`,
      ],
      objection_handling: [
        {
          objection: "We already have an existing vendor/internal team for this.",
          counter:
            "Understood! Most clients we work with run hybrid setups where we handle overflow and complex automation without disrupting existing workflows.",
        },
        {
          objection: "We don't have budget until next fiscal year.",
          counter:
            "Completely fair. We often share our ROI calculation brief now so ops leaders can factor it into planning early. Worth a brief 10-minute preview?",
        },
      ],
      qualification_checklist: [
        `Company size matches ${client.target_company_sizes?.[0] || "50-500 FTEs"}`,
        `Identified decision-maker in ${client.target_job_titles?.[0] || "Leadership"}`,
        `Budget allocated within ${client.budget_range || "target range"}`,
      ],
      generated_at: new Date().toISOString(),
    };

    updateClient(clientId, { sales_playbook: playbook });
    return playbook;
  };

  const deleteClient = (id: string) => {
    globalState = {
      ...globalState,
      clients: globalState.clients.filter((c) => c.id !== id),
      campaigns: globalState.campaigns.filter((c) => c.client_id !== id),
      prospects: globalState.prospects.filter((p) => p.client_id !== id),
      deals: globalState.deals.filter((d) => d.client_id !== id),
      financeAgreements: globalState.financeAgreements.filter((f) => f.client_id !== id),
    };
    notify();
  };

  // 2. Campaign CRUD
  const addCampaign = (campData: Partial<Campaign>) => {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      client_id: campData.client_id || globalState.clients[0]?.id || "client-kf-ai",
      client_name:
        globalState.clients.find((c) => c.id === campData.client_id)?.name ||
        campData.client_name ||
        "Kinetic Flow AI",
      name: campData.name || "New Outreach Campaign",
      description: campData.description || "",
      objective: campData.objective || "Generate qualified pipeline leads.",
      channel: campData.channel || "LINKEDIN",
      status: campData.status || "DRAFT",
      target_audience: campData.target_audience || "",
      target_industry: campData.target_industry || "B2B SaaS",
      target_job_titles: campData.target_job_titles || ["VP of Operations"],
      target_geography: campData.target_geography || ["United States"],
      company_size: campData.company_size || "10-200 employees",
      icp_details: campData.icp_details || "",
      start_date: campData.start_date || new Date().toISOString().split("T")[0],
      end_date: campData.end_date,
      assigned_team_member_name: campData.assigned_team_member_name || "Marcus Chen",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const recalculated = computeCampaignMetrics(newCamp, globalState.prospects);
    globalState = {
      ...globalState,
      campaigns: [recalculated, ...globalState.campaigns],
    };
    notify();
    return recalculated;
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    globalState = {
      ...globalState,
      campaigns: globalState.campaigns.map((c) =>
        c.id === id
          ? computeCampaignMetrics(
              { ...c, ...updates, updated_at: new Date().toISOString() },
              globalState.prospects
            )
          : c
      ),
    };
    notify();
  };

  const deleteCampaign = (id: string) => {
    globalState = {
      ...globalState,
      campaigns: globalState.campaigns.filter((c) => c.id !== id),
    };
    notify();
  };

  // 3. Prospect CRUD & Lifecycle (15-Stages)
  const addProspect = (data: Partial<Prospect>) => {
    const firstName = data.first_name || "New";
    const lastName = data.last_name || "Prospect";
    const newProspect: Prospect = {
      id: `prospect-${Date.now()}`,
      client_id: data.client_id || globalState.clients[0]?.id || "client-kf-ai",
      client_name:
        globalState.clients.find((c) => c.id === data.client_id)?.name || "Kinetic Flow AI",
      campaign_id: data.campaign_id || globalState.campaigns[0]?.id,
      campaign_name:
        globalState.campaigns.find((c) => c.id === data.campaign_id)?.name ||
        "US FinTech & Logistics COO Outreach",
      assigned_team_member_name: data.assigned_team_member_name || globalState.currentUser.full_name,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`.trim(),
      job_title: data.job_title || "Decision Maker",
      company: data.company || "Company Inc",
      company_website: data.company_website || "",
      linkedin_url: data.linkedin_url || "https://linkedin.com",
      work_email: data.work_email || "",
      phone_number: data.phone_number || "",
      industry: data.industry || "B2B SaaS",
      location: data.location || "United States",
      company_size: data.company_size || "50-200 employees",
      company_description: data.company_description || "",
      lead_source: data.lead_source || "LINKEDIN",
      added_by_name: data.added_by_name || globalState.currentUser.full_name,
      reason_for_adding: data.reason_for_adding || "Target account decision-maker.",
      budget: data.budget || 1000000,
      deal_value: data.deal_value || 1000000,
      currency: data.currency || "INR",
      status: data.status || "NEW_LEAD",
      priority: data.priority || "MEDIUM",
      notes: data.notes || "",
      last_activity_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const nextProspects = [newProspect, ...globalState.prospects];
    const nextCampaigns = globalState.campaigns.map((c) =>
      computeCampaignMetrics(c, nextProspects)
    );

    // Record activity
    const activity: ProspectActivity = {
      id: `act-${Date.now()}`,
      prospect_id: newProspect.id,
      prospect_name: newProspect.full_name,
      user_name: globalState.currentUser.full_name,
      activity_type: "STAGE_CHANGED",
      new_stage: newProspect.status,
      notes: `Lead added from ${newProspect.lead_source}`,
      created_at: new Date().toISOString(),
    };

    globalState = {
      ...globalState,
      prospects: nextProspects,
      campaigns: nextCampaigns,
      activities: [activity, ...globalState.activities],
    };
    notify();
    return newProspect;
  };

  const updateProspect = (id: string, updates: Partial<Prospect>) => {
    let oldStage: string | undefined;
    const nextProspects = globalState.prospects.map((p) => {
      if (p.id !== id) return p;
      oldStage = p.status;
      const firstName = updates.first_name !== undefined ? updates.first_name : p.first_name;
      const lastName = updates.last_name !== undefined ? updates.last_name : p.last_name;
      const fullName = `${firstName} ${lastName}`.trim();
      return {
        ...p,
        ...updates,
        full_name: fullName,
        last_activity_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    const nextCampaigns = globalState.campaigns.map((c) =>
      computeCampaignMetrics(c, nextProspects)
    );

    // If stage changed, append activity log
    const updatedLead = nextProspects.find((p) => p.id === id);
    const newActivities = [...globalState.activities];
    if (updates.status && updates.status !== oldStage && updatedLead) {
      newActivities.unshift({
        id: `act-${Date.now()}`,
        prospect_id: id,
        prospect_name: updatedLead.full_name,
        user_name: globalState.currentUser.full_name,
        activity_type: "STAGE_CHANGED",
        previous_stage: oldStage,
        new_stage: updates.status,
        notes: `Stage advanced from ${oldStage} to ${updates.status}`,
        created_at: new Date().toISOString(),
      });
    }

    globalState = {
      ...globalState,
      prospects: nextProspects,
      campaigns: nextCampaigns,
      activities: newActivities,
    };
    notify();
  };

  const updateProspectStatus = (id: string, status: ProspectStatus) => {
    updateProspect(id, { status });
  };

  const batchUpdateProspectStatus = (ids: string[], newStatus: ProspectStatus) => {
    const nextProspects = globalState.prospects.map((p) =>
      ids.includes(p.id)
        ? {
            ...p,
            status: newStatus,
            last_activity_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : p
    );

    const nextCampaigns = globalState.campaigns.map((c) =>
      computeCampaignMetrics(c, nextProspects)
    );

    globalState = {
      ...globalState,
      prospects: nextProspects,
      campaigns: nextCampaigns,
    };
    notify();
  };

  const deleteProspect = (id: string) => {
    const nextProspects = globalState.prospects.filter((p) => p.id !== id);
    const nextCampaigns = globalState.campaigns.map((c) =>
      computeCampaignMetrics(c, nextProspects)
    );

    globalState = {
      ...globalState,
      prospects: nextProspects,
      campaigns: nextCampaigns,
      deals: globalState.deals.filter((d) => d.prospect_id !== id),
    };
    notify();
  };

  // 4. Deals & Sales Pipeline (Section 4)
  const addDeal = (data: Partial<Deal>) => {
    const dealName = data.name || data.title || "New Opportunity";
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      name: dealName,
      title: dealName,
      client_id: data.client_id || globalState.clients[0]?.id || "client-kf-ai",
      client_name:
        globalState.clients.find((c) => c.id === data.client_id)?.name || "Kinetic Flow AI",
      prospect_id: data.prospect_id || "prospect-kf-01",
      prospect_name: data.prospect_name || "Decision Maker",
      prospect_company: data.prospect_company || "Enterprise Account",
      owner_name: data.owner_name || globalState.currentUser.full_name,
      service_offered: data.service_offered || data.service_sold || "Outreach & Automation Services",
      service_sold: data.service_sold || data.service_offered || "Outreach & Automation Services",
      expected_value: Number(data.expected_value) || 1000000,
      customer_budget: Number(data.customer_budget) || 1000000,
      currency: data.currency || "INR",
      expected_close_date:
        data.expected_close_date ||
        data.expected_closing_date ||
        new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
      expected_closing_date:
        data.expected_closing_date ||
        data.expected_close_date ||
        new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
      stage: data.stage || "QUALIFIED_OPPORTUNITY",
      probability: Number(data.probability) || 50,
      status: "OPEN",
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    globalState = {
      ...globalState,
      deals: [newDeal, ...globalState.deals],
    };
    notify();
    return newDeal;
  };

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    globalState = {
      ...globalState,
      deals: globalState.deals.map((d) => {
        if (d.id !== id) return d;
        let finalStatus = d.status;
        if (updates.stage === "DEAL_WON") finalStatus = "WON";
        if (updates.stage === "DEAL_LOST") finalStatus = "LOST";
        return {
          ...d,
          ...updates,
          status: finalStatus,
          updated_at: new Date().toISOString(),
        };
      }),
    };
    notify();
  };

  const updateDealStage = (id: string, stage: DealStage, lostReason?: string) => {
    updateDeal(id, {
      stage,
      lost_reason: lostReason,
      reason_lost: lostReason,
    });
  };

  const deleteDeal = (id: string) => {
    globalState = {
      ...globalState,
      deals: globalState.deals.filter((d) => d.id !== id),
    };
    notify();
  };

  const convertLeadToDeal = (prospectId: string, dealName: string, expectedValue: number) => {
    const prospect = globalState.prospects.find((p) => p.id === prospectId);
    if (!prospect) return;

    const newDeal = addDeal({
      name: dealName || `${prospect.company} - Expansion Deal`,
      client_id: prospect.client_id,
      client_name: prospect.client_name,
      prospect_id: prospect.id,
      prospect_name: prospect.full_name,
      prospect_company: prospect.company,
      expected_value: expectedValue || prospect.deal_value || 1000000,
      customer_budget: prospect.budget || expectedValue || 1000000,
      currency: prospect.currency || "INR",
      stage: "PROPOSAL_SENT",
      probability: 60,
    });

    updateProspect(prospectId, { status: "PROPOSAL_SENT" });
    return newDeal;
  };

  // 5. Internal Finance & Invoices (Section 6)
  const recordPayment = (
    agreementId: string,
    amount: number,
    method: "BANK_TRANSFER" | "UPI" | "STRIPE" | "WIRE",
    refId: string,
    notes?: string
  ) => {
    const agreement = globalState.financeAgreements.find((f) => f.id === agreementId);
    if (!agreement) return;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      client_id: agreement.client_id,
      amount,
      currency: agreement.currency,
      payment_method: method,
      reference_id: refId,
      paid_at: new Date().toISOString(),
      recorded_by: globalState.currentUser.full_name,
      notes,
    };

    const nextPaid = agreement.total_paid + amount;
    const nextPending = Math.max(0, agreement.agreed_contract_amount - nextPaid);
    const nextStatus = nextPending === 0 ? "PAID" : "PARTIALLY_PAID";

    globalState = {
      ...globalState,
      financeAgreements: globalState.financeAgreements.map((f) =>
        f.id === agreementId
          ? {
              ...f,
              total_paid: nextPaid,
              pending_amount: nextPending,
              payment_status: nextStatus,
              payment_history: [newPayment, ...f.payment_history],
            }
          : f
      ),
    };
    notify();
  };

  const sendPaymentReminder = (agreementId: string) => {
    globalState = {
      ...globalState,
      financeAgreements: globalState.financeAgreements.map((f) =>
        f.id === agreementId
          ? {
              ...f,
              reminders_sent_count: f.reminders_sent_count + 1,
              last_reminder_date: new Date().toISOString(),
            }
          : f
      ),
    };
    notify();
  };

  const generateInvoice = (data: Partial<Invoice>) => {
    const subtotal = data.items?.reduce((sum, item) => sum + item.amount, 0) || 100000;
    const taxRate = data.tax_rate !== undefined ? data.tax_rate : 18;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoice_number: data.invoice_number || `LS-2026-${Math.floor(100 + Math.random() * 900)}`,
      client_id: data.client_id || globalState.clients[0]?.id || "client-kf-ai",
      client_name:
        globalState.clients.find((c) => c.id === data.client_id)?.name || "Kinetic Flow AI",
      client_billing_address: data.client_billing_address || "Registered Corporate Office",
      client_gstin: data.client_gstin,
      client_email: data.client_email || "billing@client.com",
      invoice_date: data.invoice_date || new Date().toISOString().split("T")[0],
      due_date: data.due_date || new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
      items: data.items || [
        {
          id: `item-${Date.now()}`,
          description: "Outbound Campaign Retainer & Qualified Lead Generation",
          quantity: 1,
          unit_price: subtotal,
          amount: subtotal,
        },
      ],
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: total,
      currency: "INR",
      payment_instructions:
        "Please remit payment to LeadScorpio Operations Account: HDFC Bank, A/C: 50200012345678, IFSC: HDFC0000123.",
      status: data.status || "SENT",
      created_at: new Date().toISOString(),
    };

    globalState = {
      ...globalState,
      invoices: [newInvoice, ...globalState.invoices],
    };
    notify();
    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: "DRAFT" | "SENT" | "PAID" | "OVERDUE") => {
    globalState = {
      ...globalState,
      invoices: globalState.invoices.map((inv) => (inv.id === id ? { ...inv, status } : inv)),
    };
    notify();
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    globalState = {
      ...globalState,
      invoices: globalState.invoices.map((inv) =>
        inv.id === id ? { ...inv, ...updates } : inv
      ),
    };
    notify();
  };

  const deleteInvoice = (id: string) => {
    globalState = {
      ...globalState,
      invoices: globalState.invoices.filter((inv) => inv.id !== id),
    };
    notify();
  };

  const addFinanceAgreement = (agreementData: Partial<ClientFinanceAgreement>) => {
    const amount = agreementData.agreed_contract_amount || 0;
    const newAgreement: ClientFinanceAgreement = {
      id: `fin-${Date.now()}`,
      client_id: agreementData.client_id || (globalState.clients[0]?.id ?? ""),
      client_name: agreementData.client_name || globalState.clients.find((c) => c.id === agreementData.client_id)?.name || "Client",
      agreed_contract_amount: amount,
      total_contract_value: agreementData.total_contract_value || amount,
      currency: "INR",
      billing_cycle: (agreementData.billing_cycle as any) || "MONTHLY",
      pricing_model: agreementData.pricing_model || "Monthly Retainer",
      total_paid: agreementData.total_paid || 0,
      pending_amount: amount - (agreementData.total_paid || 0),
      service_purchased: agreementData.service_purchased || "LinkedIn Outbound Retainer",
      contract_start_date: agreementData.contract_start_date || new Date().toISOString().slice(0, 10),
      contract_end_date: agreementData.contract_end_date || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      payment_status: (agreementData.payment_status as any) || "PENDING",
      payment_due_date: agreementData.payment_due_date || new Date().toISOString().slice(0, 10),
      next_payment_due: agreementData.next_payment_due || agreementData.payment_due_date || new Date().toISOString().slice(0, 10),
      payment_history: [],
      reminders_sent_count: 0,
      notes: agreementData.notes || "",
      created_at: new Date().toISOString(),
    };
    globalState = {
      ...globalState,
      financeAgreements: [newAgreement, ...globalState.financeAgreements],
    };
    notify();
    return newAgreement;
  };

  const updateFinanceAgreement = (id: string, updates: Partial<ClientFinanceAgreement>) => {
    globalState = {
      ...globalState,
      financeAgreements: globalState.financeAgreements.map((f) => {
        if (f.id !== id) return f;
        const updated = { ...f, ...updates };
        if (updates.agreed_contract_amount !== undefined || updates.total_paid !== undefined) {
          const totalAmt = updates.agreed_contract_amount !== undefined ? updates.agreed_contract_amount : f.agreed_contract_amount;
          const paidAmt = updates.total_paid !== undefined ? updates.total_paid : f.total_paid;
          updated.pending_amount = Math.max(0, totalAmt - paidAmt);
          if (updated.pending_amount === 0 && paidAmt > 0) updated.payment_status = "PAID";
          else if (paidAmt > 0) updated.payment_status = "PARTIALLY_PAID";
        }
        return updated;
      }),
    };
    notify();
  };

  const deleteFinanceAgreement = (id: string) => {
    globalState = {
      ...globalState,
      financeAgreements: globalState.financeAgreements.filter((f) => f.id !== id),
    };
    notify();
  };

  // 6. Automated Weekly Reports (Section 7)
  const generateWeeklyReport = (
    clientId: string,
    periodStartOrCampaignId?: string,
    periodEnd?: string
  ) => {
    const client = globalState.clients.find((c) => c.id === clientId);
    if (!client) return null as any;

    const camp =
      globalState.campaigns.find((c) => c.id === periodStartOrCampaignId) ||
      globalState.campaigns.find((c) => c.client_id === clientId);
    const clientProspects = globalState.prospects.filter((p) => p.client_id === clientId);
    const clientDeals = globalState.deals.filter((d) => d.client_id === clientId);
    const clientMeetings = globalState.meetings.filter((m) => m.client_id === clientId);

    const pipeVal = clientDeals.reduce((sum, d) => sum + d.expected_value, 0);
    const wonVal = clientDeals
      .filter((d) => d.status === "WON")
      .reduce((sum, d) => sum + (d.final_value || d.final_deal_value || d.expected_value), 0);

    const periodLabel = periodEnd
      ? `${periodStartOrCampaignId} to ${periodEnd}`
      : `Week of ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    const report: WeeklyReport = {
      id: `wr-${Date.now()}`,
      client_id: clientId,
      client_name: client.name,
      campaign_id: camp?.id,
      campaign_name: camp?.name,
      report_title: `Weekly Outbound Dossier — ${client.name}`,
      reporting_period: periodLabel,
      period_start: periodEnd ? periodStartOrCampaignId : "2026-11-10",
      period_end: periodEnd || "2026-11-16",
      generated_at: new Date().toISOString(),
      generated_by: globalState.currentUser.full_name,
      prepared_by: globalState.currentUser.full_name,
      metrics: {
        conn_sent: camp?.connection_requests_sent || 35,
        conn_accepted: camp?.connections_accepted || 15,
        opening_sent: camp?.messages_sent || 14,
        followups_sent: 22,
        replies: camp?.replies_count || 6,
        reply_rate: camp?.reply_rate || 42,
        positive_replies: camp?.positive_replies_count || 3,
        neutral_replies: 2,
        negative_replies: 1,
        interested_leads: clientProspects.filter((p) => p.status === "INTERESTED").length || 2,
        qualified_leads: clientProspects.filter((p) => p.status === "QUALIFIED" || p.status === "MEETING_BOOKED").length || 2,
        meetings_booked: clientMeetings.length,
        meetings_attended: clientMeetings.filter((m) => m.status === "ATTENDED" || m.status === "CONFIRMED").length,
        meetings_no_show: clientMeetings.filter((m) => m.status === "NO_SHOW").length,
        deals_created: clientDeals.length,
        deals_won: clientDeals.filter((d) => d.status === "WON").length,
        pipeline_value: pipeVal,
        won_value: wonVal,
      },
      outreach_metrics: {
        connection_requests_sent: camp?.connection_requests_sent || 35,
        connection_requests_accepted: camp?.connections_accepted || 15,
        acceptance_rate: camp?.acceptance_rate || 43,
        opening_messages_sent: camp?.messages_sent || 14,
        replies_received: camp?.replies_count || 6,
        reply_rate: camp?.reply_rate || 42,
      },
      reply_classification: {
        positive: camp?.positive_replies_count || 3,
        negative: 1,
        neutral: 2,
        interested: clientProspects.filter((p) => p.status === "INTERESTED").length || 2,
        not_interested: 1,
        out_of_office: 0,
        other: 0,
      },
      meeting_metrics: {
        booked: clientMeetings.length,
        attended: clientMeetings.filter((m) => m.status === "ATTENDED" || m.status === "CONFIRMED").length,
        no_show: clientMeetings.filter((m) => m.status === "NO_SHOW").length,
        qualified: clientProspects.filter((p) => p.status === "QUALIFIED").length || 1,
      },
      deal_metrics: {
        pipeline_value_generated: pipeVal,
        deals_won_count: clientDeals.filter((d) => d.status === "WON").length,
        total_won_value: wonVal,
      },
      strategy_observations: `Executive messaging emphasizing ${client.products_and_services?.slice(0, 50) || "core solution"} continues to yield high acceptance across ${client.target_industries?.[0] || "B2B"} decision-makers.`,
      observations: `Executive messaging emphasizing ${client.products_and_services?.slice(0, 50) || "core solution"} continues to yield high acceptance across ${client.target_industries?.[0] || "B2B"} decision-makers.`,
      challenges: "Follow-up response latency averages 48 hours; introducing mid-week check-in touchpoint.",
      next_week_action_plan: `1. Expand target pool with 40 new verified leads.\n2. Execute Follow-up #2 sequence.\n3. Assist client with qualification brief handoff.`,
      action_plan: `1. Expand target pool with 40 new verified leads.\n2. Execute Follow-up #2 sequence.\n3. Assist client with qualification brief handoff.`,
      shared_with_client: true,
      is_shared_with_client: true,
    };

    globalState = {
      ...globalState,
      weeklyReports: [report, ...globalState.weeklyReports],
    };
    notify();
    return report;
  };

  const toggleShareWeeklyReport = (id: string) => {
    globalState = {
      ...globalState,
      weeklyReports: globalState.weeklyReports.map((r) =>
        r.id === id
          ? {
              ...r,
              shared_with_client: !r.shared_with_client,
              is_shared_with_client: !r.shared_with_client,
            }
          : r
      ),
    };
    notify();
  };

  const deleteWeeklyReport = (id: string) => {
    globalState = {
      ...globalState,
      weeklyReports: globalState.weeklyReports.filter((r) => r.id !== id),
    };
    notify();
  };

  // 7. Meetings
  const addMeeting = (data: Partial<Meeting>) => {
    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`,
      client_id: data.client_id || "client-kf-ai",
      client_name: data.client_name || "Kinetic Flow AI",
      prospect_id: data.prospect_id || "prospect-kf-01",
      prospect_name: data.prospect_name || "Sarah Jenkins",
      prospect_company: data.prospect_company || "Apex Freight Systems",
      title: data.title || "Executive Discovery Call",
      meeting_type: data.meeting_type || "DISCOVERY",
      scheduled_at: data.scheduled_at || new Date(Date.now() + 86400000 * 3).toISOString(),
      duration_minutes: data.duration_minutes || 30,
      meeting_url: data.meeting_url || "https://calendly.com/leadscorpioofficial/30min",
      meeting_owner_name: data.meeting_owner_name || globalState.currentUser.full_name,
      status: data.status || "CONFIRMED",
      is_qualified: data.is_qualified !== undefined ? data.is_qualified : true,
      qualification_notes: data.qualification_notes || "",
      feedback: data.feedback || "",
      next_steps: data.next_steps || "",
      booked_by_name: data.booked_by_name || "Marcus Chen",
      created_at: new Date().toISOString(),
    };

    globalState = {
      ...globalState,
      meetings: [newMeeting, ...globalState.meetings],
    };
    notify();
    return newMeeting;
  };

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    globalState = {
      ...globalState,
      meetings: globalState.meetings.map((m) => (m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m)),
    };
    notify();
  };

  // 8. Conversations, Tasks, Approvals, Requests
  const recordManualMessage = (
    conversationId: string,
    content: string,
    direction: "OUTBOUND" | "INBOUND",
    sentiment?: ResponseSentiment
  ) => {
    const conv = globalState.conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId,
      direction,
      sender_name:
        direction === "OUTBOUND" ? "LeadScorpio Operator" : conv.prospect_name,
      content,
      is_manual_entry: true,
      sentiment,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const updatedConvs = globalState.conversations.map((c) => {
      if (c.id !== conversationId) return c;
      return {
        ...c,
        last_message_at: new Date().toISOString(),
        last_message_preview: content.slice(0, 100),
        last_response_sentiment: sentiment || c.last_response_sentiment,
        messages: [...c.messages, newMessage],
      };
    });

    globalState = {
      ...globalState,
      conversations: updatedConvs,
    };
    notify();
  };

  const addTask = (data: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: data.title || "New Task",
      description: data.description || "",
      assigned_to_name: data.assigned_to_name || "Marcus Chen",
      client_name: data.client_name || "Kinetic Flow AI",
      client_id: data.client_id || "client-kf-ai",
      priority: data.priority || "MEDIUM",
      status: data.status || "TODO",
      due_date: data.due_date || new Date(Date.now() + 86400000 * 2).toISOString(),
      created_at: new Date().toISOString(),
    };

    globalState = {
      ...globalState,
      tasks: [newTask, ...globalState.tasks],
    };
    notify();
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    globalState = {
      ...globalState,
      tasks: globalState.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    };
    notify();
  };

  const toggleTaskStatus = (id: string) => {
    globalState = {
      ...globalState,
      tasks: globalState.tasks.map((t) => {
        if (t.id !== id) return t;
        const newStatus = t.status === "COMPLETED" ? "TODO" : "COMPLETED";
        return {
          ...t,
          status: newStatus,
          completed_at: newStatus === "COMPLETED" ? new Date().toISOString() : undefined,
        };
      }),
    };
    notify();
  };

  const deleteTask = (id: string) => {
    globalState = {
      ...globalState,
      tasks: globalState.tasks.filter((t) => t.id !== id),
    };
    notify();
  };

  const reviewApproval = (id: string, status: ApprovalStatus, feedbackComment?: string) => {
    globalState = {
      ...globalState,
      approvals: globalState.approvals.map((a) => {
        if (a.id !== id) return a;
        const commentObj = feedbackComment
          ? [
              ...a.comments,
              {
                id: `comm-${Date.now()}`,
                approval_id: id,
                user_name: globalState.currentUser.full_name,
                user_role: globalState.currentUser.role,
                comment: feedbackComment,
                created_at: new Date().toISOString(),
              },
            ]
          : a.comments;

        return {
          ...a,
          status,
          reviewed_by_name: globalState.currentUser.full_name,
          reviewed_at: new Date().toISOString(),
          feedback_comment: feedbackComment || a.feedback_comment,
          comments: commentObj,
          updated_at: new Date().toISOString(),
        };
      }),
    };
    notify();
  };

  const addClientRequest = (data: Partial<ClientRequest>) => {
    const newReq: ClientRequest = {
      id: `req-${Date.now()}`,
      client_id: data.client_id || globalState.currentUser.organization_id || "client-kf-ai",
      client_name:
        globalState.clients.find(
          (c) => c.id === (data.client_id || globalState.currentUser.organization_id)
        )?.name || "Kinetic Flow AI",
      title: data.title || "Campaign Request",
      category: data.category || "GENERAL_QUESTION",
      description: data.description || "",
      priority: data.priority || "MEDIUM",
      status: "OPEN",
      submitted_by_name: globalState.currentUser.full_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    globalState = {
      ...globalState,
      clientRequests: [newReq, ...globalState.clientRequests],
    };
    notify();
    return newReq;
  };

  const updateClientRequestStatus = (id: string, status: ClientRequestStatus, resolutionNotes?: string) => {
    globalState = {
      ...globalState,
      clientRequests: globalState.clientRequests.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              resolution_notes: resolutionNotes || r.resolution_notes,
              updated_at: new Date().toISOString(),
            }
          : r
      ),
    };
    notify();
  };

  const markNotificationRead = (id: string) => {
    globalState = {
      ...globalState,
      notifications: globalState.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
    };
    notify();
  };

  const markAllNotificationsRead = () => {
    globalState = {
      ...globalState,
      notifications: globalState.notifications.map((n) => ({ ...n, is_read: true })),
    };
    notify();
  };

  const flagProspectClientFeedback = (id: string, isFlagged: boolean, feedbackNotes: string) => {
    updateProspect(id, {
      is_flagged_by_client: isFlagged,
      client_feedback_notes: feedbackNotes,
    });
  };

  const addUser = (userData: Partial<UserProfile>) => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: userData.email || "",
      full_name: userData.full_name || "New Team Member",
      role: userData.role || "TEAM_MEMBER",
      phone: userData.phone || "",
      organization_id: userData.organization_id || "org-leadscorpio-hq",
      created_at: new Date().toISOString(),
    };
    globalState = {
      ...globalState,
      users: [...globalState.users, newUser],
    };
    notify();
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<UserProfile>) => {
    globalState = {
      ...globalState,
      users: globalState.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      currentUser:
        globalState.currentUser.id === id
          ? { ...globalState.currentUser, ...updates }
          : globalState.currentUser,
    };
    notify();
  };

  const deleteUser = (id: string) => {
    globalState = {
      ...globalState,
      users: globalState.users.filter((u) => u.id !== id),
    };
    notify();
  };

  const clearAllData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    globalState = {
      currentUser: INITIAL_USERS[0],
      users: INITIAL_USERS,
      clients: [],
      campaigns: [],
      prospects: [],
      deals: [],
      meetings: [],
      financeAgreements: [],
      invoices: [],
      weeklyReports: [],
      activities: [],
      tasks: [],
      approvals: [],
      clientRequests: [],
      conversations: [],
      notifications: [],
      internalNotes: [],
      documents: [],
    };
    notify();
  };

  return {
    state,
    currentUser: state.currentUser,
    users: state.users,
    clients: state.clients,
    campaigns: state.campaigns,
    prospects: state.prospects,
    deals: state.deals,
    meetings: state.meetings,
    financeAgreements: state.financeAgreements,
    invoices: state.invoices,
    weeklyReports: state.weeklyReports,
    activities: state.activities,
    tasks: state.tasks,
    approvals: state.approvals,
    clientRequests: state.clientRequests,
    conversations: state.conversations,
    notifications: state.notifications,
    internalNotes: state.internalNotes,
    documents: state.documents,

    // Methods
    setCurrentUser,
    resetToDemoData,
    clearAllData,
    addUser,
    updateUser,
    deleteUser,
    addClient,
    updateClient,
    deleteClient,
    generateSalesPlaybook,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    addProspect,
    updateProspect,
    updateProspectStatus,
    batchUpdateProspectStatus,
    deleteProspect,
    flagProspectClientFeedback,
    addDeal,
    updateDeal,
    updateDealStage,
    deleteDeal,
    convertLeadToDeal,
    addMeeting,
    updateMeeting,
    addFinanceAgreement,
    updateFinanceAgreement,
    deleteFinanceAgreement,
    recordPayment,
    sendPaymentReminder,
    generateInvoice,
    createInvoice: generateInvoice,
    updateInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    generateWeeklyReport,
    toggleShareWeeklyReport,
    deleteWeeklyReport,
    recordManualMessage,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
    reviewApproval,
    addClientRequest,
    updateClientRequestStatus,
    markNotificationRead,
    markAllNotificationsRead,
  };
}
