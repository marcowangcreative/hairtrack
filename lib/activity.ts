import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Log a row to ht_activity. Never throws — activity logging is best-effort,
 * we never want to break a mutation because the activity insert failed.
 *
 * Pass the same Supabase client (user-scoped or admin) you already have open
 * so RLS/session state is consistent.
 */
export async function logActivity(
  supabase: SupabaseClient,
  params: {
    actor_id?: string | null;
    kind: string;
    entity_type?: string | null;
    entity_id?: string | null;
    payload?: Record<string, unknown> | null;
  }
) {
  try {
    await supabase.from('ht_activity').insert({
      actor_id: params.actor_id ?? null,
      kind: params.kind,
      entity_type: params.entity_type ?? null,
      entity_id: params.entity_id ?? null,
      payload: params.payload ?? null,
    });
  } catch (err) {
    console.warn('[activity] insert failed', err);
  }
}
