import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Bookings — Finance with Anne" };

const STATUS_COLOR: Record<string, { dot: string; badge: string; label: string }> = {
  confirmed: { dot: "bg-green-400",  badge: "bg-green-50 text-green-700 ring-green-200",   label: "Confirmed" },
  pending:   { dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700 ring-amber-200",    label: "Pending"   },
  cancelled: { dot: "bg-red-400",    badge: "bg-red-50 text-red-600 ring-red-200",          label: "Cancelled" },
  completed: { dot: "bg-gray-300",   badge: "bg-gray-100 text-gray-500 ring-gray-200",      label: "Completed" },
};

export default async function AccountBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data } = await supabase
    .from("bookings")
    .select(`
      id, status, date, notes, is_paid, payment_ref, created_at,
      session:booking_sessions(title, duration_minutes, google_meet_link, cover_image),
      slot:booking_slots(date, start_time)
    `)
    .eq("client_email", user.email!)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings: any[] = data ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = bookings.filter(
    (b) =>
      ["confirmed", "pending"].includes(b.status) &&
      new Date(b.slot?.date ?? b.date) >= today
  );
  const past = bookings.filter((b) => !upcoming.includes(b));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function BookingCard({ b }: { b: any }) {
    const session = b.session;
    const slot = b.slot;
    const slotDate: string = slot?.date ?? b.date ?? "";
    const slotTime: string = slot?.start_time ?? "";
    const meetLink: string = b.notes || session?.google_meet_link || "";
    const statusStr: string = b.status ?? "pending";
    const sc = STATUS_COLOR[statusStr] ?? STATUS_COLOR.pending;

    const dateFormatted = slotDate
      ? new Date(slotDate).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

    return (
      <div className="group flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 hover:border-gray-200 hover:shadow-sm transition-all">
        {/* Left — colour accent / cover */}
        <div className="shrink-0 w-12 h-12 rounded-xl bg-[#0822C0]/8 flex items-center justify-center overflow-hidden">
          {session?.cover_image ? (
            <img src={session.cover_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="h-5 w-5 text-[#0822C0]/60" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        {/* Middle — info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900 leading-snug">
              {session?.title ?? "Session"}
            </p>
            <span className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${sc.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-xs text-gray-400">
            {dateFormatted && (
              <span className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {dateFormatted}{slotTime ? ` · ${slotTime}` : ""}
              </span>
            )}
            {session?.duration_minutes && (
              <span className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {session.duration_minutes} min
              </span>
            )}
            {b.is_paid && (
              <span className="flex items-center gap-1 text-green-600">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Paid
              </span>
            )}
          </div>
        </div>

        {/* Right — action */}
        {meetLink && statusStr === "confirmed" && (
          <div className="shrink-0 flex items-center">
            <a
              href={meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0822C0] text-white text-xs font-semibold px-3.5 py-2 hover:bg-[#061aa0] transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              Join
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-400 mt-1">Your 1-on-1 sessions with Anne.</p>
        </div>
        <Link
          href="/account/bookings/book"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0822C0] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[#061aa0] transition-colors shrink-0"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Book a session
        </Link>
      </div>

      {/* Stats strip — only if there are bookings */}
      {bookings.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: bookings.length },
            { label: "Upcoming", value: upcoming.length },
            { label: "Completed", value: bookings.filter(b => b.status === "completed").length },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-gray-100 bg-white px-5 py-4">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {bookings.length === 0 ? (
        /* Empty state */
        <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#0822C0] via-blue-400 to-[#0822C0]/30" />
          <div className="px-8 py-16 text-center">
            <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-[#0822C0]/8 flex items-center justify-center">
              <svg className="h-8 w-8 text-[#0822C0]/50" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-900">No sessions booked yet</p>
            <p className="text-sm text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Book a personalised 1-on-1 with Anne and start taking control of your finances.
            </p>
            <Link
              href="/account/bookings/book"
              className="inline-flex items-center gap-2 mt-6 rounded-xl bg-[#0822C0] text-white text-sm font-semibold px-6 py-3 hover:bg-[#061aa0] transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Book a session
            </Link>
          </div>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Upcoming</p>
              {upcoming.map((b) => <BookingCard key={b.id} b={b} />)}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Past</p>
              {past.map((b) => <BookingCard key={b.id} b={b} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
