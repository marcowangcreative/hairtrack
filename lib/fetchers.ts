import { createAdminClient } from '@/lib/supabase/admin';

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
