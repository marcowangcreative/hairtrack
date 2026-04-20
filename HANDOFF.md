# Hair Track — Developer Handoff

A prototype-to-production scaffold. This document is everything a dev (or Claude Code) needs to turn the prototype into a live app.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Next.js 15** (App Router) on **Vercel** | The prototype's JSX ports directly to React components |
| Database | **Supabase** (Postgres) | Relational fits factories/samples/invoices well |
| Auth | **Supabase Auth** (email magic link) | 2–5 person team, no complex SSO needed |
| Storage | **Supabase Storage** | Sample photos, invoice PDFs, NDAs |
| Realtime | **Supabase Realtime** | Live WhatsApp thread updates |
| WhatsApp | **Telnyx WhatsApp Business API** | You already have account |
| OCR | **Claude API** (claude-sonnet-4-5) | Better invoice extraction than Textract for messy factory invoices |
| Jobs | **Inngest** | Daily digest, payment reminders, template renewal |

**Monthly cost at your scale: ~$45–75.**

---

## 2. Repo bootstrap

```bash
npx create-next-app@latest hair-track --typescript --tailwind --app
cd hair-track
npm i @supabase/supabase-js @supabase/ssr zod
npm i -D @types/node
```

Copy all `.jsx` files from this prototype into `app/components/` as `.tsx`. Rename and add types. The CSS in `styles.css` can be ported to Tailwind or kept as a global stylesheet.

---

## 3. Supabase schema

Run this in the Supabase SQL editor:

```sql
-- =====================================================
-- USERS / TEAM
-- =====================================================
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  role text not null default 'ops' check (role in ('founder','ops','viewer')),
  avatar_url text,
  created_at timestamptz default now()
);

-- =====================================================
-- FACTORIES
-- =====================================================
create table factories (
  id text primary key,                    -- e.g. 'F-001'
  name text not null,
  short text,
  city text,
  country text,
  specialty text,
  status text default 'evaluating' check (status in ('active','evaluating','paused','archived')),
  whatsapp text,
  alibaba_url text,
  website text,
  contact_name text,
  contact_role text,
  moq int,
  lead_time_days int,
  payment_terms text,
  swatch text,                            -- hex color chip
  notes text,
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on factories (status);

-- =====================================================
-- SAMPLES
-- =====================================================
create table samples (
  id text primary key,                    -- e.g. 'S-104'
  factory_id text references factories(id) on delete set null,
  name text not null,
  stage text not null default 'requested' check (stage in (
    'requested','in_production','shipping','received','approved','rejected'
  )),
  requested_at date,
  eta date,
  received_at date,
  notes text,
  cover_photo text,                       -- storage url
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on samples (stage);
create index on samples (factory_id);

create table sample_photos (
  id uuid primary key default gen_random_uuid(),
  sample_id text references samples(id) on delete cascade,
  url text not null,
  caption text,
  created_at timestamptz default now()
);

-- =====================================================
-- WHATSAPP THREADS + MESSAGES
-- =====================================================
create table wa_threads (
  id uuid primary key default gen_random_uuid(),
  factory_id text references factories(id) on delete set null,
  wa_phone text not null,                 -- +86... as E.164
  name text,                              -- contact display name
  pinned boolean default false,
  unread_count int default 0,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz default now(),
  unique (wa_phone)
);
create index on wa_threads (last_message_at desc);

create table wa_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references wa_threads(id) on delete cascade,
  direction text not null check (direction in ('inbound','outbound')),
  body text,
  media_url text,                         -- supabase storage url if photo/pdf
  media_type text,                        -- 'image' | 'document' | 'audio'
  telnyx_id text,                         -- for dedup on webhook replay
  sent_by uuid references profiles(id),   -- null if inbound
  status text default 'sent' check (status in ('pending','sent','delivered','read','failed')),
  sent_at timestamptz default now()
);
create index on wa_messages (thread_id, sent_at desc);
create unique index on wa_messages (telnyx_id) where telnyx_id is not null;

-- =====================================================
-- INVOICES + PARSING
-- =====================================================
create table invoices (
  id uuid primary key default gen_random_uuid(),
  factory_id text references factories(id) on delete set null,
  file_url text not null,                 -- original pdf/img in storage
  source text default 'upload' check (source in ('upload','email','whatsapp')),
  parse_status text default 'pending' check (parse_status in ('pending','parsed','confirmed','failed')),
  parse_confidence numeric,               -- 0-1
  invoice_number text,
  invoice_date date,
  due_date date,
  currency text default 'USD',
  subtotal numeric,
  shipping numeric,
  tax numeric,
  total numeric,
  payment_terms text,
  raw_extraction jsonb,                   -- full claude response
  confirmed_at timestamptz,
  confirmed_by uuid references profiles(id),
  created_at timestamptz default now()
);
create index on invoices (factory_id, invoice_date desc);
create index on invoices (parse_status);

create table invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  sku text,
  description text,
  qty numeric,
  unit_price numeric,
  total numeric,
  ordinal int
);

-- =====================================================
-- PURCHASE ORDERS
-- =====================================================
create table pos (
  id text primary key,                    -- e.g. 'PO-2026-041'
  factory_id text references factories(id),
  sample_id text references samples(id),
  status text default 'draft' check (status in ('draft','sent','confirmed','in_production','shipped','received','closed')),
  total numeric,
  currency text default 'USD',
  deposit_paid boolean default false,
  balance_paid boolean default false,
  placed_at date,
  ship_by date,
  notes text,
  created_at timestamptz default now()
);

-- =====================================================
-- ACTIVITY FEED
-- =====================================================
create table activity (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  kind text not null,                     -- 'sample.stage_changed', 'invoice.parsed', etc
  entity_type text,
  entity_id text,
  payload jsonb,
  created_at timestamptz default now()
);
create index on activity (created_at desc);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
alter table factories enable row level security;
alter table samples enable row level security;
alter table wa_threads enable row level security;
alter table wa_messages enable row level security;
alter table invoices enable row level security;
alter table invoice_line_items enable row level security;
alter table pos enable row level security;
alter table activity enable row level security;

-- Simple: any authenticated team member can read/write everything
create policy "team_all" on factories for all to authenticated using (true) with check (true);
create policy "team_all" on samples for all to authenticated using (true) with check (true);
create policy "team_all" on wa_threads for all to authenticated using (true) with check (true);
create policy "team_all" on wa_messages for all to authenticated using (true) with check (true);
create policy "team_all" on invoices for all to authenticated using (true) with check (true);
create policy "team_all" on invoice_line_items for all to authenticated using (true) with check (true);
create policy "team_all" on pos for all to authenticated using (true) with check (true);
create policy "team_all" on activity for all to authenticated using (true) with check (true);

-- Viewers can't write (tighten later)
create policy "viewers_no_write" on factories for insert to authenticated
  with check ((select role from profiles where id = auth.uid()) <> 'viewer');
```

