import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/activity';

const PatchBody = z.object({
  factory_id: z.string().min(1).optional(),
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
    .optional(),
  total: z.number().nullable().optional(),
  currency: z.string().length(3).optional(),
  deposit_paid: z.boolean().optional(),
  balance_paid: z.boolean().optional(),
  placed_at: z.string().nullable().optional(),
  ship_by: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const parsed = PatchBody.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'invalid input' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('ht_pos')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  const kind = parsed.data.status ? 'po.status_changed' : 'po.updated';
  await logActivity(supabase, {
    actor_id: user.id,
    kind,
    entity_type: 'po',
    entity_id: id,
    payload: { changed: Object.keys(parsed.data), status: parsed.data.status },
  });

  return Response.json({ ok: true, po: data });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const { error } = await supabase.from('ht_pos').delete().eq('id', id);
  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  await logActivity(supabase, {
    actor_id: user.id,
    kind: 'po.deleted',
    entity_type: 'po',
    entity_id: id,
  });

  return Response.json({ ok: true });
}
