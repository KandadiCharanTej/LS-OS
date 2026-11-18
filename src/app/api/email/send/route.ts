import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  resend,
  getSmtpTransporter,
  DEFAULT_FROM_EMAIL,
  DEFAULT_FROM_NAME,
  DEFAULT_REPLY_TO,
  SMTP_USER,
  formatResendError,
  getProviderStatus,
} from "@/lib/email/resend";

// ─── Idempotency guard (in-memory, per-instance) ────────────────────────────
const recentIdempotencyKeys = new Set<string>();

function markSent(key: string) {
  recentIdempotencyKeys.add(key);
  // Evict after 5 minutes to avoid unbounded growth
  setTimeout(() => recentIdempotencyKeys.delete(key), 5 * 60 * 1000);
}

// ─── Ambiguous SMTP error detection ─────────────────────────────────────────
// When an error happens during or after the DATA phase, the SMTP server may
// have accepted and queued the message even if the client socket timed out or closed.
// In such cases, retrying via Resend risks sending a duplicate email.
function isAmbiguousSmtpError(err: any): boolean {
  if (!err) return false;

  const msg = String(err.message || err || "").toLowerCase();
  const code = String(err.code || "").toUpperCase();
  const command = String(err.command || "").toUpperCase();

  // Explicit SMTP stages where message body was already in-flight or sent
  if (command === "DATA" || command === "END" || command === "QUIT") {
    return true;
  }

  // Socket timeouts and resets after handshake
  if (code === "ETIMEDOUT" || code === "ECONNRESET" || code === "ESOCKETTIMEDOUT") {
    return true;
  }

  const ambiguousPatterns = [
    "connection closed",
    "socket hang up",
    "unexpected connection closure",
    "timeout waiting for response",
    "greeting timeout",
    "data response timeout",
  ];

  return ambiguousPatterns.some((pattern) => msg.includes(pattern));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      to,
      to_name,
      subject,
      html_content,
      text_content,
      sender_name = DEFAULT_FROM_NAME,
      sender_email = DEFAULT_FROM_EMAIL,
      reply_to = DEFAULT_REPLY_TO,
      cc,
      bcc,
      category = "TRANSACTIONAL",
      attachments,
      client_id,
      prospect_id,
      template_id,
      template_name,
    } = body;

    // ── 1. Validation ───────────────────────────────────────────────────────
    if (!to || typeof to !== "string" || !to.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid recipient email address is required." },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json(
        { success: false, error: "Email subject line cannot be empty." },
        { status: 400 }
      );
    }

    if (!html_content || typeof html_content !== "string" || !html_content.trim()) {
      return NextResponse.json(
        { success: false, error: "Email HTML body content cannot be empty." },
        { status: 400 }
      );
    }

    // ── 2. Provider availability ────────────────────────────────────────────
    const { smtp_configured, resend_configured } = getProviderStatus();

    if (!smtp_configured && !resend_configured) {
      console.warn(
        "[Email API Warning] Neither Gmail SMTP (SMTP_USER/SMTP_PASSWORD) nor Resend (RESEND_API_KEY) are configured. Outbound email skipped."
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "No email provider configured. Please configure Gmail SMTP (SMTP_USER + SMTP_PASSWORD) as Primary or Resend (RESEND_API_KEY) as Fallback.",
        },
        { status: 500 }
      );
    }

    // ── 3. Idempotency key ──────────────────────────────────────────────────
    const idempotencyKey = crypto.randomUUID();

    // ── 4. Resolve sender ───────────────────────────────────────────────────
    const resolvedSenderEmail = sender_email.includes("@") ? sender_email : DEFAULT_FROM_EMAIL;
    const fromAddress = `${sender_name} <${resolvedSenderEmail}>`;

    // ── 5. Format attachments for both providers ────────────────────────────
    const resendAttachments = Array.isArray(attachments)
      ? attachments.map((att: any) => ({
          filename: att.filename || "attachment.pdf",
          content: att.content, // base64 string or buffer — Resend accepts both
        }))
      : undefined;

    const nodemailerAttachments = Array.isArray(attachments)
      ? attachments.map((att: any) => ({
          filename: att.filename || "attachment.pdf",
          content:
            typeof att.content === "string"
              ? Buffer.from(att.content, "base64")
              : att.content,
        }))
      : undefined;

    // ── 6. Custom headers (shared) ──────────────────────────────────────────
    const customHeaders: Record<string, string> = {
      "X-Entity-Category": category,
      "X-LeadScorpio-CRM": "true",
    };

    // ── 7a. Try Gmail SMTP first ────────────────────────────────────────────
    if (smtp_configured) {
      const transporter = getSmtpTransporter();
      if (transporter) {
        try {
          const info = await transporter.sendMail({
            from: `${sender_name} <${SMTP_USER}>`,
            to,
            cc: Array.isArray(cc) && cc.length > 0 ? cc.join(", ") : undefined,
            bcc: Array.isArray(bcc) && bcc.length > 0 ? bcc.join(", ") : undefined,
            replyTo: reply_to || DEFAULT_REPLY_TO,
            subject,
            html: html_content,
            text: text_content || undefined,
            attachments: nodemailerAttachments,
            headers: customHeaders,
          });

          markSent(idempotencyKey);

          return NextResponse.json({
            success: true,
            provider: "gmail_smtp",
            message_id: info.messageId,
            recipient: to,
            recipient_name: to_name,
            sent_at: new Date().toISOString(),
            message: "Email successfully dispatched through Gmail SMTP.",
          });
        } catch (smtpErr: any) {
          // Ambiguous timeout — data may have been accepted by Gmail
          if (isAmbiguousSmtpError(smtpErr)) {
            console.warn(
              "[Email API] SMTP ambiguous error — message may have been delivered. NOT retrying via Resend to avoid duplicate.",
              smtpErr
            );
            return NextResponse.json(
              {
                success: false,
                provider: "provider_uncertain",
                error:
                  "SMTP connection closed after sending data. The email may have been delivered. Not retrying to prevent duplicates.",
                raw_error: smtpErr.message,
              },
              { status: 502 }
            );
          }

          console.error("[Email API] SMTP Error — falling through to Resend:", smtpErr);
          // Non-ambiguous failure: safe to try Resend below
        }
      }
    }

    // ── 7b. Try Resend as fallback ──────────────────────────────────────────
    if (resend_configured && !recentIdempotencyKeys.has(idempotencyKey)) {
      if (!resend) {
        return NextResponse.json(
          {
            success: false,
            error: "Resend API key is configured but the client failed to initialise.",
          },
          { status: 500 }
        );
      }

      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [to],
        cc: Array.isArray(cc) && cc.length > 0 ? cc : undefined,
        bcc: Array.isArray(bcc) && bcc.length > 0 ? bcc : undefined,
        replyTo: reply_to || DEFAULT_REPLY_TO,
        subject,
        html: html_content,
        text: text_content || undefined,
        attachments: resendAttachments,
        headers: customHeaders,
      });

      if (error) {
        console.error("[Email API] Resend Error:", error);
        return NextResponse.json(
          {
            success: false,
            provider: "resend",
            error: formatResendError(error),
            raw_error: error,
          },
          { status: 422 }
        );
      }

      markSent(idempotencyKey);

      return NextResponse.json({
        success: true,
        provider: "resend",
        resend_id: data?.id,
        recipient: to,
        recipient_name: to_name,
        sent_at: new Date().toISOString(),
        message: "Email successfully dispatched through Resend.",
      });
    }

    // ── 8. All providers failed ─────────────────────────────────────────────
    return NextResponse.json(
      {
        success: false,
        error: "All configured email providers failed to send the message.",
      },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("[Email API] Server Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "An unexpected error occurred while sending email.",
      },
      { status: 500 }
    );
  }
}
