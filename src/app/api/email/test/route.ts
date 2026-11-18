import { NextRequest, NextResponse } from "next/server";
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
import { wrapEmailHtml } from "@/lib/email/templates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const recipient = body.to || "leadscorpioofficial@gmail.com";

    const { smtp_configured, resend_configured } = getProviderStatus();

    if (!smtp_configured && !resend_configured) {
      console.warn(
        "[Email Test Warning] Neither Gmail SMTP (SMTP_USER/SMTP_PASSWORD) nor Resend (RESEND_API_KEY) are configured. Test skipped."
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "No email provider configured. Set SMTP_USER + SMTP_PASSWORD for Gmail SMTP, or RESEND_API_KEY for Resend.",
        },
        { status: 500 }
      );
    }

    // Helper to build the test HTML with the provider name baked in
    function buildTestHtml(providerLabel: string): string {
      return wrapEmailHtml({
        title: "LeadScorpio Email Connection Test",
        previewText: `Test email verifying ${providerLabel} integration in LeadScorpio CRM.`,
        bodyHtml: `
          <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700; color: #071934;">
            ${providerLabel} Provider Connection Verified ✅
          </h2>
          <p style="margin-top: 0; margin-bottom: 16px;">
            This test message confirms that your <strong>${providerLabel}</strong> provider is successfully configured and communicating with LeadScorpio CRM.
          </p>
          <div style="background-color: #FAF9F6; border-left: 4px solid #F15A24; padding: 14px 18px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #071934;">
              <strong>Provider:</strong> ${providerLabel}<br>
              <strong>Test Timestamp:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}<br>
              <strong>Sender Identity:</strong> ${DEFAULT_FROM_NAME} &lt;${DEFAULT_FROM_EMAIL}&gt;<br>
              <strong>Reply-To:</strong> ${DEFAULT_REPLY_TO}
            </p>
          </div>
          <p style="font-size: 14px; color: #4A5568;">
            All email templates, variables engine, and CRM outbox logs are live and operational.
          </p>
        `,
        ctaText: "Open LeadScorpio CRM",
        ctaUrl: "https://leadscorpio.vercel.app/app/email",
      });
    }

    const subjectLine = `[Verified] LeadScorpio CRM Email Test — ${new Date().toLocaleTimeString()}`;

    // ── Try Gmail SMTP first ────────────────────────────────────────────────
    if (smtp_configured) {
      const transporter = getSmtpTransporter();
      if (transporter) {
        try {
          const testHtml = buildTestHtml("Gmail SMTP");
          const info = await transporter.sendMail({
            from: `${DEFAULT_FROM_NAME} <${SMTP_USER}>`,
            to: recipient,
            replyTo: DEFAULT_REPLY_TO,
            subject: subjectLine,
            html: testHtml,
            text: "This is a test email verifying that Gmail SMTP is active in LeadScorpio CRM.",
          });

          return NextResponse.json({
            success: true,
            provider: "gmail_smtp",
            message_id: info.messageId,
            recipient,
            message: `Test email successfully sent to ${recipient} via Gmail SMTP.`,
          });
        } catch (smtpErr: any) {
          console.error("[Email Test] SMTP failed, falling back to Resend:", smtpErr);
          // Fall through to Resend
        }
      }
    }

    // ── Resend fallback ─────────────────────────────────────────────────────
    if (resend_configured) {
      if (!resend) {
        return NextResponse.json(
          {
            success: false,
            error: "Resend client not initialized. Ensure RESEND_API_KEY is present in environment variables.",
          },
          { status: 500 }
        );
      }

      const testHtml = buildTestHtml("Resend");

      const { data, error } = await resend.emails.send({
        from: `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
        to: [recipient],
        replyTo: DEFAULT_REPLY_TO,
        subject: subjectLine,
        html: testHtml,
        text: "This is a test email verifying that Resend is active in LeadScorpio CRM.",
      });

      if (error) {
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

      return NextResponse.json({
        success: true,
        provider: "resend",
        resend_id: data?.id,
        recipient,
        message: `Test email successfully sent to ${recipient} via Resend.`,
      });
    }

    return NextResponse.json(
      { success: false, error: "All email providers failed to send the test email." },
      { status: 500 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to execute test email dispatch.",
      },
      { status: 500 }
    );
  }
}
