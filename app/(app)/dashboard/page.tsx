import { Toolbar } from '@/components/toolbar';
import { Icons } from '@/components/icons';
import { getDashboardData } from '@/lib/fetchers';

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  requested: { label: 'Requested', color: '#8a8a85' },
  in_production: { label: 'In production', color: 'oklch(0.78 0.14 75)' },
  shipping: { label: 'Shipping', color: 'oklch(0.68 0.17 290)' },
  received: { label: 'Received — QC', color: 'oklch(0.7 0.14 210)' },
  approved: { label: 'Approved', color: 'oklch(0.72 0.14 155)' },
  rejected: { label: 'Rejected', color: 'oklch(0.68 0.18 25)' },
};

function formatRelativeTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const totalSamples = data.samplesByStage.reduce((a, s) => a + s.count, 0);

  const stats = [
    {
      label: 'Active factories',
      value: data.stats.activeFactories,
      delta: data.configured ? 'from factories table' : 'connect supabase',
    },
    {
      label: 'Samples in-flight',
      value: data.stats.samplesInFlight,
      delta: `${totalSamples} total`,
    },
    {
      label: 'Unread on WhatsApp',
      value: data.stats.whatsappUnread,
      delta: 'across threads',
    },
    {
      label: 'Open invoices',
      value: data.stats.openInvoices,
      delta: data.stats.invoicesOpenTotal
        ? `$${data.stats.invoicesOpenTotal.toLocaleString()} pending`
        : 'no totals yet',
    },
  ];

  return (
    <>
      <Toolbar
        crumbs={['Workspace', 'Dashboard']}
        right={
          <>
            <button className="btn">
              <Icons.plus /> New sample
            </button>
            <button className="btn primary">
              <Icons.sparkle /> Ask Hair Track
            </button>
          </>
        }
      />
      <div className="canvas">
        <div className="dash">
          <div className="stats">
            {stats.map((s) => (
              <div key={s.label} className="stat">
                <div className="label">{s.label}</div>
                <div className="value">{s.value}</div>
                <div className="delta">{s.delta}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="head">
              <div className="title">Samples by stage</div>
              <div className="sub">live</div>
              <div className="spacer" />
              <button className="btn ghost sm">
                <Icons.more />
              </button>
            </div>
            <div className="body" style={{ padding: 0 }}>
              {totalSamples === 0 ? (
                <div className="empty-state">
                  No samples yet. Add rows to the <code>samples</code> table.
                </div>
              ) : (
                data.samplesByStage.map((s) => {
                  const meta = STAGE_LABELS[s.stage] ?? {
                    label: s.stage,
                    color: '#8a8a85',
                  };
                  const pct = totalSamples === 0 ? 0 : s.count / totalSamples;
                  return (
                    <div
                      key={s.stage}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '140px 1fr 40px',
                        gap: 10,
                        alignItems: 'center',
                        padding: '8px 14px',
                        borderBottom: '1px solid var(--line)',
                      }}
                    >
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 2,
                            background: meta.color,
                          }}
                        />
                        <span style={{ fontSize: 12 }}>{meta.label}</span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: 'var(--bg-2)',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct * 100}%`,
                            background: meta.color,
                          }}
                        />
                      </div>
                      <div
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: 'var(--fg-2)',
                          textAlign: 'right',
                        }}
                      >
                        {s.count}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card">
            <div className="head">
              <div className="title">Activity</div>
              <div className="sub">latest 10</div>
              <div className="spacer" />
              <span className={'pill ' + (data.configured ? 'ok' : 'warn')}>
                <span className="dot" />
                {data.configured ? 'sync ok' : 'offline'}
              </span>
            </div>
            <div className="body" style={{ padding: 0 }}>
              {data.activity.length === 0 ? (
                <div className="empty-state">
                  {data.configured
                    ? 'No activity yet.'
                    : (
                        <>
                          Configure <code>.env.local</code> and run{' '}
                          <code>schema.sql</code> to start tracking activity.
                        </>
                      )}
                </div>
              ) : (
                data.activity.map((a) => (
                  <div key={a.id} className="activity-row">
                    <div className="time">{formatRelativeTime(a.created_at)}</div>
                    <div className="who">{a.entity_type ?? 'system'}</div>
                    <div className="what">
                      <b>{a.kind}</b>
                      {a.entity_id ? ` · ${a.entity_id}` : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="head">
              <div className="title">Launch runway</div>
              <div className="sub">Timeline preview</div>
              <div className="spacer" />
              <a href="/timeline" className="btn ghost sm">
                <Icons.calendar /> Open timeline
              </a>
            </div>
            <div className="body">
              <div className="empty-state">
                Timeline view coming next — will read from <code>samples</code> +{' '}
                <code>pos</code> date fields.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
