-- Course categories
create table if not exists course_categories (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  slug        text        not null unique,
  description text,
  color       text        not null default '#F59E0B',
  created_at  timestamptz not null default now()
);

insert into course_categories (name, slug, color) values
  ('Personal Finance', 'personal-finance', '#10B981'),
  ('Investing',        'investing',        '#3B82F6'),
  ('Budgeting',        'budgeting',        '#F59E0B'),
  ('Business',         'business',         '#8B5CF6'),
  ('Real Estate',      'real-estate',      '#EC4899')
on conflict (slug) do nothing;

-- Course tags
create table if not exists course_tags (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  slug       text        not null unique,
  created_at timestamptz not null default now()
);

create table if not exists course_tag_assignments (
  course_id uuid references courses(id) on delete cascade,
  tag_id    uuid references course_tags(id) on delete cascade,
  primary key (course_id, tag_id)
);

-- Course sections (modules)
create table if not exists course_sections (
  id         uuid        primary key default gen_random_uuid(),
  course_id  uuid        not null references courses(id) on delete cascade,
  title      text        not null,
  sort_order integer     not null default 0,
  created_at timestamptz not null default now()
);

-- Extend courses
alter table courses
  add column if not exists category_id  uuid          references course_categories(id) on delete set null,
  add column if not exists level        text          check (level in ('beginner','intermediate','advanced')) default 'beginner',
  add column if not exists language     text          default 'English',
  add column if not exists what_you_learn text[],
  add column if not exists requirements   text[],
  add column if not exists certificate  boolean       not null default false,
  add column if not exists price_ngn    numeric(10,2),
  add column if not exists price_usd    numeric(10,2),
  add column if not exists price_gbp    numeric(10,2);

-- Extend lessons
alter table lessons
  add column if not exists section_id uuid references course_sections(id) on delete cascade,
  add column if not exists type       text check (type in ('video','text','quiz')) default 'video',
  add column if not exists content    text;

-- RLS
alter table course_categories      enable row level security;
alter table course_tags            enable row level security;
alter table course_tag_assignments enable row level security;
alter table course_sections        enable row level security;
