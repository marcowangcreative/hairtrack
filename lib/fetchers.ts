import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type {
  Factory,
  Sample,
  SamplePhoto,
  Invoice,
  InvoiceLineItem,
  WaThread,
  WaMessage,
} from '@/lib/types/db';

export async function getCurrentUser(): Promise<{
  name: string;
  email: string;
  role: string;
} | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('ht_profiles')
      .select('name, role')
      .eq('id', user.id)
      .maybeSingle();

    return {
      name: profile?.name ?? user.email?.split('@')[0] ?? 'User',
      email: user.email ?? '',
      role: profile?.role ?? 'ops',
    };
  } catch {
    return null;
  }
}

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

export async function getAllFactories(): Promise<Factory[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('ht_factories')
      .select('*')
      .order('name');
    return (data ?? []) as Factory[];
  } catch {
    return [];
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

// =====================================================
// SAMPLES VIEW
// =====================================================

export type SamplesViewData = {
  configured: boolean;
  samples: Array<Sample & { factory: Factory | null }>;
  factoriesById: Record<string, Factory>;
};

export async function getSamplesViewData(): Promise<SamplesViewData> {
  if (!hasSupabaseEnv()) {
    return { configured: false, samples: [], factoriesById: {} };
  }

  const supabase = createAdminClient();
  const [samplesRes, factoriesRes] = await Promise.all([
    supabase
      .from('ht_samples')
      .select('*')
      .order('requested_at', { ascending: false, nullsFirst: false }),
    supabase.from('ht_factories').select('*'),
  ]);

  const factories = (factoriesRes.data ?? []) as Factory[];
  const factoriesById = Object.fromEntries(
    factories.map((f) => [f.id, f])
  ) as Record<string, Factory>;

  const samples = ((samplesRes.data ?? []) as Sample[]).map((s) => ({
    ...s,
    factory: s.factory_id ? factoriesById[s.factory_id] ?? null : null,
  }));

  return { configured: true, samples, factoriesById };
}

// =====================================================
// INVOICES VIEW
// =====================================================

export type InvoiceListItem = Invoice & { factory: Factory | null };

export type InvoicesViewData = {
  configured: boolean;
  invoices: InvoiceListItem[];
  factories: Factory[];
  selected:
    | (InvoiceListItem & {
        line_items: InvoiceLineItem[];
      })
    | null;
};

export async function getInvoicesViewData(
  invoiceId?: string
): Promise<InvoicesViewData> {
  if (!hasSupabaseEnv()) {
    return { configured: false, invoices: [], factories: [], selected: null };
  }

  const supabase = createAdminClient();
  const [invoicesRes, factoriesRes] = await Promise.all([
    supabase
      .from('ht_invoices')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase.from('ht_factories').select('*').order('name'),
  ]);

  const factories = (factoriesRes.data ?? []) as Factory[];
  const factoryById = new Map(factories.map((f) => [f.id, f]));
  const invoices: InvoiceListItem[] = ((invoicesRes.data ?? []) as Invoice[]).map(
    (inv) => ({
      ...inv,
      factory: inv.factory_id ? factoryById.get(inv.factory_id) ?? null : null,
    })
  );

  const targetId =
    (invoiceId && invoices.find((i) => i.id === invoiceId)?.id) ||
    invoices[0]?.id;
  if (!targetId) {
    return { configured: true, invoices, factories, selected: null };
  }

  const base = invoices.find((i) => i.id === targetId)!;
  const { data: lineItems } = await supabase
    .from('ht_invoice_line_items')
    .select('*')
    .eq('invoice_id', targetId)
    .order('ordinal', { ascending: true, nullsFirst: false });

  return {
    configured: true,
    invoices,
    factories,
    selected: {
      ...base,
      line_items: (lineItems ?? []) as InvoiceLineItem[],
    },
  };
}

// =====================================================
// COSTS VIEW
// =====================================================

export type SkuRow = {
  sku: string;
  description: string | null;
  factoryShort: string | null;
  factoryId: string | null;
  totalQty: number;
  avgUnitCost: number | null;
  totalCogs: number;
  invoiceCount: number;
};

export type FactorySpend = {
  factoryId: string;
  factoryShort: string;
  spend: number;
};

export type CashRunwayBucket = {
  label: string;
  amount: number;
  note: string;
  cls: '' | 'ok' | 'warn' | 'danger';
};

export type CostsViewData = {
  configured: boolean;
  stats: {
    totalCogs: number;
    openInvoiceTotal: number;
    poCommitments: number;
    skuCount: number;
  };
  skus: SkuRow[];
  spendByFactory: FactorySpend[];
  cashRunway: CashRunwayBucket[];
  unmatched: number;
};

export async function getCostsViewData(): Promise<CostsViewData> {
  const empty: CostsViewData = {
    configured: hasSupabaseEnv(),
    stats: { totalCogs: 0, openInvoiceTotal: 0, poCommitments: 0, skuCount: 0 },
    skus: [],
    spendByFactory: [],
    cashRunway: [],
    unmatched: 0,
  };
  if (!hasSupabaseEnv()) return empty;

  const supabase = createAdminClient();
  const [invoicesRes, lineItemsRes, posRes, factoriesRes] = await Promise.all([
    supabase
      .from('ht_invoices')
      .select(
        'id, factory_id, total, parse_status, due_date, invoice_number'
      ),
    supabase
      .from('ht_invoice_line_items')
      .select('invoice_id, sku, description, qty, unit_price, total'),
    supabase
      .from('ht_pos')
      .select(
        'id, factory_id, total, status, deposit_paid, balance_paid, ship_by'
      ),
    supabase.from('ht_factories').select('id, short, name'),
  ]);

  type InvoiceRow = {
    id: string;
    factory_id: string | null;
    total: number | null;
    parse_status: string;
    due_date: string | null;
    invoice_number: string | null;
  };
  type LineItemRow = {
    invoice_id: string | null;
    sku: string | null;
    description: string | null;
    qty: number | null;
    unit_price: number | null;
    total: number | null;
  };
  type PoRow = {
    id: string;
    factory_id: string | null;
    total: number | null;
    status: string;
    deposit_paid: boolean;
    balance_paid: boolean;
    ship_by: string | null;
  };

  const invoices = (invoicesRes.data ?? []) as InvoiceRow[];
  const lineItems = (lineItemsRes.data ?? []) as LineItemRow[];
  const pos = (posRes.data ?? []) as PoRow[];
  const factories = (factoriesRes.data ?? []) as Array<{
    id: string;
    short: string | null;
    name: string;
  }>;

  const factoryShortById = new Map(
    factories.map((f) => [f.id, f.short ?? f.name])
  );
  const factoryByInvoiceId = new Map(
    invoices.map((i) => [i.id, i.factory_id])
  );

  // Aggregate SKUs across line items.
  type Agg = {
    sku: string;
    description: string | null;
    factoryId: string | null;
    totalQty: number;
    totalCost: number;
    unitPriceSum: number;
    unitPriceN: number;
    invoiceIds: Set<string>;
  };
  const skuAgg = new Map<string, Agg>();
  let unmatched = 0;
  for (const li of lineItems) {
    if (!li.sku) {
      if ((li.qty ?? 0) > 0 || (li.total ?? 0) > 0) unmatched++;
      continue;
    }
    const factoryId = li.invoice_id
      ? factoryByInvoiceId.get(li.invoice_id) ?? null
      : null;
    const key = `${li.sku}|${factoryId ?? ''}`;
    const existing = skuAgg.get(key) ?? {
      sku: li.sku,
      description: li.description,
      factoryId,
      totalQty: 0,
      totalCost: 0,
      unitPriceSum: 0,
      unitPriceN: 0,
      invoiceIds: new Set<string>(),
    };
    existing.totalQty += Number(li.qty ?? 0);
    existing.totalCost += Number(li.total ?? 0);
    if (li.unit_price != null) {
      existing.unitPriceSum += Number(li.unit_price);
      existing.unitPriceN += 1;
    }
    if (!existing.description && li.description) existing.description = li.description;
    if (li.invoice_id) existing.invoiceIds.add(li.invoice_id);
    skuAgg.set(key, existing);
  }

  const skus: SkuRow[] = Array.from(skuAgg.values())
    .map((a) => ({
      sku: a.sku,
      description: a.description,
      factoryId: a.factoryId,
      factoryShort: a.factoryId
        ? factoryShortById.get(a.factoryId) ?? null
        : null,
      totalQty: a.totalQty,
      avgUnitCost: a.unitPriceN > 0 ? a.unitPriceSum / a.unitPriceN : null,
      totalCogs: a.totalCost,
      invoiceCount: a.invoiceIds.size,
    }))
    .sort((a, b) => b.totalCogs - a.totalCogs);

  // Spend by factory (sum of all invoice totals).
  const spendBy = new Map<string, number>();
  for (const inv of invoices) {
    if (!inv.factory_id || inv.total == null) continue;
    spendBy.set(
      inv.factory_id,
      (spendBy.get(inv.factory_id) ?? 0) + Number(inv.total)
    );
  }
  const spendByFactory: FactorySpend[] = Array.from(spendBy.entries())
    .map(([factoryId, spend]) => ({
      factoryId,
      factoryShort: factoryShortById.get(factoryId) ?? factoryId,
      spend,
    }))
    .sort((a, b) => b.spend - a.spend);

  // Stats.
  const totalCogs = skus.reduce((a, s) => a + s.totalCogs, 0);
  const openInvoiceTotal = invoices
    .filter((i) => i.parse_status !== 'confirmed' && i.total != null)
    .reduce((a, i) => a + Number(i.total), 0);
  const poCommitments = pos
    .filter((p) => !p.balance_paid && p.total != null)
    .reduce((a, p) => a + Number(p.total), 0);

  // Cash runway buckets.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inDays = (s: string | null): number | null => {
    if (!s) return null;
    const d = new Date(s);
    d.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - today.getTime()) / 86_400_000);
  };

  type Bucket = { amount: number; items: string[] };
  const buckets: Record<string, Bucket> = {
    overdue: { amount: 0, items: [] },
    week1: { amount: 0, items: [] },
    week2: { amount: 0, items: [] },
    days30: { amount: 0, items: [] },
    days60: { amount: 0, items: [] },
    later: { amount: 0, items: [] },
  };

  function bucketFor(days: number): keyof typeof buckets {
    if (days < 0) return 'overdue';
    if (days <= 7) return 'week1';
    if (days <= 14) return 'week2';
    if (days <= 30) return 'days30';
    if (days <= 60) return 'days60';
    return 'later';
  }

  for (const inv of invoices) {
    if (inv.parse_status === 'confirmed' || inv.total == null) continue;
    const days = inDays(inv.due_date);
    if (days == null) continue;
    const b = buckets[bucketFor(days)];
    b.amount += Number(inv.total);
    b.items.push(`Invoice ${inv.invoice_number ?? inv.id.slice(0, 6)}`);
  }
  for (const po of pos) {
    if (po.balance_paid || po.total == null) continue;
    const days = inDays(po.ship_by);
    if (days == null) continue;
    const remaining =
      Number(po.total) * (po.deposit_paid ? 0.5 : 1);
    const b = buckets[bucketFor(days)];
    b.amount += remaining;
    b.items.push(`PO ${po.id}${po.deposit_paid ? ' (balance)' : ''}`);
  }

  const cashRunway: CashRunwayBucket[] = [
    { label: 'Overdue', amount: buckets.overdue.amount, note: buckets.overdue.items.join(', ') || '—', cls: 'danger' },
    { label: 'This week', amount: buckets.week1.amount, note: buckets.week1.items.join(', ') || '—', cls: 'warn' },
    { label: 'Next week', amount: buckets.week2.amount, note: buckets.week2.items.join(', ') || '—', cls: '' },
    { label: 'Within 30d', amount: buckets.days30.amount, note: buckets.days30.items.join(', ') || '—', cls: 'ok' },
    { label: '30\u201360d', amount: buckets.days60.amount, note: buckets.days60.items.join(', ') || '—', cls: 'ok' },
    { label: '60d+', amount: buckets.later.amount, note: buckets.later.items.join(', ') || '—', cls: '' },
  ];

  return {
    configured: true,
    stats: {
      totalCogs,
      openInvoiceTotal,
      poCommitments,
      skuCount: skus.length,
    },
    skus,
    spendByFactory,
    cashRunway,
    unmatched,
  };
}

