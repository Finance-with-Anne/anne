import { createClient } from "@/lib/supabase/server";
import YouTubePage from "@/components/admin/YouTubePage";

export default async function AdminYouTubePage() {
  const supabase = await createClient();
  const { data: videos } = await supabase.from("youtube_videos").select("*").order("order", { ascending: true });
  return <YouTubePage videos={videos ?? []} />;
}
