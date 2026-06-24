-- Add sales_page_url to products so admin can link a product card to its dedicated sales page
alter table products add column if not exists sales_page_url text;