// =====================================================
// TIMELINE VIEW
// =====================================================

export type TimelineItem = {
  id: string;
  kind: 'sample' | 'po';
  label: string;
  factoryId: string | null;
  factoryShort: string | null;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  status: 'ok' | 'warn' | 'danger' | 'accent';
  detail: string;
};

export type TimelineViewData = {
  configured: boolean;
  items: TimelineItem[];
  factories: Factory[];
};

export async function getTimelineViewData(): Promise<TimelineViewData> {
  if (!hasSupabaseEnv()) {
    return { configured: false, items: [], factories: [] };
  }

  const supabase = createAdminClient();
  const [samplesRes, posRes, factoriesRes] = await Promise.all([
    supabase
      .from('ht_samples')
      .select('id, name, factory_id, stage, requested_at, eta, received_at'),
    supabase
      .from('ht_pos')
      .select('id, factory_id, status, total, currency, placed_at, ship_by'),
    supabase.from('ht_factories').select('*'),
  ]);

  const factories = (factoriesRes.data ?? []) as Factory[];
  const factoryById = new Map(factories.map((f) => [f.id, f]));

  type SampleRow = {
    id: string;
    name: string;
    factory_id: string | null;
    stage: string;
    requested_at: string | null;
    eta: string | null;
    received_at: string | null;
  };
  type PoRow = {
    id: string;
    factory_id: string | null;
    status: string;
    total: number | null;
    currency: string;
    placed_at: string | null;
    ship_by: string | null;
  };

  const items: TimelineItem[] = [];

  for (const s of (samplesRes.data ?? []) as SampleRow[]) {
    const start = s.requested_at;
    const end = s.received_at ?? s.eta;
    if (!start || !end) continue;
    let status: TimelineItem['status'] = 'accent';
    if (s.stage === 'approved') status = 'ok';
    else if (s.stage === 'rejected') status = 'danger';
    else if (s.stage === 'in_production' || s.stage === 'shipping') {
      status = 'warn';
    }
    const fac = s.factory_id ? factoryById.get(s.factory_id) ?? null : null;
    items.push({
      id: `S:${s.id}`,
      kind: 'sample',
      label: s.name,
      factoryId: s.factory_id,
      factoryShort: fac?.short ?? fac?.name ?? null,
      start,
      end,
      status,
      detail: `Sample · ${s.stage.replace('_', ' ')}`,
    });
  }

  for (const p of (posRes.data ?? []) as PoRow[]) {
    const start = p.placed_at;
    const end = p.ship_by;
    if (!start || !end) continue;
    let status: TimelineItem['status'] = 'accent';
    if (p.status === 'received' || p.status === 'closed') status = 'ok';
    else if (p.status === 'shipped' || p.status === 'in_production')
      status = 'warn';
    const fac = p.factory_id ? factoryById.get(p.factory_id) ?? null : null;
    items.push({
      id: `P:${p.id}`,
      kind: 'po',
      label: `${p.id}${p.total ? ` · $${Math.round(Number(p.total)).toLocaleString()}` : ''}`,
      factoryId: p.factory_id,
      factoryShort: fac?.short ?? fac?.name ?? null,
      start,
      end,
      status,
      detail: `PO · ${p.status.replace('_', ' ')}`,
    });
  }

  // Sort: by factory name then start date.
  items.sort((a, b) => {
    if ((a.factoryShort ?? '') !== (b.factoryShort ?? '')) {
      return (a.factoryShort ?? 'zzz').localeCompare(b.factoryShort ?? 'zzz');
    }
    return a.start.localeCompare(b.start);
  });

  return { configured: true, items, factories };
}

export async function getSamplePhotosBySample(
  sampleIds: string[]
): Promise<Record<string, SamplePhoto[]>> {
  if (!hasSupabaseEnv() || sampleIds.length === 0) return {};
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('ht_sample_photos')
    .select('*')
    .in('sample_id', sampleIds);
  const grouped: Record<string, SamplePhoto[]> = {};
  for (const p of (data ?? []) as SamplePhoto[]) {
    (grouped[p.sample_id] ??= []).push(p);
  }
  return grouped;
}
