import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTelnyxSignature } from '@/lib/telnyx';

/**
 * Telnyx WhatsApp inbound webhook.
 * Docs: https://developers.telnyx.com/docs/messaging/whatsapp
 */
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

  const payload = (body as { data?: { payload?: unknown } })?.data?.payload as
    | {
        from?: { phone_number: string } | string;
        text?: { body?: string } | string;
        media?: Array<{ url: string; content_type?: string }>;
        id?: string;
      }
    | undefined;
  if (!payload) {
    return Response.json(
      { ok: false, error: 'missing payload' },
      { status: 400 }
    );
  }

  const { from, text, media, id: telnyxId } = payload;
  const fromPhone =
    typeof from === 'string' ? from : from?.phone_number ?? null;
  const textBody =
    typeof text === 'string' ? text : text?.body ?? null;
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

  const contentType = media?.[0]?.content_type;
  const mediaType = contentType?.startsWith('image')
    ? 'image'
    : contentType?.startsWith('audio')
      ? 'audio'
      : media?.[0]
        ? 'document'
        : null;

  await supabase.from('ht_wa_messages').insert({
    thread_id: thread.id,
    direction: 'inbound',
    body: textBody,
    media_url: media?.[0]?.url ?? null,
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

  return Response.json({ ok: true, dev_mode: verdict.devMode });
}
