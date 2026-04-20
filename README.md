# Hair Track

Factory ops tracker for hairline launches — factories, samples, WhatsApp chat, auto-parsed invoices, production timeline, cost & margin.

## Files

- `index.html` — working prototype (open this)
- `HANDOFF.md` — full developer handoff: stack, deploy plan, component→table map
- `schema.sql` — Supabase schema (paste into SQL editor)
- `*.jsx` — prototype components (port these to your Next.js repo)
- `data.jsx` — mock data (reference for seeding real DB)
- `styles.css` — complete stylesheet with light/dark mode

## Views (keyboard `1–8`)

1. Dashboard — live stats, activity feed, launch runway
2. Factories — directory + detail panels
3. Samples — kanban / list / timeline
4. WhatsApp — 3-pane chat with factory context
5. Invoices — drop → parse → confirm
6. Timeline — 12-week launch Gantt
7. Cost & margin — per-SKU + cash runway
8. Integrations — Telnyx, templates, usage meter

## Tweaks (toolbar toggle)

Layout (sidebar/top), pipeline view (kanban/list/timeline), density (comfy/compact), theme (dark/light).

## To go live

See `HANDOFF.md` — realistic timeline is 2–4 weeks with AI-assisted dev.
