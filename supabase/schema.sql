-- Bluebird Prospect Board — Supabase schema
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query -> paste -> Run)

-- 1. Companies table: one row per prospect, populated by uploading the Excel file
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  website text,
  linkedin text,
  industry text,
  employees text,
  location text,
  hiring_roles text,
  buying_signal text,
  opportunity_summary text,
  fit text,
  decision_maker text,
  title text,
  phone text,
  phone_confidence text,
  email text,
  email_confidence text,
  linkedin_profile text,
  job_posting_url text,
  research_source text,
  research_notes text,
  status text not null default 'New',
  assignee_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Notes table: team comments/notes attached to a company, one row per note
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  author_email text not null,
  text text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

-- 3. Keep updated_at current on companies
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists companies_set_updated_at on companies;
create trigger companies_set_updated_at
  before update on companies
  for each row execute function set_updated_at();

-- 4. Row Level Security: any authenticated (logged-in) user can read/write.
--    This matches "everyone on the team sees and edits everything" from the current version.
--    Tighten later (e.g. only the assignee can change status) once real roles matter.
alter table companies enable row level security;
alter table notes enable row level security;

create policy "Authenticated users can read companies"
  on companies for select
  to authenticated
  using (true);

create policy "Authenticated users can insert companies"
  on companies for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update companies"
  on companies for update
  to authenticated
  using (true);

create policy "Authenticated users can read notes"
  on notes for select
  to authenticated
  using (true);

create policy "Authenticated users can insert notes"
  on notes for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update their own notes"
  on notes for update
  to authenticated
  using (auth.jwt() ->> 'email' = author_email);

create policy "Authenticated users can delete their own notes"
  on notes for delete
  to authenticated
  using (auth.jwt() ->> 'email' = author_email);

-- 5. Helpful index for filtering
create index if not exists companies_status_idx on companies(status);
create index if not exists companies_assignee_idx on companies(assignee_email);
create index if not exists notes_company_id_idx on notes(company_id);
