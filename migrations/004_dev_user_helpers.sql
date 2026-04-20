-- Dev helpers: run these manually in the Supabase SQL editor to skip the
-- magic-link loop during local development.

-- --------------------------------------------------------------------
-- 1) BACKFILL ht_profiles for any existing auth.users rows.
--    After you sign in once via /login, this ensures a profile exists.
-- --------------------------------------------------------------------
insert into ht_profiles (id, name, role)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'User'),
  'ops'
from auth.users u
where not exists (select 1 from ht_profiles p where p.id = u.id)
on conflict (id) do nothing;

-- --------------------------------------------------------------------
-- 2) Promote yourself to `founder`.
--    Replace the email with yours, then run.
-- --------------------------------------------------------------------
-- update ht_profiles
--   set role = 'founder', name = 'Marco'
-- where id = (select id from auth.users where email = 'you@example.com');

-- --------------------------------------------------------------------
-- 3) (Optional) Create a seed auth user WITHOUT password / email flow.
--    Only run this on local Supabase instances you control; on hosted
--    Supabase you should prefer sign-in via /login.
--
--    Swap the email then uncomment.
-- --------------------------------------------------------------------
-- do $$
-- declare new_id uuid := gen_random_uuid();
-- begin
--   insert into auth.users (
--     id, instance_id, aud, role, email, email_confirmed_at,
--     raw_app_meta_data, raw_user_meta_data, created_at, updated_at
--   ) values (
--     new_id,
--     '00000000-0000-0000-0000-000000000000',
--     'authenticated',
--     'authenticated',
--     'dev@halohair.co',
--     now(),
--     jsonb_build_object('provider','email','providers',array['email']),
--     jsonb_build_object('name','Dev User'),
--     now(), now()
--   ) on conflict (email) do nothing;
--
--   insert into ht_profiles (id, name, role)
--   values (new_id, 'Dev User', 'founder')
--   on conflict (id) do nothing;
-- end$$;
