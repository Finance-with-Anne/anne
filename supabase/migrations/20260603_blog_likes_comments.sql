-- Likes (anonymous, one per browser fingerprint per post)
create table if not exists blog_likes (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid references blog_posts(id) on delete cascade not null,
  fingerprint  text not null,
  created_at   timestamptz default now(),
  unique(post_id, fingerprint)
);

-- Comments
create table if not exists blog_comments (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid references blog_posts(id) on delete cascade not null,
  author_name  text not null,
  author_email text,
  content      text not null,
  approved     boolean default false,
  admin_reply  text,
  replied_at   timestamptz,
  created_at   timestamptz default now()
);

-- Add read duration tracking to existing views table
alter table blog_post_views
  add column if not exists read_duration_seconds integer;
