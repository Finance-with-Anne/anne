export default function AdminYouTubePage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">YouTube</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and showcase your YouTube content on the site.</p>
        </div>
        <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
          + Add Video
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400 col-span-full">
          Add YouTube video IDs or connect your YouTube channel to display videos here.
        </div>
      </div>
    </div>
  );
}
