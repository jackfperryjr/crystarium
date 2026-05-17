create table if not exists public.user_preferences (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  prefs      jsonb       not null default '{
    "theme": "system",
    "edge_threshold": 0.7,
    "default_view": "graph",
    "always_show_labels": false
  }'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users can manage own preferences"
  on public.user_preferences for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, update on public.user_preferences to authenticated;
