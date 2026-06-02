alter table booking_sessions
  add column if not exists cover_image text,
  add column if not exists what_you_get text;
