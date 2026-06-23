-- ============================================================
-- COURSE EXTRAS: resources, announcements, reviews, support
-- ============================================================

-- Course resources (files, links, notes)
create table if not exists course_resources (
  id          uuid        primary key default gen_random_uuid(),
  course_id   uuid        not null references courses(id) on delete cascade,
  type        text        not null check (type in ('file', 'link', 'note')),
  title       text        not null,
  url         text,
  content     text,
  created_at  timestamptz not null default now()
);

alter table course_resources enable row level security;

create policy "Enrolled students can read resources"
  on course_resources for select
  using (
    exists (
      select 1 from course_enrollments ce
      where ce.course_id = course_resources.course_id
        and ce.user_id = auth.uid()
    )
  );

-- Course announcements
create table if not exists course_announcements (
  id          uuid        primary key default gen_random_uuid(),
  course_id   uuid        not null references courses(id) on delete cascade,
  title       text        not null,
  body        text        not null,
  created_at  timestamptz not null default now()
);

alter table course_announcements enable row level security;

create policy "Enrolled students can read announcements"
  on course_announcements for select
  using (
    exists (
      select 1 from course_enrollments ce
      where ce.course_id = course_announcements.course_id
        and ce.user_id = auth.uid()
    )
  );

-- Course reviews
create table if not exists course_reviews (
  id          uuid        primary key default gen_random_uuid(),
  course_id   uuid        not null references courses(id) on delete cascade,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  rating      integer     not null check (rating >= 1 and rating <= 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (course_id, user_id)
);

alter table course_reviews enable row level security;

create policy "Anyone can read reviews"
  on course_reviews for select using (true);

create policy "Enrolled students can post reviews"
  on course_reviews for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from course_enrollments ce
      where ce.course_id = course_reviews.course_id
        and ce.user_id = auth.uid()
    )
  );

create policy "Students can update own review"
  on course_reviews for update using (auth.uid() = user_id);

create policy "Students can delete own review"
  on course_reviews for delete using (auth.uid() = user_id);

-- Course support (student ↔ admin chat, one thread per student per course)
create table if not exists course_support (
  id          uuid        primary key default gen_random_uuid(),
  course_id   uuid        not null references courses(id) on delete cascade,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  message     text        not null,
  is_admin    boolean     not null default false,
  created_at  timestamptz not null default now()
);

alter table course_support enable row level security;

-- Students can read their own thread (their messages + admin replies in same thread)
create policy "Students read own thread"
  on course_support for select
  using (auth.uid() = user_id);

-- Students can only send their own non-admin messages
create policy "Students can send messages"
  on course_support for insert
  with check (auth.uid() = user_id and is_admin = false);
