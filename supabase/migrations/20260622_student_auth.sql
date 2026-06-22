-- Student profiles (auto-created on signup via trigger)
create table if not exists profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Course enrollments
create table if not exists course_enrollments (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  course_id    uuid        not null references courses(id) on delete cascade,
  enrolled_at  timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
);

alter table course_enrollments enable row level security;

create policy "Users can read own enrollments"
  on course_enrollments for select
  using (auth.uid() = user_id);

-- Lesson progress
create table if not exists lesson_progress (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  course_id    uuid        not null references courses(id) on delete cascade,
  lesson_id    text        not null,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table lesson_progress enable row level security;

create policy "Users can read own progress"
  on lesson_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own progress"
  on lesson_progress for delete
  using (auth.uid() = user_id);
