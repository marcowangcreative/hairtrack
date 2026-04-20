'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { FactoryListItem } from '@/lib/fetchers';
import { Icons } from '@/components/icons';
import { FactoryStatusPill } from '@/components/pills';

export function FactoryGrid({
  factories,
}: {
  factories: FactoryListItem[];
}) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return factories;
    return factories.filter(
      (f) =>
        f.name.toLowerCase().includes(needle) ||
        (f.city ?? '').toLowerCase().includes(needle) ||
        (f.specialty ?? '').toLowerCase().includes(needle) ||
        f.id.toLowerCase().includes(needle)
    );
  }, [factories, q]);

  return (
    <div className="factory-grid-wrap">
      <div className="factory-grid-toolbar">
        <div className="search" style={{ flex: 1, maxWidth: 360 }}>
          <Icons.search />
          <input
            placeholder="Search factories…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div
          className="mono"
          style={{ fontSize: 11, color: 'var(--fg-3)', marginLeft: 'auto' }}
        >
          {filtered.length} of {factories.length}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          No factories match &ldquo;{q}&rdquo;.
        </div>
      ) : (
        <div className="factory-grid">
          {filtered.map((f) => (
            <Link
              key={f.id}
              href={`/factories?id=${encodeURIComponent(f.id)}&view=list`}
              className="factory-card"
            >
              <div
                className="card-thumb"
                style={{ background: f.swatch ?? 'var(--bg-3)' }}
              >
                <span className="mono abbr">
                  {(f.short ?? f.name).slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="card-body">
                <div className="card-head">
                  <div className="card-name">{f.name}</div>
                  <FactoryStatusPill status={f.status} />
                </div>
                <div className="card-meta">
                  <span className="mono">{f.id}</span>
                  {f.city && (
                    <>
                      <span>·</span>
                      <span>
                        {f.city}
                        {f.country ? `, ${f.country}` : ''}
                      </span>
                    </>
                  )}
                </div>
                {f.specialty && (
                  <div className="card-specialty">{f.specialty}</div>
                )}
                <div className="card-stats">
                  <Stat
                    label="Samples"
                    value={String(f.sampleCount)}
                  />
                  <Stat
                    label="Lead"
                    value={f.lead_time_days ? `${f.lead_time_days}d` : '—'}
                  />
                  <Stat
                    label="MOQ"
                    value={f.moq ? String(f.moq) : '—'}
                  />
                  <Stat
                    label="Spend"
                    value={
                      f.lifetimeSpend > 0
                        ? `$${Math.round(f.lifetimeSpend / 1000)}k`
                        : '$0'
                    }
                  />
                </div>
                {f.unread > 0 && (
                  <span
                    className="pill accent"
                    style={{ alignSelf: 'flex-start', marginTop: 6 }}
                  >
                    <span className="dot" />
                    {f.unread} new
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-stat">
      <div className="k">{label}</div>
      <div className="v mono">{value}</div>
    </div>
  );
}
