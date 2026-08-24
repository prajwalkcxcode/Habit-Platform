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