---

## 4. API routes to build (Next.js app/api/)

| Route | Method | Purpose |
|---|---|---|
| `api/whatsapp/incoming` | POST | Telnyx webhook — new message arrives |
| `api/whatsapp/status` | POST | Telnyx webhook — delivery receipts |
| `api/whatsapp/send` | POST | Outbound message (from chat UI) |
| `api/invoices/upload` | POST | Accept file → storage → queue OCR |
| `api/invoices/parse` | POST | Run Claude OCR, update invoice row |
| `api/invoices/[id]/confirm` | POST | Ops confirms parsed fields |
| `api/factories/sync-alibaba` | POST | Scrape Alibaba supplier page (optional) |

### Telnyx webhook handler (skeleton)

```ts
// app/api/whatsapp/incoming/route.ts
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { from, to, text, media, id: telnyxId } = body.data.payload;

  const supabase = await createClient();

  // upsert thread
  const { data: thread } = await supabase
    .from('wa_threads')
    .upsert({ wa_phone: from }, { onConflict: 'wa_phone' })
    .select().single();

  // store message (idempotent via telnyx_id)
  await supabase.from('wa_messages').insert({
    thread_id: thread.id,
    direction: 'inbound',
    body: text,
    media_url: media?.[0]?.url,
    telnyx_id: telnyxId,
  });

  // bump thread
  await supabase.from('wa_threads').update({
    last_message_at: new Date().toISOString(),
    last_message_preview: text?.slice(0, 120),
    unread_count: thread.unread_count + 1,
  }).eq('id', thread.id);

  return Response.json({ ok: true });
}
```

### Claude invoice OCR (skeleton)

