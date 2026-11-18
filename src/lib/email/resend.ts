import { Resend } from "resend";

// Initialize Resend SDK instance safely
const apiKey = process.env.RESEND_API_KEY || "";
export const resend = apiKey ? new Resend(apiKey) : null;

export const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
export const DEFAULT_FROM_NAME = process.env.RESEND_FROM_NAME || "LeadScorpio";
export const DEFAULT_REPLY_TO = process.env.RESEND_REPLY_TO || "leadscorpioofficial@gmail.com";

/**
 * Returns masked API key for security (never expose full key to client)
 */
export function getMaskedApiKey(): string {
  if (!apiKey) return "Not Configured";
  if (apiKey.length <= 8) return "••••••••";
  return `${apiKey.slice(0, 5)}...${apiKey.slice(-4)}`;
}

/**
 * Translates provider errors into clear, actionable messages
 */
export function formatResendError(error: any): string {
  if (!error) return "Unknown email provider error";
  
  const msg = error.message || (typeof error === "string" ? error : JSON.stringify(error));
  
  if (msg.includes("domain") && (msg.includes("not verified") || msg.includes("validation"))) {
    return "Domain verification required: Resend requires verifying your custom sending domain. Until verified, test emails can be sent from onboarding@resend.dev to your registered account email.";
  }
  
  if (msg.includes("API key") || msg.includes("Unauthorized") || msg.includes("401")) {
    return "Invalid or unauthorized Resend API key. Please check RESEND_API_KEY in Email Settings.";
  }

  if (msg.includes("rate_limit") || msg.includes("Too many requests")) {
    return "Provider rate limit reached. Please wait a few seconds before trying again.";
  }

  return msg;
}
