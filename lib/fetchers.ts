import { createAdminClient } from '@/lib/supabase/admin';
import type { Factory, Sample, Invoice, WaThread, WaMessage } from '@/lib/types/db';

function hasSupabaseEnv() {
  // Dashboard reads use the service-role client (bypasses RLS).
  // Swap this back to anon once Supabase Auth is wired up.
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Shared counts for the sidebar. Returns zeros if Supabase isn't configured yet,
 * so the UI still renders before env is filled in.
 */
export async function getSidebarCounts() {
  const empty = {
    factories: 0,
    samples: 0,
    whatsappUnread: 0,
    invoicesOpen: 0,
  };
  if (!hasSupabaseEnv()) return empty;

  try {
    const supabase = createAdminClient();

    const [factories, samples, threads, invoices] = await Promise.all([
      supabase.from('ht_factories').select('id', { count: 'exact', head: true }),
      supabase.from('ht_samples').select('id', { count: 'exact', head: true }),
      supabase.from('ht_wa_threads').select('unread_count'),
      supabase.from('ht_invoices').select('parse_status'),
    ]);

    const whatsappUnread =
      threads.data?.reduce((a, t) => a + (t.unread_count ?? 0), 0) ?? 0;
    const invoicesOpen =
      invoices.data?.filter((i) => i.parse_status !== 'confirmed').length ?? 0;

    return {
      factories: factories.count ?? 0,
      samples: samples.count ?? 0,
      whatsappUnread,
      invoicesOpen,
    };
  } catch {
    return empty;
  }
}

export async function getPinnedFactories() {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('ht_factories')
      .select('id, short, swatch')
      .eq('pinned', true)
      .order('name')
      .limit(6);
    return data ?? [];
  } catch {
    return [];
  }
}

export type DashboardData = {
  stats: {
    activeFactories: number;
    samplesInFlight: number;
    whatsappUnread: number;
    openInvoices: number;
    invoicesOpenTotal: number;
  };
  samplesByStage: Array<{ stage: string; count: number }>;
  activity: Array<{
    id: string;
    kind: string;
    entity_type: string | null;
    entity_id: string | null;
    created_at: string;
    payload: unknown;
  }>;
  configured: boolean;
};

