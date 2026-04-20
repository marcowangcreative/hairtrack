import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTelnyxSignature } from '@/lib/telnyx';

/**
 * Telnyx WhatsApp unified webhook.
 *
 * Telnyx's WhatsApp product sends all event types to the same URL:
 * - inbound messages (`*.received`, `*.inbound_message`)
 * - outbound status updates (`*.sent`, `*.delivered`, `*.read`, `*.failed`)
 * - account/template events (ignored)
 *
 * We dispatch based on `event_type`.
 */

const STATUS_MAP: Record<
  string,
  'pending' | 'sent' | 'delivered' | 'read' | 'failed'
> = {
  queued: 'pending',
  sending: 'pending',
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'failed',
  undelivered: 'failed',
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const verdict = verifyTelnyxSignature({
    rawBody,
    signature: req.headers.get('telnyx-signature-ed25519'),
    timestamp: req.headers.get('telnyx-timestamp'),
  });
  if (!verdict.ok) {
    return Response.json(
      { ok: false, error: verdict.reason },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json(
      { ok: false, error: 'invalid json' },
      { status: 400 }
    );
  }

  const data = (body as { data?: { event_type?: string; payload?: unknown } })
    ?.data;
  const eventType = data?.event_type ?? '';
  const payload = data?.payload;

  if (!payload) {
    // Some Telnyx events (e.g. test pings) arrive with no payload. Accept.
    return Response.json({ ok: true, skipped: true });
  }

  const isInbound =
    /inbound/i.test(eventType) ||
    /received/i.test(eventType) ||
    eventType === '';
  const isStatus =
    /\.(sent|delivered|read|failed|message_status)/i.test(eventType);

  if (isInbound && !isStatus) {
    return handleInbound(payload, verdict.devMode);
  }
  if (isStatus) {
    return handleStatus(payload, verdict.devMode);
  }

  // Unknown event — ack with 200 so Telnyx doesn't retry.
  return Response.json({ ok: true, ignored: eventType });
}

async function handleInbound(payload: unknown, devMode: boolean) {
  const p = payload as {
    from?: { phone_number?: string } | string;
    text?: { body?: string } | string;
    media?: Array<{ url: string; content_type?: string }>;
    id?: string;
  };

  const fromPhone =
    typeof p.from === 'string' ? p.from : p.from?.phone_number ?? null;
  const textBody =
    typeof p.text === 'string' ? p.text : p.text?.body ?? null;
  const telnyxId = p.id;

  if (!fromPhone || !telnyxId) {
    return Response.json(
      { ok: false, error: 'missing from/id' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: thread, error: threadErr } = await supabase
    .from('ht_wa_threads')
    .upsert({ wa_phone: fromPhone }, { onConflict: 'wa_phone' })
    .select()
    .single();
  if (threadErr || !thread) {
    return Response.json(
      { ok: false, error: threadErr?.message },
      { status: 500 }
    );
  }

  const contentType = p.media?.[0]?.content_type;
  const mediaType = contentType?.startsWith('image')
    ? 'image'
    : contentType?.startsWith('audio')
      ? 'audio'
      : p.media?.[0]
        ? 'document'
        : null;

  await supabase.from('ht_wa_messages').insert({
    thread_id: thread.id,
    direction: 'inbound',
    body: textBody,
    media_url: p.media?.[0]?.url ?? null,
    media_type: mediaType,
    telnyx_id: telnyxId,
  });

  await supabase
    .from('ht_wa_threads')
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: textBody?.slice(0, 120) ?? null,
      unread_count: (thread.unread_count ?? 0) + 1,
    })
    .eq('id', thread.id);

  return Response.json({ ok: true, kind: 'inbound', dev_mode: devMode });
}

async function handleStatus(payload: unknown, devMode: boolean) {
  const p = payload as {
    id?: string;
    status?: string;
    to?: Array<{ status?: string }>;
  };
  const telnyxId = p.id;
  const rawStatus = p.to?.[0]?.status ?? p.status;
  if (!telnyxId || !rawStatus) {
    return Response.json(
      { ok: false, error: 'missing fields' },
      { status: 400 }
    );
  }
  const supabase = createAdminClient();
  await supabase
    .from('ht_wa_messages')
    .update({ status: STATUS_MAP[rawStatus] ?? 'sent' })
    .eq('telnyx_id', telnyxId);
  return Response.json({ ok: true, kind: 'status', dev_mode: devMode });
}
