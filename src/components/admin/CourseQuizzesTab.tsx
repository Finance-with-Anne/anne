"use client";

import { useEffect, useState } from "react";
import { useAdminTheme } from "@/lib/admin-theme";

interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correct: number;
}

interface Quiz {
  lesson_id: string;
  questions: QuizQuestion[];
}

interface Lesson {
  id: string;
  title: string;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

const BLANK_QUESTION = (): QuizQuestion => ({
  question: "",
  options: ["", "", "", ""],
  correct: 0,
});

export default function CourseQuizzesTab({ courseId }: { courseId: string }) {
  const { dark } = useAdminTheme();
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [quizMap, setQuizMap] = useState<Record<string, QuizQuestion[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([BLANK_QUESTION()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const tText = dark ? "text-white/80" : "text-gray-800";
  const tSub = dark ? "text-white/35" : "text-gray-400";
  const inputBg = dark
    ? "bg-white/5 border-white/8 text-white/80 placeholder-white/20"
    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400";
  const divider = dark ? "border-white/5" : "border-gray-100";

  useEffect(() => {
    (async () => {
      const [courseRes, quizzesRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/courses/${courseId}/quizzes`),
      ]);
      const course = await courseRes.json();
      const quizzes: Quiz[] = await quizzesRes.json();

      const sections: Section[] = course.curriculum ?? [];
      setAllLessons(sections.flatMap((s) => s.lessons ?? []));

      const map: Record<string, QuizQuestion[]> = {};
      for (const q of quizzes) map[q.lesson_id] = q.questions;
      setQuizMap(map);
      setLoading(false);
    })();
  }, [courseId]);

  function openLesson(lesson: Lesson) {
    setSelectedLesson(lesson);
    setQuestions(quizMap[lesson.id]?.length ? structuredClone(quizMap[lesson.id]) : [BLANK_QUESTION()]);
    setError("");
    setSaved(false);
  }

  function setQ(idx: number, patch: Partial<QuizQuestion>) {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }

  function setOption(qi: number, oi: number, val: string) {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qi) return q;
        const opts: [string, string, string, string] = [...q.options] as [string, string, string, string];
        opts[oi] = val;
        return { ...q, options: opts };
      })
    );
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, BLANK_QUESTION()]);
  }

  function removeQuestion(idx: number) {
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!selectedLesson) return;
    const valid = questions.every(
      (q) => q.question.trim() && q.options.every((o) => o.trim())
    );
    if (!valid) { setError("Fill in all question text and all 4 options before saving."); return; }

    setSaving(true);
    setError("");
    const res = await fetch(`/api/courses/${courseId}/quizzes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_id: selectedLesson.id, questions }),
    });
    setSaving(false);

    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to save"); return; }
    setQuizMap((m) => ({ ...m, [selectedLesson.id]: questions }));
    setSaved(true);
  }

  async function handleDelete() {
    if (!selectedLesson) return;
    await fetch(`/api/courses/${courseId}/quizzes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_id: selectedLesson.id }),
    });
    setQuizMap((m) => {
      const next = { ...m };
      delete next[selectedLesson.id];
      return next;
    });
    setSelectedLesson(null);
  }

  if (loading) {
    return (
      <div className={`rounded-2xl border py-14 text-center text-sm ${card} ${tSub}`}>Loading…</div>
    );
  }

  return (
    <div className="grid grid-cols-[220px_1fr] gap-4 min-h-[480px]">
      {/* Lesson sidebar */}
      <div className={`rounded-2xl border overflow-hidden self-start ${card}`}>
        <div className={`px-3 py-2.5 border-b text-xs font-semibold uppercase tracking-wider ${dark ? "text-white/25 border-white/5" : "text-gray-400 border-gray-100"}`}>
          Lessons
        </div>
        {allLessons.length === 0 ? (
          <p className={`px-3 py-6 text-xs ${tSub}`}>No lessons yet.</p>
        ) : (
          allLessons.map((lesson) => {
            const hasQuiz = !!quizMap[lesson.id]?.length;
            const isActive = selectedLesson?.id === lesson.id;
            return (
              <button
                key={lesson.id}
                onClick={() => openLesson(lesson)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm border-b last:border-b-0 transition-colors ${divider} ${
                  isActive
                    ? dark ? "bg-white/8 text-white" : "bg-brand/5 text-brand"
                    : dark ? "text-white/60 hover:bg-white/5 hover:text-white/80" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="flex-1 line-clamp-2 leading-snug">{lesson.title}</span>
                {hasQuiz && (
                  <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-green-400" title="Quiz exists" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Quiz editor */}
      {!selectedLesson ? (
        <div className={`rounded-2xl border flex items-center justify-center ${card}`}>
          <p className={`text-sm ${tSub}`}>Select a lesson to add or edit its quiz.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header */}
          <div className={`rounded-2xl border px-5 py-4 flex items-center justify-between gap-4 ${card}`}>
            <div>
              <p className={`text-xs ${tSub}`}>Editing quiz for</p>
              <p className={`text-sm font-semibold mt-0.5 ${tText}`}>{selectedLesson.title}</p>
            </div>
            <div className="flex items-center gap-2">
              {quizMap[selectedLesson.id]?.length ? (
                <button
                  onClick={handleDelete}
                  className={`text-xs rounded-lg px-3 py-1.5 transition-colors ${dark ? "text-red-400/70 hover:text-red-400 hover:bg-red-400/10" : "text-red-500 hover:bg-red-50"}`}
                >
                  Delete quiz
                </button>
              ) : null}
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : saved ? "Saved ✓" : "Save quiz"}
              </button>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={qi} className={`rounded-2xl border p-5 space-y-3 ${card}`}>
                <div className="flex items-start justify-between gap-3">
                  <span className={`text-xs font-semibold ${tSub}`}>Question {qi + 1}</span>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qi)}
                      className={`text-xs rounded-lg px-2 py-1 transition-colors ${dark ? "text-white/20 hover:text-red-400 hover:bg-red-400/10" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Question text…"
                  value={q.question}
                  onChange={(e) => setQ(qi, { question: e.target.value })}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 ${inputBg}`}
                />

                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <button
                        onClick={() => setQ(qi, { correct: oi })}
                        title={q.correct === oi ? "Correct answer" : "Mark as correct"}
                        className={`shrink-0 h-5 w-5 rounded-full border-2 transition-colors ${
                          q.correct === oi
                            ? "border-green-400 bg-green-400"
                            : dark ? "border-white/20 hover:border-green-400/50" : "border-gray-300 hover:border-green-400"
                        }`}
                      />
                      <input
                        type="text"
                        placeholder={`Option ${oi + 1}`}
                        value={opt}
                        onChange={(e) => setOption(qi, oi, e.target.value)}
                        className={`flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 ${inputBg}`}
                      />
                    </div>
                  ))}
                </div>

                <p className={`text-xs ${tSub}`}>
                  Click a circle to mark the correct answer (currently: Option {q.correct + 1})
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={addQuestion}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                dark ? "border-white/10 text-white/50 hover:text-white/80 hover:border-white/20" : "border-gray-200 text-gray-500 hover:text-gray-800"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add question
            </button>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
