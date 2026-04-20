import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const PatchBody = z.object({
  name: z.string().min(1).optional(),
  short: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  specialty: z.string().nullable().optional(),
  status: z
    .enum(['active', 'evaluating', 'paused', 'archived'])
    .optional(),
  whatsapp: z.string().nullable().optional(),
  alibaba_url: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  contact_name: z.string().nullable().optional(),
  contact_role: z.string().nullable().optional(),
  moq: z.number().int().nullable().optional(),
  lead_time_days: z.number().int().nullable().optional(),
  payment_terms: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  pinned: z.boolean().optional(),
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
    .from('ht_factories')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true, factory: data });
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

  const { error } = await supabase.from('ht_factories').delete().eq('id', id);

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}
