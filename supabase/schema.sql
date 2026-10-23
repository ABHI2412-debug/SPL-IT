create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  location text not null,
  starts_on date,
  ends_on date,
  cover_url text,
  created_at timestamptz not null default now()
);

create table public.trip_members (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  invited_phone text,
  display_name text,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (trip_id, user_id),
  check (user_id is not null or invited_phone is not null)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  paid_by uuid not null references public.profiles(id),
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'INR',
  split_type text not null default 'equal' check (split_type in ('equal', 'exact', 'percentage', 'shares')),
  created_at timestamptz not null default now()
);

create table public.expense_splits (
  expense_id uuid not null references public.expenses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  share numeric(12, 2) not null check (share >= 0),
  settled boolean not null default false,
  primary key (expense_id, user_id)
);

create table public.trip_invites (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  phone text not null,
  token text not null unique default encode(gen_random_bytes(18), 'hex'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;
alter table public.trip_invites enable row level security;

create policy "profiles are visible to trip members" on public.profiles for select using (
  id = auth.uid() or exists (select 1 from public.trip_members tm where tm.user_id = profiles.id and exists (select 1 from public.trip_members mine where mine.trip_id = tm.trip_id and mine.user_id = auth.uid()))
);
create policy "users can create trips" on public.trips for insert with check (owner_id = auth.uid());
create policy "members can view trips" on public.trips for select using (exists (select 1 from public.trip_members tm where tm.trip_id = trips.id and tm.user_id = auth.uid()));
create policy "members can view membership" on public.trip_members for select using (user_id = auth.uid() or exists (select 1 from public.trip_members mine where mine.trip_id = trip_members.trip_id and mine.user_id = auth.uid()));
create policy "members can view expenses" on public.expenses for select using (exists (select 1 from public.trip_members tm where tm.trip_id = expenses.trip_id and tm.user_id = auth.uid()));
create policy "members can view splits" on public.expense_splits for select using (exists (select 1 from public.expenses e join public.trip_members tm on tm.trip_id = e.trip_id where e.id = expense_splits.expense_id and tm.user_id = auth.uid()));

create policy "owners can update trips" on public.trips for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owners can add members" on public.trip_members for insert with check (exists (select 1 from public.trips t where t.id = trip_members.trip_id and t.owner_id = auth.uid()));
create policy "members can add expenses" on public.expenses for insert with check (paid_by = auth.uid() and exists (select 1 from public.trip_members tm where tm.trip_id = expenses.trip_id and tm.user_id = auth.uid()));
create policy "members can add splits" on public.expense_splits for insert with check (exists (select 1 from public.expenses e join public.trip_members tm on tm.trip_id = e.trip_id where e.id = expense_splits.expense_id and tm.user_id = auth.uid()));

insert into storage.buckets (id, name, public) values ('trip-covers', 'trip-covers', true) on conflict (id) do nothing;
create policy "authenticated users can upload trip covers" on storage.objects for insert to authenticated with check (bucket_id = 'trip-covers' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "public can view trip covers" on storage.objects for select using (bucket_id = 'trip-covers');
