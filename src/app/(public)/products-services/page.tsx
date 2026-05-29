export const metadata = { title: "Products & Services — ANNE" };

const services = [
  { title: "1-on-1 Coaching", desc: "Personalised financial coaching sessions tailored to your goals." },
  { title: "Group Programme", desc: "Join a cohort of like-minded individuals on a structured finance programme." },
  { title: "Courses", desc: "Self-paced online courses covering budgeting, investing, and more." },
  { title: "Digital Products", desc: "Templates, trackers, and guides available for immediate download." },
];

export default function ProductsServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Products & Services</h1>
      <p className="mt-4 text-lg text-gray-600 max-w-2xl">
        Everything you need to take control of your finances and build lasting wealth.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {services.map((service) => (
          <div key={service.title} className="rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900">{service.title}</h2>
            <p className="mt-3 text-gray-500 leading-relaxed">{service.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
