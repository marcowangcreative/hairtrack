-- Enable Realtime for WhatsApp tables so the UI can stream live inbound
-- messages and thread updates. Idempotent — safe to re-run.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'ht_wa_messages'
  ) then
    alter publication supabase_realtime add table ht_wa_messages;
  end if;
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'ht_wa_threads'
  ) then
    alter publication supabase_realtime add table ht_wa_threads;
  end if;
end$$;
