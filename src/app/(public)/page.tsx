import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Take Control of Your <span className="text-black underline decoration-4 underline-offset-4">Financial Future</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Expert financial coaching, resources, and tools to help you build lasting wealth. Start your journey today.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/booking"
              className="rounded-md bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
            >
              Book a Free Call
            </Link>
            <Link
              href="/products-services"
              className="rounded-md border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Financial Coaching", desc: "Personalised 1-on-1 sessions tailored to your goals and situation.", href: "/booking" },
              { title: "Courses & Resources", desc: "Self-paced courses and downloadable resources to build your knowledge.", href: "/resources" },
              { title: "Money Talks", desc: "Deep-dive conversations on money, wealth, and financial freedom.", href: "/money-talks" },
              { title: "Shop", desc: "Curated tools, templates, and guides to get you started.", href: "/shop" },
              { title: "Community", desc: "Join a like-minded community of people on their financial journey.", href: "/about" },
              { title: "Blog", desc: "Regular insights, tips and strategies from our finance experts.", href: "/blog" },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-xl border border-gray-200 p-6 hover:border-gray-400 hover:shadow-sm transition-all"
              >
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-black">{card.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                <span className="mt-4 inline-block text-xs font-medium text-gray-900 underline underline-offset-2">
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to start your journey?</h2>
          <p className="mt-4 text-gray-400 text-base max-w-xl mx-auto">
            Book a free discovery call and let us help you build a plan that actually works.
          </p>
          <Link
            href="/booking"
            className="mt-8 inline-block rounded-md bg-white px-8 py-3 text-sm font-semibold text-black hover:bg-gray-100 transition-colors"
          >
            Book Your Free Call
          </Link>
        </div>
      </section>
    </div>
  );
}
