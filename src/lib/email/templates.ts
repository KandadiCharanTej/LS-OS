import { EmailTemplate } from "@/types/crm";

export const LOGO_URL = "https://leadscorpio.vercel.app/logo-white.png";
export const WEBSITE_URL = "https://leadscorpio.vercel.app/";

interface EmailLayoutOptions {
  title: string;
  previewText?: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  isMarketing?: boolean;
}

/**
 * Standard LeadScorpio Responsive Corporate Email Wrapper
 * Brand Identity:
 * - Deep Navy: #071934
 * - Copper/Orange: #F15A24 / #C65D2E
 * - Warm White: #FAF9F6
 */
export function wrapEmailHtml({
  title,
  previewText = "",
  bodyHtml,
  ctaText,
  ctaUrl = WEBSITE_URL,
  isMarketing = false,
}: EmailLayoutOptions): string {
  const ctaBlock = ctaText
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px 0 20px;">
        <tr>
          <td align="center" style="border-radius: 9999px; background-color: #F15A24;">
            <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 13px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #FFFFFF; text-decoration: none; border-radius: 9999px; letter-spacing: 0.3px;">
              ${ctaText}
            </a>
          </td>
        </tr>
      </table>
    `
    : "";

  const complianceFooter = isMarketing
    ? `
      <p style="margin: 10px 0 0; font-size: 11px; color: #A0AEC0;">
        You are receiving this communication because you engaged with LeadScorpio services. 
        <a href="{{unsubscribe_link}}" target="_blank" rel="noopener noreferrer" style="color: #F15A24; text-decoration: underline;">Unsubscribe from marketing emails</a>.
      </p>
    `
    : `
      <p style="margin: 10px 0 0; font-size: 11px; color: #A0AEC0;">
        This is a transactional communication related to your LeadScorpio account and active outbound operations.
      </p>
    `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF9F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #071934; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { border: 0; display: block; outline: none; text-decoration: none; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid rgba(7, 25, 52, 0.08); border-radius: 16px; overflow: hidden; }
    @media only screen and (max-width: 600px) {
      .email-container { border-radius: 0 !important; border: none !important; }
      .content-cell { padding: 28px 20px 24px !important; }
      .header-cell { padding: 24px 20px !important; }
      .footer-cell { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #FAF9F6;">
  ${previewText ? `<div style="display:none;font-size:1px;color:#FAF9F6;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF9F6;">
    <tr>
      <td align="center">
        <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #ECEBE7; box-shadow: 0 4px 20px rgba(7, 25, 52, 0.04);">
          <!-- Header (Deep Navy #071934) -->
          <tr>
            <td class="header-cell" style="background-color: #071934; padding: 32px 32px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${WEBSITE_URL}" target="_blank" rel="noopener noreferrer">
                      <img src="${LOGO_URL}" alt="LeadScorpio Logo" width="180" height="52" style="width: 180px; height: auto; max-width: 100%; display: block; margin: 0 auto;" />
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td class="content-cell" style="padding: 38px 32px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.65; color: #2D3748;">
              ${bodyHtml}
              ${ctaBlock}
              
              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #EDF2F7;">
                <p style="margin: 0; font-size: 14px; color: #071934; line-height: 1.5;">
                  Best regards,<br>
                  <strong>{{sender_name}}</strong><br>
                  <span style="font-size: 12.5px; color: #718096;">LeadScorpio B2B Outbound Operations</span>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td class="footer-cell" style="background-color: #FAF9F6; border-top: 1px solid rgba(7, 25, 52, 0.06); padding: 24px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #718096; line-height: 1.55;">
              <p style="margin: 0 0 6px; font-weight: 600; color: #071934;">
                LeadScorpio Outbound Growth Systems
              </p>
              <p style="margin: 0 0 6px;">
                © ${new Date().getFullYear()} LeadScorpio. Turn Your Ideal Customers Into Qualified Sales Conversations.
              </p>
              <p style="margin: 0;">
                <a href="${WEBSITE_URL}" target="_blank" rel="noopener noreferrer" style="color: #F15A24; text-decoration: none; font-weight: 600;">Visit Website</a> &nbsp;•&nbsp; 
                <a href="mailto:{{sender_email}}" style="color: #718096; text-decoration: underline;">Support</a>
              </p>
              ${complianceFooter}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================================
// 12 INITIAL PROFESSIONAL EMAIL TEMPLATES
// ============================================================================

export const INITIAL_EMAIL_TEMPLATES: EmailTemplate[] = [
  // 1. Welcome to LeadScorpio
  {
    id: "tpl-welcome",
    name: "Welcome to LeadScorpio",
    category: "ONBOARDING",
    subject: "Welcome to LeadScorpio — Building Your High-Performing Outbound Engine",
    preview_text: "Welcome aboard! Here is everything you need to know to get started.",
    html_content: wrapEmailHtml({
      title: "Welcome to LeadScorpio",
      previewText: "Welcome aboard! Here is how we build your outbound pipeline.",
      bodyHtml: `
        <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700; color: #071934;">
          Welcome to LeadScorpio, {{first_name}}!
        </h2>
        <p style="margin-top: 0; margin-bottom: 16px;">
          We are thrilled to welcome <strong>{{company_name}}</strong> to the LeadScorpio family. Our mission is clear: transform your outbound operations into a predictable, qualified revenue pipeline.
        </p>
        <div style="background-color: #FAF9F6; border-left: 4px solid #F15A24; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; font-size: 14.5px; color: #071934; font-weight: 600;">
            What happens next:
          </p>
          <ul style="margin: 8px 0 0; padding-left: 20px; font-size: 14px; color: #4A5568; line-height: 1.6;">
            <li>ICP & Target Persona Calibration</li>
            <li>LinkedIn Outreach Infrastructure Setup</li>
            <li>Custom Multi-touch Copywriting Approval</li>
            <li>Live Campaign Launch & Weekly Metric Reporting</li>
          </ul>
        </div>
        <p style="margin-bottom: 16px;">
          You can track every prospect, campaign metric, and booked meeting anytime through your dedicated Client Portal.
        </p>
      `,
      ctaText: "Open Client Portal",
      ctaUrl: "https://leadscorpio.vercel.app/portal",
    }),
    text_content: `Welcome to LeadScorpio, {{first_name}}!\n\nWe are thrilled to welcome {{company_name}} to LeadScorpio. Our mission is to transform your outbound operations into a predictable pipeline.\n\nNext Steps:\n1. ICP & Target Persona Calibration\n2. LinkedIn Outreach Infrastructure Setup\n3. Copywriting Approval\n4. Live Campaign Launch\n\nLog in to your portal: https://leadscorpio.vercel.app/portal\n\nBest regards,\n{{sender_name}}\nLeadScorpio`,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 2. Client Onboarding
  {
    id: "tpl-client-onboarding",
    name: "Client Onboarding & Kickoff",
    category: "ONBOARDING",
    subject: "Kickoff Brief & Onboarding Checklist for {{client_name}}",
    preview_text: "Please complete our brief 5-minute kickoff questionnaire.",
    html_content: wrapEmailHtml({
      title: "Client Kickoff & Onboarding",
      previewText: "Please complete our brief kickoff questionnaire.",
      bodyHtml: `
        <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700; color: #071934;">
          Let's Calibrate Your Outbound Engine, {{first_name}}
        </h2>
        <p style="margin-top: 0; margin-bottom: 16px;">
          To ensure maximum precision and response rates for <strong>{{client_name}}</strong>, we need a few details regarding your ideal customer profile (ICP) and value proposition.
        </p>
        <div style="background-color: #FAF9F6; border: 1px dashed #CBD5E0; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px; font-weight: 600; color: #071934;">Checklist Items:</p>
          <p style="margin: 0 0 6px; font-size: 14px; color: #4A5568;">✅ Provide target geography & company size range</p>
          <p style="margin: 0 0 6px; font-size: 14px; color: #4A5568;">✅ Confirm target decision-maker titles (e.g. VP Operations, COO)</p>
          <p style="margin: 0; font-size: 14px; color: #4A5568;">✅ Share past messaging collateral or sales one-pagers</p>
        </div>
        <p>Please review and submit your brief so our strategy team can finalize your opening campaign.</p>
      `,
      ctaText: "Complete Kickoff Form",
      ctaUrl: "https://leadscorpio.vercel.app/portal/requests",
    }),
    text_content: `Hi {{first_name}},\n\nTo ensure maximum precision and response rates for {{client_name}}, please review our onboarding checklist.\n\nComplete Kickoff Form: https://leadscorpio.vercel.app/portal/requests\n\nBest regards,\n{{sender_name}}`,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 3. Service Introduction
  {
    id: "tpl-service-intro",
    name: "Service Introduction",
    category: "SALES",
    subject: "Scaling Qualified B2B Pipeline for {{company_name}}",
    preview_text: "How LeadScorpio drives executive meetings for B2B founders.",
    html_content: wrapEmailHtml({
      title: "LeadScorpio B2B Lead Generation",
      previewText: "How LeadScorpio drives executive meetings for B2B founders.",
      bodyHtml: `
        <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700; color: #071934;">
          Targeted Decision-Maker Outreach for {{company_name}}
        </h2>
        <p style="margin-top: 0; margin-bottom: 16px;">
          Hi {{first_name}}, noticed your work leading operations at <strong>{{company_name}}</strong>. Most leaders we speak with encounter two core friction points: building a verified lead list and sustaining multi-touch follow-ups without burning executive bandwidth.
        </p>
        <p style="margin-bottom: 16px;">
          <strong>LeadScorpio</strong> provides end-to-end outbound infrastructure:
        </p>
        <ul style="margin: 0 0 20px; padding-left: 20px; color: #4A5568; line-height: 1.6;">
          <li><strong>Verified Prospecting:</strong> Hand-curated decision-maker lists matched to your exact ICP.</li>
          <li><strong>Tailored Copywriting:</strong> Thought-provoking, non-spam conversation starters.</li>
          <li><strong>Appointment Setting:</strong> Seamless calendar qualification directly into your schedule.</li>
        </ul>
        <p>Open to a quick 10-minute preview on how we could drive 15-30 qualified conversations for your team next month?</p>
      `,
      ctaText: "Schedule 10-Min Exchange",
      ctaUrl: "https://leadscorpio.vercel.app/",
      isMarketing: true,
    }),
    text_content: `Hi {{first_name}},\n\nLeadScorpio provides end-to-end outbound infrastructure to scale your qualified B2B pipeline.\n\nOpen to a brief 10-minute exchange?\nSchedule: https://leadscorpio.vercel.app/\n\nBest regards,\n{{sender_name}}`,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 4. Proposal Submission
  {
    id: "tpl-proposal",
    name: "Proposal Submission",
    category: "SALES",
    subject: "LeadScorpio Outbound Growth Proposal for {{company_name}}",
    preview_text: "Review the tailored outbound campaign strategy and scope.",
    html_content: wrapEmailHtml({
      title: "Outbound Proposal",
      previewText: "Review your tailored outbound campaign strategy and deliverables.",
      bodyHtml: `
        <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700; color: #071934;">
          Outbound Growth Proposal Prepared for {{company_name}}
        </h2>
        <p style="margin-top: 0; margin-bottom: 16px;">
          Hi {{first_name}}, following our recent discussion, we have assembled a customized outbound lead generation proposal for <strong>{{company_name}}</strong>.
        </p>
        <div style="background-color: #FAF9F6; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px; color: #2D3748;">
            <tr>
              <td style="font-weight: 600; width: 40%; color: #071934;">Service Scope:</td>
              <td>{{service_name}}</td>
            </tr>
            <tr>
              <td style="font-weight: 600; color: #071934;">Outreach Channel:</td>
              <td>LinkedIn Outreach + Verified Follow-ups</td>
            </tr>
            <tr>
              <td style="font-weight: 600; color: #071934;">Target Market:</td>
              <td>B2B Decision Makers</td>
            </tr>
          </table>
        </div>
        <p>Please review the proposal details and let us know if any adjustments are needed.</p>
      `,
      ctaText: "Review Proposal",
      ctaUrl: "https://leadscorpio.vercel.app/",
    }),
    text_content: `Hi {{first_name}},\n\nFollowing our discussion, we have assembled a customized outbound proposal for {{company_name}}.\n\nReview details: https://leadscorpio.vercel.app/\n\nBest regards,\n{{sender_name}}`,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 5. Follow-up Email
  {
    id: "tpl-followup",
    name: "Follow-up Email",
    category: "SALES",
    subject: "Checking in regarding outbound pipeline for {{company_name}}",
    preview_text: "Wanted to share a quick update on our recent conversation.",
    html_content: wrapEmailHtml({
      title: "Following Up",
      previewText: "Wanted to share a quick update on our recent conversation.",
      bodyHtml: `
        <p style="margin-top: 0; margin-bottom: 16px;">
          Hi {{first_name}},
        </p>
        <p style="margin-top: 0; margin-bottom: 16px;">
          I wanted to briefly follow up on my earlier note regarding outbound lead generation for <strong>{{company_name}}</strong>.
        </p>
        <p style="margin-bottom: 16px;">
          We recently launched a targeted LinkedIn sequence in your industry that achieved a 42% connection acceptance rate and generated 8 qualified leadership calls within 2 weeks.
        </p>
        <p style="margin-bottom: 16px;">
          I would love to walk you through the exact messaging framework we used. Do you have 10 minutes available this Thursday or Friday?
        </p>
      `,
      ctaText: "Book a Time",
      ctaUrl: "https://leadscorpio.vercel.app/",
      isMarketing: true,
    }),
    text_content: `Hi {{first_name}},\n\nI wanted to briefly follow up on my note regarding outbound pipeline for {{company_name}}.\n\nDo you have 10 minutes available this week?\nBook a time: https://leadscorpio.vercel.app/\n\nBest regards,\n{{sender_name}}`,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 6. Meeting Confirmation
  {
    id: "tpl-meeting-confirm",
    name: "Meeting Confirmation",
    category: "MEETINGS",
    subject: "Confirmed: LeadScorpio Strategy Session with {{company_name}}",
    preview_text: "Your strategy meeting is confirmed for {{meeting_date}} at {{meeting_time}}.",
    html_content: wrapEmailHtml({
      title: "Meeting Confirmed",
      previewText: "Your strategy meeting is confirmed for {{meeting_date}} at {{meeting_time}}.",
      bodyHtml: `
        <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700; color: #071934;">
          Your Meeting is Confirmed!
        </h2>
        <p style="margin-top: 0; margin-bottom: 16px;">
          Hi {{first_name}}, your strategy session with LeadScorpio has been scheduled. We look forward to speaking with you.
        </p>
        <div style="background-color: #FAF9F6; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #071934;"><strong>📅 Date:</strong> {{meeting_date}}</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #071934;"><strong>⏰ Time:</strong> {{meeting_time}}</p>
          <p style="margin: 0; font-size: 14px; color: #071934;"><strong>🔗 Meeting Link:</strong> <a href="{{meeting_url}}" target="_blank" style="color: #F15A24;">{{meeting_url}}</a></p>
        </div>
        <p style="font-size: 14px; color: #718096;">
          Feel free to reply directly to this email if you need to reschedule or invite additional colleagues.
        </p>
      `,
      ctaText: "Join Video Call",
      ctaUrl: "{{meeting_url}}",
    }),
    text_content: `Hi {{first_name}},\n\nYour strategy meeting is confirmed:\nDate: {{meeting_date}}\nTime: {{meeting_time}}\nLink: {{meeting_url}}\n\nBest regards,\n{{sender_name}}`,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 7. Meeting Reminder
  {
    id: "tpl-meeting-reminder",
    name: "Meeting Reminder",
    category: "MEETINGS",
    subject: "Reminder: Strategy Session Tomorrow at {{meeting_time}}",
    preview_text: "Looking forward to our call tomorrow, {{first_name}}.",
    html_content: wrapEmailHtml({
      title: "Meeting Reminder",
      previewText: "Looking forward to our call tomorrow at {{meeting_time}}.",
      bodyHtml: `
        <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700; color: #071934;">
          Reminder: Tomorrow's Strategy Call
        </h2>
        <p style="margin-top: 0; margin-bottom: 16px;">
          Hi {{first_name}}, just a quick reminder that our outbound consultation for <strong>{{company_name}}</strong> is scheduled for tomorrow.
        </p>
        <div style="background-color: #FAF9F6; border-left: 4px solid #F15A24; padding: 14px 18px; margin: 18px 0;">
          <p style="margin: 0; font-size: 14.5px; color: #071934;">
            <strong>{{meeting_date}}</strong> at <strong>{{meeting_time}}</strong>
          </p>
        </div>
        <p>We have prepared market data and persona insights to share with your team.</p>
      `,
      ctaText: "Access Meeting Room",
      ctaUrl: "{{meeting_url}}",
    }),
    text_content: `Hi {{first_name}},\n\nReminder: Our strategy call is tomorrow, {{meeting_date}} at {{meeting_time}}.\nMeeting Link: {{meeting_url}}\n\nBest regards,\n{{sender_name}}`,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 8. Weekly Performance Report
  {
    id: "tpl-weekly-report",
    name: "Weekly Performance Report",
    category: "REPORTS",
    subject: "Weekly Outbound Performance Report — {{client_name}}",
    preview_text: "Review this week's LinkedIn outreach metrics and booked calls.",
    html_content: wrapEmailHtml({
      title: "Weekly Outbound Report",
      previewText: "Review this week's outreach metrics and booked calls.",
      bodyHtml: `
        <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700; color: #071934;">
          Weekly Performance Report: {{client_name}}
        </h2>
        <p style="margin-top: 0; margin-bottom: 16px;">
          Hi {{first_name}}, here is your weekly summary of live outbound campaign operations.
        </p>
        <div style="background-color: #FAF9F6; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="margin: 0 0 12px; color: #071934; font-size: 15px;">Key Highlights:</h4>
          <p style="margin: 0 0 6px; font-size: 14px; color: #4A5568;">📈 Executive Connection Acceptance: <strong>43%</strong></p>
          <p style="margin: 0 0 6px; font-size: 14px; color: #4A5568;">💬 Positive Response Sentiment: <strong>68%</strong></p>
          <p style="margin: 0; font-size: 14px; color: #4A5568;">🎯 Qualified Meetings Booked: <strong>3 calls</strong></p>
        </div>
        <p>Full breakdown of prospect responses, campaign iterations, and action plans are accessible in your portal.</p>
      `,
      ctaText: "View Full Report in Portal",
      ctaUrl: "https://leadscorpio.vercel.app/portal/reports",
    }),
    text_content: `Hi {{first_name}},\n\nHere is your weekly outbound report for {{client_name}}.\nView full report: https://leadscorpio.vercel.app/portal/reports\n\nBest regards,\n{{sender_name}}`,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 9. Invoice Email
  {
    id: "tpl-invoice-email",
    name: "Invoice Email",
    category: "FINANCE",
    subject: "Invoice {{invoice_number}} from LeadScorpio",
    preview_text: "Invoice {{invoice_number}} for {{invoice_amount}} is ready for payment.",
    html_content: wrapEmailHtml({
      title: "Invoice Notification",
      previewText: "Invoice {{invoice_number}} for {{invoice_amount}} is ready for payment.",
      bodyHtml: `
        <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700; color: #071934;">
          Invoice {{invoice_number}}
        </h2>
        <p style="margin-top: 0; margin-bottom: 16px;">
          Hi {{first_name}}, please find attached the invoice for your active LeadScorpio outbound lead generation engagement with <strong>{{company_name}}</strong>.
        </p>
        <div style="background-color: #FAF9F6; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px; color: #2D3748;">
            <tr>
              <td style="font-weight: 600; width: 45%; color: #071934;">Invoice Number:</td>
              <td>{{invoice_number}}</td>
            </tr>
            <tr>
              <td style="font-weight: 600; color: #071934;">Total Amount Due:</td>
              <td style="font-size: 16px; font-weight: 700; color: #071934;">{{invoice_amount}}</td>
            </tr>
            <tr>
              <td style="font-weight: 600; color: #071934;">Payment Due Date:</td>
              <td style="color: #C65D2E; font-weight: 600;">{{payment_due_date}}</td>
            </tr>
          </table>
        </div>
        <p style="font-size: 13.5px; color: #4A5568;">
          Bank Transfer Details:<br>
          <strong>Account:</strong> LeadScorpio Operations | <strong>Bank:</strong> HDFC Bank<br>
          <strong>A/C No:</strong> 50200012345678 | <strong>IFSC:</strong> HDFC0000123
        </p>
      `,
      ctaText: "Pay Online / View Invoice",
      ctaUrl: "https://leadscorpio.vercel.app/app/finance",
    }),
    text_content: `Hi {{first_name}},\n\nInvoice {{invoice_number}} for {{invoice_amount}} has been issued.\nDue Date: {{payment_due_date}}\n\nPlease remit payment via bank transfer or online.\n\nBest regards,\n{{sender_name}}\nLeadScorpio Finance`,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 10. Payment Reminder
  {
    id: "tpl-payment-reminder",
    name: "Payment Reminder",
    category: "FINANCE",
    subject: "Friendly Reminder: Invoice {{invoice_number}} Due on {{payment_due_date}}",
    preview_text: "Gentle reminder regarding pending invoice {{invoice_number}}.",
    html_content: wrapEmailHtml({
      title: "Payment Reminder",
      previewText: "Gentle reminder regarding pending invoice {{invoice_number}}.",
      bodyHtml: `
        <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700; color: #071934;">
          Payment Reminder: Invoice {{invoice_number}}
        </h2>
        <p style="margin-top: 0; margin-bottom: 16px;">
          Hi {{first_name}}, this is a friendly reminder that invoice <strong>{{invoice_number}}</strong> for <strong>{{invoice_amount}}</strong> is due on <strong>{{payment_due_date}}</strong>.
        </p>
        <p style="margin-bottom: 16px;">
          If payment has already been sent, please disregard this notice or reply with the transaction reference.
        </p>
      `,
      ctaText: "Review Invoice Details",
      ctaUrl: "https://leadscorpio.vercel.app/app/finance",
    }),
    text_content: `Hi {{first_name}},\n\nReminder: Invoice {{invoice_number}} for {{invoice_amount}} is due on {{payment_due_date}}.\n\nBest regards,\n{{sender_name}}`,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 11. Campaign Update
  {
    id: "tpl-campaign-update",
    name: "Campaign Update",
    category: "GENERAL",
    subject: "Campaign Milestone Update for {{client_name}}",
    preview_text: "Update on active LinkedIn outreach sequences and prospect engagement.",
    html_content: wrapEmailHtml({
      title: "Campaign Update",
      previewText: "Update on active outreach sequences and prospect engagement.",
      bodyHtml: `
        <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700; color: #071934;">
          Campaign Progress Update
        </h2>
        <p style="margin-top: 0; margin-bottom: 16px;">
          Hi {{first_name}}, our team has completed the latest batch of targeted prospect outreach for <strong>{{client_name}}</strong>.
        </p>
        <p style="margin-bottom: 16px;">
          Several high-interest replies have been received and are currently undergoing qualification handoff.
        </p>
      `,
      ctaText: "Check Campaign Dashboard",
      ctaUrl: "https://leadscorpio.vercel.app/portal/campaigns",
    }),
    text_content: `Hi {{first_name}},\n\nUpdate on active outreach for {{client_name}}.\nCheck campaigns: https://leadscorpio.vercel.app/portal/campaigns\n\nBest regards,\n{{sender_name}}`,
    is_custom: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 12. Custom HTML Email
  {
    id: "tpl-custom-html",
    name: "Custom HTML Corporate Email",
    category: "GENERAL",
    subject: "Update from LeadScorpio for {{company_name}}",
    preview_text: "Important announcement from LeadScorpio Operations.",
    html_content: wrapEmailHtml({
      title: "Corporate Notice",
      previewText: "Important update from LeadScorpio Operations.",
      bodyHtml: `
        <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700; color: #071934;">
          Important Update for {{company_name}}
        </h2>
        <p style="margin-top: 0; margin-bottom: 16px;">
          Hi {{first_name}},
        </p>
        <p style="margin-bottom: 16px;">
          This is a custom message from LeadScorpio Operations regarding your outbound program. You can edit this block to share any custom instructions, strategic recommendations, or operational briefs.
        </p>
      `,
      ctaText: "Visit Portal",
      ctaUrl: "https://leadscorpio.vercel.app/",
    }),
    text_content: `Hi {{first_name}},\n\nThis is an update from LeadScorpio for {{company_name}}.\n\nBest regards,\n{{sender_name}}`,
    is_custom: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
