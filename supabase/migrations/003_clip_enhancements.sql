alter table public.clips
  add column if not exists is_starred       boolean     not null default false,
  add column if not exists notes            text,
  add column if not exists og_image_url     text,
  add column if not exists reading_time_min integer,
  add column if not exists archived_at      timestamptz,
  add column if not exists content_type     text        not null default 'article';

-- Index for fast starred / archive queries
create index if not exists clips_user_starred
  on public.clips (user_id, is_starred) where is_starred = true;

create index if not exists clips_user_active
  on public.clips (user_id, created_at desc) where archived_at is null;
