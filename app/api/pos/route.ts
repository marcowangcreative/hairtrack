import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { nextSequentialId } from '@/lib/ids';
import { logActivity } from '@/lib/activity';

const Body = z.object({
  factory_id: z.string().min(1),
  sample_id: z.string().nullable().optional(),
  status: z
    .enum([
      'draft',
      'sent',
      'confirmed',
      'in_production',
      'shipped',
      'received',
      'closed',
    ])
    .default('draft'),
  total: z.number().nullable().optional(),
  currency: z.string().length(3).default('USD'),
  deposit_paid: z.boolean().default(false),
  balance_paid: z.boolean().default(false),
  placed_at: z.string().nullable().optional(),
  ship_by: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'invalid input' },
      { status: 400 }
    );
  }

  const id = await nextSequentialId(supabase, 'ht_pos', 'PO-', 4);

  const { data, error } = await supabase
    .from('ht_pos')
    .insert({ id, ...parsed.data })
    .select()
    .single();

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  await logActivity(supabase, {
    actor_id: user.id,
    kind: 'po.created',
    entity_type: 'po',
    entity_id: data.id,
    payload: { factory_id: data.factory_id, total: data.total },
  });

  return Response.json({ ok: true, po: data });
}
