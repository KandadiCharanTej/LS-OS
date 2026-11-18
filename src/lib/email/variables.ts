// ============================================================================
// LEADSCORPIO CRM — EMAIL PERSONALIZATION & VARIABLES ENGINE
// ============================================================================

export interface VariableDefinition {
  key: string;
  label: string;
  category: "RECIPIENT" | "ORGANIZATION" | "SERVICE" | "MEETING" | "FINANCE" | "SENDER";
  sampleValue: string;
  description: string;
}

export const AVAILABLE_VARIABLES: VariableDefinition[] = [
  // Recipient / Lead
  { key: "{{first_name}}", label: "First Name", category: "RECIPIENT", sampleValue: "Sarah", description: "Recipient's first name" },
  { key: "{{last_name}}", label: "Last Name", category: "RECIPIENT", sampleValue: "Jenkins", description: "Recipient's last name" },
  { key: "{{full_name}}", label: "Full Name", category: "RECIPIENT", sampleValue: "Sarah Jenkins", description: "Recipient's complete name" },
  { key: "{{company_name}}", label: "Company Name", category: "RECIPIENT", sampleValue: "Acme Logistics", description: "Recipient's organization name" },
  { key: "{{job_title}}", label: "Job Title", category: "RECIPIENT", sampleValue: "VP of Operations", description: "Recipient's professional title" },

  // Client / Project
  { key: "{{client_name}}", label: "Client Workspace", category: "ORGANIZATION", sampleValue: "TechSphere Dynamics", description: "Associated LeadScorpio client" },
  { key: "{{service_name}}", label: "Service / Plan", category: "SERVICE", sampleValue: "B2B Outbound Lead Engine", description: "Outbound package name" },

  // Meetings
  { key: "{{meeting_date}}", label: "Meeting Date", category: "MEETING", sampleValue: "Thursday, Nov 26, 2026", description: "Scheduled meeting date" },
  { key: "{{meeting_time}}", label: "Meeting Time", category: "MEETING", sampleValue: "03:30 PM IST", description: "Scheduled meeting time" },
  { key: "{{meeting_url}}", label: "Meeting Link", category: "MEETING", sampleValue: "https://meet.google.com/ls-demo", description: "Video conference link" },

  // Finance & Invoices
  { key: "{{invoice_number}}", label: "Invoice Number", category: "FINANCE", sampleValue: "INV-2026-0042", description: "Generated tax invoice code" },
  { key: "{{invoice_amount}}", label: "Invoice Amount", category: "FINANCE", sampleValue: "₹85,000", description: "Total billing amount in INR" },
  { key: "{{payment_due_date}}", label: "Payment Due Date", category: "FINANCE", sampleValue: "Nov 30, 2026", description: "Due date for invoice or retainer" },

  // Sender / LeadScorpio Staff
  { key: "{{sender_name}}", label: "Sender Name", category: "SENDER", sampleValue: "Charan Tej", description: "Name of the sending operator" },
  { key: "{{sender_email}}", label: "Sender Email", category: "SENDER", sampleValue: "leadscorpioofficial@gmail.com", description: "Sender's email address" },
  { key: "{{unsubscribe_link}}", label: "Unsubscribe Link", category: "ORGANIZATION", sampleValue: "https://leadscorpio.com/unsubscribe", description: "Compliance opt-out URL" },
];

/**
 * Replace all {{key}} placeholders in string with context values.
 */
export function renderEmailVariables(
  templateText: string,
  context: Record<string, string | number | undefined | null>
): string {
  if (!templateText) return "";

  let result = templateText;

  // Replace each known variable
  for (const v of AVAILABLE_VARIABLES) {
    const rawKey = v.key.replace(/[{}]/g, "");
    const val = context[rawKey] !== undefined && context[rawKey] !== null
      ? String(context[rawKey])
      : undefined;

    if (val !== undefined) {
      const regex = new RegExp(`\\{\\{${rawKey}\\}\\}`, "gi");
      result = result.replace(regex, val);
    }
  }

  // Also replace any generic key matching {{anything}}
  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined && value !== null) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
      result = result.replace(regex, String(value));
    }
  }

  return result;
}

/**
 * Find all unpopulated {{placeholders}} remaining in content.
 */
export function findUnresolvedVariables(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/\{\{([a-zA-Z0-9_]+)\}\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches));
}

/**
 * Basic HTML sanitizer to strip dangerous script tags and event handlers.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}
