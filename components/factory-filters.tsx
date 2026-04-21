'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import {
  DEFAULT_FILTERS,
  filtersActive,
  parseFactoryFilters,
  serializeFactoryFilters,
  type FactoryFilters,
} from '@/lib/factory-filters';

export function FactoryFilters({ countries }: { countries: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const current = parseFactoryFilters({
    q: sp.get('q') ?? undefined,
    status: sp.get('status') ?? undefined,
    country: sp.get('country') ?? undefined,
    unread: sp.get('unread') ?? undefined,
    pinned: sp.get('pinned') ?? undefined,
    withSamples: sp.get('withSamples') ?? undefined,
  });

  const [draft, setDraft] = useState<FactoryFilters>(current);
  useEffect(() => {
    setDraft(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function apply(next: FactoryFilters) {
    const merged = new URLSearchParams(sp.toString());
    for (const k of [
      'q',
      'status',
      'country',
      'unread',
      'pinned',
      'withSamples',
    ]) {
      merged.delete(k);
    }
    const filterParams = serializeFactoryFilters(next);
    filterParams.forEach((v, k) => merged.set(k, v));
    router.push(`${pathname}?${merged.toString()}`, { scroll: false });
  }

  const activeCount = filtersActive(current);

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        className="btn"
        onClick={() => setOpen((v) => !v)}
        type="button"
        data-active={activeCount > 0 ? 'true' : undefined}
      >
        <Icons.filter /> Filter
        {activeCount > 0 && (
          <span
            className="mono"
            style={{
              marginLeft: 4,
              padding: '0 5px',
              background: 'var(--accent)',
              color: 'var(--bg)',
              borderRadius: 3,
              fontSize: 10,
            }}
          >
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div ref={panelRef} className="filter-pop">
          <div className="filter-row">
            <div className="lbl">Status</div>
            <div className="seg-group">
              {(['all', 'active', 'paused', 'archived'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={'chip' + (draft.status === s ? ' on' : '')}
                  onClick={() => setDraft({ ...draft, status: s })}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row">
            <div className="lbl">Country</div>
            <select
              value={draft.country ?? ''}
              onChange={(e) =>
                setDraft({ ...draft, country: e.target.value || null })
              }
            >
              <option value="">Any</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-row">
            <div className="lbl">Quick</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="check">
                <input
                  type="checkbox"
                  checked={draft.unreadOnly}
                  onChange={(e) =>
                    setDraft({ ...draft, unreadOnly: e.target.checked })
                  }
                />
                Unread WhatsApp only
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={draft.pinnedOnly}
                  onChange={(e) =>
                    setDraft({ ...draft, pinnedOnly: e.target.checked })
                  }
                />
                Pinned only
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={draft.withSamplesOnly}
                  onChange={(e) =>
                    setDraft({ ...draft, withSamplesOnly: e.target.checked })
                  }
                />
                With active samples
              </label>
            </div>
          </div>

          <div className="filter-actions">
            <button
              className="btn ghost sm"
              type="button"
              onClick={() => {
                setDraft(DEFAULT_FILTERS);
                apply(DEFAULT_FILTERS);
                setOpen(false);
              }}
            >
              Clear
            </button>
            <div style={{ flex: 1 }} />
            <button
              className="btn primary sm"
              type="button"
              onClick={() => {
                apply(draft);
                setOpen(false);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
