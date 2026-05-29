export default function AdminEmailPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email System</h1>
          <p className="mt-1 text-sm text-gray-500">Send broadcasts, manage subscribers, and track campaigns.</p>
        </div>
        <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
          + New Campaign
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Subscribers", value: "—" },
          { label: "Emails Sent", value: "—" },
          { label: "Open Rate", value: "—" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-gray-200 p-12 text-center text-sm text-gray-400">
        Connect your email provider (Resend / SendGrid) to get started.
      </div>
    </div>
  );
}
