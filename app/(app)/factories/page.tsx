import Link from 'next/link';
import { Toolbar } from '@/components/toolbar';
import { Icons } from '@/components/icons';
import { FactoryList } from '@/components/factory-list';
import { StagePill, InvoiceStatusPill, FactoryStatusPill } from '@/components/pills';
import { getFactoriesViewData } from '@/lib/fetchers';
import type { FactoriesViewData } from '@/lib/fetchers';
import {
  FactoryAddButton,
  FactoryEditButton,
} from '@/components/factory-actions';
import { PoAddButton } from '@/components/po-actions';
import {
  SampleAddButton,
  SampleEditButton,
} from '@/components/sample-actions';

const SUBTABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'samples', label: 'Samples' },
  { id: 'orders', label: 'POs & invoices' },
  { id: 'chat', label: 'Chat' },
  { id: 'notes', label: 'Notes' },
] as const;

type Tab = (typeof SUBTABS)[number]['id'];

function toDollar(n: number | null | undefined): string {
  if (n == null) return '—';
  return `$${Math.round(Number(n)).toLocaleString()}`;
}

export default async function FactoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const tab: Tab =
    (SUBTABS.find((t) => t.id === params.tab)?.id as Tab) ?? 'overview';

  const data = await getFactoriesViewData(params.id);

  return (
    <>
      <Toolbar
        crumbs={['Workspace', 'Factories']}
        right={
          <>
            <div className="seg">
              <button className="on">
                <Icons.list /> List
              </button>
              <button disabled title="Coming soon">
                <Icons.grid /> Grid
              </button>
              <button disabled title="Coming soon">
                <Icons.globe /> Map
              </button>
            </div>
            <button className="btn" disabled>
              <Icons.filter /> Filter
            </button>
            <FactoryAddButton />
          </>
        }
      />

      {!data.configured ? (
        <div className="canvas">
          <div className="empty-state">
            Supabase isn&apos;t configured — set{' '}
            <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> in <code>.env.local</code>.
          </div>
        </div>
      ) : data.factories.length === 0 ? (
        <div className="canvas">
          <div className="empty-state">
            No factories yet. Run <code>seed.sql</code> in the Supabase SQL editor
            to load demo data.
          </div>
        </div>
      ) : (
        <div className="canvas" style={{ display: 'flex' }}>
          <div className="split" style={{ width: '100%' }}>
            <FactoryList
              factories={data.factories}
              selectedId={data.selected?.id ?? null}
              tab={tab}
            />
            {data.selected && (
              <FactoryDetail
                selected={data.selected}
                tab={tab}
                allFactories={data.factories}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function FactoryDetail({
  selected: sel,
  tab,
  allFactories,
}: {
  selected: NonNullable<FactoriesViewData['selected']>;
  tab: Tab;
  allFactories: FactoriesViewData['factories'];
}) {
  const invoicesForTab = sel.invoices.length;

  return (
    <div className="factory-detail">
      <div className="factory-hero">
        <div
          className="big-thumb"
          style={sel.swatch ? { background: sel.swatch } : undefined}
        />
        <div>
          <h2>{sel.name}</h2>
          <div className="subline">
            <span>{sel.id}</span>
            {sel.city && (
              <>
                <span>·</span>
                <span>
                  {sel.city}
                  {sel.country ? `, ${sel.country}` : ''}
                </span>
              </>
            )}
            <FactoryStatusPill status={sel.status} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {sel.whatsapp && (
            <Link
              href={`/whatsapp?factory=${encodeURIComponent(sel.id)}`}
              className="btn"
            >
              <Icons.whatsapp /> WhatsApp
            </Link>
          )}
          {sel.alibaba_url && (
            <a
              href={sel.alibaba_url}
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              <Icons.link /> Alibaba
            </a>
          )}
          <FactoryEditButton factory={sel} />
          <PoAddButton
            factories={allFactories}
            samples={sel.samples}
            defaultFactoryId={sel.id}
          />
        </div>
      </div>

      <div className="kv-grid">
        <KV k="Contact" v={sel.contact_name ?? '—'} />
        <KV k="WhatsApp" v={sel.whatsapp ?? '—'} mono />
        <KV
          k="Alibaba link"
          v={
            sel.alibaba_url ? (
              <a
                href={sel.alibaba_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent-fg)' }}
              >
                open →
              </a>
            ) : (
              '—'
            )
          }
        />
        <KV k="Specialty" v={sel.specialty ?? '—'} />
        <KV k="MOQ" v={sel.moq ? `${sel.moq} units` : '—'} mono />
        <KV
          k="Lead time"
          v={sel.lead_time_days ? `${sel.lead_time_days} days` : '—'}
          mono
        />
        <KV k="Payment terms" v={sel.payment_terms ?? '—'} />
        <KV k="Lifetime spend" v={toDollar(sel.lifetimeSpend)} mono />
      </div>

      <div className="subtabs">
        {SUBTABS.map((t) => {
          const count =
            t.id === 'samples'
              ? sel.samples.length
              : t.id === 'orders'
              ? invoicesForTab
              : null;
          const href = `/factories?id=${encodeURIComponent(sel.id)}${
            t.id === 'overview' ? '' : `&tab=${t.id}`
          }`;
          return (
            <Link
              key={t.id}
              href={href}
              scroll={false}
              className={'t' + (tab === t.id ? ' on' : '')}
            >
              <span>{t.label}</span>
              {count != null && (
                <span
                  className="mono"
                  style={{ fontSize: 10, color: 'var(--fg-3)' }}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {tab === 'overview' && <OverviewTab selected={sel} />}
      {tab === 'samples' && (
        <SamplesTab
          samples={sel.samples}
          factoryId={sel.id}
          allFactories={allFactories}
        />
      )}
      {tab === 'orders' && <OrdersTab invoices={sel.invoices} />}
      {tab === 'chat' && <ChatTab thread={sel.thread} factoryId={sel.id} />}
      {tab === 'notes' && (
        <div className="section">
          <h3>Notes</h3>
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              color: 'var(--fg-1)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {sel.notes || 'No notes.'}
          </div>
        </div>
      )}
    </div>
  );
}

function KV({
  k,
  v,
  mono,
}: {
  k: string;
  v: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="k">{k}</div>
      <div className={'v' + (mono ? ' mono' : '')}>{v}</div>
    </div>
  );
}

function OverviewTab({
  selected: sel,
}: {
  selected: NonNullable<FactoriesViewData['selected']>;
}) {
  const active = sel.samples.filter(
    (s) => s.stage !== 'approved' && s.stage !== 'rejected'
  );

  return (
    <div className="section">
      <div
        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}
      >
        <div>
          <h3>Active samples</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {active.length === 0 && (
              <div className="muted" style={{ fontSize: 12 }}>
                No active samples.
              </div>
            )}
            {active.map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 1fr auto auto',
                  gap: 12,
                  padding: '9px 12px',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  alignItems: 'center',
                }}
              >
                <span
                  className="mono"
                  style={{ fontSize: 11, color: 'var(--fg-3)' }}
                >
                  {s.id}
                </span>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--fg)' }}>
                    {s.name}
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: 'var(--fg-3)',
                      marginTop: 2,
                    }}
                  >
                    req {s.requested_at ?? '—'} · ETA {s.eta ?? '—'}
                  </div>
                </div>
                <StagePill stage={s.stage} />
                <Link
                  href={`/samples?id=${encodeURIComponent(s.id)}`}
                  className="mono"
                  style={{ fontSize: 11, color: 'var(--accent-fg)' }}
                >
                  open →
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3>Notes</h3>
          <div
            style={{
              fontSize: 12.5,
              lineHeight: 1.55,
              color: 'var(--fg-1)',
              padding: 12,
              border: '1px solid var(--line)',
              borderRadius: 6,
              whiteSpace: 'pre-wrap',
            }}
          >
            {sel.notes || 'No notes yet.'}
          </div>
          <h3 style={{ marginTop: 20 }}>Recent invoices</h3>
          <div style={{ display: 'grid', gap: 6 }}>
            {sel.invoices.length === 0 && (
              <div className="muted" style={{ fontSize: 12 }}>
                None.
              </div>
            )}
            {sel.invoices.slice(0, 5).map((i) => (
              <div
                key={i.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  fontSize: 12,
                  padding: '7px 10px',
                  border: '1px solid var(--line)',
                  borderRadius: 5,
                }}
              >
                <Icons.doc />
                <div
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {i.invoice_number ?? i.file_url.split('/').pop()}
                </div>
                <span
                  className="mono"
                  style={{ fontSize: 10, color: 'var(--fg-3)' }}
                >
                  {toDollar(i.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SamplesTab({
  samples,
  factoryId,
  allFactories,
}: {
  samples: FactoriesViewData['selected'] extends infer S
    ? S extends { samples: infer T }
      ? T
      : never
    : never;
  factoryId: string;
  allFactories: FactoriesViewData['factories'];
}) {
  return (
    <div className="section">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <h3 style={{ margin: 0 }}>All samples · {samples.length}</h3>
        <div className="spacer" style={{ flex: 1 }} />
        <SampleAddButton
          factories={allFactories}
          defaultFactoryId={factoryId}
        />
      </div>
      {samples.length === 0 ? (
        <div className="muted" style={{ fontSize: 12 }}>
          No samples.
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Stage</th>
              <th>Requested</th>
              <th>ETA</th>
              <th>Received</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {samples.map((s) => (
              <tr key={s.id}>
                <td className="mono" style={{ color: 'var(--fg-3)' }}>
                  {s.id}
                </td>
                <td>{s.name}</td>
                <td>
                  <StagePill stage={s.stage} />
                </td>
                <td className="mono">{s.requested_at ?? '—'}</td>
                <td className="mono">{s.eta ?? '—'}</td>
                <td className="mono">{s.received_at ?? '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  <SampleEditButton sample={s} factories={allFactories} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function OrdersTab({
  invoices,
}: {
  invoices: NonNullable<FactoriesViewData['selected']>['invoices'];
}) {
  return (
    <div className="section">
      <h3>Purchase orders & invoices · {invoices.length}</h3>
      {invoices.length === 0 ? (
        <div className="muted" style={{ fontSize: 12 }}>
          None.
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Due</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.id}>
                <td className="mono" style={{ color: 'var(--fg-2)' }}>
                  {i.invoice_number ?? '—'}
                </td>
                <td className="mono">{i.invoice_date ?? '—'}</td>
                <td className="mono">{i.due_date ?? '—'}</td>
                <td className="mono">{toDollar(i.total)}</td>
                <td>
                  <InvoiceStatusPill status={i.parse_status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ChatTab({
  thread,
  factoryId,
}: {
  thread: NonNullable<FactoriesViewData['selected']>['thread'];
  factoryId: string;
}) {
  if (!thread) {
    return (
      <div className="section">
        <div className="muted">No WhatsApp thread yet.</div>
      </div>
    );
  }
  return (
    <div className="section">
      <h3>
        WhatsApp · {thread.name ?? thread.wa_phone}
        {thread.unread_count > 0 && (
          <span className="pill accent" style={{ marginLeft: 8 }}>
            <span className="dot" />
            {thread.unread_count} new
          </span>
        )}
      </h3>
      <div
        style={{
          border: '1px solid var(--line)',
          borderRadius: 6,
          padding: 14,
          background: 'var(--bg-1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {thread.messages.length === 0 && (
            <div className="muted" style={{ fontSize: 12 }}>
              No messages yet.
            </div>
          )}
          {thread.messages.map((m) => (
            <div
              key={m.id}
              className={
                'wa-msg ' +
                (m.direction === 'outbound' ? 'me' : 'them') +
                (m.media_type === 'image' ? ' img' : '')
              }
            >
              {m.media_type === 'image' ? (
                <>
                  <div className="placeholder">photo</div>
                  {m.body && <div className="cap">{m.body}</div>}
                </>
              ) : (
                m.body
              )}
              <span className="ts">
                {new Date(m.sent_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
      <Link
        href={`/whatsapp?factory=${encodeURIComponent(factoryId)}`}
        className="btn"
        style={{ marginTop: 10 }}
      >
        <Icons.chat /> Open full conversation
      </Link>
    </div>
  );
}
