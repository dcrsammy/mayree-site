-- ─────────────────────────────────────────────────────────────
-- MAYREE — SUPABASE DATABASE SCHEMA
-- Run this entire file in: Supabase → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";


-- ─── PROFILES ────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text default '',
  phone       text default '',
  address     text default '',
  created_at  timestamptz default now()
);

-- Auto-create profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── PRODUCTS ────────────────────────────────────────────────
create table if not exists public.products (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  price       numeric(12,2) not null,
  old_price   numeric(12,2),
  category    text,
  images      text[] default '{}',
  badge       text,
  active      boolean default true,
  stock       integer default 1,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);


-- ─── ORDERS ──────────────────────────────────────────────────
create table if not exists public.orders (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete set null,
  reference        text unique not null,
  items            jsonb default '[]',
  subtotal         numeric(12,2) default 0,
  shipping         numeric(12,2) default 0,
  total            numeric(12,2) default 0,
  status           text default 'pending'
                   check (status in ('pending','paid','processing','shipped','delivered','cancelled')),
  paystack_ref     text,
  shipping_address jsonb default '{}',
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);


-- ─── NEWSLETTER ──────────────────────────────────────────────
create table if not exists public.newsletter (
  id         uuid primary key default uuid_generate_v4(),
  email      text unique not null,
  created_at timestamptz default now()
);


-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

-- ── PROFILES ─────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile"   on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Admin can read all profiles (for customer list page)
create policy "Admin can read all profiles"
  on public.profiles for select
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));


-- ── PRODUCTS ─────────────────────────────────────────────────
alter table public.products enable row level security;

drop policy if exists "Products are publicly readable"    on public.products;
drop policy if exists "Admin can manage products"         on public.products;
drop policy if exists "Admin full access to products"     on public.products;
drop policy if exists "Public can read active products"   on public.products;

-- Anyone (logged in or not) can read active products for the shop
create policy "Public can read active products"
  on public.products for select
  using (active = true);

-- *** KEY FIX: authenticated users can read ALL products (active or not)
-- This lets the admin panel see hidden products without hitting RLS.
-- The actual admin-only write guard is below.
create policy "Authenticated users can read all products"
  on public.products for select
  using (auth.role() = 'authenticated');

-- Only the admin email can insert, update, delete
create policy "Admin can insert products"
  on public.products for insert
  with check (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

create policy "Admin can update products"
  on public.products for update
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

create policy "Admin can delete products"
  on public.products for delete
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));


-- ── ORDERS ───────────────────────────────────────────────────
alter table public.orders enable row level security;

drop policy if exists "Users can view own orders"    on public.orders;
drop policy if exists "Users can insert own orders"  on public.orders;
drop policy if exists "Users can update own orders"  on public.orders;
drop policy if exists "Admin can manage all orders"  on public.orders;

create policy "Users can view own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert with check (auth.uid() = user_id);

create policy "Users can update own orders"
  on public.orders for update using (auth.uid() = user_id);

-- Admin sees and manages everything
create policy "Admin can read all orders"
  on public.orders for select
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

create policy "Admin can update all orders"
  on public.orders for update
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));


-- ── NEWSLETTER ───────────────────────────────────────────────
alter table public.newsletter enable row level security;

drop policy if exists "Anyone can subscribe" on public.newsletter;
create policy "Anyone can subscribe"
  on public.newsletter for insert with check (true);


-- ─────────────────────────────────────────────────────────────
-- STORAGE BUCKET
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('mayree-images', 'mayree-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read mayree images"    on storage.objects;
drop policy if exists "Auth users can upload"        on storage.objects;
drop policy if exists "Auth users can delete own uploads" on storage.objects;

create policy "Public read mayree images"
  on storage.objects for select
  using (bucket_id = 'mayree-images');

create policy "Auth users can upload to mayree"
  on storage.objects for insert
  with check (bucket_id = 'mayree-images' and auth.role() = 'authenticated');

create policy "Auth users can update mayree uploads"
  on storage.objects for update
  using (bucket_id = 'mayree-images' and auth.role() = 'authenticated');

create policy "Auth users can delete mayree uploads"
  on storage.objects for delete
  using (bucket_id = 'mayree-images' and auth.role() = 'authenticated');


-- ─────────────────────────────────────────────────────────────
-- ADMIN EMAIL SETTING
-- Run this separately, replacing with YOUR actual admin email:
-- alter database postgres set app.admin_email = 'your@email.com';
-- ─────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────
-- DONE. Your Mayree database is ready.
-- ─────────────────────────────────────────────────────────────
