import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const Body = z.object({
  question: z.string().min(2).max(500),
});

// Compact DB snapshot. Only fields that help answering questions.
async function buildSnapshot() {
  const supabase = createAdminClient();
  const [factories, samples, pos, invoices, threads] = await Promise.all([
    supabase
      .from('ht_factories')
      .select(
        'id, name, short, city, country, specialty, status, contact_name, moq, lead_time_days, payment_terms, pinned'
      ),
    supabase
      .from('ht_samples')
      .select('id, factory_id, name, stage, requested_at, eta, received_at'),
    supabase
      .from('ht_pos')
      .select(
        'id, factory_id, sample_id, status, total, currency, deposit_paid, balance_paid, placed_at, ship_by'
      ),
    supabase
      .from('ht_invoices')
      .select(
        'id, factory_id, invoice_number, invoice_date, due_date, total, currency, parse_status, payment_terms'
      ),
    supabase
      .from('ht_wa_threads')
      .select('id, factory_id, name, wa_phone, unread_count, last_message_at'),
  ]);

  return {
    generated_at: new Date().toISOString(),
    factories: factories.data ?? [],
    samples: samples.data ?? [],
    pos: pos.data ?? [],
    invoices: invoices.data ?? [],
    whatsapp_threads: threads.data ?? [],
  };
}

const SYSTEM_PROMPT = `You are "Hair Track", a concise operations assistant for a hair-extension brand that manages factory relationships, sample rounds, purchase orders, and invoices.

You will be given the user's question and a JSON snapshot of the current database. Answer the question **based only on the data provided**. If the data is insufficient, say so clearly.

Style rules:
- Be direct and short. Use bullet points or a small table for lists.
- Use ids in backticks when referring to entities (e.g. \`FAC-018\`, \`S-104\`).
- Quote amounts with currency (e.g. "$2,400 USD").
- For dates, prefer short format like "Apr 20".
- Never invent data.
- If the answer requires a calculation, do it.

Output markdown.`;

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

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { ok: false, error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 }
    );
  }

  const snapshot = await buildSnapshot();

  const anthropic = new Anthropic();
  try {
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Database snapshot:
\`\`\`json
${JSON.stringify(snapshot)}
\`\`\`

Question: ${parsed.data.question}`,
        },
      ],
    });

    const answer = res.content
      .filter((block) => block.type === 'text')
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('\n')
      .trim();

    return Response.json({
      ok: true,
      answer,
      meta: {
        row_counts: {
          factories: snapshot.factories.length,
          samples: snapshot.samples.length,
          pos: snapshot.pos.length,
          invoices: snapshot.invoices.length,
          threads: snapshot.whatsapp_threads.length,
        },
        input_tokens: res.usage.input_tokens,
        output_tokens: res.usage.output_tokens,
      },
    });
  } catch (e) {
    console.error('[ask] anthropic error', e);
    const msg = e instanceof Error ? e.message : 'unknown error';
    return Response.json({ ok: false, error: msg }, { status: 502 });
  }
}
