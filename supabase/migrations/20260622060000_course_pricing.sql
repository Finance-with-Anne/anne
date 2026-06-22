-- Free/paid flag and sale/promo pricing for courses
alter table courses
  add column if not exists is_free         boolean      not null default false,
  add column if not exists sale_price_ngn  numeric(10,2),
  add column if not exists sale_price_usd  numeric(10,2),
  add column if not exists sale_price_gbp  numeric(10,2),
  add column if not exists sale_starts_at  timestamptz,
  add column if not exists sale_ends_at    timestamptz;
