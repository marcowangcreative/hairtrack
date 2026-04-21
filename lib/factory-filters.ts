import type { FactoryListItem } from '@/lib/fetchers';

export type FactoryFilters = {
  q: string;
  status: 'all' | 'active' | 'paused' | 'archived';
  country: string | null;
  unreadOnly: boolean;
  pinnedOnly: boolean;
  withSamplesOnly: boolean;
};

export const DEFAULT_FILTERS: FactoryFilters = {
  q: '',
  status: 'all',
  country: null,
  unreadOnly: false,
  pinnedOnly: false,
  withSamplesOnly: false,
};

export function parseFactoryFilters(params: {
  q?: string;
  status?: string;
  country?: string;
  unread?: string;
  pinned?: string;
  withSamples?: string;
}): FactoryFilters {
  const status =
    params.status === 'active' ||
    params.status === 'paused' ||
    params.status === 'archived'
      ? params.status
      : 'all';
  return {
    q: params.q?.trim() ?? '',
    status,
    country: params.country?.trim() || null,
    unreadOnly: params.unread === '1',
    pinnedOnly: params.pinned === '1',
    withSamplesOnly: params.withSamples === '1',
  };
}

export function serializeFactoryFilters(f: FactoryFilters): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.q) sp.set('q', f.q);
  if (f.status !== 'all') sp.set('status', f.status);
  if (f.country) sp.set('country', f.country);
  if (f.unreadOnly) sp.set('unread', '1');
  if (f.pinnedOnly) sp.set('pinned', '1');
  if (f.withSamplesOnly) sp.set('withSamples', '1');
  return sp;
}

export function filtersActive(f: FactoryFilters): number {
  let n = 0;
  if (f.q) n++;
  if (f.status !== 'all') n++;
  if (f.country) n++;
  if (f.unreadOnly) n++;
  if (f.pinnedOnly) n++;
  if (f.withSamplesOnly) n++;
  return n;
}

export function applyFactoryFilters(
  factories: FactoryListItem[],
  f: FactoryFilters
): FactoryListItem[] {
  const needle = f.q.trim().toLowerCase();
  return factories.filter((x) => {
    if (
      needle &&
      !x.name.toLowerCase().includes(needle) &&
      !(x.city ?? '').toLowerCase().includes(needle) &&
      !(x.specialty ?? '').toLowerCase().includes(needle) &&
      !x.id.toLowerCase().includes(needle)
    ) {
      return false;
    }
    if (f.status !== 'all' && x.status !== f.status) return false;
    if (
      f.country &&
      (x.country ?? '').trim().toLowerCase() !== f.country.trim().toLowerCase()
    ) {
      return false;
    }
    if (f.unreadOnly && x.unread <= 0) return false;
    if (f.pinnedOnly && !x.pinned) return false;
    if (f.withSamplesOnly && x.sampleCount <= 0) return false;
    return true;
  });
}

export function uniqueCountries(factories: FactoryListItem[]): string[] {
  const set = new Set<string>();
  for (const f of factories) {
    if (f.country) set.add(f.country.trim());
  }
  return Array.from(set).sort();
}
