export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
  subcategories?: Category[];
};

export type NavItem = {
  label: string;
  href: string;
};

export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  published: boolean;
  published_at: string | null;
  featured: boolean | null;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  price_ngn: number | null;
  price_usd: number | null;
  price_gbp: number | null;
  image_url: string | null;
  category_id: string | null;
  category?: { id: string; name: string; color: string } | null;
  stock: number;
  active: boolean;
  download_url: string | null;
  source_type: "manual" | "course" | "booking" | null;
  source_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  client_name: string;
  client_email: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  created_at: string;
  // new fields
  session_id?: string | null;
  slot_id?: string | null;
  answers?: Record<string, string> | null;
  phone?: string | null;
  is_paid?: boolean;
  payment_ref?: string | null;
  amount_paid?: number | null;
  currency?: string | null;
};

export type BookingSession = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  is_free: boolean;
  price_ngn: number | null;
  price_usd: number | null;
  price_gbp: number | null;
  google_meet_link: string | null;
  cover_image: string | null;
  what_you_get: string | null;
  is_active: boolean;
  availability?: Record<number, { enabled: boolean; start: string; end: string }> | null;
  created_at: string;
  updated_at: string;
  questions?: BookingQuestion[];
  slots?: BookingSlot[];
};

export type BookingQuestion = {
  id: string;
  session_id: string;
  question: string;
  type: "text" | "textarea" | "select";
  options: string[] | null;
  required: boolean;
  sort_order: number;
  created_at: string;
};

export type BookingSlot = {
  id: string;
  session_id: string;
  date: string;
  start_time: string;
  is_booked: boolean;
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string | null;
  published: boolean;
  lessons: Lesson[];
  created_at: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  video_url: string | null;
  duration: number;
  order: number;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: "active" | "inactive";
  notes: string | null;
  created_at: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  image_url: string | null;
  published: boolean;
  created_at: string;
};
