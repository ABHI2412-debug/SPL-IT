-- ========================================================
-- SPLit Database Schema & Seed Data
-- Run this in the Supabase SQL Editor (SQL Query tab)
-- ========================================================

-- 1. Ensure required extensions
create extension if not exists "pgcrypto";

-- 2. Profiles table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  phone text unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 3. Trips / Shared Spaces table
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  location text not null,
  starts_on date,
  ends_on date,
  cover_url text,
  status text not null default 'Active' check (status in ('Active', 'Upcoming', 'Settled')),
  created_at timestamptz not null default now()
);

-- 4. Trip Members table
create table if not exists public.trip_members (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  display_name text not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz default now(),
  created_at timestamptz not null default now(),
  primary key (trip_id, display_name)
);

-- 5. Shared Expenses table
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  paid_by_name text not null,
  paid_by_id uuid references public.profiles(id) on delete set null,
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'INR',
  split_type text not null default 'equal' check (split_type in ('equal', 'exact', 'percentage', 'shares')),
  created_at timestamptz not null default now()
);

-- 6. Expense Splits table
create table if not exists public.expense_splits (
  expense_id uuid not null references public.expenses(id) on delete cascade,
  member_name text not null,
  user_id uuid references public.profiles(id) on delete set null,
  share numeric(12, 2) not null check (share >= 0),
  settled boolean not null default false,
  primary key (expense_id, member_name)
);

-- 7. Personal Transactions table (Room Ledger)
create table if not exists public.personal_transactions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  amount numeric(12, 2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense', 'transfer')),
  category text not null,
  account text not null,
  date text not null,
  notes text,
  created_at timestamptz not null default now()
);

-- 8. Personal Budgets table
create table if not exists public.personal_budgets (
  id uuid primary key default gen_random_uuid(),
  category text not null unique,
  category_icon text not null,
  allocated numeric(12, 2) not null check (allocated > 0),
  spent numeric(12, 2) not null default 0,
  currency text not null default 'INR',
  warning_threshold integer not null default 80,
  created_at timestamptz not null default now()
);

-- 9. Financial Goals table
create table if not exists public.personal_goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  current_amount numeric(12, 2) not null default 0,
  currency text not null default 'INR',
  target_date text not null,
  category text not null,
  created_at timestamptz not null default now()
);

-- ========================================================
-- RLS POLICIES (Allow public read & insert for demo testing)
-- ========================================================
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;
alter table public.personal_transactions enable row level security;
alter table public.personal_budgets enable row level security;
alter table public.personal_goals enable row level security;

-- Permissive demo policies so anon public key can read and insert
create policy "Allow public read profiles" on public.profiles for select using (true);
create policy "Allow public write profiles" on public.profiles for all using (true);

create policy "Allow public read trips" on public.trips for select using (true);
create policy "Allow public write trips" on public.trips for all using (true);

create policy "Allow public read trip_members" on public.trip_members for select using (true);
create policy "Allow public write trip_members" on public.trip_members for all using (true);

create policy "Allow public read expenses" on public.expenses for select using (true);
create policy "Allow public write expenses" on public.expenses for all using (true);

create policy "Allow public read expense_splits" on public.expense_splits for select using (true);
create policy "Allow public write expense_splits" on public.expense_splits for all using (true);

create policy "Allow public read personal_transactions" on public.personal_transactions for select using (true);
create policy "Allow public write personal_transactions" on public.personal_transactions for all using (true);

create policy "Allow public read personal_budgets" on public.personal_budgets for select using (true);
create policy "Allow public write personal_budgets" on public.personal_budgets for all using (true);

create policy "Allow public read personal_goals" on public.personal_goals for select using (true);
create policy "Allow public write personal_goals" on public.personal_goals for all using (true);

-- ========================================================
-- SEED DATA (Trips, Members, Expenses & Personal Records)
-- ========================================================

-- Clean up any prior seed entries
truncate table public.expense_splits, public.expenses, public.trip_members, public.trips, public.personal_transactions, public.personal_budgets, public.personal_goals, public.profiles cascade;

-- Seed Profiles
insert into public.profiles (id, display_name, phone) values
  ('11111111-1111-1111-1111-111111111111', 'Sourabh Patil', '+919876543210'),
  ('22222222-2222-2222-2222-222222222222', 'Aman Sharma', '+919876543211'),
  ('33333333-3333-3333-3333-333333333333', 'Rhea Sen', '+919876543212'),
  ('44444444-4444-4444-4444-444444444444', 'Vikram Malhotra', '+919876543213');

-- Seed Trips
insert into public.trips (id, owner_id, name, location, starts_on, ends_on, cover_url, status) values
  (
    'a0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Goa Beach & Sun Weekend',
    'North Goa, India',
    '2026-11-12',
    '2026-11-16',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'Active'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Himalayan Trek & Cabin',
    'Manali, Himachal Pradesh',
    '2026-12-05',
    '2026-12-10',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    'Upcoming'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'Jaipur Heritage Stories',
    'Jaipur, Rajasthan',
    '2026-09-18',
    '2026-09-21',
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    'Settled'
  );

