import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/types";
import Link from "next/link";
import ActionButton from "@/components/admin/ActionButton";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="mt-1 text-sm text-gray-500">{posts?.length ?? 0} posts total</p>
        </div>
        <ActionButton label="New Post" onClick={() => { window.location.href = "/admin/blog/new"; }} />
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
        {!posts || posts.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No blog posts yet. Create your first one.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(posts as BlogPost[]).map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{post.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(post.created_at).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/blog/${post.id}`} className="text-xs text-gray-500 hover:text-gray-900 underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
