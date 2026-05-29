export const metadata = { title: "Privacy Policy — ANNE" };

export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Privacy Policy</h1>
      <p className="mt-4 text-sm text-gray-400">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      <div className="mt-8 prose prose-gray max-w-none text-sm text-gray-600 leading-relaxed space-y-4">
        <p>Your privacy policy content goes here.</p>
      </div>
    </div>
  );
}
