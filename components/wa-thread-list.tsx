'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { WaThreadListItem } from '@/lib/fetchers';
import { Icons } from '@/components/icons';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'pinned', label: 'Pinned' },
] as const;

type Filter = (typeof FILTERS)[number]['id'];

function shortDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function WaThreadList({
  threads,
  selectedId,
}: {
  threads: WaThreadListItem[];
  selectedId: string | null;
}) {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    if (filter === 'unread') return threads.filter((t) => t.unread_count > 0);
    if (filter === 'pinned') return threads.filter((t) => t.pinned);
    return threads;
  }, [threads, filter]);

  return (
    <div className="wa-list">
      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={'filter' + (filter === f.id ? ' on' : '')}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {visible.length === 0 && (
        <div
          className="muted"
          style={{ padding: 16, fontSize: 12, textAlign: 'center' }}
        >
          {filter === 'all' ? 'No threads yet.' : `No ${filter} threads.`}
        </div>
      )}
      {visible.map((t) => {
        const label = t.name ?? t.factory?.name ?? t.wa_phone;
        const initial = (label ?? '?').trim().charAt(0).toUpperCase();
        const isActive = t.id === selectedId;
        return (
          <Link
            key={t.id}
            href={`/whatsapp?id=${t.id}`}
            scroll={false}
            className={'wa-thread' + (isActive ? ' active' : '')}
          >
            <div
              className="avatar"
              style={t.factory?.swatch ? { background: t.factory.swatch } : undefined}
            >
              {initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="who">
                <span>{label}</span>
                {t.pinned && (
                  <Icons.pin strokeW={2} style={{ width: 10, height: 10, color: 'var(--fg-3)' }} />
                )}
              </div>
              <div className="preview">
                {t.last_message_preview ?? t.wa_phone}
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
              <div className="time">{shortDate(t.last_message_at)}</div>
              {t.unread_count > 0 && (
                <span className="unread">{t.unread_count}</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
