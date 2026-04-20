import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/activity';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const { error } = await supabase.from('ht_invoices').delete().eq('id', id);
  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  await logActivity(supabase, {
    actor_id: user.id,
    kind: 'invoice.deleted',
    entity_type: 'invoice',
    entity_id: id,
  });

  return Response.json({ ok: true });
}
