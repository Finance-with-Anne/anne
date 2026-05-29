export const metadata = { title: "Book a Session — ANNE" };

export default function BookingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Book a Session</h1>
      <p className="mt-4 text-lg text-gray-600">
        Schedule a 1-on-1 coaching session. Pick a service and a time that works for you.
      </p>
      {/* Booking form / calendar widget goes here */}
    </div>
  );
}
