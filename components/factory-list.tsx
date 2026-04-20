'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { FactoryListItem } from '@/lib/fetchers';
import { Icons } from '@/components/icons';

export function FactoryList({
  factories,
  selectedId,
  tab,
}: {
  factories: FactoryListItem[];
  selectedId: string | null;
  tab: string;
}) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return factories;
    return factories.filter((f) => {
      return (
        f.name.toLowerCase().includes(needle) ||
        (f.city ?? '').toLowerCase().includes(needle) ||
        (f.specialty ?? '').toLowerCase().includes(needle) ||
        f.id.toLowerCase().includes(needle)
      );
    });
  }, [factories, q]);

  return (
    <div className="list-panel">
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <div className="search" style={{ flex: 1, minWidth: 0 }}>
          <Icons.search />
          <input
            placeholder="Search by name, city, specialty…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      {filtered.map((f) => {
        const href = `/factories?id=${encodeURIComponent(f.id)}${
          tab && tab !== 'overview' ? `&tab=${tab}` : ''
        }`;
        const isActive = f.id === selectedId;
        return (
          <Link
            key={f.id}
            href={href}
            scroll={false}
            className={'factory-row' + (isActive ? ' active' : '')}
          >
            <div className="thumb" style={{ background: f.swatch ?? undefined }}>
              {(f.short ?? f.name).slice(0, 2).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="name">{f.name}</div>
              <div className="meta">
                <span className="mono-id">{f.id}</span>
                {f.city && (
                  <>
                    <span>·</span>
                    <span>{f.city}</span>
                  </>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 5,
                  marginTop: 6,
                  alignItems: 'center',
                }}
              >
                {f.specialty && (
                  <span className="pill dim">{f.specialty.split(',')[0]}</span>
                )}
                {f.unread > 0 && (
                  <span className="pill accent">
                    <span className="dot" />
                    {f.unread} new
                  </span>
                )}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 3,
              }}
            >
              <span
                className="mono"
                style={{ fontSize: 10, color: 'var(--fg-3)' }}
              >
                {f.status}
              </span>
              {f.lifetimeSpend > 0 && (
                <span
                  className="mono"
                  style={{ fontSize: 10, color: 'var(--fg-3)' }}
                >
                  ${Math.round(f.lifetimeSpend).toLocaleString()}
                </span>
              )}
            </div>
          </Link>
        );
      })}
      {filtered.length === 0 && (
        <div
          style={{ padding: 16, fontSize: 12, color: 'var(--fg-3)' }}
          className="muted"
        >
          No factories match &ldquo;{q}&rdquo;.
        </div>
      )}
    </div>
  );
}
