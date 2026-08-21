-- Adds a `profiles` table so the app can show a real dropdown of teammates
-- (instead of free-text) when assigning a company. Run this once in the
-- Supabase SQL Editor, same way you ran schema.sql.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Authenticated users can read profiles"
  on profiles for select
  to authenticated
  using (true);

-- Auto-add a profile row whenever someone signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Backfill profiles for anyone who already signed up before this migration
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;
