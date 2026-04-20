import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { nextSequentialId } from '@/lib/ids';

const Body = z.object({
  name: z.string().min(1),
  factory_id: z.string().nullable().optional(),
  stage: z
    .enum([
      'requested',
      'in_production',
      'shipping',
      'received',
      'approved',
      'rejected',
    ])
    .default('requested'),
  requested_at: z.string().nullable().optional(),
  eta: z.string().nullable().optional(),
  received_at: z.string().nullable().optional(),
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

  const id = await nextSequentialId(supabase, 'ht_samples', 'S-', 3);

  const { data, error } = await supabase
    .from('ht_samples')
    .insert({
      id,
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true, sample: data });
}
