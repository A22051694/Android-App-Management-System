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

create index if not exists idx_apps_updated_at on public.apps(updated_at desc);
create index if not exists idx_ideas_created_at on public.ideas(created_at desc);
