export const metadata = { title: "FAQ — ANNE" };

const faqs = [
  { q: "How do I book a session?", a: "Visit our Booking page and select a service and available time slot." },
  { q: "What does a coaching session cover?", a: "Sessions are tailored to your goals — budgeting, debt, investing, savings, or a full financial review." },
  { q: "Do you offer refunds?", a: "Please refer to our Terms of Service for our refund policy." },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Frequently Asked Questions</h1>
      <p className="mt-4 text-lg text-gray-600">Answers to the most common questions about our platform and services.</p>

      <div className="mt-12 space-y-6">
        {faqs.map((faq) => (
          <div key={faq.q} className="rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900">{faq.q}</h2>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
