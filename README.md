# Hair Track

Factory ops tracker for hairline launches — factories, samples, WhatsApp chat, auto-parsed invoices, production timeline, cost & margin.

## Status

Scaffolded from prototype → **Next.js 16 + Supabase + Tailwind**. Prototype lives under `prototype/` and is the design spec.

## Layout

```
app/                     Next.js App Router
  api/
    whatsapp/{incoming,status,send}/route.ts   Telnyx webhooks + outbound
    invoices/{upload,parse,[id]/confirm}/route.ts  Upload → Claude OCR → confirm
  page.tsx               Landing + view nav
  layout.tsx, globals.css
lib/
  supabase/{server,client,admin}.ts            SSR, browser, service-role clients
  types/db.ts                                  Hand-written row types
proxy.ts                 Supabase session refresh (Next 16 proxy convention)
prototype/               Original HTML + JSX prototype (reference)
schema.sql               Paste into Supabase SQL editor
HANDOFF.md               Full dev handoff (stack, API routes, deploy plan)
.env.local.example       Copy → .env.local
```

## Dev

```bash
npm install           # already done
cp .env.local.example .env.local   # then fill in values
npm run dev
```

Open http://localhost:3000.

## Supabase setup

1. Create a new Supabase project.
2. Paste `schema.sql` into the SQL editor and run it.
3. Create a public storage bucket named `invoices` (used by `/api/invoices/upload`).
4. Copy URL + anon + service-role keys into `.env.local`.

## Prototype (legacy)

Open `prototype/index.html` in a browser to see the original design. Use keyboard `1–8` to switch views, toolbar toggle for layout/density/theme tweaks.

## Next steps

See `HANDOFF.md` §7 for the Day 1 → Live plan. In short:

1. Port `prototype/shell.jsx` + `prototype/view_dashboard.jsx` → `app/(dashboard)/`.
2. Seed `factories` from `prototype/data.jsx`.
3. Wire the invoice upload → parse → confirm flow end-to-end.
4. Telnyx WABA webhook + outbound send from chat UI.
5. Realtime subscription on `wa_messages`.
