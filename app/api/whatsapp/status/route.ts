import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Telnyx delivery receipts. Map Telnyx status to our wa_messages.status.
 */
const MAP: Record<string, 'pending' | 'sent' | 'delivered' | 'read' | 'failed'> = {
  queued: 'pending',
  sending: 'pending',
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'failed',
  undelivered: 'failed',
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const payload = body?.data?.payload;
  const telnyxId = payload?.id as string | undefined;
  const status = payload?.to?.[0]?.status ?? payload?.status;
  if (!telnyxId || !status) {
    return Response.json({ ok: false, error: 'missing fields' }, { status: 400 });
  }

  const supabase = createAdminClient();
  await supabase
    .from('ht_wa_messages')
    .update({ status: MAP[status] ?? 'sent' })
    .eq('telnyx_id', telnyxId);

  return Response.json({ ok: true });
}
