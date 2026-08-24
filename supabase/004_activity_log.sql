-- Replaces the status-only history with a single, general activity log that
-- captures everything that happens to a company: creation, every field edit
-- (name, phone, email, Fit, status, assignee, follow-up date, notes, etc.),
-- and every team note added/edited/deleted. The detail page and the Reports
-- section both read from this one table.
--
-- Run this once in the Supabase SQL Editor, same as the previous migrations.

-- 1. Track how a company entered the board: uploaded via Excel, or added by hand.
alter table companies add column if not exists source text not null default 'import';

-- 2. The unified log
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  actor_email text,
  action text not null, -- created | field_updated | status_changed | fit_changed | assignee_changed | note_added | note_edited | note_deleted
  field_name text,
  old_value text,
  new_value text,
  created_at timestamptz not null default now()
);

alter table activity_log enable row level security;

create policy "Authenticated users can read activity log"
  on activity_log for select
  to authenticated
  using (true);

create index if not exists activity_log_company_id_idx on activity_log(company_id);
create index if not exists activity_log_actor_idx on activity_log(actor_email);
create index if not exists activity_log_created_at_idx on activity_log(created_at);

-- 3. Log company creation
create or replace function log_company_created()
returns trigger as $$
begin
  insert into public.activity_log (company_id, actor_email, action, new_value)
  values (new.id, auth.jwt() ->> 'email', 'created', new.company);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists companies_log_created on companies;
create trigger companies_log_created
  after insert on companies
  for each row execute function log_company_created();

-- 4. Log every field change on a company (generic — works for any column,
--    including ones added later), with friendlier action names for the
--    fields people care most about.
create or replace function log_company_field_change()
returns trigger as $$
declare
  old_j jsonb := to_jsonb(old);
  new_j jsonb := to_jsonb(new);
  key text;
  action_name text;
begin
  for key in select jsonb_object_keys(new_j) loop
    if key in ('updated_at', 'created_at', 'id') then
      continue;
    end if;
    if old_j ->> key is distinct from new_j ->> key then
      action_name := case key
        when 'status' then 'status_changed'
        when 'fit' then 'fit_changed'
        when 'assignee_email' then 'assignee_changed'
        else 'field_updated'
      end;
      insert into public.activity_log (company_id, actor_email, action, field_name, old_value, new_value)
      values (new.id, auth.jwt() ->> 'email', action_name, key, old_j ->> key, new_j ->> key);
    end if;
  end loop;
  return new;
end;
$$ language plpgsql security definer;

-- Remove the older status-only trigger/function from migration 003 — this one supersedes it.
drop trigger if exists companies_log_status_change on companies;
drop function if exists log_status_change();

drop trigger if exists companies_log_field_change on companies;
create trigger companies_log_field_change
  after update on companies
  for each row execute function log_company_field_change();

-- 5. Log notes
create or replace function log_note_activity()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity_log (company_id, actor_email, action, new_value)
    values (new.company_id, new.author_email, 'note_added', new.text);
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.activity_log (company_id, actor_email, action, old_value, new_value)
    values (new.company_id, new.author_email, 'note_edited', old.text, new.text);
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.activity_log (company_id, actor_email, action, old_value)
    values (old.company_id, old.author_email, 'note_deleted', old.text);
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists notes_log_activity on notes;
create trigger notes_log_activity
  after insert or update or delete on notes
  for each row execute function log_note_activity();
