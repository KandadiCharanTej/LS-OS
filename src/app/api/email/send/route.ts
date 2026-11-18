import { NextRequest, NextResponse } from "next/server";
import { resend, DEFAULT_FROM_EMAIL, DEFAULT_FROM_NAME, DEFAULT_REPLY_TO, formatResendError } from "@/lib/email/resend";

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

    // 1. Validation
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

    // 2. Resend Client Check
    if (!resend) {
      return NextResponse.json(
        {
          success: false,
          error: "Resend API key is not configured. Please add RESEND_API_KEY in Email Settings or .env.local.",
        },
        { status: 500 }
      );
    }

    // 3. Format from address
    // Clean sender email: use configured verified sender or fallback
    const resolvedSenderEmail = sender_email.includes("@") ? sender_email : DEFAULT_FROM_EMAIL;
    const fromAddress = `${sender_name} <${resolvedSenderEmail}>`;

    // 4. Format attachments if present
    const formattedAttachments = Array.isArray(attachments)
      ? attachments.map((att: any) => ({
          filename: att.filename || "attachment.pdf",
          content: att.content, // base64 string or buffer
        }))
      : undefined;

    // 5. Send via Resend
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      cc: Array.isArray(cc) && cc.length > 0 ? cc : undefined,
      bcc: Array.isArray(bcc) && bcc.length > 0 ? bcc : undefined,
      replyTo: reply_to || DEFAULT_REPLY_TO,
      subject,
      html: html_content,
      text: text_content || undefined,
      attachments: formattedAttachments,
      headers: {
        "X-Entity-Category": category,
        "X-LeadScorpio-CRM": "true",
      },
    });

    if (error) {
      console.error("[Email API] Resend Error:", error);
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
      recipient: to,
      recipient_name: to_name,
      sent_at: new Date().toISOString(),
      message: "Email successfully dispatched through Resend.",
    });
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
