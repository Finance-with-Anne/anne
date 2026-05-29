export const metadata = { title: "Terms of Service — ANNE" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Terms of Service</h1>
      <p className="mt-4 text-sm text-gray-400">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      <div className="mt-8 prose prose-gray max-w-none text-sm text-gray-600 leading-relaxed space-y-4">
        <p>Your terms of service content goes here.</p>
      </div>
    </div>
  );
}
