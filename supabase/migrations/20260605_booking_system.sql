-- ============================================================
-- BOOKING SESSIONS
-- ============================================================
create table if not exists booking_sessions (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  slug             text not null unique,
  description      text,
  duration_minutes integer not null default 60,
  is_free          boolean not null default true,
  price_ngn        numeric(12,2),
  price_usd        numeric(12,2),
  price_gbp        numeric(12,2),
  google_meet_link text,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table booking_sessions enable row level security;
create policy "Public can view active sessions" on booking_sessions
  for select using (is_active = true);
create policy "Admins can do everything on booking_sessions" on booking_sessions
  for all to authenticated using (true) with check (true);

-- ============================================================
-- BOOKING QUESTIONS
-- ============================================================
create table if not exists booking_questions (
  id         uuid primary key default uuid_generate_v4(),
  session_id uuid not null references booking_sessions(id) on delete cascade,
  question   text not null,
  type       text not null default 'text' check (type in ('text', 'textarea', 'select')),
  options    jsonb,
  required   boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table booking_questions enable row level security;
create policy "Public can view booking questions" on booking_questions
  for select using (true);
create policy "Admins can do everything on booking_questions" on booking_questions
  for all to authenticated using (true) with check (true);

-- ============================================================
-- BOOKING SLOTS
-- ============================================================
create table if not exists booking_slots (
  id         uuid primary key default uuid_generate_v4(),
  session_id uuid not null references booking_sessions(id) on delete cascade,
  date       date not null,
  start_time text not null,
  is_booked  boolean not null default false,
  created_at timestamptz not null default now()
);

alter table booking_slots enable row level security;
create policy "Public can view available slots" on booking_slots
  for select using (true);
create policy "Admins can do everything on booking_slots" on booking_slots
  for all to authenticated using (true) with check (true);

-- ============================================================
-- UPDATE BOOKINGS TABLE
-- ============================================================
alter table bookings
  add column if not exists session_id    uuid references booking_sessions(id),
  add column if not exists slot_id       uuid references booking_slots(id),
  add column if not exists answers       jsonb,
  add column if not exists phone         text,
  add column if not exists is_paid       boolean not null default false,
  add column if not exists payment_ref   text,
  add column if not exists amount_paid   numeric(12,2),
  add column if not exists currency      text;

-- updated_at triggers
create or replace function set_updated_at()
  returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger booking_sessions_updated_at
  before update on booking_sessions
  for each row execute function set_updated_at();