-- Seed Trip Members
insert into public.trip_members (trip_id, user_id, display_name, role) values
  ('a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'You', 'owner'),
  ('a0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Aman', 'member'),
  ('a0000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Rhea', 'member'),
  ('a0000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'Vikram', 'member'),

  ('a0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'You', 'owner'),
  ('a0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Aman', 'member'),

  ('a0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'You', 'owner'),
  ('a0000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'Rhea', 'member');

-- Seed Expenses
insert into public.expenses (id, trip_id, paid_by_name, paid_by_id, description, amount, split_type) values
  (
    'e0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'You',
    '11111111-1111-1111-1111-111111111111',
    'Beachside Villa 3 Nights',
    18500.00,
    'equal'
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Aman',
    '22222222-2222-2222-2222-222222222222',
    'Dinner at Thalassa Sunset Cafe',
    4800.00,
    'equal'
  ),
  (
    'e0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Rhea',
    '33333333-3333-3333-3333-333333333333',
    'Self-Drive Thar & Fuel',
    6200.00,
    'equal'
  ),
  (
    'e0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000002',
    'You',
    '11111111-1111-1111-1111-111111111111',
    'Trek Guide & Camping Gear Deposit',
    5500.00,
    'equal'
  );

-- Seed Expense Splits
insert into public.expense_splits (expense_id, member_name, share, settled) values
  ('e0000000-0000-0000-0000-000000000001', 'You', 4625.00, true),
  ('e0000000-0000-0000-0000-000000000001', 'Aman', 4625.00, false),
  ('e0000000-0000-0000-0000-000000000001', 'Rhea', 4625.00, false),
  ('e0000000-0000-0000-0000-000000000001', 'Vikram', 4625.00, false),

  ('e0000000-0000-0000-0000-000000000002', 'You', 1200.00, false),
  ('e0000000-0000-0000-0000-000000000002', 'Aman', 1200.00, true),
  ('e0000000-0000-0000-0000-000000000002', 'Rhea', 1200.00, false),
  ('e0000000-0000-0000-0000-000000000002', 'Vikram', 1200.00, false),

  ('e0000000-0000-0000-0000-000000000003', 'You', 1550.00, false),
  ('e0000000-0000-0000-0000-000000000003', 'Aman', 1550.00, false),
  ('e0000000-0000-0000-0000-000000000003', 'Rhea', 1550.00, true),
  ('e0000000-0000-0000-0000-000000000003', 'Vikram', 1550.00, false),

  ('e0000000-0000-0000-0000-000000000004', 'You', 2750.00, true),
  ('e0000000-0000-0000-0000-000000000004', 'Aman', 2750.00, false);

-- Seed Personal Transactions (Room Ledger)
insert into public.personal_transactions (title, amount, type, category, account, date, notes) values
  ('October Monthly Salary', 85000.00, 'income', 'Salary / Income', 'HDFC Salary Account', 'Today, 21 Oct', 'Direct payroll credit'),
  ('Whole Foods & Nature Basket Grocery', 3450.00, 'expense', 'Food & Groceries', 'HDFC Salary Account', 'Yesterday, 20 Oct', 'Organic veggies, almond milk, coffee'),
  ('High-Yield Savings Auto-Deposit', 20000.00, 'transfer', 'Savings Transfer', 'ICICI Savings', '18 Oct', 'Monthly discipline transfer'),
  ('Blue Tokai Specialty Coffee Roasters', 420.00, 'expense', 'Food & Dining', 'CRED / UPI Wallet', '17 Oct', 'Cold brew + croissant'),
  ('Cult.fit Gym & Fitness Pass', 2999.00, 'expense', 'Health & Fitness', 'HDFC Salary Account', '15 Oct', 'Quarterly elite membership'),
  ('Freelance UI/UX Advisory', 24000.00, 'income', 'Freelance / Consulting', 'ICICI Savings', '10 Oct', 'Fintech design sprint payout');

-- Seed Personal Budgets
insert into public.personal_budgets (category, category_icon, allocated, spent, warning_threshold) values
  ('Food & Groceries', '🛒', 14000.00, 8920.00, 80),
  ('Dining Out & Cafes', '☕', 9000.00, 6400.00, 75),
  ('Rent & Housing', '🏠', 28000.00, 28000.00, 95),
  ('Transportation & Fuel', '🚗', 6500.00, 4200.00, 80),
  ('Shopping & Gear', '🛍️', 10000.00, 3100.00, 70),
  ('Health & Fitness', '🏋️', 5000.00, 2999.00, 80);

-- Seed Financial Goals
insert into public.personal_goals (title, target_amount, current_amount, target_date, category) values
  ('Kyoto Autumn Expedition', 180000.00, 92000.00, 'Nov 2026', 'Travel'),
  ('Emergency Safety Net (6 Months)', 250000.00, 165000.00, 'Q1 2027', 'Safety Net'),
  ('M4 Max Studio Setup', 220000.00, 140000.00, 'Dec 2026', 'Hardware');
