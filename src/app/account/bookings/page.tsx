import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Bookings — Finance with Anne" };

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-green-50 text-green-700",
  pending:   "bg-yellow-50 text-yellow-700",
  cancelled: "bg-red-50 text-red-600",
  completed: "bg-gray-100 text-gray-500",
};

export default async function AccountBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data } = await supabase
    .from("bookings")
    .select(`
      id, status, date, notes, is_paid, payment_ref, created_at,
      session:booking_sessions(title, duration_minutes, google_meet_link),
      slot:booking_slots(date, start_time)
    `)
    .eq("client_email", user.email!)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings: any[] = data ?? [];

  const upcoming = bookings.filter(
    (b) => ["confirmed", "pending"].includes(b.status) && new Date(b.slot?.date ?? b.date) >= new Date(new Date().toDateString())
  );
  const past = bookings.filter((b) => !upcoming.includes(b));

  function BookingCard({ b }: { b: Record<string, unknown> }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = b.session as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const slot = b.slot as any;
    const slotDate = slot?.date ?? b.date as string;
    const slotTime = slot?.start_time as string ?? "";
    const meetLink = (b.notes as string) || session?.google_meet_link;
    const statusStr = b.status as string;

    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-gray-900">{session?.title ?? "Session"}</p>
            {slotDate && (
              <p className="text-xs text-gray-400">
                {new Date(slotDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                {slotTime ? ` · ${slotTime}` : ""}
              </p>
            )}
            {session?.duration_minutes && (
              <p className="text-xs text-gray-400">{session.duration_minutes} minutes</p>
            )}
          </div>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 capitalize ${STATUS_STYLES[statusStr] ?? "bg-gray-100 text-gray-500"}`}>
            {statusStr}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {b.is_paid ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-600">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Paid
            </span>
          ) : (
            <span className="text-xs text-gray-400">Unpaid</span>
          )}
          {meetLink && statusStr === "confirmed" && (
            <a
              href={meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0822C0] text-white text-xs font-semibold px-3 py-1.5 hover:bg-[#061aa0] transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              Join Meeting
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-400 mt-1">All your scheduled sessions with Anne.</p>
        </div>
        <Link href="/booking" className="rounded-lg bg-[#0822C0] text-white text-xs font-semibold px-4 py-2.5 hover:bg-[#061aa0] transition-colors shrink-0">
          Book a session
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-24 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">No bookings found</p>
          <p className="text-xs text-gray-400 mt-1">Book a 1-on-1 session with Anne to get started.</p>
          <Link href="/booking" className="inline-block mt-5 rounded-lg bg-[#0822C0] text-white text-xs font-semibold px-5 py-2.5 hover:bg-[#061aa0] transition-colors">
            Book a session
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Upcoming</h2>
              {upcoming.map((b) => <BookingCard key={b.id as string} b={b} />)}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Past</h2>
              {past.map((b) => <BookingCard key={b.id as string} b={b} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
