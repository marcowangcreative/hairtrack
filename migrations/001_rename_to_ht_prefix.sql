-- Hair Track — namespace our tables with ht_ prefix so we don't collide
-- with other projects sharing this Supabase database.
-- Safe to run multiple times (each rename is guarded by a check).

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='profiles')
     and not exists (select 1 from information_schema.tables where table_schema='public' and table_name='ht_profiles') then
    alter table public.profiles rename to ht_profiles;
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='factories')
     and not exists (select 1 from information_schema.tables where table_schema='public' and table_name='ht_factories') then
    alter table public.factories rename to ht_factories;
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='samples')
     and not exists (select 1 from information_schema.tables where table_schema='public' and table_name='ht_samples') then
    alter table public.samples rename to ht_samples;
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='sample_photos')
     and not exists (select 1 from information_schema.tables where table_schema='public' and table_name='ht_sample_photos') then
    alter table public.sample_photos rename to ht_sample_photos;
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='wa_threads')
     and not exists (select 1 from information_schema.tables where table_schema='public' and table_name='ht_wa_threads') then
    alter table public.wa_threads rename to ht_wa_threads;
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='wa_messages')
     and not exists (select 1 from information_schema.tables where table_schema='public' and table_name='ht_wa_messages') then
    alter table public.wa_messages rename to ht_wa_messages;
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='invoices')
     and not exists (select 1 from information_schema.tables where table_schema='public' and table_name='ht_invoices') then
    alter table public.invoices rename to ht_invoices;
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='invoice_line_items')
     and not exists (select 1 from information_schema.tables where table_schema='public' and table_name='ht_invoice_line_items') then
    alter table public.invoice_line_items rename to ht_invoice_line_items;
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='pos')
     and not exists (select 1 from information_schema.tables where table_schema='public' and table_name='ht_pos') then
    alter table public.pos rename to ht_pos;
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='activity')
     and not exists (select 1 from information_schema.tables where table_schema='public' and table_name='ht_activity') then
    alter table public.activity rename to ht_activity;
  end if;
end $$;

-- Reload PostgREST schema cache so the new names are visible immediately.
notify pgrst, 'reload schema';
