import { NextResponse } from "next/server";
import {
  getMaskedApiKey,
  DEFAULT_FROM_EMAIL,
  DEFAULT_FROM_NAME,
  DEFAULT_REPLY_TO,
  getProviderStatus,
  SMTP_USER,
  getMaskedSmtpPassword,
} from "@/lib/email/resend";

export async function GET() {
  const isKeyConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_"));
  const webhookSecretConfigured = Boolean(process.env.RESEND_WEBHOOK_SECRET);
  const { smtp_configured, resend_configured, active_provider } = getProviderStatus();

  return NextResponse.json({
    // ── Existing fields (unchanged) ──────────────────────────────────────
    provider: "resend",
    status: isKeyConfigured ? "CONNECTED" : "NOT_CONFIGURED",
    api_key_masked: getMaskedApiKey(),
    sender_name: DEFAULT_FROM_NAME,
    sender_email: DEFAULT_FROM_EMAIL,
    reply_to: DEFAULT_REPLY_TO,
    webhook_secret_configured: webhookSecretConfigured,
    verified_domain_mode: !DEFAULT_FROM_EMAIL.includes("onboarding@resend.dev"),

    // ── New dual-provider fields ─────────────────────────────────────────
    smtp_configured,
    resend_configured,
    active_provider,
    smtp_user_masked: SMTP_USER
      ? `${SMTP_USER.slice(0, 3)}***${SMTP_USER.slice(SMTP_USER.indexOf("@"))}`
      : "Not Configured",
    smtp_password_masked: getMaskedSmtpPassword(),

    timestamp: new Date().toISOString(),
  });
}
