import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ViewTracker from "@/components/public/ViewTracker";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Client-side view tracker — fires once on mount */}
      <ViewTracker postId={post.id} />

      {post.cover_image && (
        <img src={post.cover_image} alt={post.title} className="w-full rounded-xl object-cover aspect-video mb-8" />
      )}
      <p className="text-sm text-gray-400">
        {post.published_at ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""}
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">{post.title}</h1>
      <div
        className="mt-8 blog-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
