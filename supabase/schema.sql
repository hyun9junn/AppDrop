-- supabase/schema.sql
-- Run this in the Supabase Dashboard → SQL Editor

create table if not exists creators (
  id            text primary key,
  name          text not null,
  bio           text not null default '',
  avatar        text not null default '',
  links         text[] not null default '{}',
  regular_count int not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists apps (
  id          text primary key,
  title       text not null,
  tagline     text not null,
  link        text not null,
  creator_id  text references creators(id),
  description text not null,
  use_cases   text[] not null,
  tags        text[] not null,
  category    text not null,
  access_type text[] not null,
  pricing     text not null,
  story_card  jsonb not null,
  social_copy jsonb not null,
  boost_count int not null default 0,
  is_new      bool not null default true,
  status      text not null default 'published',
  created_at  timestamptz not null default now()
);

create table if not exists boosts (
  device_id  text not null,
  app_id     text references apps(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (device_id, app_id)
);

create table if not exists favorites (
  device_id  text not null,
  creator_id text references creators(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (device_id, creator_id)
);

create table if not exists collections (
  id          text primary key,
  title       text not null,
  description text not null,
  emoji       text not null,
  app_ids     text[] not null default '{}',
  curated_by  text not null default 'AppDrop',
  updated_at  timestamptz not null default now()
);

create table if not exists feed_items (
  id         uuid primary key default gen_random_uuid(),
  creator_id text references creators(id) on delete cascade,
  type       text not null,
  app_id     text references apps(id) on delete cascade,
  body       text not null default '',
  created_at timestamptz not null default now()
);

-- Trigger: keep apps.boost_count in sync with boosts table
create or replace function sync_boost_count()
returns trigger language plpgsql as $$
begin
  if (TG_OP = 'INSERT') then
    update apps set boost_count = boost_count + 1 where id = NEW.app_id;
  elsif (TG_OP = 'DELETE') then
    update apps set boost_count = greatest(boost_count - 1, 0) where id = OLD.app_id;
  end if;
  return null;
end;
$$;

drop trigger if exists boost_count_trigger on boosts;
create trigger boost_count_trigger
  after insert or delete on boosts
  for each row execute function sync_boost_count();
