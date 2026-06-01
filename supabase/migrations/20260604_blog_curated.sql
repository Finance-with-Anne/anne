create table if not exists blog_curated (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  source_name text not null,
  title       text not null,
  excerpt     text,
  cover_image text,
  published   boolean default true,
  created_at  timestamptz default now()
);
