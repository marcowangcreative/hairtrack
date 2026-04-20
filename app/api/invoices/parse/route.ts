import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

const Body = z.object({ invoiceId: z.string().uuid() });

const Extraction = z.object({
  invoice_number: z.string().nullable().optional(),
  invoice_date: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  factory_name: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  subtotal: z.number().nullable().optional(),
  shipping: z.number().nullable().optional(),
  tax: z.number().nullable().optional(),
  total: z.number().nullable().optional(),
  payment_terms: z.string().nullable().optional(),
  line_items: z
    .array(
      z.object({
        sku: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        qty: z.number().nullable().optional(),
        unit_price: z.number().nullable().optional(),
        total: z.number().nullable().optional(),
      })
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { invoiceId } = parsed.data;

  const supabase = createAdminClient();
  const { data: inv, error } = await supabase
    .from('ht_invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();
  if (error || !inv) {
    return Response.json({ ok: false, error: error?.message ?? 'not found' }, { status: 404 });
  }

  const anthropic = new Anthropic();
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'document', source: { type: 'url', url: inv.file_url } },
          {
            type: 'text',
            text: `Extract invoice fields as JSON. Schema:
{ invoice_number, invoice_date (YYYY-MM-DD), due_date (YYYY-MM-DD), factory_name, currency (ISO), subtotal, shipping, tax, total, payment_terms, line_items: [{sku, description, qty, unit_price, total}] }
Return ONLY JSON, no prose.`,
          },
        ],
      },
    ],
  });

  const first = msg.content[0];
  if (first.type !== 'text') {
    await supabase.from('ht_invoices').update({ parse_status: 'failed' }).eq('id', invoiceId);
    return Response.json({ ok: false, error: 'non-text response' }, { status: 502 });
  }

  let json: z.infer<typeof Extraction>;
  try {
    const raw = first.text.trim().replace(/^```(?:json)?/, '').replace(/```$/, '');
    json = Extraction.parse(JSON.parse(raw));
  } catch (e) {
    await supabase
      .from('ht_invoices')
      .update({ parse_status: 'failed', raw_extraction: { raw: first.text } })
      .eq('id', invoiceId);
    return Response.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }

  await supabase
    .from('ht_invoices')
    .update({
      parse_status: 'parsed',
      invoice_number: json.invoice_number ?? null,
      invoice_date: json.invoice_date ?? null,
      due_date: json.due_date ?? null,
      currency: json.currency ?? 'USD',
      subtotal: json.subtotal ?? null,
      shipping: json.shipping ?? null,
      tax: json.tax ?? null,
      total: json.total ?? null,
      payment_terms: json.payment_terms ?? null,
      raw_extraction: json,
    })
    .eq('id', invoiceId);

  if (json.line_items?.length) {
    await supabase.from('ht_invoice_line_items').insert(
      json.line_items.map((li, i) => ({
        invoice_id: invoiceId,
        sku: li.sku ?? null,
        description: li.description ?? null,
        qty: li.qty ?? null,
        unit_price: li.unit_price ?? null,
        total: li.total ?? null,
        ordinal: i,
      }))
    );
  }

  return Response.json({ ok: true });
}
