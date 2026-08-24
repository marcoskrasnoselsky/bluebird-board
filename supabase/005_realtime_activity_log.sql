-- The activity_log trigger (from 004) was correctly inserting rows all along, but the
-- open detail view never saw new entries live — it only showed up-to-date activity
-- after a manual reload. Root cause: new tables aren't automatically added to Supabase's
-- realtime publication, so postgres_changes subscriptions on activity_log were never firing.
-- This adds it (and profiles, for the same reason) so live updates actually work.
-- Safe to run even if a table is already included.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'activity_log'
  ) then
    alter publication supabase_realtime add table activity_log;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table profiles;
  end if;
end $$;