export async function getDashboardData(): Promise<DashboardData> {
  const empty: DashboardData = {
    stats: {
      activeFactories: 0,
      samplesInFlight: 0,
      whatsappUnread: 0,
      openInvoices: 0,
      invoicesOpenTotal: 0,
    },
    samplesByStage: [],
    activity: [],
    configured: hasSupabaseEnv(),
  };
  if (!hasSupabaseEnv()) return empty;

  try {
    const supabase = createAdminClient();

    const [factories, samples, threads, invoices, activity] = await Promise.all([
      supabase.from('ht_factories').select('status'),
      supabase.from('ht_samples').select('stage'),
      supabase.from('ht_wa_threads').select('unread_count'),
      supabase.from('ht_invoices').select('parse_status, total'),
      supabase
        .from('ht_activity')
        .select('id, kind, entity_type, entity_id, created_at, payload')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    const activeFactories =
      factories.data?.filter((f) => f.status === 'active').length ?? 0;
    const samplesInFlight =
      samples.data?.filter(
        (s) => s.stage !== 'approved' && s.stage !== 'rejected'
      ).length ?? 0;
    const whatsappUnread =
      threads.data?.reduce((a, t) => a + (t.unread_count ?? 0), 0) ?? 0;
    const openInvoices =
      invoices.data?.filter((i) => i.parse_status !== 'confirmed').length ?? 0;
    const invoicesOpenTotal =
      invoices.data
        ?.filter((i) => i.parse_status !== 'confirmed')
        .reduce((a, i) => a + (i.total ? Number(i.total) : 0), 0) ?? 0;

    const stages = [
      'requested',
      'in_production',
      'shipping',
      'received',
      'approved',
      'rejected',
    ] as const;
    const samplesByStage = stages.map((stage) => ({
      stage,
      count: samples.data?.filter((s) => s.stage === stage).length ?? 0,
    }));

    return {
      stats: {
        activeFactories,
        samplesInFlight,
        whatsappUnread,
        openInvoices,
        invoicesOpenTotal,
      },
      samplesByStage,
      activity: activity.data ?? [],
      configured: true,
    };
  } catch {
    return empty;
  }
}

export type FactoryListItem = Factory & {
  sampleCount: number;
  unread: number;
  lifetimeSpend: number;
};

export type FactoriesViewData = {
  configured: boolean;
  factories: FactoryListItem[];
  selected:
    | (FactoryListItem & {
        samples: Sample[];
        invoices: Invoice[];
        thread: (WaThread & { messages: WaMessage[] }) | null;
      })
    | null;
};

export async function getFactoriesViewData(
  selectedId?: string
): Promise<FactoriesViewData> {
  if (!hasSupabaseEnv()) {
    return { configured: false, factories: [], selected: null };
  }

  const supabase = createAdminClient();

  const [factoriesRes, samplesRes, invoicesRes, threadsRes] = await Promise.all([
    supabase
      .from('ht_factories')
      .select('*')
      .order('pinned', { ascending: false })
      .order('name'),
    supabase.from('ht_samples').select('factory_id'),
    supabase.from('ht_invoices').select('factory_id, total'),
    supabase.from('ht_wa_threads').select('factory_id, unread_count'),
  ]);

  const factories = (factoriesRes.data ?? []) as Factory[];
  const sampleRows = (samplesRes.data ?? []) as Array<{ factory_id: string | null }>;
  const invoiceRows = (invoicesRes.data ?? []) as Array<{
    factory_id: string | null;
    total: number | null;
  }>;
  const threadRows = (threadsRes.data ?? []) as Array<{
    factory_id: string | null;
    unread_count: number | null;
  }>;

  const sampleCountBy = new Map<string, number>();
  for (const r of sampleRows) {
    if (!r.factory_id) continue;
    sampleCountBy.set(r.factory_id, (sampleCountBy.get(r.factory_id) ?? 0) + 1);
  }
  const spendBy = new Map<string, number>();
  for (const r of invoiceRows) {
    if (!r.factory_id) continue;
    spendBy.set(
      r.factory_id,
      (spendBy.get(r.factory_id) ?? 0) + (r.total ? Number(r.total) : 0)
    );
  }
  const unreadBy = new Map<string, number>();
  for (const r of threadRows) {
    if (!r.factory_id) continue;
    unreadBy.set(r.factory_id, (unreadBy.get(r.factory_id) ?? 0) + (r.unread_count ?? 0));
  }

  const list: FactoryListItem[] = factories.map((f) => ({
    ...f,
    sampleCount: sampleCountBy.get(f.id) ?? 0,
    unread: unreadBy.get(f.id) ?? 0,
    lifetimeSpend: spendBy.get(f.id) ?? 0,
  }));

  const targetId =
    (selectedId && list.find((f) => f.id === selectedId)?.id) || list[0]?.id;
  if (!targetId) {
    return { configured: true, factories: list, selected: null };
  }

  const base = list.find((f) => f.id === targetId)!;

  const [samplesDetail, invoicesDetail, threadDetail] = await Promise.all([
    supabase
      .from('ht_samples')
      .select('*')
      .eq('factory_id', targetId)
      .order('requested_at', { ascending: false, nullsFirst: false }),
    supabase
      .from('ht_invoices')
      .select('*')
      .eq('factory_id', targetId)
      .order('invoice_date', { ascending: false, nullsFirst: false }),
    supabase
      .from('ht_wa_threads')
      .select('*')
      .eq('factory_id', targetId)
      .limit(1)
      .maybeSingle(),
  ]);

  let thread: (WaThread & { messages: WaMessage[] }) | null = null;
  if (threadDetail.data) {
    const { data: msgs } = await supabase
      .from('ht_wa_messages')
      .select('*')
      .eq('thread_id', threadDetail.data.id)
      .order('sent_at', { ascending: false })
      .limit(4);
    thread = {
      ...(threadDetail.data as WaThread),
      messages: ((msgs as WaMessage[] | null) ?? []).reverse(),
    };
  }

  return {
    configured: true,
    factories: list,
    selected: {
      ...base,
      samples: (samplesDetail.data ?? []) as Sample[],
      invoices: (invoicesDetail.data ?? []) as Invoice[],
      thread,
    },
  };
}

export type WaThreadListItem = WaThread & { factory: Factory | null };

export type WhatsAppViewData = {
  configured: boolean;
  threads: WaThreadListItem[];
  selected:
    | (WaThreadListItem & {
        messages: WaMessage[];
        samples: Sample[];
      })
    | null;
};

export async function getWhatsAppViewData(
  threadId?: string
): Promise<WhatsAppViewData> {
  if (!hasSupabaseEnv()) {
    return { configured: false, threads: [], selected: null };
  }

  const supabase = createAdminClient();

  const [threadsRes, factoriesRes] = await Promise.all([
    supabase
      .from('ht_wa_threads')
      .select('*')
      .order('pinned', { ascending: false })
      .order('last_message_at', { ascending: false, nullsFirst: false }),
    supabase.from('ht_factories').select('*'),
  ]);

  const factories = (factoriesRes.data ?? []) as Factory[];
  const factoryById = new Map(factories.map((f) => [f.id, f]));
  const threads: WaThreadListItem[] = ((threadsRes.data ?? []) as WaThread[]).map(
    (t) => ({ ...t, factory: t.factory_id ? factoryById.get(t.factory_id) ?? null : null })
  );

  const targetId =
    (threadId && threads.find((t) => t.id === threadId)?.id) || threads[0]?.id;
  if (!targetId) {
    return { configured: true, threads, selected: null };
  }

  const selBase = threads.find((t) => t.id === targetId)!;
  const [msgRes, sampleRes] = await Promise.all([
    supabase
      .from('ht_wa_messages')
      .select('*')
      .eq('thread_id', targetId)
      .order('sent_at', { ascending: true }),
    selBase.factory_id
      ? supabase
          .from('ht_samples')
          .select('*')
          .eq('factory_id', selBase.factory_id)
          .order('requested_at', { ascending: false, nullsFirst: false })
          .limit(6)
      : Promise.resolve({ data: [] }),
  ]);

  return {
    configured: true,
    threads,
    selected: {
      ...selBase,
      messages: (msgRes.data ?? []) as WaMessage[],
      samples: (sampleRes.data ?? []) as Sample[],
    },
  };
}
