-- ============================================================
-- CONTACTS
-- Directional: user_id has added contact_id to their list.
-- ============================================================
create table public.contacts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  contact_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(user_id, contact_id)
);

create index idx_contacts_user_id    on public.contacts(user_id);
create index idx_contacts_contact_id on public.contacts(contact_id);

alter table public.contacts enable row level security;

create policy "Users can view their own contacts"
  on public.contacts for select
  using (auth.uid() = user_id);

create policy "Users can add contacts"
  on public.contacts for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own contacts"
  on public.contacts for delete
  using (auth.uid() = user_id);

-- Allow payer to pay from their dashboard:
-- Party B needs to be able to update payment_requests where they are the payer
create policy "Payer can update payment status"
  on public.payment_requests for update
  using (auth.uid() = payer_id);
