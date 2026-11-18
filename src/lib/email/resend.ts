import { Resend } from "resend";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// ─── Resend Configuration ────────────────────────────────────────────────────
const apiKey = process.env.RESEND_API_KEY || "";

let _resend: Resend | null = null;

/** Lazily initialise the Resend SDK — returns null when no key is configured. */
export function getResend(): Resend | null {
  if (!_resend && apiKey) {
    _resend = new Resend(apiKey);
  }
  return _resend;
}

/** Backwards-compat: modules that import `resend` directly keep working. */
export const resend = apiKey ? new Resend(apiKey) : null;

// ─── Gmail SMTP Configuration ────────────────────────────────────────────────
const smtpUser = process.env.SMTP_USER || "";
const smtpPassword = process.env.SMTP_PASSWORD || "";

let _transporter: Transporter | null = null;
let _cachedUser = "";
let _cachedPass = "";

/** Lazily create or return a Gmail SMTP transporter via nodemailer. */
export function getSmtpTransporter(): Transporter | null {
  const user = process.env.SMTP_USER || smtpUser;
  const pass = process.env.SMTP_PASSWORD || smtpPassword;

  if (!user || !pass) {
    return null;
  }

  // Invalidate cache if credentials changed
  if (!_transporter || _cachedUser !== user || _cachedPass !== pass) {
    _cachedUser = user;
    _cachedPass = pass;
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  return _transporter;
}

// ─── Shared Defaults ─────────────────────────────────────────────────────────
export const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
export const DEFAULT_FROM_NAME = process.env.RESEND_FROM_NAME || "LeadScorpio";
export const DEFAULT_REPLY_TO = process.env.RESEND_REPLY_TO || "leadscorpioofficial@gmail.com";

// ─── SMTP env exports ────────────────────────────────────────────────────────
export const SMTP_USER = smtpUser;

export function getMaskedSmtpPassword(): string {
  if (!smtpPassword) return "Not Configured";
  if (smtpPassword.length <= 4) return "••••";
  return `${"•".repeat(smtpPassword.length - 4)}${smtpPassword.slice(-4)}`;
}

// ─── Resend helpers (unchanged signatures) ───────────────────────────────────

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

// ─── Provider Status ─────────────────────────────────────────────────────────

export interface ProviderStatus {
  smtp_configured: boolean;
  resend_configured: boolean;
  active_provider: "gmail_smtp" | "resend" | "none";
}

/**
 * Returns the current provider availability / active provider.
 * Gmail SMTP is preferred when both are configured.
 */
export function getProviderStatus(): ProviderStatus {
  const user = process.env.SMTP_USER || smtpUser;
  const pass = process.env.SMTP_PASSWORD || smtpPassword;
  const key = process.env.RESEND_API_KEY || apiKey;

  const smtpConfigured = Boolean(user && pass);
  const resendConfigured = Boolean(key && key.startsWith("re_"));

  let activeProvider: ProviderStatus["active_provider"] = "none";
  if (smtpConfigured) {
    activeProvider = "gmail_smtp";
  } else if (resendConfigured) {
    activeProvider = "resend";
  }

  if (!smtpConfigured && !resendConfigured) {
    console.warn(
      "[Email Provider Warning] Neither Gmail SMTP (SMTP_USER/SMTP_PASSWORD) nor Resend (RESEND_API_KEY) are configured."
    );
  }

  return {
    smtp_configured: smtpConfigured,
    resend_configured: resendConfigured,
    active_provider: activeProvider,
  };
}
