-- Habit Platform — Supabase Cloud Schema (V4)
-- Run this in your Supabase SQL editor to enable cloud sync.

-- Enable RLS
alter table if exists habits enable row level security;

-- Habits
create table if not exists habits (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  icon text not null,
  accent_color text not null,
  frequency jsonb not null,
  preferred_time text not null,
  status text not null default 'active',
  priority text not null default 'medium',
  difficulty text not null default 'medium',
  category_id text,
  created_at text not null,
  updated_at text not null
);

-- Completions
create table if not exists completions (
  id text primary key,
  habit_id text references habits(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  date text not null,
  completed_at text not null,
  note text
);

-- Routines
create table if not exists routines (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  icon text not null,
  accent_color text not null,
  items jsonb not null default '[]',
  created_at text not null,
  updated_at text not null
);

-- Goals
create table if not exists goals (
  id text primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  target_type text not null,
  target_value int not null,
  current_value int not null default 0,
  unit text,
  deadline text,
  sub_goals jsonb not null default '[]',
  linked_habit_ids jsonb not null default '[]',
  status text not null default 'active',
  created_at text not null,
  updated_at text not null
);

-- Reflections
create table if not exists reflections (
  id text primary key,
  user_id uuid references auth.users not null,
  date text not null unique,
  mood int,
  energy int,
  note text,
  updated_at text not null
);

-- Row Level Security Policies
create policy "Users manage own habits" on habits for all using (auth.uid() = user_id);
create policy "Users manage own completions" on completions for all using (auth.uid() = user_id);
create policy "Users manage own routines" on routines for all using (auth.uid() = user_id);
create policy "Users manage own goals" on goals for all using (auth.uid() = user_id);
create policy "Users manage own reflections" on reflections for all using (auth.uid() = user_id);

-- ──── Challenge Rooms (Social Multiplayer) ──────────────────────────
create table if not exists challenge_rooms (
  id text primary key,
  code text unique not null,
  title text not null,
  description text,
  creator_username text not null,
  target_days int not null,
  habit_names jsonb not null default '[]',
  start_date text not null,
  end_date text not null,
  participants jsonb not null default '[]',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for instant lookup by room code (e.g. 'AB12CD')
create index if not exists idx_challenge_rooms_code on challenge_rooms(code);

-- Enable RLS
alter table challenge_rooms enable row level security;

-- Since challenge rooms are shared publicly via 6-digit codes, allow read, insert, and update
create policy "Public can view challenge rooms" on challenge_rooms for select using (true);
create policy "Public can insert challenge rooms" on challenge_rooms for insert with check (true);
create policy "Public can update challenge rooms" on challenge_rooms for update using (true);

