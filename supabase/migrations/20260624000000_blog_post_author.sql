alter table blog_posts add column if not exists author_id uuid references auth.users(id) on delete set null;
create index if not exists blog_posts_author_id_idx on blog_posts(author_id);
