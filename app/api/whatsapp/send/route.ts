import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const Body = z.object({
  thread_id: z.string().uuid(),
  to: z.string().min(4),
  text: z.string().min(1).max(4096),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { thread_id, to, text } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const apiKey = process.env.TELNYX_API_KEY;
  const from = process.env.TELNYX_WHATSAPP_NUMBER;
  if (!apiKey || !from) {
    return Response.json({ ok: false, error: 'telnyx not configured' }, { status: 500 });
  }

  const res = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, text, type: 'whatsapp' }),
  });
  const json = await res.json();
  if (!res.ok) {
    return Response.json({ ok: false, error: json }, { status: 502 });
  }
  const telnyxId = json?.data?.id as string | undefined;

  await supabase.from('ht_wa_messages').insert({
    thread_id,
    direction: 'outbound',
    body: text,
    telnyx_id: telnyxId,
    sent_by: user.id,
    status: 'pending',
  });

  await supabase
    .from('ht_wa_threads')
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: text.slice(0, 120),
    })
    .eq('id', thread_id);

  return Response.json({ ok: true, telnyx_id: telnyxId });
}
