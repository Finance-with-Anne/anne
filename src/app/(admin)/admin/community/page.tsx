export default function AdminCommunityPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Community</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your community members, groups, and activity.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Members", value: "—" },
          { label: "Active Groups", value: "—" },
          { label: "New This Week", value: "—" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-gray-200 p-12 text-center text-sm text-gray-400">
        Community management features coming soon.
      </div>
    </div>
  );
}
