create table if not exists google_tokens (
  id           text primary key,
  access_token text,
  refresh_token text,
  expiry_date  bigint,
  updated_at   timestamptz not null default now()
);

alter table google_tokens enable row level security;
create policy "Admins only on google_tokens" on google_tokens
  for all to authenticated using (true) with check (true);
