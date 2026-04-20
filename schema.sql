-- Hair Track — Supabase schema
-- Run in the Supabase SQL editor on a fresh project.
-- All tables are prefixed with ht_ to namespace against shared Supabase projects.

-- =====================================================
-- PROFILES (extends auth.users)
-- =====================================================
create table ht_profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  role text not null default 'ops' check (role in ('founder','ops','viewer')),
  avatar_url text,
  created_at timestamptz default now()
);

-- =====================================================
-- FACTORIES
-- =====================================================
create table ht_factories (
  id text primary key,
  name text not null,
  short text,
  city text,
  country text,
  specialty text,
  status text default 'evaluating' check (status in ('active','evaluating','paused','archived')),
  whatsapp text,
  alibaba_url text,
  website text,
  contact_name text,
  contact_role text,
  moq int,
  lead_time_days int,
  payment_terms text,
  swatch text,
  notes text,
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on ht_factories (status);

-- =====================================================
-- SAMPLES
-- =====================================================
create table ht_samples (
  id text primary key,
  factory_id text references ht_factories(id) on delete set null,
  name text not null,
  stage text not null default 'requested' check (stage in (
    'requested','in_production','shipping','received','approved','rejected'
  )),
  requested_at date,
  eta date,
  received_at date,
  notes text,
  cover_photo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on ht_samples (stage);
create index on ht_samples (factory_id);

create table ht_sample_photos (
  id uuid primary key default gen_random_uuid(),
  sample_id text references ht_samples(id) on delete cascade,
  url text not null,
  caption text,
  created_at timestamptz default now()
);

-- =====================================================
-- WHATSAPP
-- =====================================================
create table ht_wa_threads (
  id uuid primary key default gen_random_uuid(),
  factory_id text references ht_factories(id) on delete set null,
  wa_phone text not null,
  name text,
  pinned boolean default false,
  unread_count int default 0,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz default now(),
  unique (wa_phone)
);
create index on ht_wa_threads (last_message_at desc);

create table ht_wa_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references ht_wa_threads(id) on delete cascade,
  direction text not null check (direction in ('inbound','outbound')),
  body text,
  media_url text,
  media_type text,
  telnyx_id text,
  sent_by uuid references ht_profiles(id),
  status text default 'sent' check (status in ('pending','sent','delivered','read','failed')),
  sent_at timestamptz default now()
);
create index on ht_wa_messages (thread_id, sent_at desc);
create unique index on ht_wa_messages (telnyx_id) where telnyx_id is not null;

-- =====================================================
-- INVOICES
-- =====================================================
create table ht_invoices (
  id uuid primary key default gen_random_uuid(),
  factory_id text references ht_factories(id) on delete set null,
  file_url text not null,
  source text default 'upload' check (source in ('upload','email','whatsapp')),
  parse_status text default 'pending' check (parse_status in ('pending','parsed','confirmed','failed')),
  parse_confidence numeric,
  invoice_number text,
  invoice_date date,
  due_date date,
  currency text default 'USD',
  subtotal numeric,
  shipping numeric,
  tax numeric,
  total numeric,
  payment_terms text,
  raw_extraction jsonb,
  confirmed_at timestamptz,
  confirmed_by uuid references ht_profiles(id),
  created_at timestamptz default now()
);
create index on ht_invoices (factory_id, invoice_date desc);
create index on ht_invoices (parse_status);

create table ht_invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references ht_invoices(id) on delete cascade,
  sku text,
  description text,
  qty numeric,
  unit_price numeric,
  total numeric,
  ordinal int
);

-- =====================================================
-- PURCHASE ORDERS
-- =====================================================
create table ht_pos (
  id text primary key,
  factory_id text references ht_factories(id),
  sample_id text references ht_samples(id),
  status text default 'draft' check (status in ('draft','sent','confirmed','in_production','shipped','received','closed')),
  total numeric,
  currency text default 'USD',
  deposit_paid boolean default false,
  balance_paid boolean default false,
  placed_at date,
  ship_by date,
  notes text,
  created_at timestamptz default now()
);

-- =====================================================
-- ACTIVITY
-- =====================================================
create table ht_activity (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references ht_profiles(id),
  kind text not null,
  entity_type text,
  entity_id text,
  payload jsonb,
  created_at timestamptz default now()
);
create index on ht_activity (created_at desc);

-- =====================================================
-- RLS
-- =====================================================
alter table ht_factories enable row level security;
alter table ht_samples enable row level security;
alter table ht_wa_threads enable row level security;
alter table ht_wa_messages enable row level security;
alter table ht_invoices enable row level security;
alter table ht_invoice_line_items enable row level security;
alter table ht_pos enable row level security;
alter table ht_activity enable row level security;

create policy "team_all" on ht_factories for all to authenticated using (true) with check (true);
create policy "team_all" on ht_samples for all to authenticated using (true) with check (true);
create policy "team_all" on ht_wa_threads for all to authenticated using (true) with check (true);
create policy "team_all" on ht_wa_messages for all to authenticated using (true) with check (true);
create policy "team_all" on ht_invoices for all to authenticated using (true) with check (true);
create policy "team_all" on ht_invoice_line_items for all to authenticated using (true) with check (true);
create policy "team_all" on ht_pos for all to authenticated using (true) with check (true);
create policy "team_all" on ht_activity for all to authenticated using (true) with check (true);
