-- Hair Track — Supabase schema
-- Run in the Supabase SQL editor after creating a new project.

-- =====================================================
-- PROFILES (extends auth.users)
-- =====================================================
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  role text not null default 'ops' check (role in ('founder','ops','viewer')),
  avatar_url text,
  created_at timestamptz default now()
);

-- =====================================================
-- FACTORIES
-- =====================================================
create table factories (
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
create index on factories (status);

-- =====================================================
-- SAMPLES
-- =====================================================
create table samples (
  id text primary key,
  factory_id text references factories(id) on delete set null,
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
create index on samples (stage);
create index on samples (factory_id);

create table sample_photos (
  id uuid primary key default gen_random_uuid(),
  sample_id text references samples(id) on delete cascade,
  url text not null,
  caption text,
  created_at timestamptz default now()
);

-- =====================================================
-- WHATSAPP
-- =====================================================
create table wa_threads (
  id uuid primary key default gen_random_uuid(),
  factory_id text references factories(id) on delete set null,
  wa_phone text not null,
  name text,
  pinned boolean default false,
  unread_count int default 0,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz default now(),
  unique (wa_phone)
);
create index on wa_threads (last_message_at desc);

create table wa_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references wa_threads(id) on delete cascade,
  direction text not null check (direction in ('inbound','outbound')),
  body text,
  media_url text,
  media_type text,
  telnyx_id text,
  sent_by uuid references profiles(id),
  status text default 'sent' check (status in ('pending','sent','delivered','read','failed')),
  sent_at timestamptz default now()
);
create index on wa_messages (thread_id, sent_at desc);
create unique index on wa_messages (telnyx_id) where telnyx_id is not null;

-- =====================================================
-- INVOICES
-- =====================================================
create table invoices (
  id uuid primary key default gen_random_uuid(),
  factory_id text references factories(id) on delete set null,
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
  confirmed_by uuid references profiles(id),
  created_at timestamptz default now()
);
create index on invoices (factory_id, invoice_date desc);
create index on invoices (parse_status);

create table invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  sku text,
  description text,
  qty numeric,
  unit_price numeric,
  total numeric,
  ordinal int
);

-- =====================================================
-- POS
-- =====================================================
create table pos (
  id text primary key,
  factory_id text references factories(id),
  sample_id text references samples(id),
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
create table activity (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  kind text not null,
  entity_type text,
  entity_id text,
  payload jsonb,
  created_at timestamptz default now()
);
create index on activity (created_at desc);

-- =====================================================
-- RLS
-- =====================================================
alter table factories enable row level security;
alter table samples enable row level security;
alter table wa_threads enable row level security;
alter table wa_messages enable row level security;
alter table invoices enable row level security;
alter table invoice_line_items enable row level security;
alter table pos enable row level security;
alter table activity enable row level security;

create policy "team_all" on factories for all to authenticated using (true) with check (true);
create policy "team_all" on samples for all to authenticated using (true) with check (true);
create policy "team_all" on wa_threads for all to authenticated using (true) with check (true);
create policy "team_all" on wa_messages for all to authenticated using (true) with check (true);
create policy "team_all" on invoices for all to authenticated using (true) with check (true);
create policy "team_all" on invoice_line_items for all to authenticated using (true) with check (true);
create policy "team_all" on pos for all to authenticated using (true) with check (true);
create policy "team_all" on activity for all to authenticated using (true) with check (true);
