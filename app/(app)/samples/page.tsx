import Link from 'next/link';
import { Toolbar } from '@/components/toolbar';
import { Icons } from '@/components/icons';
import { StagePill } from '@/components/pills';
import { getSamplesViewData } from '@/lib/fetchers';
import type { Factory, SampleStage } from '@/lib/types/db';
import { SampleAddButton, SampleEditButton } from '@/components/sample-actions';

type View = 'kanban' | 'list';

type Stage = { id: SampleStage; label: string; color: string };

const STAGES: Stage[] = [
  { id: 'requested', label: 'Requested', color: 'var(--fg-3)' },
  { id: 'in_production', label: 'In production', color: 'var(--warn)' },
  { id: 'shipping', label: 'Shipping', color: 'var(--accent)' },
  { id: 'received', label: 'Received', color: 'var(--accent)' },
  { id: 'approved', label: 'Approved', color: 'var(--ok)' },
  { id: 'rejected', label: 'Rejected', color: 'var(--danger)' },
];

const STAGE_PROGRESS: Record<SampleStage, number> = {
  requested: 0.15,
  in_production: 0.4,
  shipping: 0.65,
  received: 0.8,
  approved: 1,
  rejected: 1,
};

export default async function SamplesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const view: View = params.view === 'list' ? 'list' : 'kanban';
  const data = await getSamplesViewData();

  return (
    <>
      <Toolbar
        crumbs={['Workspace', 'Samples']}
        right={
          <>
            <div className="seg">
              <Link
                href="/samples?view=kanban"
                className={view === 'kanban' ? 'on' : ''}
                replace
              >
                <Icons.grid /> Kanban
              </Link>
              <Link
                href="/samples?view=list"
                className={view === 'list' ? 'on' : ''}
                replace
              >
                <Icons.list /> List
              </Link>
            </div>
            <button className="btn" disabled title="Coming soon">
              <Icons.filter /> Filter
            </button>
            <SampleAddButton
              factories={Object.values(data.factoriesById) as Factory[]}
            />
          </>
        }
      />
      <div className="canvas" style={{ padding: 0 }}>
        {!data.configured ? (
          <div className="empty-state">
            Supabase isn&apos;t configured. Fill in <code>.env.local</code>.
          </div>
        ) : data.samples.length === 0 ? (
          <div className="empty-state">
            No samples yet. Run <code>seed.sql</code> or create one.
          </div>
        ) : view === 'kanban' ? (
          <KanbanView samples={data.samples} />
        ) : (
          <ListView
            samples={data.samples}
            factories={Object.values(data.factoriesById) as Factory[]}
          />
        )}
      </div>
    </>
  );
}

type SampleWithFactory = NonNullable<
  Awaited<ReturnType<typeof getSamplesViewData>>['samples']
>[number];

function KanbanView({ samples }: { samples: SampleWithFactory[] }) {
  return (
    <div className="kanban">
      {STAGES.map((stage) => {
        const items = samples.filter((s) => s.stage === stage.id);
        return (
          <div key={stage.id} className="kcol">
            <div className="head">
              <span className="dot" style={{ background: stage.color }} />
              <span className="title">{stage.label}</span>
              <span className="count">{items.length}</span>
            </div>
            <div className="list">
              {items.length === 0 ? (
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: 'var(--fg-4)',
                    textAlign: 'center',
                    padding: 14,
                  }}
                >
                  —
                </div>
              ) : (
                items.map((s) => <KCard key={s.id} sample={s} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KCard({ sample: s }: { sample: SampleWithFactory }) {
  const progress = STAGE_PROGRESS[s.stage];
  const eta = s.eta ? new Date(s.eta).toLocaleDateString() : '—';
  return (
    <Link
      href={
        s.factory_id
          ? `/factories?id=${s.factory_id}&tab=samples`
          : '/samples'
      }
      className="kcard"
    >
      <div className="top">
        <span>{s.id}</span>
        <span style={{ color: 'var(--fg-4)' }}>·</span>
        <span>{s.factory?.short ?? '—'}</span>
      </div>
      <div className="title">{s.name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        {s.factory?.swatch && (
          <span
            className="sw"
            style={{ background: s.factory.swatch, width: 14, height: 14 }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div className="bar">
            <div
              className="fill"
              style={{
                width: `${Math.round(progress * 100)}%`,
                background:
                  s.stage === 'rejected'
                    ? 'var(--danger)'
                    : s.stage === 'approved'
                      ? 'var(--ok)'
                      : 'var(--accent)',
              }}
            />
          </div>
        </div>
      </div>
      <div className="bot">
        <Icons.clock />
        <span>ETA {eta}</span>
      </div>
    </Link>
  );
}

function ListView({
  samples,
  factories,
}: {
  samples: SampleWithFactory[];
  factories: Factory[];
}) {
  return (
    <div className="sample-list">
      <div className="row head">
        <div>ID</div>
        <div>Sample</div>
        <div>Factory</div>
        <div>Stage</div>
        <div>Requested</div>
        <div>ETA</div>
        <div></div>
      </div>
      {samples.map((s) => (
        <div key={s.id} className="row">
          <Link
            href={
              s.factory_id
                ? `/factories?id=${s.factory_id}&tab=samples`
                : '/samples'
            }
            className="mono"
            style={{ color: 'var(--fg-3)' }}
          >
            {s.id}
          </Link>
          <div>
            <div style={{ color: 'var(--fg)' }}>{s.name}</div>
            {s.factory?.swatch && (
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: s.factory.swatch,
                    border: '1px solid var(--line-2)',
                  }}
                />
              </div>
            )}
          </div>
          <div style={{ fontSize: 12 }}>{s.factory?.short ?? '—'}</div>
          <div>
            <StagePill stage={s.stage} />
          </div>
          <div className="mono" style={{ color: 'var(--fg-2)' }}>
            {s.requested_at
              ? new Date(s.requested_at).toLocaleDateString()
              : '—'}
          </div>
          <div className="mono" style={{ color: 'var(--fg-2)' }}>
            {s.eta ? new Date(s.eta).toLocaleDateString() : '—'}
          </div>
          <div>
            <SampleEditButton sample={s} factories={factories} />
          </div>
        </div>
      ))}
    </div>
  );
}
