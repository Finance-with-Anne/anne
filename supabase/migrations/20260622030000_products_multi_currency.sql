alter table products
  add column if not exists price_ngn numeric(10,2),
  add column if not exists price_usd numeric(10,2),
  add column if not exists price_gbp numeric(10,2);
