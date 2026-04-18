create extension if not exists pgcrypto;

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  status text not null,
  category text not null,
  description text default '',
  links jsonb not null default '{}'::jsonb,
  notes text default '',
  tags text[] not null default '{}',
  slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  category text default 'General',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.compliance_profiles (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  support_email text not null default '',
  collected_data jsonb not null default '[]'::jsonb,
  third_party_sdks jsonb not null default '[]'::jsonb,
  has_user_accounts boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(app_id)
);

create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  version_name text not null,
  version_code integer not null,
  track text not null default 'Alpha',
  changelog text default '',
  storage_path text default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_apps_updated_at on public.apps(updated_at desc);
create index if not exists idx_apps_slug on public.apps(slug);
create index if not exists idx_ideas_created_at on public.ideas(created_at desc);
create index if not exists idx_compliance_profiles_app_id on public.compliance_profiles(app_id);
create index if not exists idx_releases_app_id on public.releases(app_id, created_at desc);
