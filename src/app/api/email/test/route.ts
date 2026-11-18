import { NextRequest, NextResponse } from "next/server";
import { resend, DEFAULT_FROM_EMAIL, DEFAULT_FROM_NAME, DEFAULT_REPLY_TO, formatResendError } from "@/lib/email/resend";
import { wrapEmailHtml } from "@/lib/email/templates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const recipient = body.to || "leadscorpioofficial@gmail.com";

    if (!resend) {
      return NextResponse.json(
        {
          success: false,
          error: "Resend client not initialized. Ensure RESEND_API_KEY is present in environment variables.",
        },
        { status: 500 }
      );
    }

    const testHtml = wrapEmailHtml({
      title: "LeadScorpio Email Connection Test",
      previewText: "Test email verifying Resend integration in LeadScorpio CRM.",
      bodyHtml: `
        <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700; color: #071934;">
          Resend Provider Connection Verified ✅
        </h2>
        <p style="margin-top: 0; margin-bottom: 16px;">
          This test message confirms that your <strong>Resend Email Delivery Provider</strong> is successfully configured and communicating with LeadScorpio CRM.
        </p>
        <div style="background-color: #FAF9F6; border-left: 4px solid #F15A24; padding: 14px 18px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #071934;">
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

    const { data, error } = await resend.emails.send({
      from: `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
      to: [recipient],
      replyTo: DEFAULT_REPLY_TO,
      subject: `[Verified] LeadScorpio CRM Email Test — ${new Date().toLocaleTimeString()}`,
      html: testHtml,
      text: "This is a test email verifying that Resend is active in LeadScorpio CRM.",
    });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: formatResendError(error),
          raw_error: error,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      resend_id: data?.id,
      recipient,
      message: `Test email successfully sent to ${recipient} via Resend.`,
    });
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
