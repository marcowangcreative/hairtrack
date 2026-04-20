import { Toolbar } from '@/components/toolbar';

export default function SettingsPage() {
  const telnyx = Boolean(process.env.TELNYX_API_KEY);
  const anthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const supabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  const rows = [
    { name: 'Supabase', ok: supabase },
    { name: 'Anthropic (invoice OCR)', ok: anthropic },
    { name: 'Telnyx (WhatsApp)', ok: telnyx },
  ];

  return (
    <>
      <Toolbar crumbs={['Workspace', 'Integrations']} />
      <div className="canvas">
        <div style={{ padding: 16, maxWidth: 640 }}>
          <div className="card">
            <div className="head">
              <div className="title">Integration status</div>
              <div className="sub">detected from env</div>
            </div>
            <div className="body" style={{ padding: 0 }}>
              {rows.map((r) => (
                <div
                  key={r.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--line)',
                    fontSize: 13,
                  }}
                >
                  <span>{r.name}</span>
                  <span style={{ marginLeft: 'auto' }}>
                    <span className={'pill ' + (r.ok ? 'ok' : 'warn')}>
                      <span className="dot" />
                      {r.ok ? 'configured' : 'missing env'}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p
            className="mono"
            style={{ marginTop: 14, fontSize: 11, color: 'var(--fg-3)' }}
          >
            Fill in <code>.env.local</code> using{' '}
            <code>.env.local.example</code> as a template.
          </p>
        </div>
      </div>
    </>
  );
}
