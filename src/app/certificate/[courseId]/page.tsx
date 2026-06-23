import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ courseId: string }> }

export default async function CertificatePage({ params }: Props) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [certRes, courseRes, profileRes] = await Promise.all([
    supabaseAdmin.from("course_certificates").select("issued_at").eq("user_id", user.id).eq("course_id", courseId).single(),
    supabaseAdmin.from("courses").select("title, thumbnail_url").eq("id", courseId).single(),
    supabaseAdmin.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);

  if (!certRes.data || !courseRes.data) notFound();

  const name = profileRes.data?.full_name || user.email?.split("@")[0] || "Student";
  const issuedAt = new Date(certRes.data.issued_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 print:bg-white print:p-0">
      <div className="w-full max-w-3xl">
        {/* Print button */}
        <div className="mb-6 flex justify-end print:hidden">
          <button onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0822C0] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[#0a2fd4] transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Download / Print
          </button>
        </div>

        {/* Certificate */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 print:shadow-none print:rounded-none print:border-none">
          {/* Top accent bar */}
          <div className="h-2 bg-[#0822C0]" />

          <div className="px-16 py-14 text-center">
            {/* Badge */}
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#0822C0]/8 mb-8">
              <svg className="h-10 w-10 text-[#0822C0]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <p className="text-xs font-bold text-[#0822C0] uppercase tracking-[0.3em] mb-4">Certificate of Completion</p>

            <p className="text-sm text-gray-400 mb-2">This certifies that</p>
            <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, serif" }}>{name}</h1>

            <p className="text-sm text-gray-400 mb-2">has successfully completed</p>
            <h2 className="text-2xl font-semibold text-gray-800 mb-10">{courseRes.data.title}</h2>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-1 h-px bg-gray-200" />
              <div className="h-2 w-2 rounded-full bg-[#0822C0]/30" />
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Signatures row */}
            <div className="flex items-end justify-between">
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-800" style={{ fontFamily: "Georgia, serif" }}>Finance With Anne</p>
                <div className="h-px w-32 bg-gray-300 mt-2 mb-1" />
                <p className="text-xs text-gray-400">Instructor</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-mono text-gray-300">{courseId.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-gray-400 mt-1">Certificate ID</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{issuedAt}</p>
                <div className="h-px w-32 bg-gray-300 mt-2 mb-1 ml-auto" />
                <p className="text-xs text-gray-400">Date issued</p>
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="h-1 bg-gradient-to-r from-[#0822C0] via-[#4361ee] to-[#0822C0]" />
        </div>
      </div>
    </div>
  );
}
