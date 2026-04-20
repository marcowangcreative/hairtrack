import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { nextSequentialId } from '@/lib/ids';
import { logActivity } from '@/lib/activity';

const Body = z.object({
  name: z.string().min(1),
  short: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  specialty: z.string().nullable().optional(),
  status: z
    .enum(['active', 'evaluating', 'paused', 'archived'])
    .default('evaluating'),
  whatsapp: z.string().nullable().optional(),
  alibaba_url: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  contact_name: z.string().nullable().optional(),
  contact_role: z.string().nullable().optional(),
  moq: z.number().int().nullable().optional(),
  lead_time_days: z.number().int().nullable().optional(),
  payment_terms: z.string().nullable().optional(),
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

  const id = await nextSequentialId(supabase, 'ht_factories', 'FAC-', 3);

  const row = {
    id,
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('ht_factories')
    .insert(row)
    .select()
    .single();

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  await logActivity(supabase, {
    actor_id: user.id,
    kind: 'factory.created',
    entity_type: 'factory',
    entity_id: data.id,
    payload: { name: data.name },
  });

  return Response.json({ ok: true, factory: data });
}
