import { NextResponse } from "next/server";
import { getMaskedApiKey, DEFAULT_FROM_EMAIL, DEFAULT_FROM_NAME, DEFAULT_REPLY_TO } from "@/lib/email/resend";

export async function GET() {
  const isKeyConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_"));
  const webhookSecretConfigured = Boolean(process.env.RESEND_WEBHOOK_SECRET);

  return NextResponse.json({
    provider: "resend",
    status: isKeyConfigured ? "CONNECTED" : "NOT_CONFIGURED",
    api_key_masked: getMaskedApiKey(),
    sender_name: DEFAULT_FROM_NAME,
    sender_email: DEFAULT_FROM_EMAIL,
    reply_to: DEFAULT_REPLY_TO,
    webhook_secret_configured: webhookSecretConfigured,
    verified_domain_mode: !DEFAULT_FROM_EMAIL.includes("onboarding@resend.dev"),
    timestamp: new Date().toISOString(),
  });
}
