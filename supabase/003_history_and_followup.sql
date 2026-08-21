-- Adds:
--   1. A `follow_up_date` column on companies, so each prospect can have a next-action date.
--   2. A `status_history` table that auto-logs every status change (who, when, from/to),
--      via a trigger — the app never writes to it directly.
-- Run this once in the Supabase SQL Editor, same as the previous migrations.

alter table companies add column if not exists follow_up_date date;
create index if not exists companies_follow_up_idx on companies(follow_up_date);

create table if not exists status_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by text,
  changed_at timestamptz not null default now()
);

alter table status_history enable row level security;

create policy "Authenticated users can read status history"
  on status_history for select
  to authenticated
  using (true);

create index if not exists status_history_company_id_idx on status_history(company_id);

create or replace function log_status_change()
returns trigger as $$
begin
  if (new.status is distinct from old.status) then
    insert into public.status_history (company_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.jwt() ->> 'email');
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists companies_log_status_change on companies;
create trigger companies_log_status_change
  after update on companies
  for each row execute function log_status_change();
