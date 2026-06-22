"use client";

import { useState } from "react";
import { useAdminTheme } from "@/lib/admin-theme";
import ProductsSubNav from "./ProductsSubNav";
import ProductForm from "./ProductForm";
import type { Course, BookingSession } from "@/types";

type Source = "manual" | "course" | "booking" | null;

interface Props {
  courses: Course[];
  sessions: BookingSession[];
}

export default function ProductSourcePicker({ courses, sessions }: Props) {
  const { dark } = useAdminTheme();
  const [source, setSource] = useState<Source>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Course | BookingSession | null>(null);

  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-500";
  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const inputBg = dark
    ? "bg-white/5 border-white/5 text-white/70 placeholder-white/20 focus:border-white/20"
    : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400";
  const rowHover = dark ? "hover:bg-white/4 border-white/5" : "hover:bg-gray-50 border-gray-100";

  function reset() {
    setSource(null);
    setSearch("");
    setSelected(null);
  }

  // If source picker is done and item is selected (or manual chosen), show the form
  if (source === "manual") {
    return (
      <ProductForm
        initialData={{ source_type: "manual" }}
        showSubNav
      />
    );
  }

  if (selected) {
    const isCourse = source === "course";
    const prefill = isCourse
      ? {
          name: (selected as Course).title,
          description: (selected as Course).description ?? "",
          price: (selected as Course).price,
          image_url: (selected as Course).thumbnail_url,
          source_type: "course" as const,
          source_id: selected.id,
        }
      : {
          name: (selected as BookingSession).title,
          description: (selected as BookingSession).description ?? "",
          price: (selected as BookingSession).price_gbp ?? 0,
          image_url: (selected as BookingSession).cover_image,
          source_type: "booking" as const,
          source_id: selected.id,
        };

    return (
      <ProductForm
        initialData={prefill}
        showSubNav
      />
    );
  }

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );
  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <ProductsSubNav />

      <div>
        <h1 className={`text-xl font-bold ${heading}`}>Add New Product</h1>
        <p className={`text-sm mt-0.5 ${sub}`}>Create manually or import from an existing Course or Booking Session.</p>
      </div>

      {source === null && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
          {/* Manual */}
          <button
            onClick={() => setSource("manual")}
            className={`rounded-xl border p-6 text-left group transition-all hover:shadow-md ${card} ${dark ? "hover:border-white/15" : "hover:border-[#0822C0]/30"}`}
          >
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${dark ? "bg-white/5" : "bg-gray-100"} group-hover:bg-[#0822C0]/10 transition-colors`}>
              <svg className={`h-5 w-5 ${dark ? "text-white/40" : "text-gray-500"} group-hover:text-[#0822C0] transition-colors`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <p className={`font-semibold text-sm ${heading}`}>Create Manually</p>
            <p className={`text-xs mt-1 leading-relaxed ${sub}`}>Fill in all details from scratch — templates, ebooks, or anything else.</p>
          </button>

          {/* From Course */}
          <button
            onClick={() => { setSource("course"); setSearch(""); }}
            className={`rounded-xl border p-6 text-left group transition-all hover:shadow-md ${card} ${dark ? "hover:border-white/15" : "hover:border-amber-400/40"}`}
          >
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${dark ? "bg-amber-400/10" : "bg-amber-50"} transition-colors`}>
              <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            <p className={`font-semibold text-sm ${heading}`}>From Course</p>
            <p className={`text-xs mt-1 leading-relaxed ${sub}`}>Pick an existing course and publish it as a product in your shop.</p>
            <p className={`text-xs mt-2 font-medium ${dark ? "text-white/30" : "text-gray-400"}`}>{courses.length} course{courses.length !== 1 ? "s" : ""} available</p>
          </button>

          {/* From Booking */}
          <button
            onClick={() => { setSource("booking"); setSearch(""); }}
            className={`rounded-xl border p-6 text-left group transition-all hover:shadow-md ${card} ${dark ? "hover:border-white/15" : "hover:border-cyan-400/40"}`}
          >
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${dark ? "bg-cyan-400/10" : "bg-cyan-50"} transition-colors`}>
              <svg className="h-5 w-5 text-cyan-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <p className={`font-semibold text-sm ${heading}`}>From Booking Session</p>
            <p className={`text-xs mt-1 leading-relaxed ${sub}`}>Turn a bookable session into a purchasable product.</p>
            <p className={`text-xs mt-2 font-medium ${dark ? "text-white/30" : "text-gray-400"}`}>{sessions.length} session{sessions.length !== 1 ? "s" : ""} available</p>
          </button>
        </div>
      )}

      {(source === "course" || source === "booking") && (
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/30 hover:text-white/70 hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className={`text-base font-semibold ${heading}`}>
                {source === "course" ? "Select a Course" : "Select a Booking Session"}
              </h2>
              <p className={`text-xs ${sub}`}>Choose one to pre-fill the product form.</p>
            </div>
          </div>

          <div className="relative">
            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${sub}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={source === "course" ? "Search courses…" : "Search sessions…"}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors ${inputBg}`}
              autoFocus
            />
          </div>

          <div className={`rounded-xl border overflow-hidden ${card}`}>
            {source === "course" && (
              filteredCourses.length === 0
                ? <div className={`py-12 text-center text-sm ${sub}`}>No courses found.</div>
                : filteredCourses.map((course, i) => (
                  <button
                    key={course.id}
                    onClick={() => setSelected(course)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors border-b last:border-0 ${rowHover}`}
                  >
                    {course.thumbnail_url
                      ? <img src={course.thumbnail_url} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                      : <div className={`h-10 w-10 rounded-lg shrink-0 flex items-center justify-center ${dark ? "bg-amber-400/10" : "bg-amber-50"}`}>
                          <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${heading}`}>{course.title}</p>
                      <p className={`text-xs mt-0.5 truncate ${sub}`}>{course.description ?? "No description"}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-sm font-semibold ${heading}`}>£{course.price.toFixed(2)}</p>
                      <p className={`text-xs mt-0.5 ${course.published ? "text-green-500" : sub}`}>
                        {course.published ? "Published" : "Draft"}
                      </p>
                    </div>
                  </button>
                ))
            )}
            {source === "booking" && (
              filteredSessions.length === 0
                ? <div className={`py-12 text-center text-sm ${sub}`}>No sessions found.</div>
                : filteredSessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => setSelected(session)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors border-b last:border-0 ${rowHover}`}
                  >
                    {session.cover_image
                      ? <img src={session.cover_image} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                      : <div className={`h-10 w-10 rounded-lg shrink-0 flex items-center justify-center ${dark ? "bg-cyan-400/10" : "bg-cyan-50"}`}>
                          <svg className="h-5 w-5 text-cyan-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${heading}`}>{session.title}</p>
                      <p className={`text-xs mt-0.5 ${sub}`}>{session.duration_minutes} min</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-sm font-semibold ${heading}`}>
                        {session.is_free ? "Free" : `£${(session.price_gbp ?? 0).toFixed(2)}`}
                      </p>
                      <p className={`text-xs mt-0.5 ${session.is_active ? "text-green-500" : sub}`}>
                        {session.is_active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </button>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
