create table if not exists public.announcements (
  id           uuid        primary key default gen_random_uuid(),
  message      text        not null,
  type         text        not null default 'info'
                           check (type in ('info', 'warning', 'maintenance')),
  active_from  timestamptz not null default now(),
  active_until timestamptz,
  dismissible  boolean     not null default true,
  created_at   timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "Public can read announcements"
  on public.announcements for select using (true);

grant select on public.announcements to authenticated;

-- Example: insert a test announcement (remove or update as needed)
-- insert into public.announcements (message, type, active_until)
-- values ('Magiloom is in early access — things may move fast!', 'info', now() + interval '30 days');
