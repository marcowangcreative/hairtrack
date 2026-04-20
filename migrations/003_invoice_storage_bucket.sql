-- Create the `invoices` storage bucket and policies.
-- Idempotent: safe to re-run.

-- Create bucket (public so Anthropic's OCR can fetch via URL).
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', true)
on conflict (id) do update set public = excluded.public;

-- Allow authenticated users to upload to the bucket.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'invoices_upload'
  ) then
    create policy "invoices_upload" on storage.objects
      for insert to authenticated
      with check (bucket_id = 'invoices');
  end if;
end$$;

-- Allow authenticated users to update their own files.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'invoices_update'
  ) then
    create policy "invoices_update" on storage.objects
      for update to authenticated
      using (bucket_id = 'invoices');
  end if;
end$$;

-- Allow authenticated users to delete files in the bucket.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'invoices_delete'
  ) then
    create policy "invoices_delete" on storage.objects
      for delete to authenticated
      using (bucket_id = 'invoices');
  end if;
end$$;

-- Public read is already granted because the bucket is public.
