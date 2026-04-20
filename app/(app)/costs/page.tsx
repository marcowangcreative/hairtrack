import { Toolbar } from '@/components/toolbar';
import { Icons } from '@/components/icons';
import { getCostsViewData } from '@/lib/fetchers';

function fmtMoney(n: number, opts: { kilo?: boolean } = {}): string {
  if (opts.kilo && Math.abs(n) >= 1000) {
    return `$${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  }
  return `$${Math.round(n).toLocaleString()}`;
}

export default async function CostsPage() {
  const data = await getCostsViewData();

  const stats = [
    {
      label: 'Total invoiced (COGS)',
      value: fmtMoney(data.stats.totalCogs, { kilo: true }),
      delta: `${data.stats.skuCount} unique SKU${data.stats.skuCount === 1 ? '' : 's'}`,
    },
    {
      label: 'Open invoice total',
      value: fmtMoney(data.stats.openInvoiceTotal, { kilo: true }),
      delta: 'unconfirmed invoices',
    },
    {
      label: 'PO commitments',
      value: fmtMoney(data.stats.poCommitments, { kilo: true }),
      delta: 'balance not paid',
    },
    {
      label: 'Tracked factories',
      value: data.spendByFactory.length,
      delta: 'with invoice spend',
    },
  ];

  const maxFactorySpend = data.spendByFactory.reduce(
    (a, b) => Math.max(a, b.spend),
    0
  );

  return (
    <>
      <Toolbar
        crumbs={['Workspace', 'Cost & margin']}
        right={
          <>
            <div className="seg">
              <button className="on">Per SKU</button>
              <button disabled title="Coming soon">
                Per factory
              </button>
              <button disabled title="Coming soon">
                Landed cost
              </button>
            </div>
            <button className="btn" disabled title="Coming soon">
              <Icons.upload /> Export CSV
            </button>
          </>
        }
      />
      <div className="canvas">
        {!data.configured ? (
          <div className="empty-state">
            Supabase isn&apos;t configured. Fill in <code>.env.local</code>.
          </div>
        ) : (
          <div className="cost-wrap">
            <div className="cost-header">
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
                <div className="title">SKU economics</div>
                <div className="sub">
                  aggregated from confirmed invoice line items
                </div>
                <div className="spacer" />
                {data.unmatched > 0 && (
                  <span className="pill warn">
                    <span className="dot" />
                    {data.unmatched} line item(s) without SKU
                  </span>
                )}
              </div>
              <div className="body" style={{ padding: 0 }}>
                {data.skus.length === 0 ? (
                  <div className="empty-state">
                    No SKU data yet. Confirm invoices with parsed line items to
                    populate this table.
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Description</th>
                        <th>Factory</th>
                        <th style={{ textAlign: 'right' }}>Avg unit cost</th>
                        <th style={{ textAlign: 'right' }}>Qty ordered</th>
                        <th style={{ textAlign: 'right' }}>Total spent</th>
                        <th style={{ textAlign: 'right' }}>Invoices</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.skus.map((s) => (
                        <tr key={`${s.sku}|${s.factoryId}`}>
                          <td className="mono" style={{ color: 'var(--fg-3)' }}>
                            {s.sku}
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                maxWidth: 360,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'bottom',
                              }}
                              title={s.description ?? ''}
                            >
                              {s.description ?? '—'}
                            </span>
                          </td>
                          <td>{s.factoryShort ?? '—'}</td>
                          <td className="mono" style={{ textAlign: 'right' }}>
                            {s.avgUnitCost != null
                              ? `$${s.avgUnitCost.toFixed(2)}`
                              : '—'}
                          </td>
                          <td className="mono" style={{ textAlign: 'right' }}>
                            {s.totalQty.toLocaleString()}
                          </td>
                          <td className="mono" style={{ textAlign: 'right' }}>
                            {fmtMoney(s.totalCogs)}
                          </td>
                          <td className="mono" style={{ textAlign: 'right' }}>
                            {s.invoiceCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
              }}
            >
              <div className="card">
                <div className="head">
                  <div className="title">Spend by factory</div>
                  <div className="sub">
                    sum of all invoiced amounts (lifetime)
                  </div>
                </div>
                <div className="body">
                  {data.spendByFactory.length === 0 ? (
                    <div className="muted" style={{ fontSize: 12 }}>
                      No invoice spend yet.
                    </div>
                  ) : (
                    data.spendByFactory.map((f) => (
                      <div key={f.factoryId} className="bar-row">
                        <div className="label">{f.factoryShort}</div>
                        <div className="barbg">
                          <div
                            className="barfill"
                            style={{
                              width: `${
                                maxFactorySpend
                                  ? (f.spend / maxFactorySpend) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <div className="num">{fmtMoney(f.spend)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card">
                <div className="head">
                  <div className="title">Cash runway</div>
                  <div className="sub">
                    open invoice + PO obligations by due date
                  </div>
                </div>
                <div className="body">
                  {data.cashRunway.every((b) => b.amount === 0) ? (
                    <div className="muted" style={{ fontSize: 12 }}>
                      No upcoming obligations.
                    </div>
                  ) : (
                    data.cashRunway.map((r, i) => (
                      <div
                        key={r.label}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '90px 1fr auto',
                          gap: 10,
                          padding: '8px 0',
                          borderBottom:
                            i < data.cashRunway.length - 1
                              ? '1px solid var(--line)'
                              : 'none',
                          alignItems: 'center',
                          opacity: r.amount === 0 ? 0.4 : 1,
                        }}
                      >
                        <div
                          className="mono"
                          style={{
                            fontSize: 11,
                            color:
                              r.cls === 'danger'
                                ? 'var(--danger)'
                                : r.cls === 'warn'
                                  ? 'var(--warn)'
                                  : 'var(--fg-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                          }}
                        >
                          {r.label}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: 'var(--fg-1)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={r.note}
                        >
                          {r.amount === 0 ? '—' : r.note}
                        </div>
                        <div
                          className="mono"
                          style={{ fontSize: 13, color: 'var(--fg)' }}
                        >
                          {fmtMoney(r.amount)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
