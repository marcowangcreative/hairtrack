'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Subscribes to INSERT events on ht_wa_messages + UPDATE events on ht_wa_threads
 * and triggers a router.refresh() so server-rendered threads / messages re-fetch.
 *
 * Requires the tables to be added to the `supabase_realtime` publication
 * (see migrations/002_enable_realtime.sql).
 */
export function WaRealtime() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    let refreshQueued = false;
    const schedule = () => {
      if (refreshQueued) return;
      refreshQueued = true;
      setTimeout(() => {
        refreshQueued = false;
        router.refresh();
      }, 250);
    };

    const channel = supabase
      .channel('ht-whatsapp')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ht_wa_messages' },
        schedule
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ht_wa_messages' },
        schedule
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ht_wa_threads' },
        schedule
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
