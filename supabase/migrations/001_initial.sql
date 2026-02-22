-- ============================================================
-- Aventure Hero - Initial Schema Migration
-- Copy and run in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  role text not null default 'player' check (role in ('player', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Stories
create table public.stories (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  author_id uuid not null references public.profiles(id) on delete cascade,
  is_published boolean not null default false,
  cover_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Scenes
create table public.scenes (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  title text not null,
  content text not null default '',
  is_start boolean not null default false,
  is_ending boolean not null default false,
  ending_type text check (ending_type in ('victory', 'defeat', 'neutral')),
  position_x float not null default 0,
  position_y float not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure only one start scene per story
create unique index scenes_one_start_per_story
  on public.scenes (story_id)
  where is_start = true;

-- Choices (links between scenes)
create table public.choices (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  from_scene_id uuid not null references public.scenes(id) on delete cascade,
  to_scene_id uuid not null references public.scenes(id) on delete cascade,
  label text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  constraint choices_different_scenes check (from_scene_id != to_scene_id)
);

-- Game sessions
create table public.game_sessions (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  current_scene_id uuid not null references public.scenes(id),
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint one_active_session_per_story unique (player_id, story_id)
);

-- Scene visits (audit trail)
create table public.scene_visits (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  scene_id uuid not null references public.scenes(id),
  choice_id uuid references public.choices(id),
  visited_at timestamptz not null default now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamps
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger stories_updated_at before update on public.stories
  for each row execute procedure public.update_updated_at();

create trigger scenes_updated_at before update on public.scenes
  for each row execute procedure public.update_updated_at();

create trigger game_sessions_updated_at before update on public.game_sessions
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.scenes enable row level security;
alter table public.choices enable row level security;
alter table public.game_sessions enable row level security;
alter table public.scene_visits enable row level security;

-- Profiles policies
create policy "Users can view all profiles"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Stories policies
create policy "Anyone can view published stories"
  on public.stories for select
  using (is_published = true or author_id = auth.uid());

create policy "Admins can view all stories"
  on public.stories for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert stories"
  on public.stories for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Authors can update own stories"
  on public.stories for update
  using (author_id = auth.uid());

create policy "Authors can delete own stories"
  on public.stories for delete
  using (author_id = auth.uid());

-- Scenes policies
create policy "Anyone can view scenes of published stories"
  on public.scenes for select
  using (
    exists (
      select 1 from public.stories
      where id = story_id and (is_published = true or author_id = auth.uid())
    )
  );

create policy "Authors can manage scenes"
  on public.scenes for all
  using (
    exists (
      select 1 from public.stories
      where id = story_id and author_id = auth.uid()
    )
  );

-- Choices policies
create policy "Anyone can view choices of published stories"
  on public.choices for select
  using (
    exists (
      select 1 from public.stories
      where id = story_id and (is_published = true or author_id = auth.uid())
    )
  );

create policy "Authors can manage choices"
  on public.choices for all
  using (
    exists (
      select 1 from public.stories
      where id = story_id and author_id = auth.uid()
    )
  );

-- Game sessions policies
create policy "Players can view own sessions"
  on public.game_sessions for select using (player_id = auth.uid());

create policy "Players can insert own sessions"
  on public.game_sessions for insert with check (player_id = auth.uid());

create policy "Players can update own sessions"
  on public.game_sessions for update using (player_id = auth.uid());

-- Scene visits policies
create policy "Players can view own visits"
  on public.scene_visits for select
  using (
    exists (
      select 1 from public.game_sessions
      where id = session_id and player_id = auth.uid()
    )
  );

create policy "Players can insert own visits"
  on public.scene_visits for insert
  with check (
    exists (
      select 1 from public.game_sessions
      where id = session_id and player_id = auth.uid()
    )
  );

-- ============================================================
-- ADMIN PROMOTION (run manually for first admin)
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'your-user-id';
-- ============================================================
