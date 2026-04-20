import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Generate the next sequential text ID for a table whose primary key follows
 * the pattern `<prefix><pad-zero-number>` (e.g. FAC-018, S-104, PO-2041).
 *
 * Reads the max existing id with that prefix, parses its numeric suffix, and
 * returns prefix + (max+1) zero-padded to `width`.
 */
export async function nextSequentialId(
  supabase: SupabaseClient,
  table: string,
  prefix: string,
  width: number
): Promise<string> {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .like('id', `${prefix}%`)
    .order('id', { ascending: false })
    .limit(50);

  if (error) throw new Error(`id gen failed: ${error.message}`);

  let maxN = 0;
  for (const row of data ?? []) {
    const suffix = String(row.id).slice(prefix.length);
    const n = parseInt(suffix, 10);
    if (Number.isFinite(n) && n > maxN) maxN = n;
  }
  const next = maxN + 1;
  return `${prefix}${String(next).padStart(width, '0')}`;
}
