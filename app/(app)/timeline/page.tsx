import { Toolbar } from '@/components/toolbar';
import { Icons } from '@/components/icons';
import { getTimelineViewData } from '@/lib/fetchers';
import type { TimelineItem } from '@/lib/fetchers';

const WEEKS_TO_SHOW = 12;
const WEEKS_BEHIND = 2; // show 2 weeks of recent past + 10 ahead

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  // Monday as the first day of the week.
  const day = x.getDay() || 7;
  if (day !== 1) x.setDate(x.getDate() - (day - 1));
  return x;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function fmtWeek(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export default async function TimelinePage() {
  const data = await getTimelineViewData();

  const today = new Date();
  const rangeStart = addDays(startOfWeek(today), -WEEKS_BEHIND * 7);
  const rangeEnd = addDays(rangeStart, WEEKS_TO_SHOW * 7);
  const rangeDays = WEEKS_TO_SHOW * 7;

  // Bucket weeks for the header.
  const weeks: Date[] = [];
  for (let i = 0; i < WEEKS_TO_SHOW; i++) {
    weeks.push(addDays(rangeStart, i * 7));
  }

  // Filter items that overlap the visible range so we don't render off-screen
  // bars (we still keep a count of items hidden so the user knows about them).
  const visible = data.items.filter((it) => {
    const a = new Date(it.start);
    const b = new Date(it.end);
    return b >= rangeStart && a <= rangeEnd;
  });
  const hidden = data.items.length - visible.length;

  // Today's marker (left percentage).
  const todayPct =
    Math.max(0, Math.min(rangeDays, diffDays(rangeStart, today))) /
    rangeDays *
    100;

  return (
    <>
      <Toolbar
        crumbs={['Workspace', 'Timeline']}
        right={
          <>
            <div className="seg">
              <button className="on">12 weeks</button>
            </div>
            <button className="btn" disabled title="Coming soon">
              <Icons.filter /> Filter
            </button>
          </>
        }
      />
      <div className="canvas" style={{ padding: 0, overflow: 'auto' }}>
        {!data.configured ? (
          <div className="empty-state">
            Supabase isn&apos;t configured. Fill in <code>.env.local</code>.
          </div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            No samples or POs with dates in the next 10 weeks.
            {hidden > 0 && ` (${hidden} item(s) outside the visible range.)`}
          </div>
        ) : (
          <div className="tl-page">
            <div className="tl-grid-head">
              <div className="tl-cell-left tl-head">Track</div>
              <div className="tl-cell-right tl-head">
                <div
                  className="tl-weeks"
                  style={{ gridTemplateColumns: `repeat(${WEEKS_TO_SHOW}, 1fr)` }}
                >
                  {weeks.map((w, i) => (
                    <div key={i} className="tl-week">
                      {fmtWeek(w)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {visible.map((it) => (
              <TimelineRow
                key={it.id}
                item={it}
                rangeStart={rangeStart}
                rangeDays={rangeDays}
                weeksCount={WEEKS_TO_SHOW}
                todayPct={todayPct}
              />
            ))}

            {hidden > 0 && (
              <div
                className="muted"
                style={{ padding: '10px 14px', fontSize: 11 }}
              >
                {hidden} item(s) outside the 12-week window.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function TimelineRow({
  item,
  rangeStart,
  rangeDays,
  weeksCount,
  todayPct,
}: {
  item: TimelineItem;
  rangeStart: Date;
  rangeDays: number;
  weeksCount: number;
  todayPct: number;
}) {
  const start = new Date(item.start);
  const end = new Date(item.end);

  const startDays = Math.max(0, diffDays(rangeStart, start));
  const endDays = Math.min(rangeDays, diffDays(rangeStart, end));
  const leftPct = (startDays / rangeDays) * 100;
  const widthPct = Math.max(2, ((endDays - startDays) / rangeDays) * 100);

  const phaseLabel = item.kind === 'sample' ? 'SMP' : 'PO';

  return (
    <div className="tl-grid-row">
      <div className="tl-cell-left">
        <span
          className="mono"
          style={{
            fontSize: 10,
            color: 'var(--fg-3)',
            width: 30,
            display: 'inline-block',
          }}
        >
          {phaseLabel}
        </span>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              color: 'var(--fg)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>
            {item.factoryShort ?? '—'} · {item.detail}
          </div>
        </div>
      </div>
      <div className="tl-cell-right">
        <div
          className="tl-weeks"
          style={{ gridTemplateColumns: `repeat(${weeksCount}, 1fr)` }}
        >
          {Array.from({ length: weeksCount }).map((_, i) => (
            <div key={i} className="tl-week-bg" />
          ))}
        </div>
        <div className="tl-today" style={{ left: `${todayPct}%` }} />
        <div
          className={'tl-bar ' + (item.status === 'accent' ? '' : item.status)}
          style={{
            left: `calc(${leftPct}% + 4px)`,
            width: `calc(${widthPct}% - 8px)`,
          }}
          title={`${item.label} · ${fmtDate(item.start)} → ${fmtDate(item.end)}`}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {fmtDate(item.start)} → {fmtDate(item.end)}
          </span>
        </div>
      </div>
    </div>
  );
}
