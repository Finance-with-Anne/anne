-- Add 'community' to source_type check constraint
alter table products drop constraint if exists products_source_type_check;
alter table products add constraint products_source_type_check
  check (source_type in ('manual', 'course', 'booking', 'template', 'community'));

-- Insert LBN as a community product
insert into products (
  name, description, source_type, source_id,
  price_ngn, price_usd, price_gbp,
  price, active, sales_page_url, community_links
)
values (
  'Legacy Builders Network — Annual Membership',
  'A private investment community with monthly expert webinars, live Q&A sessions, and direct access to Anne.',
  'community', 'lbn',
  100, 150, 150,
  100, true,
  '/legacy-builders-network', '[]'::jsonb
)
on conflict do nothing;
