import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Topology } from 'topojson-specification';

let cached: Topology | null = null;

/**
 * Load the 110m world-atlas topology once and keep it in memory for subsequent
 * server renders. Served from /public/data so the same file can also be fetched
 * directly by clients that want to hydrate the map without the SSR boundary.
 */
export async function loadWorldTopology(): Promise<Topology> {
  if (cached) return cached;
  const filePath = path.join(
    process.cwd(),
    'public',
    'data',
    'countries-110m.json'
  );
  const raw = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as Topology;
  cached = parsed;
  return parsed;
}
