import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTelnyxSignature } from '@/lib/telnyx';

/**
 * Telnyx WhatsApp unified webhook.
 *
 * Telnyx wraps WhatsApp Cloud API events in its own envelope:
 *   { data: { event_type, payload } }
 *
 * The inner `payload` follows the Meta WhatsApp Cloud API shape:
 *   - inbound messages → payload.messages[]
 *   - delivery/read receipts for outbound → payload.statuses[]
 *   - template / account events → ignored
 *
 * We dispatch based on which of those arrays is present, which is more
 * robust than matching on the event_type string (Telnyx has changed the
 * event_type format a few times).
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

type WhatsAppMessage = {
  id?: string;
  foreign_id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  image?: { link?: string; url?: string; mime_type?: string; caption?: string };
  audio?: { link?: string; url?: string; mime_type?: string };
  video?: { link?: string; url?: string; mime_type?: string; caption?: string };
  document?: {
    link?: string;
    url?: string;
    mime_type?: string;
    filename?: string;
    caption?: string;
  };
  sticker?: { link?: string; url?: string; mime_type?: string };
  voice?: { link?: string; url?: string; mime_type?: string };
  location?: { latitude?: number; longitude?: number; name?: string };
  context?: { from?: string; id?: string };
};

type WhatsAppStatus = {
  id?: string;
  recipient_id?: string;
  status?: string;
  timestamp?: string;
  errors?: Array<{ code?: number; title?: string; message?: string }>;
};

type WhatsAppContact = {
  profile?: { name?: string };
  wa_id?: string;
};

type WhatsAppPayload = {
  messaging_product?: string;
  metadata?: { display_phone_number?: string; phone_number_id?: string };
  contacts?: WhatsAppContact[];
  messages?: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
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

  // Telnyx wraps events in { data: { event_type, payload } }. Accept both
  // wrapped and unwrapped for robustness against future format changes.
  const maybeWrapped = body as {
    data?: { event_type?: string; payload?: WhatsAppPayload };
  };
  const eventType = maybeWrapped?.data?.event_type ?? '';
  const payload: WhatsAppPayload =
    maybeWrapped?.data?.payload ?? (body as WhatsAppPayload);

  const messages = payload?.messages;
  const statuses = payload?.statuses;
  const contacts = payload?.contacts;

  // Test pings / account events arrive without either array. Ack 200.
  if (
    (!messages || messages.length === 0) &&
    (!statuses || statuses.length === 0)
  ) {
    return Response.json({ ok: true, skipped: true, event_type: eventType });
  }

  try {
    if (messages && messages.length > 0) {
      await handleInboundMessages(messages, contacts ?? []);
    }
    if (statuses && statuses.length > 0) {
      await handleStatuses(statuses);
    }
    return Response.json({
      ok: true,
      dev_mode: verdict.devMode,
      event_type: eventType,
      message_count: messages?.length ?? 0,
      status_count: statuses?.length ?? 0,
    });
  } catch (e) {
    console.error('[whatsapp/incoming] handler error', e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : 'unknown' },
      { status: 500 }
    );
  }
}

function normalizePhone(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  return trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
}

function extractMedia(m: WhatsAppMessage): {
  mediaType: 'image' | 'audio' | 'document' | 'video' | null;
  mediaUrl: string | null;
  body: string | null;
} {
  if (m.image) {
    return {
      mediaType: 'image',
      mediaUrl: m.image.link ?? m.image.url ?? null,
      body: m.image.caption ?? null,
    };
  }
  if (m.video) {
    return {
      mediaType: 'video',
      mediaUrl: m.video.link ?? m.video.url ?? null,
      body: m.video.caption ?? null,
    };
  }
  if (m.audio || m.voice) {
    const src = m.audio ?? m.voice!;
    return {
      mediaType: 'audio',
      mediaUrl: src.link ?? src.url ?? null,
      body: null,
    };
  }
  if (m.document) {
    return {
      mediaType: 'document',
      mediaUrl: m.document.link ?? m.document.url ?? null,
      body: m.document.caption ?? m.document.filename ?? null,
    };
  }
  if (m.sticker) {
    return {
      mediaType: 'image',
      mediaUrl: m.sticker.link ?? m.sticker.url ?? null,
      body: null,
    };
  }
  return { mediaType: null, mediaUrl: null, body: null };
}

async function handleInboundMessages(
  messages: WhatsAppMessage[],
  contacts: WhatsAppContact[]
) {
  const supabase = createAdminClient();

  // Build wa_id → profile name lookup for contact naming.
  const nameByWaId = new Map<string, string>();
  for (const c of contacts) {
    if (c.wa_id && c.profile?.name) nameByWaId.set(c.wa_id, c.profile.name);
  }

  for (const m of messages) {
    const fromPhone = normalizePhone(m.from);
    const telnyxId = m.id ?? m.foreign_id;
    if (!fromPhone || !telnyxId) {
      console.warn('[whatsapp/incoming] skipping message, missing from/id', m);
      continue;
    }

    const media = extractMedia(m);
    const textBody = m.text?.body ?? media.body ?? null;

    // Upsert thread (on wa_phone). Stash contact name in notes on first sight.
    const waIdKey = m.from?.replace(/^\+/, '') ?? '';
    const contactName = nameByWaId.get(waIdKey) ?? null;

    const { data: thread, error: threadErr } = await supabase
      .from('ht_wa_threads')
      .upsert({ wa_phone: fromPhone }, { onConflict: 'wa_phone' })
      .select()
      .single();
    if (threadErr || !thread) {
      throw new Error(threadErr?.message ?? 'thread upsert failed');
    }

    const { error: msgErr } = await supabase.from('ht_wa_messages').insert({
      thread_id: thread.id,
      direction: 'inbound',
      body: textBody,
      media_url: media.mediaUrl,
      media_type: media.mediaType,
      telnyx_id: telnyxId,
    });
    if (msgErr) throw new Error(msgErr.message);

    const preview = textBody
      ? textBody.slice(0, 120)
      : media.mediaType
        ? `[${media.mediaType}]`
        : null;

    await supabase
      .from('ht_wa_threads')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: preview,
        unread_count: (thread.unread_count ?? 0) + 1,
        ...(contactName && !thread.name ? { name: contactName } : {}),
      })
      .eq('id', thread.id);
  }
}

async function handleStatuses(statuses: WhatsAppStatus[]) {
  const supabase = createAdminClient();

  for (const s of statuses) {
    const telnyxId = s.id;
    const rawStatus = s.status;
    if (!telnyxId || !rawStatus) continue;

    await supabase
      .from('ht_wa_messages')
      .update({ status: STATUS_MAP[rawStatus] ?? 'sent' })
      .eq('telnyx_id', telnyxId);
  }
}
