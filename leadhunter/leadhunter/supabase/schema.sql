-- LeadHunter Database Schema
-- Run this in Supabase SQL Editor

-- =====================
-- USERS TABLE
-- =====================
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'agency')),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================
-- GROUPS TABLE
-- =====================
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  group_url text not null,
  group_name text not null,
  platform text not null check (platform in ('facebook','linkedin','useme','freelancer','upwork','twitter','reddit','other')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.groups enable row level security;

create policy "Users manage own groups"
  on public.groups for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================
-- KEYWORDS TABLE
-- =====================
create table if not exists public.keywords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  keyword text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id, keyword)
);

alter table public.keywords enable row level security;

create policy "Users manage own keywords"
  on public.keywords for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================
-- LEADS TABLE
-- =====================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  platform text not null check (platform in ('facebook','linkedin','useme','freelancer','upwork','twitter','reddit','other')),
  group_name text not null default '',
  post_text text not null,
  post_link text not null,
  score integer not null default 0 check (score >= 0 and score <= 100),
  status text not null default 'new' check (status in ('new','contacted','negotiation','won','lost')),
  notes text,
  keyword_matched text,
  date_found timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "Users manage own leads"
  on public.leads for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index leads_user_id_idx on public.leads(user_id);
create index leads_date_found_idx on public.leads(date_found desc);
create index leads_status_idx on public.leads(status);
create index leads_platform_idx on public.leads(platform);

-- =====================
-- ALERTS TABLE
-- =====================
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade unique,
  telegram_chat_id text,
  email_enabled boolean not null default true,
  telegram_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.alerts enable row level security;

create policy "Users manage own alerts"
  on public.alerts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================
-- PROPOSALS TABLE
-- =====================
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  client_description text not null,
  project_scope text not null,
  timeline text,
  price text,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.proposals enable row level security;

create policy "Users manage own proposals"
  on public.proposals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================
-- SEED DEMO DATA (optional)
-- =====================
-- Uncomment to add demo leads for testing:
-- insert into public.leads (user_id, platform, group_name, post_text, post_link, score, status, keyword_matched)
-- values (
--   auth.uid(),
--   'facebook',
--   'Zlecenia Web Dev PL',
--   'Szukam osoby do wykonania strony internetowej dla mojej restauracji. Potrzebuję prostej strony z menu, galerią i formularzem rezerwacji. Budżet 2000-3000 zł.',
--   'https://facebook.com/groups/123/posts/456',
--   85,
--   'new',
--   'szukam strony'
-- );
