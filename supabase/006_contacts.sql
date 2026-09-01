-- Adds support for multiple contacts per company. The existing single
-- decision_maker/title/phone/email/linkedin_profile fields on companies stay as
-- the "primary" contact (from the original research) — this table is for
-- additional contacts a rep finds later (a better number, a second person, etc.)
-- without overwriting what's already there.
--
-- Run this once in the Supabase SQL Editor, same as the previous migrations.

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text,
  title text,
  phone text,
  email text,
  linkedin_profile text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table contacts enable row level security;

create policy "Authenticated users can read contacts"
  on contacts for select
  to authenticated
  using (true);

create policy "Authenticated users can insert contacts"
  on contacts for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update contacts"
  on contacts for update
  to authenticated
  using (true);

create policy "Authenticated users can delete contacts"
  on contacts for delete
  to authenticated
  using (true);

create index if not exists contacts_company_id_idx on contacts(company_id);

drop trigger if exists contacts_set_updated_at on contacts;
create trigger contacts_set_updated_at
  before update on contacts
  for each row execute function set_updated_at();

-- Log contact add/edit/delete into the same activity_log used for everything else
create or replace function log_contact_activity()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity_log (company_id, actor_email, action, new_value)
    values (new.company_id, auth.jwt() ->> 'email', 'contact_added', coalesce(new.name, 'unnamed contact'));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.activity_log (company_id, actor_email, action, new_value)
    values (new.company_id, auth.jwt() ->> 'email', 'contact_updated', coalesce(new.name, 'unnamed contact'));
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.activity_log (company_id, actor_email, action, old_value)
    values (old.company_id, auth.jwt() ->> 'email', 'contact_deleted', coalesce(old.name, 'unnamed contact'));
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists contacts_log_activity on contacts;
create trigger contacts_log_activity
  after insert or update or delete on contacts
  for each row execute function log_contact_activity();

-- Same realtime gap we hit with activity_log before — add contacts up front this time.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'contacts'
  ) then
    alter publication supabase_realtime add table contacts;
  end if;
end $$;
