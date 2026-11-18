# LeadScorpio CRM — Dual-Provider Email Delivery Architecture

**Specification:** Naavik-Style Resilient Dual-Provider Outbound Pipeline  
**Primary Provider:** Gmail SMTP (via Nodemailer)  
**Fallback Provider:** Resend API (via Official Resend SDK)  
**Active LeadScorpio Sender Account:** `leadscorpioofficial@gmail.com`  

---

## 1. Architectural Overview & Priority Rules

The LeadScorpio CRM email system mirrors the dual-provider architecture pioneered in the **Naavik** project, providing high deliverability and resilience:

```
                      ┌────────────────────────────────────────┐
                      │    Outbound Email Request (Composer,   │
                      │   Prospects, Clients, Finance, Reports)│
                      └──────────────────┬─────────────────────┘
                                         │
                                         ▼
                      ┌────────────────────────────────────────┐
                      │   1. Suppression & Idempotency Check   │
                      │  (Block unsubscribed, prevent doubles) │
                      └──────────────────┬─────────────────────┘
                                         │
                                         ▼
                      ┌────────────────────────────────────────┐
                      │    2. Attempt PRIMARY Provider         │
                      │   Gmail SMTP (Nodemailer / Port 465)   │
                      │ From: LeadScorpio <leadscorpioofficial>│
                      └────────────┬──────────────┬────────────┘
                                   │              │
                   Success (250 OK)│              │ Failure / Timeout
                                   │              ▼
                                   │     ┌───────────────────────────────┐
                                   │     │ Ambiguous / Post-DATA Timeout?│
                                   │     └──────┬─────────────────┬──────┘
                                   │            │ YES             │ NO (e.g. Auth Error)
                                   │            ▼                 ▼
                                   │  ┌────────────────────┐   ┌───────────────────────────┐
                                   │  │ STOP & Alert User  │   │ 3. Attempt FALLBACK       │
                                   │  │ Suppress Resend to │   │ Resend API                │
                                   │  │ prevent duplicates │   │ From: onboarding@resend.dev│
                                   │  └────────────────────┘   └─────────────┬─────────────┘
                                   │                                         │
                                   │                                         ▼
                                   └─────────────────►┌──────────────────────────┐
                                                      │ 4. Record Actual Provider│
                                                      │ in Database & Outbox     │
                                                      │ (provider: gmail / resend│
                                                      └──────────────────────────┘
```

### Provider Priority:
1. **Gmail SMTP (Primary):**
   - Configured with `SMTP_USER=leadscorpioofficial@gmail.com` and `SMTP_PASSWORD` (Google App Password).
   - Requires **no custom domain** and has **no recipient sandbox restrictions**.
   - Outbound emails arrive in recipient inboxes directly from Google's authenticated infrastructure (`From: LeadScorpio <leadscorpioofficial@gmail.com>`).
2. **Resend API (Fallback):**
   - Configured with `RESEND_API_KEY` and `RESEND_FROM_EMAIL=onboarding@resend.dev`.
   - Used when Gmail SMTP credentials are not yet supplied, or in case of a non-ambiguous Gmail outage/auth issue.
3. **Graceful Warning Log:**
   - If neither Gmail SMTP credentials nor Resend API keys are found in environment variables, a clear warning is logged (`console.warn`) and the API returns an informative HTTP 500 error without crashing the application.

---

## 2. Duplicate Delivery Prevention (Safe Failover)

A critical requirement in transactional outbound systems is preventing duplicate emails if an SMTP connection drops or times out:

1. **Pre-Data Failures (Safe to Retry):**
   - If Gmail returns authentication errors (`EAUTH`, code `535`, invalid password) or connection refusal (`ECONNREFUSED` before handshake), the message was **never** received by Google.
   - The system immediately and safely proceeds to Resend as fallback.
2. **Ambiguous / In-Flight Timeouts (Fallback Suppressed):**
   - If the connection drops during or after the SMTP `DATA` transmission phase (`ETIMEDOUT`, `ESOCKETTIMEDOUT`, `ECONNRESET`, or closed socket after data transfer), Google's mail servers may have already received and queued the message for delivery.
   - In this scenario, **fallback to Resend is strictly suppressed**.
   - The API logs a warning and returns HTTP 502 with `provider: "provider_uncertain"`, informing the user that the message may have been delivered and preventing duplicate emails to the client.
3. **In-Memory Idempotency Cache:**
   - Every dispatch request is assigned a unique idempotency UUID to prevent accidental concurrent multi-clicks.

---

## 3. Preserved Features & System Integration

* **All 12 Responsive HTML Email Templates:** Unchanged, preserving LeadScorpio brand guidelines (Deep Navy `#071934`, Orange `#F15A24` / `#C65D2E`, Warm White `#FAF9F6`).
* **Composer Personalization:** Auto-resolves all 15 dynamic variables (`{{first_name}}`, `{{company_name}}`, `{{client_name}}`, `{{invoice_amount}}`, etc.).
* **Attachments:** PDF attachment support works seamlessly on both Gmail SMTP (via nodemailer buffer conversion) and Resend.
* **Human-in-the-Loop Review:** Never auto-sends; review confirmation modal verifies recipient, subject, and delivery pipeline before sending.
* **Tracking & Outbox:**
  - Sent emails record `provider: "gmail_smtp" | "resend"`.
  - Outbox table (`/app/email/history`) displays distinct emerald badges for **Gmail SMTP** and blue badges for **Resend**.
  - Modal details view shows the exact provider and delivery ID.
  - Prospect activity timeline logs: `Sent email via Gmail SMTP: ...` or `Sent email via Resend: ...`.

---

## 4. Manual Setup Steps for the User

To activate **Gmail SMTP** as your primary sender:

### Step 1: Generate a 16-Character Google App Password
1. Sign in to your Google Account: **[https://myaccount.google.com/security](https://myaccount.google.com/security)** with `leadscorpioofficial@gmail.com`.
2. Make sure **2-Step Verification** is turned ON.
3. Go directly to **[https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)** (or search "App passwords" in the top bar).
4. In the app name box, enter **`LeadScorpio CRM`** and click **Create**.
5. Google will display a 16-letter code (e.g. `abcd efgh ijkl mnop`). Copy this code.

### Step 2: Add to `.env.local`
Open `.env.local` in the project root and enter the password:
```env
SMTP_USER=leadscorpioofficial@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
```

### Step 3: Restart Dev Server & Verify
1. Restart your local server:
   ```bash
   npx next dev -p 3001
   ```
2. Navigate to **[http://localhost:3001/app/email/settings](http://localhost:3001/app/email/settings)**.
3. You will see:
   - **Dual-Provider Engine:** `Gmail SMTP Active` (Green badge)
   - **Active Sending Mode:** `leadscorpioofficial@gmail.com`
4. Click **"Send Test Email"** to verify live dispatch!
