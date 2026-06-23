-- ============================================================
-- COURSE FEATURES: notes, certificates, quizzes
-- ============================================================

-- Student notes per lesson
create table if not exists course_notes (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  course_id   uuid        not null references courses(id) on delete cascade,
  lesson_id   text        not null,
  content     text        not null default '',
  updated_at  timestamptz not null default now(),
  unique (user_id, course_id, lesson_id)
);

alter table course_notes enable row level security;

create policy "Students read own notes"
  on course_notes for select using (auth.uid() = user_id);

create policy "Students insert own notes"
  on course_notes for insert with check (auth.uid() = user_id);

create policy "Students update own notes"
  on course_notes for update using (auth.uid() = user_id);

create policy "Students delete own notes"
  on course_notes for delete using (auth.uid() = user_id);

-- Course certificates
create table if not exists course_certificates (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  course_id   uuid        not null references courses(id) on delete cascade,
  issued_at   timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table course_certificates enable row level security;

create policy "Students read own certificates"
  on course_certificates for select using (auth.uid() = user_id);

create policy "Students insert own certificates"
  on course_certificates for insert with check (auth.uid() = user_id);

-- Allow admin to read all certificates
create policy "Admin reads all certificates"
  on course_certificates for select using (true);

-- Quiz questions (per lesson, stored as JSONB array)
create table if not exists course_quizzes (
  id          uuid        primary key default gen_random_uuid(),
  course_id   uuid        not null references courses(id) on delete cascade,
  lesson_id   text        not null,
  questions   jsonb       not null default '[]',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (course_id, lesson_id)
);

alter table course_quizzes enable row level security;

create policy "Enrolled students read quizzes"
  on course_quizzes for select
  using (
    exists (
      select 1 from course_enrollments ce
      where ce.course_id = course_quizzes.course_id
        and ce.user_id = auth.uid()
    )
  );

-- Quiz attempts (student answers + score)
create table if not exists quiz_attempts (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  course_id   uuid        not null references courses(id) on delete cascade,
  lesson_id   text        not null,
  answers     jsonb       not null default '{}',
  score       integer     not null default 0,
  total       integer     not null default 0,
  passed      boolean     not null default false,
  created_at  timestamptz not null default now()
);

alter table quiz_attempts enable row level security;

create policy "Students read own attempts"
  on quiz_attempts for select using (auth.uid() = user_id);

create policy "Students insert attempts"
  on quiz_attempts for insert with check (auth.uid() = user_id);
