-- Allow 'template' as a source_type for products
alter table products drop constraint if exists products_source_type_check;
alter table products add constraint products_source_type_check
  check (source_type in ('manual', 'course', 'booking', 'template'));
