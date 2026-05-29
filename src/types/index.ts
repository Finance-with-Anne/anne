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
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
  active: boolean;
  created_at: string;
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
