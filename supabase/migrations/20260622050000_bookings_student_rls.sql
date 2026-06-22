-- Enable RLS on bookings so students can read their own bookings by email
alter table bookings enable row level security;

-- Students can read bookings where their email matches
create policy "Students can read own bookings"
  on bookings for select
  using (client_email = auth.email());

-- Admins bypass RLS via service role key (supabaseAdmin), no extra policy needed
