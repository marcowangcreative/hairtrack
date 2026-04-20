import { NextRequest } from 'next/server';
import { POST as unified } from '../incoming/route';

/**
 * Back-compat alias: the old /status endpoint now forwards to the unified
 * /incoming handler, which dispatches based on event_type. Keeping this
 * route so older Telnyx configs don't break.
 */
export async function POST(req: NextRequest) {
  return unified(req);
}
