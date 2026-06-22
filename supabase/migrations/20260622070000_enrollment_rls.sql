-- Allow authenticated users to enroll themselves
create policy "Users can insert own enrollments"
  on course_enrollments for insert
  with check (auth.uid() = user_id);

-- Allow upsert (needs update too)
create policy "Users can update own enrollments"
  on course_enrollments for update
  using (auth.uid() = user_id);

-- lesson_progress upsert also needs update
create policy "Users can update own progress"
  on lesson_progress for update
  using (auth.uid() = user_id);
