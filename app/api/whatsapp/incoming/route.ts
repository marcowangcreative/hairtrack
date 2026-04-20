import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Telnyx WhatsApp inbound webhook.
 * Docs: https://developers.telnyx.com/docs/messaging/whatsapp
 *
 * TODO: verify `telnyx-signature-ed25519` header against TELNYX_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const payload = body?.data?.payload;
  if (!payload) {
    return Response.json({ ok: false, error: 'missing payload' }, { status: 400 });
  }

  const { from, text, media, id: telnyxId } = payload as {
    from: { phone_number: string } | string;
    text?: { body?: string } | string;
    media?: Array<{ url: string; content_type?: string }>;
    id: string;
  };

  const fromPhone = typeof from === 'string' ? from : from?.phone_number;
  const textBody = typeof text === 'string' ? text : text?.body ?? null;

  const supabase = createAdminClient();

  const { data: thread, error: threadErr } = await supabase
    .from('wa_threads')
    .upsert({ wa_phone: fromPhone }, { onConflict: 'wa_phone' })
    .select()
    .single();
  if (threadErr || !thread) {
    return Response.json({ ok: false, error: threadErr?.message }, { status: 500 });
  }

  await supabase.from('wa_messages').insert({
    thread_id: thread.id,
    direction: 'inbound',
    body: textBody,
    media_url: media?.[0]?.url ?? null,
    media_type: media?.[0]?.content_type?.startsWith('image')
      ? 'image'
      : media?.[0]?.content_type?.startsWith('audio')
        ? 'audio'
        : media?.[0]
          ? 'document'
          : null,
    telnyx_id: telnyxId,
  });

  await supabase
    .from('wa_threads')
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: textBody?.slice(0, 120) ?? null,
      unread_count: (thread.unread_count ?? 0) + 1,
    })
    .eq('id', thread.id);

  return Response.json({ ok: true });
}
