import { supabaseAdmin } from "@/lib/supabase/admin";
import ChatsPage from "@/components/admin/ChatsPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Chats — Admin" };

export default async function AdminChatsPage() {
  const [{ data: bookings }, { data: sessions }] = await Promise.all([
    supabaseAdmin
      .from("bookings")
      .select("id, client_name, client_email, service, date, time, status, answers, created_at, session_id")
      .order("created_at", { ascending: false })
      .limit(100),
    supabaseAdmin
      .from("booking_sessions")
      .select("id, questions:booking_questions(id, question)"),
  ]);

  const sessionMap = Object.fromEntries((sessions ?? []).map(s => [s.id, s.questions ?? []]));

  const enriched = (bookings ?? []).map(b => ({
    ...b,
    questions: sessionMap[b.session_id] ?? [],
  }));

  return <ChatsPage bookings={enriched} />;
}
