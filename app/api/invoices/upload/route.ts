import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const BUCKET = 'invoices';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file');
  const factoryId = form.get('factory_id') as string | null;
  if (!(file instanceof File)) {
    return Response.json({ ok: false, error: 'file required' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'pdf';
  const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadErr) {
    return Response.json({ ok: false, error: uploadErr.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data: invoice, error: insertErr } = await supabase
    .from('invoices')
    .insert({
      factory_id: factoryId,
      file_url: publicUrl,
      source: 'upload',
      parse_status: 'pending',
    })
    .select()
    .single();
  if (insertErr) {
    return Response.json({ ok: false, error: insertErr.message }, { status: 500 });
  }

  // TODO: enqueue OCR via Inngest instead of calling inline.
  // For now, kick off parse best-effort and return immediately.
  void fetch(new URL('/api/invoices/parse', req.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoiceId: invoice.id }),
  });

  return Response.json({ ok: true, invoice });
}
