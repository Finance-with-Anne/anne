import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Communities — Finance with Anne" };

type CommunityLink = { type: "whatsapp" | "telegram"; label: string; url: string };

interface CommunityMembership {
  orderId: string;
  productName: string;
  purchasedAt: string;
  links: CommunityLink[];
}

export default async function AccountCommunitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: ordersData } = await supabaseAdmin
    .from("orders")
    .select("id, items, created_at")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  const memberships: CommunityMembership[] = [];

  for (const order of ordersData ?? []) {
    const items: { id: string; name: string }[] = order.items ?? [];
    for (const item of items) {
      const { data: product } = await supabaseAdmin
        .from("products")
        .select("community_links")
        .eq("id", item.id)
        .maybeSingle();

      const links: CommunityLink[] = product?.community_links ?? [];
      if (links.length > 0) {
        memberships.push({
          orderId: order.id,
          productName: item.name,
          purchasedAt: order.created_at,
          links,
        });
      }
    }
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Communities</h1>
        <p className="text-sm text-gray-400 dark:text-white/40 mt-0.5">
          Private communities you have access to through your purchases.
        </p>
      </div>

      {memberships.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/3 py-16 text-center px-6">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-50 dark:bg-green-400/10 flex items-center justify-center">
            <svg className="h-6 w-6 text-green-500 dark:text-green-400 opacity-50" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-white/40">No community memberships yet</p>
          <p className="text-xs text-gray-400 dark:text-white/25 mt-1 max-w-xs mx-auto">
            Join a premium community like Legacy Builders Network to see your access links here.
          </p>
          <Link
            href="/legacy-builders-network"
            className="inline-block mt-4 text-xs font-semibold text-[#0822C0] dark:text-blue-400 hover:underline"
          >
            View Legacy Builders Network →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {memberships.map((m) => (
            <div
              key={`${m.orderId}`}
              className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/3 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{m.productName}</p>
                  <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
                    Joined {new Date(m.purchasedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-400/10 px-2.5 py-1 rounded-full">
                  Active
                </span>
              </div>

              <div className="p-5 space-y-3">
                {m.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-sm ${
                      link.type === "whatsapp"
                        ? "border-green-200 dark:border-green-400/20 bg-green-50/50 dark:bg-green-400/5 hover:border-green-300 dark:hover:border-green-400/40"
                        : "border-blue-200 dark:border-blue-400/20 bg-blue-50/50 dark:bg-blue-400/5 hover:border-blue-300 dark:hover:border-blue-400/40"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      link.type === "whatsapp" ? "bg-[#25D366]/15" : "bg-[#2AABEE]/15"
                    }`}>
                      {link.type === "whatsapp" ? (
                        <svg className="h-5 w-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-[#2AABEE]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{link.label || (link.type === "whatsapp" ? "WhatsApp Community" : "Telegram Channel")}</p>
                      <p className={`text-xs mt-0.5 ${link.type === "whatsapp" ? "text-[#25D366]" : "text-[#2AABEE]"}`}>
                        {link.type === "whatsapp" ? "WhatsApp" : "Telegram"} · Click to join
                      </p>
                    </div>
                    <svg className="h-4 w-4 text-gray-300 dark:text-white/20 group-hover:text-gray-500 dark:group-hover:text-white/50 transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
