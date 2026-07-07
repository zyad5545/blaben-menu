-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.

create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  price text not null,
  state text not null default 'available' check (state in ('available', 'unavailable', 'special_offer')),
  description text default '',
  image_url text,
  variants jsonb not null default '[]'::jsonb,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table products add column if not exists variants jsonb not null default '[]'::jsonb;
alter table products drop constraint if exists products_state_check;
alter table products add constraint products_state_check check (state in ('available', 'unavailable', 'special_offer'));

create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table admin_users enable row level security;

drop policy if exists "admin users can read self" on admin_users;
create policy "admin users can read self"
  on admin_users for select
  to authenticated
  using (user_id = auth.uid());

alter table products enable row level security;

-- Anyone (including anonymous menu visitors) can READ products.
drop policy if exists "public read" on products;
create policy "public read"
  on products for select
  using (true);

-- Only accounts listed in admin_users can insert/update/delete.
-- This is server-side RLS, so it cannot be bypassed by editing browser JS.
drop policy if exists "authenticated insert" on products;
drop policy if exists "admin insert" on products;
create policy "admin insert"
  on products for insert
  to authenticated
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

drop policy if exists "authenticated update" on products;
drop policy if exists "admin update" on products;
create policy "admin update"
  on products for update
  to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

drop policy if exists "authenticated delete" on products;
drop policy if exists "admin delete" on products;
create policy "admin delete"
  on products for delete
  to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()));

-- Storage bucket for product images.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public read images" on storage.objects;
create policy "public read images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "authenticated upload images" on storage.objects;
drop policy if exists "admin upload images" on storage.objects;
create policy "admin upload images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and exists (select 1 from admin_users where user_id = auth.uid()));

drop policy if exists "authenticated update images" on storage.objects;
drop policy if exists "admin update images" on storage.objects;
create policy "admin update images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and exists (select 1 from admin_users where user_id = auth.uid()));

drop policy if exists "authenticated delete images" on storage.objects;
drop policy if exists "admin delete images" on storage.objects;
create policy "admin delete images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and exists (select 1 from admin_users where user_id = auth.uid()));