```ts
// app/api/invoices/parse/route.ts
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  const { invoiceId } = await req.json();
  const supabase = await createClient();
  const { data: inv } = await supabase.from('invoices').select('*').eq('id', invoiceId).single();

  const anthropic = new Anthropic();
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        { type: 'document', source: { type: 'url', url: inv.file_url } },
        { type: 'text', text: `Extract invoice fields as JSON. Schema: { invoice_number, invoice_date, due_date, factory_name, currency, subtotal, shipping, tax, total, payment_terms, line_items: [{sku, description, qty, unit_price, total}] }. Return only JSON.` }
      ]
    }]
  });

  const json = JSON.parse(msg.content[0].text);
  await supabase.from('invoices').update({
    parse_status: 'parsed',
    invoice_number: json.invoice_number,
    invoice_date: json.invoice_date,
    total: json.total,
    raw_extraction: json,
    // ...
  }).eq('id', invoiceId);

  // insert line items
  if (json.line_items?.length) {
    await supabase.from('invoice_line_items').insert(
      json.line_items.map((li, i) => ({ ...li, invoice_id: invoiceId, ordinal: i }))
    );
  }

  return Response.json({ ok: true });
}
```

---

## 5. Realtime chat subscription

```ts
// In the WhatsAppView component
useEffect(() => {
  const channel = supabase
    .channel('wa_messages')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'wa_messages' },
      (payload) => {
        // refresh thread list, append to open chat, toast if backgrounded
      })
    .subscribe();
  return () => { channel.unsubscribe(); };
}, []);
```

---

## 6. Environment variables

```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # webhook handlers only

TELNYX_API_KEY=
TELNYX_WHATSAPP_NUMBER=+1...          # your WABA number
TELNYX_WEBHOOK_SECRET=                # verify incoming webhooks

ANTHROPIC_API_KEY=

INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

---

## 7. Deployment steps (Day 1 → Live)

1. **Day 1** — `create-next-app`, deploy empty to Vercel, set up Supabase, run schema
2. **Day 2** — Port `shell.jsx`, `view_factories.jsx`, `view_dashboard.jsx` to real components. Wire to Supabase reads.
3. **Day 3** — Seed factories table from `data.jsx`. Add factory create/edit forms.
4. **Day 4** — Invoices: upload → storage → Claude parse → confirm flow.
5. **Day 5** — Telnyx WABA setup, webhook endpoint, outbound send.
6. **Day 6** — Realtime subscriptions, unread counts, search.
7. **Week 2** — Samples pipeline, POs, timeline, cost tracking, polish.
8. **Week 3** — Team auth, roles, audit log, email digests via Inngest.
9. **Week 4** — Production hardening, error tracking (Sentry), backup strategy.

---

## 8. Handing this to Claude Code

In Claude Code or Cursor, start with:

> "I have a Next.js project scaffolded. Read `HANDOFF.md` in the root. Then look at the prototype files in `/prototype/` — port `shell.jsx` and `view_dashboard.jsx` first, wiring them to real Supabase data instead of the mock `data.jsx`."

Then feed it one view at a time. Usually takes 2–3 prompts per view.

---

## 9. Component → Table map

| Prototype view | Reads from | Writes to |
|---|---|---|
| `DashboardView` | activity, samples, factories (aggregates) | — |
| `FactoriesView` | factories, samples, invoices, pos | factories |
| `SamplesView` | samples, sample_photos, factories | samples, sample_photos |
| `WhatsAppView` | wa_threads, wa_messages, factories | wa_messages (via send API) |
| `InvoicesView` | invoices, invoice_line_items | invoices (confirm action) |
| `TimelineView` | samples, pos (date fields) | — |
| `CostsView` | invoices, pos (aggregates) | — |
| `SettingsView` | (telnyx status via API), profiles | profiles |

---

## 10. Design system notes (for the dev)

- Monospace for metadata, numbers, IDs, timestamps. Sans for content.
- `oklch()` color space — every accent is defined in oklch for consistent perceptual lightness across themes.
- 32px row height (26px in compact mode).
- Status pills are semantic: `.ok`, `.warn`, `.danger`, `.accent`.
- Dark is default; light mode is `:root.light`. Don't use `@media (prefers-color-scheme)` — let the user pick.

---

Good luck. The prototype is the spec.
