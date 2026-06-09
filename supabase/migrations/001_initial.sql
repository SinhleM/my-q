/* supabase/migrations/001_initial.sql */
-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- One row per user. Created automatically on auth.users insert.
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  display_name  text,
  bio           text,
  phone         text,
  email         text,
  website       text,
  -- social handles (plain usernames, not full URLs)
  twitter       text,
  linkedin      text,
  instagram     text,
  -- settings
  accept_files  boolean not null default true,
  accept_payments boolean not null default true,
  max_file_size_mb int not null default 25,
  -- stats (denormalised for fast public page loads)
  scan_count    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, email, display_name)
  values (
    new.id,
    -- default username = first part of email, lower-cased, spaces → underscores
    lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '_', 'g')),
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- QR CODES
-- Each user has one primary QR. Additional ones can be created
-- (e.g. temporary / event-specific).
-- ============================================================
create table public.qr_codes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  label       text not null default 'Primary',
  is_active   boolean not null default true,
  -- optional expiry for temporary QR codes
  expires_at  timestamptz,
  scan_count  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Auto-create a primary QR code when profile is created
create or replace function public.handle_new_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.qr_codes (user_id, label)
  values (new.id, 'Primary');
  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();

-- ============================================================
-- SCAN EVENTS
-- Lightweight log: who got scanned, when, from where.
-- ============================================================
create table public.scan_events (
  id          uuid primary key default uuid_generate_v4(),
  qr_id       uuid not null references public.qr_codes(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  ip_hash     text,   -- hashed for privacy
  user_agent  text,
  scanned_at  timestamptz not null default now()
);

-- ============================================================
-- FILES
-- Tracks uploads sent TO a user via their QR page.
-- actual storage: supabase storage bucket "qr-files"
-- ============================================================
create table public.files (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid not null references public.profiles(id) on delete cascade,
  -- null sender = anonymous upload from QR page
  sender_id     uuid references public.profiles(id) on delete set null,
  storage_path  text not null,   -- path inside the "qr-files" bucket
  file_name     text not null,
  file_size     bigint not null, -- bytes
  mime_type     text,
  -- owner can mark files as shared (visible on their public QR page for download)
  is_shared     boolean not null default false,
  -- soft delete
  deleted_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- PAYMENT REQUESTS
-- Owner creates a request; payer pays via PayFast.
-- ============================================================
create type payment_status as enum ('pending', 'paid', 'cancelled', 'failed');

create table public.payment_requests (
  id              uuid primary key default uuid_generate_v4(),
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  -- payer may or may not have an account
  payer_id        uuid references public.profiles(id) on delete set null,
  payer_email     text,
  amount          numeric(10,2) not null check (amount > 0),
  currency        text not null default 'ZAR',
  description     text,
  status          payment_status not null default 'pending',
  -- PayFast reference fields
  payfast_pf_payment_id  text,
  payfast_m_payment_id   text unique,  -- our merchant reference
  -- optional expiry
  expires_at      timestamptz,
  paid_at         timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger payment_requests_updated_at
  before update on public.payment_requests
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_profiles_username         on public.profiles(username);
create index idx_qr_codes_user_id          on public.qr_codes(user_id);
create index idx_scan_events_profile_id    on public.scan_events(profile_id);
create index idx_scan_events_scanned_at    on public.scan_events(scanned_at desc);
create index idx_files_owner_id            on public.files(owner_id);
create index idx_files_deleted_at          on public.files(deleted_at) where deleted_at is null;
create index idx_payment_requests_owner_id on public.payment_requests(owner_id);
create index idx_payment_requests_status   on public.payment_requests(status);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles         enable row level security;
alter table public.qr_codes         enable row level security;
alter table public.scan_events      enable row level security;
alter table public.files            enable row level security;
alter table public.payment_requests enable row level security;

-- PROFILES
create policy "Public profiles are readable by anyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- QR CODES
create policy "QR codes are readable by anyone"
  on public.qr_codes for select using (true);

create policy "Users can manage their own QR codes"
  on public.qr_codes for all using (auth.uid() = user_id);

-- SCAN EVENTS
create policy "Users can view their own scan events"
  on public.scan_events for select using (auth.uid() = profile_id);

create policy "Anyone can insert a scan event"
  on public.scan_events for insert with check (true);

-- FILES
create policy "Users can view their own files"
  on public.files for select
  using (auth.uid() = owner_id and deleted_at is null);

create policy "Shared files are readable by anyone"
  on public.files for select
  using (is_shared = true and deleted_at is null);

create policy "Anyone can upload a file to an active profile"
  on public.files for insert with check (true);

create policy "Users can update their own files"
  on public.files for update using (auth.uid() = owner_id);

create policy "Users can delete their own files"
  on public.files for delete using (auth.uid() = owner_id);

-- PAYMENT REQUESTS
create policy "Users can view their own payment requests"
  on public.payment_requests for select
  using (auth.uid() = owner_id or auth.uid() = payer_id);

create policy "Public payment requests readable by anyone (for QR pay page)"
  on public.payment_requests for select
  using (status = 'pending');

create policy "Users can create payment requests"
  on public.payment_requests for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own payment requests"
  on public.payment_requests for update using (auth.uid() = owner_id);