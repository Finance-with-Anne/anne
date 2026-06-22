-- Store curriculum (sections + lessons) as JSONB directly on courses.
-- This eliminates dependency on course_sections RLS and lessons FK joins.
alter table courses
  add column if not exists curriculum jsonb not null default '[]'::jsonb;
