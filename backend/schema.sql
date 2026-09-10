-- Apply in a dedicated Supabase project for Elemental Knight.
begin;
create schema if not exists knight_private;
revoke all on schema knight_private from public, anon;
grant usage on schema knight_private to authenticated;
create table if not exists public.knight_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  document jsonb not null,
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  constraint bounded_save check (octet_length(document::text) <= 1000000),
  constraint versioned_save check ((document->>'version') is not distinct from '2' and jsonb_typeof(document->'data') is not distinct from 'object')
);
alter table public.knight_saves enable row level security;
drop policy if exists own_save on public.knight_saves;
create policy own_save on public.knight_saves for select to authenticated using ((select auth.uid())=user_id);
revoke all on public.knight_saves from anon, authenticated;
grant select on public.knight_saves to authenticated;

create or replace function knight_private.save_knight(p_document jsonb, p_revision integer)
returns integer language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); result integer;
begin
  if uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_revision is null or p_revision<0 then raise exception 'Invalid revision'; end if;
  if p_document is null or octet_length(p_document::text)>1000000 or (p_document->>'version') is distinct from '2'
     or jsonb_typeof(p_document->'data') is distinct from 'object'
     or jsonb_typeof(p_document#>'{data,vault}') is distinct from 'array'
     or jsonb_array_length(p_document#>'{data,vault}')>200 then raise exception 'Invalid save'; end if;
  if p_revision=0 then
    insert into public.knight_saves(user_id,document) values(uid,p_document)
    on conflict(user_id) do nothing returning revision into result;
  else
    update public.knight_saves set document=p_document,revision=revision+1,updated_at=now()
    where user_id=uid and revision=p_revision returning revision into result;
  end if;
  if result is null then raise exception 'Save conflict' using errcode='40001'; end if;
  return result;
end $$;
revoke all on function knight_private.save_knight(jsonb,integer) from public,anon;
grant execute on function knight_private.save_knight(jsonb,integer) to authenticated;
create or replace function public.save_knight(p_document jsonb, p_revision integer)
returns integer language sql security invoker set search_path = '' as $$
  select knight_private.save_knight(p_document,p_revision);
$$;
revoke all on function public.save_knight(jsonb,integer) from public,anon;
grant execute on function public.save_knight(jsonb,integer) to authenticated;
commit;
