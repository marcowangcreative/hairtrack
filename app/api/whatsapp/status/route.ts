import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTelnyxSignature } from '@/lib/telnyx';

/**
 * Telnyx delivery receipts. Map Telnyx status to our ht_wa_messages.status.
 */
const MAP: Record<
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

  const payload = (body as { data?: { payload?: unknown } })?.data?.payload as
    | {
        id?: string;
        status?: string;
        to?: Array<{ status?: string }>;
      }
    | undefined;
  const telnyxId = payload?.id;
  const rawStatus = payload?.to?.[0]?.status ?? payload?.status;
  if (!telnyxId || !rawStatus) {
    return Response.json(
      { ok: false, error: 'missing fields' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  await supabase
    .from('ht_wa_messages')
    .update({ status: MAP[rawStatus] ?? 'sent' })
    .eq('telnyx_id', telnyxId);

  return Response.json({ ok: true, dev_mode: verdict.devMode });
}
