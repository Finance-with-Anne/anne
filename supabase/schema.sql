-- ============================================================
-- ANNE Finance Platform — Database Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- BLOG POSTS
-- ============================================================
create table if not exists blog_posts (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  slug        text not null unique,
  excerpt     text,
  content     text,
  cover_image text,
  published        boolean not null default false,
  published_at     timestamptz,
  meta_title       text,
  meta_description text,
  focus_keyword    text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table blog_posts enable row level security;
create policy "Public can read published posts" on blog_posts
  for select using (published = true);
create policy "Admins can do everything on blog_posts" on blog_posts
  for all using (auth.role() = 'service_role');

-- ============================================================
-- BLOG CATEGORIES
-- ============================================================
create table if not exists blog_categories (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text not null unique,
  parent_id  uuid references blog_categories(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table blog_categories enable row level security;
create policy "Public can read categories" on blog_categories
  for select using (true);
create policy "Admins can do everything on blog_categories" on blog_categories
  for all using (auth.role() = 'service_role');

-- ============================================================
-- BLOG POST CATEGORIES (many-to-many)
-- ============================================================
create table if not exists blog_post_categories (
  post_id     uuid not null references blog_posts(id) on delete cascade,
  category_id uuid not null references blog_categories(id) on delete cascade,
  primary key (post_id, category_id)
);

alter table blog_post_categories enable row level security;
create policy "Public can read post categories" on blog_post_categories
  for select using (true);
create policy "Admins can do everything on blog_post_categories" on blog_post_categories
  for all using (auth.role() = 'service_role');

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists products (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  price       numeric(10, 2) not null default 0,
  image_url   text,
  category    text,
  stock       integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table products enable row level security;
create policy "Public can view active products" on products
  for select using (active = true);
create policy "Admins can do everything on products" on products
  for all using (auth.role() = 'service_role');

-- ============================================================
-- BOOKINGS
-- ============================================================
create table if not exists bookings (
  id           uuid primary key default uuid_generate_v4(),
  client_name  text not null,
  client_email text not null,
  service      text not null,
  date         date not null,
  time         text not null,
  status       text not null default 'pending'
                check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table bookings enable row level security;
create policy "Anyone can create a booking" on bookings
  for insert with check (true);
create policy "Admins can do everything on bookings" on bookings
  for all using (auth.role() = 'service_role');

-- ============================================================
-- COURSES
-- ============================================================
create table if not exists courses (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  description   text,
  price         numeric(10, 2) not null default 0,
  thumbnail_url text,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table courses enable row level security;
create policy "Public can view published courses" on courses
  for select using (published = true);
create policy "Admins can do everything on courses" on courses
  for all using (auth.role() = 'service_role');

-- ============================================================
-- LESSONS (belongs to courses)
-- ============================================================
create table if not exists lessons (
  id         uuid primary key default uuid_generate_v4(),
  course_id  uuid not null references courses(id) on delete cascade,
  title      text not null,
  video_url  text,
  duration   integer default 0, -- in seconds
  "order"    integer not null default 0,
  created_at timestamptz not null default now()
);

alter table lessons enable row level security;
create policy "Public can view lessons of published courses" on lessons
  for select using (
    exists (
      select 1 from courses where courses.id = lessons.course_id and courses.published = true
    )
  );
create policy "Admins can do everything on lessons" on lessons
  for all using (auth.role() = 'service_role');

-- ============================================================
-- CLIENTS
-- ============================================================
create table if not exists clients (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null unique,
  phone      text,
  status     text not null default 'active'
              check (status in ('active', 'inactive')),
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table clients enable row level security;
create policy "Admins can do everything on clients" on clients
  for all using (auth.role() = 'service_role');

-- ============================================================
-- TESTIMONIALS
-- ============================================================
create table if not exists testimonials (
  id        uuid primary key default uuid_generate_v4(),
  name      text not null,
  role      text,
  content   text not null,
  rating    integer not null default 5 check (rating between 1 and 5),
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table testimonials enable row level security;
create policy "Public can view published testimonials" on testimonials
  for select using (published = true);
create policy "Admins can do everything on testimonials" on testimonials
  for all using (auth.role() = 'service_role');

-- ============================================================
-- YOUTUBE VIDEOS
-- ============================================================
create table if not exists youtube_videos (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  youtube_id  text not null unique,
  description text,
  thumbnail   text,
  published   boolean not null default true,
  "order"     integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table youtube_videos enable row level security;
create policy "Public can view published videos" on youtube_videos
  for select using (published = true);
create policy "Admins can do everything on youtube_videos" on youtube_videos
  for all using (auth.role() = 'service_role');

-- ============================================================
-- EMAIL SUBSCRIBERS
-- ============================================================
create table if not exists subscribers (
  id         uuid primary key default uuid_generate_v4(),
  email      text not null unique,
  name       text,
  status     text not null default 'active'
              check (status in ('active', 'unsubscribed')),
  created_at timestamptz not null default now()
);

alter table subscribers enable row level security;
create policy "Anyone can subscribe" on subscribers
  for insert with check (true);
create policy "Admins can do everything on subscribers" on subscribers
  for all using (auth.role() = 'service_role');

-- ============================================================
-- EMAIL CAMPAIGNS
-- ============================================================
create table if not exists email_campaigns (
  id         uuid primary key default uuid_generate_v4(),
  subject    text not null,
  body       text not null,
  status     text not null default 'draft'
              check (status in ('draft', 'sent')),
  sent_at    timestamptz,
  created_at timestamptz not null default now()
);

alter table email_campaigns enable row level security;
create policy "Admins can do everything on email_campaigns" on email_campaigns
  for all using (auth.role() = 'service_role');

-- ============================================================
-- RESOURCES (free downloads)
-- ============================================================
create table if not exists resources (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  file_url    text,
  category    text,
  published   boolean not null default true,
  "order"     integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table resources enable row level security;
create policy "Public can view published resources" on resources
  for select using (published = true);
create policy "Admins can do everything on resources" on resources
  for all using (auth.role() = 'service_role');

-- ============================================================
-- UPDATED_AT trigger helper
-- ============================================================
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger blog_posts_updated_at before update on blog_posts
  for each row execute function handle_updated_at();

create trigger products_updated_at before update on products
  for each row execute function handle_updated_at();

create trigger bookings_updated_at before update on bookings
  for each row execute function handle_updated_at();

create trigger courses_updated_at before update on courses
  for each row execute function handle_updated_at();

create trigger clients_updated_at before update on clients
  for each row execute function handle_updated_at();
