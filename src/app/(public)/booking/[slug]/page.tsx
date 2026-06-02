import { supabaseAdmin } from "@/lib/supabase/admin";
import BookingFlow from "@/components/public/BookingFlow";
import type { BookingSession } from "@/types";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabaseAdmin.from("booking_sessions").select("title").eq("slug", slug).single();
  return { title: data ? `${data.title} — Finance with Anne` : "Book a Session" };
}

export default async function BookingSessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await supabaseAdmin
    .from("booking_sessions")
    .select("*, questions:booking_questions(*), slots:booking_slots(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) notFound();
  const session = data as BookingSession;

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-[1fr_420px] gap-12">
        {/* Left: Session info */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            {!session.is_free ? (
              <span className="rounded-full bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 text-xs font-medium">Paid</span>
            ) : (
              <span className="rounded-full bg-green-50 dark:bg-green-400/10 text-green-600 dark:text-green-400 px-2.5 py-0.5 text-xs font-medium">Free</span>
            )}
            <span className="text-xs text-gray-400 dark:text-white/30">{session.duration_minutes} min</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{session.title}</h1>
          {session.description && (
            <p className="mt-4 text-gray-500 dark:text-white/50 leading-relaxed">{session.description}</p>
          )}
          {!session.is_free && (
            <div className="mt-6 space-y-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wide">Pricing</p>
              <div className="flex flex-wrap gap-3 mt-2">
                {session.price_ngn && <span className="text-lg font-bold text-gray-900 dark:text-white">₦{session.price_ngn.toLocaleString()}</span>}
                {session.price_usd && <span className="text-lg font-bold text-gray-400 dark:text-white/40">${session.price_usd}</span>}
                {session.price_gbp && <span className="text-lg font-bold text-gray-400 dark:text-white/40">£{session.price_gbp}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking flow */}
        <div>
          <BookingFlow session={session} />
        </div>
      </div>
    </div>
  );
}
