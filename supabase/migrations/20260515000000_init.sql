-- pgvector must be enabled in Supabase dashboard (Database > Extensions) or via this statement.
-- On managed Supabase, install it in the 'extensions' schema.
create extension if not exists vector with schema extensions;

-- ============================================================
-- clips
-- ============================================================
create table public.clips (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users on delete cascade,
  url         text        not null,
  title       text,
  domain      text,
  favicon_url text,
  raw_text    text,
  summary     text,
  entities    jsonb       not null default '[]'::jsonb,
  embedding   vector(1024),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table public.clips enable row level security;

create policy "users can manage their own clips"
  on public.clips
  for all
  using     (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Indexes
-- ============================================================
create index clips_user_id_idx    on public.clips (user_id);
create index clips_created_at_idx on public.clips (created_at desc);

-- HNSW is better than IVFFlat for datasets under ~1M rows.
-- vector_cosine_ops matches cosine similarity (standard for text embeddings).
create index clips_embedding_idx  on public.clips using hnsw (embedding vector_cosine_ops);

-- ============================================================
-- match_clips: semantic similarity search scoped to one user
-- Returns clips whose cosine similarity exceeds match_threshold,
-- ordered closest-first. Used by Crystarium to draw aether-lines.
-- ============================================================
create or replace function match_clips (
  query_embedding  vector(1024),
  match_user_id    uuid,
  match_threshold  float default 0.75,
  match_count      int   default 20
)
returns table (
  id         uuid,
  url        text,
  title      text,
  domain     text,
  summary    text,
  entities   jsonb,
  similarity float
)
language sql stable
as $$
  select
    id,
    url,
    title,
    domain,
    summary,
    entities,
    1 - (embedding <=> query_embedding) as similarity
  from public.clips
  where
        user_id   = match_user_id
    and embedding is not null
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
