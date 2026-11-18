import { NextRequest, NextResponse } from "next/server";

// Keep an in-memory processed events set for idempotent event handling
const processedEventIds = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const rawPayload = await req.text();
    let body: any;

    try {
      body = JSON.parse(rawPayload);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const eventId = body?.data?.id || body?.id || `evt-${Date.now()}`;
    const eventType = body?.type; // e.g. "email.sent", "email.delivered", "email.bounced", "email.opened", "email.clicked"

    // Idempotent duplicate check
    if (processedEventIds.has(eventId)) {
      return NextResponse.json({ received: true, message: "Duplicate event already processed" });
    }
    processedEventIds.add(eventId);

    // Limit set size to avoid memory growth in long-running processes
    if (processedEventIds.size > 5000) {
      const firstItems = Array.from(processedEventIds).slice(0, 1000);
      firstItems.forEach((id) => processedEventIds.delete(id));
    }

    console.log(`[Resend Webhook] Received event: ${eventType} for email:`, body?.data?.email_id || body?.data?.to);

    // In a full database environment, this updates public.email_messages and inserts public.email_events
    return NextResponse.json({
      received: true,
      event_id: eventId,
      event_type: eventType,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Resend Webhook Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
