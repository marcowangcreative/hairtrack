import Link from 'next/link';

const views = [
  { n: 1, href: '/dashboard', name: 'Dashboard', desc: 'Live stats, activity, runway' },
  { n: 2, href: '/factories', name: 'Factories', desc: 'Directory + detail panels' },
  { n: 3, href: '/samples', name: 'Samples', desc: 'Kanban / list / timeline' },
  { n: 4, href: '/whatsapp', name: 'WhatsApp', desc: '3-pane chat w/ context' },
  { n: 5, href: '/invoices', name: 'Invoices', desc: 'Drop → parse → confirm' },
  { n: 6, href: '/timeline', name: 'Timeline', desc: '12-week launch Gantt' },
  { n: 7, href: '/costs', name: 'Cost & margin', desc: 'Per-SKU + cash runway' },
  { n: 8, href: '/settings', name: 'Integrations', desc: 'Telnyx, templates, usage' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Hair Track</h1>
        <p className="mt-2 text-sm text-neutral-400 font-mono">
          Factory ops tracker — scaffolded from prototype. See <code>HANDOFF.md</code>.
        </p>

        <ul className="mt-10 divide-y divide-neutral-800 border-y border-neutral-800">
          {views.map((v) => (
            <li key={v.href}>
              <Link
                href={v.href}
                className="flex items-center gap-4 py-3 hover:bg-neutral-900 px-2 -mx-2 rounded"
              >
                <span className="w-6 font-mono text-xs text-neutral-500">{v.n}</span>
                <span className="w-36 font-medium">{v.name}</span>
                <span className="text-sm text-neutral-400">{v.desc}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-xs font-mono text-neutral-500">
          Next: port <code>prototype/shell.jsx</code> + <code>view_dashboard.jsx</code> into{' '}
          <code>app/</code> and wire to Supabase.
        </p>
      </div>
    </main>
  );
}
