-- product_categories
create table if not exists product_categories (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  slug        text        not null unique,
  description text,
  color       text        not null default '#6B7280',
  created_at  timestamptz not null default now()
);

-- seed defaults
insert into product_categories (name, slug, description, color) values
  ('Template',        'template',        'Downloadable document or spreadsheet templates', '#3B82F6'),
  ('Ebook',           'ebook',           'Digital books and guides in PDF format',          '#8B5CF6'),
  ('Course',          'course',          'Online learning programmes with lessons',          '#F59E0B'),
  ('Coaching',        'coaching',        '1-on-1 or group coaching sessions and packages',  '#10B981'),
  ('Membership',      'membership',      'Recurring membership programmes',                 '#EC4899'),
  ('Booking Session', 'booking-session', 'Bookable 1-on-1 or group sessions',              '#06B6D4'),
  ('Other',           'other',           'Miscellaneous products',                          '#6B7280')
on conflict (slug) do nothing;

-- products
create table if not exists products (
  id           uuid          primary key default gen_random_uuid(),
  name         text          not null,
  description  text,
  price        numeric(10,2) not null default 0,
  image_url    text,
  category_id  uuid          references product_categories(id) on delete set null,
  stock        integer       not null default 0,
  active       boolean       not null default true,
  download_url text,
  source_type  text          check (source_type in ('manual', 'course', 'booking')),
  source_id    text,
  created_at   timestamptz   not null default now(),
  updated_at   timestamptz   not null default now()
);

-- RLS
alter table product_categories enable row level security;
alter table products enable row level security;

create policy "Authenticated can manage categories"
  on product_categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Public can read categories"
  on product_categories for select
  using (true);

create policy "Authenticated can manage products"
  on products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Public can read active products"
  on products for select
  using (active = true);
