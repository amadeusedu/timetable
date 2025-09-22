"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Printer, ChevronLeft, ChevronRight, Clock, BookMarked } from "lucide-react";

/*
  Two-Week Study Timetable + Exam Season View (with checkboxes)
  ----------------------------------------------------------------
  • Fortnight view: your original Week 1 / Week 2
  • Exam Season view: Thu Oct 16 → Wed Nov 12 (ALL days included)
  • Each item has a checkbox; completion persists via localStorage
  • Methods & Chem anchored to Tue/Fri where applicable
  • VCAA newest-first priority (eve days = VCAA only)
*/

// --------------------------- small helpers ----------------------------
const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");
const sanitize = (s: string) => s.replace(/\s+/g, "_");

function useLocalChecks(key = "tt_checks_v1") {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setChecks(JSON.parse(raw));
    } catch {}
  }, [key]);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(checks));
    } catch {}
  }, [checks, key]);
  const set = (k: string, v: boolean) => setChecks((p) => ({ ...p, [k]: v }));
  const toggle = (k: string) => setChecks((p) => ({ ...p, [k]: !p[k] }));
  const get = (k: string) => !!checks[k];
  return { get, set, toggle };
}

// --------------------------- subject tags -----------------------------
const SUBJECTS: Record<string, { label: string; color: string }> = {
  Methods: { label: "Methods", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  Physics: { label: "Physics", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  "General Maths": { label: "General Maths", color: "bg-sky-100 text-sky-800 border-sky-300" },
  Chemistry: { label: "Chemistry", color: "bg-rose-100 text-rose-800 border-rose-300" },
  English: { label: "English", color: "bg-amber-100 text-amber-900 border-amber-300" },
  Study: { label: "Study Group", color: "bg-zinc-900 text-white border-zinc-900" },
  Debrief: { label: "Debrief", color: "bg-lime-100 text-lime-900 border-lime-300" },
};

function SubjectTag({ name }: { name: keyof typeof SUBJECTS | string }) {
  const meta = (SUBJECTS as any)[name] ?? {
    label: name,
    color: "bg-zinc-100 text-zinc-800 border-zinc-300",
  };
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", meta.color)}>
      {meta.label}
    </span>
  );
}

// --------------------------- Fortnight data ---------------------------
const WEEK1 = [
  { day: "Mon", slots: [
    { time: "11:00–12:30", subject: "Methods", text: "Practice Exam (Part A)" },
    { time: "13:00–14:30", subject: "Methods", text: "Review & error log (re-work top 3)" },
    { time: "15:00–16:30", subject: "English", text: "Exam Block 1: Analytical Essay (~60m) + quick skim" },
    { time: "17:00–18:30", subject: "English", text: "Exam Block 2: Argument Analysis (~60m) + notes for Creative" },
  ]},
  { day: "Tue", studyGroup: true, slots: [
    { time: "10:30–16:00", subject: "Study", text: "Methods & Chemistry: 10:30–12:00 Methods • 12:00–12:30 Lunch • 12:30–14:00 Chem • 14:15–16:00 Mixed Qs" },
    { time: "17:30–19:00", subject: "English", text: "Plans bank (3 prompts, ~30m each)" },
  ]},
  { day: "Wed", slots: [
    { time: "11:00–12:30", subject: "Physics", text: "Practice Exam (Part A)" },
    { time: "13:00–14:30", subject: "Physics", text: "Review & formula sheet updates" },
    { time: "15:00–16:30", subject: "General Maths", text: "Practice Exam (Part A)" },
    { time: "17:00–18:30", subject: "Methods", text: "Concept top-ups (derivatives/integration)" },
  ]},
  { day: "Thu", studyGroup: true, slots: [
    { time: "10:30–16:00", subject: "Study", text: "Physics group: 10:30–12:00 timed • 12:00–12:30 Lunch • 12:30–14:00 pracs/data • 14:15–16:00 concept Qs" },
    { time: "17:30–19:00", subject: "Methods", text: "Section A mini-exam (timed)" },
  ]},
  { day: "Fri", studyGroup: true, slots: [
    { time: "10:30–16:00", subject: "Study", text: "Methods & Chem: 10:30–12:00 Methods • 12:00–12:30 Lunch • 12:30–14:00 Chem • 14:15–16:00 Mixed sets" },
    { time: "17:30–19:00", subject: "English", text: "Quick-write (intro + 2 body paras → polish)" },
  ]},
  { day: "Sat", slots: [
    { time: "11:00–12:30", subject: "Chemistry", text: "Practice Exam (Part A)" },
    { time: "13:00–14:30", subject: "Chemistry", text: "Review & one-pager (topic summary)" },
    { time: "15:00–16:30", subject: "English", text: "Creative ~60m write + ~30m self-mark" },
    { time: "17:00–18:30", subject: "General Maths", text: "Targeted drills (from error log)" },
  ]},
];

const WEEK2 = [
  { day: "Mon", slots: [
    { time: "11:00–12:30", subject: "General Maths", text: "Practice Exam (Part A)" },
    { time: "13:00–14:30", subject: "General Maths", text: "Review & re-work" },
    { time: "15:00–16:30", subject: "Chemistry", text: "Topic sprint (2 weakest areas)" },
    { time: "17:00–18:30", subject: "English", text: "Quotes/themes bank + one refined paragraph" },
  ]},
  { day: "Tue", studyGroup: true, slots: [
    { time: "10:30–16:00", subject: "Study", text: "Methods & Chemistry: long-form problems • rotations • peer marking" },
    { time: "17:30–19:00", subject: "Physics", text: "Derivation drills (6–8 marks worth)" },
  ]},
  { day: "Wed", slots: [
    { time: "11:00–12:30", subject: "Chemistry", text: "Practice Exam (Part A)" },
    { time: "13:00–14:30", subject: "Chemistry", text: "Review & one-pager (e.g., redox/Ka/Ksp)" },
    { time: "15:00–16:30", subject: "English", text: "Exam Block 1: Analytical Essay (~60m)" },
    { time: "17:00–18:30", subject: "English", text: "Exam Block 2: Argument Analysis (~60m)" },
  ]},
  { day: "Thu", studyGroup: true, slots: [
    { time: "10:30–16:00", subject: "Study", text: "Physics group: mock test + full debrief & error classes" },
    { time: "17:30–19:00", subject: "General Maths", text: "Tech-free mini-exam (timed)" },
  ]},
  { day: "Fri", studyGroup: true, slots: [
    { time: "10:30–16:00", subject: "Study", text: "Methods & Chem: final mixed sets & paper swaps" },
    { time: "17:30–19:00", subject: "English", text: "Intro bank (draft 3 strong openings)" },
  ]},
  { day: "Sat", slots: [
    { time: "11:00–12:30", subject: "English", text: "Exam Block 3: Creative ~60m + 0–30m self-mark" },
    { time: "13:00–14:30", subject: "Methods", text: "Practice Exam (Part A)" },
    { time: "15:00–16:30", subject: "Methods", text: "Review & formula recall" },
    { time: "17:00–17:40", subject: "Debrief", text: "Fortnight debrief (scores trend + top-5 fixes)" },
  ]},
];

// --------------------------- Exam Season data ---------------------------
type PaperSlot = { subject: string; paper: string; optional?: string };
type ExamDay = {
  date: string;                   // e.g. "Thu Oct 16"
  slots?: PaperSlot[];            // practice items with checkboxes
  note?: string;                  // e.g. "English eve — no non-English"
  exam?: string;                  // e.g. "ENGLISH", "GM1", "GM2", "METHODS 1", etc.
};

const EXAM_SEASON: ExamDay[] = [
  { date: "Thu Oct 16", slots: [ { subject: "Physics", paper: "Insight 2024", optional: "NEAP 2023" } ] },
  { date: "Fri Oct 17", slots: [ { subject: "Methods", paper: "TSSM 2024 Exam 1" }, { subject: "Chemistry", paper: "TSSM 2024" } ] },
  { date: "Sat Oct 18", slots: [ { subject: "General Maths", paper: "TSSM 2024 Paper 1", optional: "Insight 2023 Paper 1" } ] },
  { date: "Sun Oct 19", slots: [ { subject: "Physics", paper: "NEAP 2024", optional: "TSSM 2023" } ] },
  { date: "Mon Oct 20", slots: [ { subject: "General Maths", paper: "Insight 2024 Paper 1", optional: "NEAP 2023 Paper 1" } ] },
  { date: "Tue Oct 21", slots: [ { subject: "Methods", paper: "Insight 2024 Exam 2" }, { subject: "Chemistry", paper: "NEAP 2024" } ] },
  { date: "Wed Oct 22", slots: [ { subject: "General Maths", paper: "VCAA 2023 Paper 1", optional: "TSSM 2022 Paper 1" } ] },
  { date: "Thu Oct 23", slots: [ { subject: "Physics", paper: "TSSM 2023", optional: "Insight 2022" } ] },
  { date: "Fri Oct 24", slots: [ { subject: "Methods", paper: "VCAA 2023 Exam 2" }, { subject: "Chemistry", paper: "Insight 2023" } ] },
  { date: "Sat Oct 25", slots: [ { subject: "General Maths", paper: "NEAP 2023 Paper 1", optional: "TSSM 2022 Paper 1" } ] },
  { date: "Sun Oct 26", slots: [ { subject: "Physics", paper: "Insight 2023", optional: "NEAP 2022" } ] },
  { date: "Mon Oct 27", note: "English eve — buffer (no non-English assigned)" },
  { date: "Tue Oct 28", exam: "ENGLISH" },

  { date: "Wed Oct 29", slots: [ { subject: "General Maths", paper: "NEAP 2024 Paper 1", optional: "Insight 2023 Paper 1" } ] },
  { date: "Thu Oct 30", slots: [ { subject: "General Maths", paper: "VCAA 2024 Paper 1 (eve — only this)" } ] },
  { date: "Fri Oct 31", exam: "GENERAL MATHS 1" },

  { date: "Sat Nov 1", slots: [ { subject: "General Maths", paper: "Insight 2024 Paper 2", optional: "NEAP 2023 Paper 2" } ] },
  { date: "Sun Nov 2", slots: [ { subject: "General Maths", paper: "VCAA 2024 Paper 2 (eve — only this)" } ] },
  { date: "Mon Nov 3", exam: "GENERAL MATHS 2" },

  { date: "Tue Nov 4", slots: [ { subject: "Methods", paper: "VCAA 2024 Exam 1 (eve — only this)" } ] },
  { date: "Wed Nov 5", exam: "METHODS 1" },
  { date: "Thu Nov 6", exam: "METHODS 2" },

  { date: "Fri Nov 7", slots: [ { subject: "Chemistry", paper: "Insight 2024", optional: "NEAP 2023" } ] },
  { date: "Sat Nov 8", slots: [ { subject: "Chemistry", paper: "TSSM 2023", optional: "Insight 2022" } ] },
  { date: "Sun Nov 9", slots: [ { subject: "Chemistry", paper: "VCAA 2024 (eve — only this)" } ] },
  { date: "Mon Nov 10", exam: "CHEMISTRY" },

  { date: "Tue Nov 11", slots: [ { subject: "Physics", paper: "VCAA 2024 (eve — only this)" } ] },
  { date: "Wed Nov 12", exam: "PHYSICS" },
];

// --------------------------- UI: Cards ---------------------------
function FortnightDayCard({
  weekId,
  day,
  studyGroup,
  slots,
  getKey,
  get,
  toggle,
}: {
  weekId: "W1" | "W2";
  day: string;
  studyGroup?: boolean;
  slots: { time: string; subject: string; text: string }[];
  getKey: (slotIndex: number) => string;
  get: (k: string) => boolean;
  toggle: (k: string) => void;
}) {
  return (
    <Card className={cx("rounded-2xl shadow-sm border print:shadow-none", studyGroup ? "border-zinc-800" : "border-zinc-200")}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cx("h-9 w-9 rounded-xl flex items-center justify-center", studyGroup ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-800")}>
              <span className="text-sm font-semibold">{day}</span>
            </div>
            {studyGroup && (
              <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full bg-zinc-900 text-white">
                <BookMarked className="h-3.5 w-3.5" /> Study Group
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {slots.map((s, i) => {
            const k = getKey(i);
            return (
              <label
                key={i}
                className="grid grid-cols-[110px_1fr] items-start gap-3 rounded-xl border border-zinc-100 p-3 hover:border-zinc-200 transition-colors print:border-zinc-200 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Clock className="h-4 w-4" />
                  {s.time}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SubjectTag name={s.subject} />
                    <span className="text-sm text-zinc-900 leading-relaxed">{s.text}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={get(k)}
                      onChange={() => toggle(k)}
                      className="h-4 w-4 accent-zinc-900"
                    />
                    <span className="text-xs text-zinc-500">Mark complete</span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ExamCard({
  day,
  getKey,
  get,
  toggle,
}: {
  day: ExamDay;
  getKey: (slotIndex: number) => string;
  get: (k: string) => boolean;
  toggle: (k: string) => void;
}) {
  const isExam = !!day.exam;
  return (
    <Card className={cx("rounded-2xl shadow-sm border", isExam ? "border-rose-400" : "border-zinc-200")}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cx("h-9 px-3 rounded-xl flex items-center justify-center bg-zinc-100 text-zinc-800")}>
              <span className="text-sm font-semibold">{day.date}</span>
            </div>
            {isExam && (
              <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                Exam • {day.exam}
              </span>
            )}
          </div>
        </div>

        {day.note && <div className="mb-3 text-sm text-zinc-600">{day.note}</div>}

        {day.slots && (
          <div className="grid grid-cols-1 gap-3">
            {day.slots.map((s, i) => {
              const k = getKey(i);
              return (
                <label key={i} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-zinc-100 p-3 hover:border-zinc-200 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SubjectTag name={s.subject} />
                      <span className="text-sm text-zinc-900 leading-relaxed">{s.paper}</span>
                    </div>
                    {s.optional && (
                      <div className="text-xs text-zinc-600">
                        + add if doing 2: <span className="font-medium">{s.optional}</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={get(k)}
                    onChange={() => toggle(k)}
                    className="h-4 w-4 accent-zinc-900 justify-self-end"
                    aria-label={`Mark ${s.subject} – ${s.paper} complete`}
                  />
                </label>
              );
            })}
          </div>
        )}

        {!day.slots && !day.note && isExam && (
          <div className="text-sm text-zinc-600">Exam day — no practice assigned.</div>
        )}
      </CardContent>
    </Card>
  );
}

// --------------------------- Main component ---------------------------
export default function StudyTimetable() {
  type View = "W1" | "W2" | "EX";
  const [view, setView] = useState<View>("EX");
  const checks = useLocalChecks();

  const dataFortnight = useMemo(() => (view === "W1" ? WEEK1 : WEEK2), [view]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 print:bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border-b border-zinc-200 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-zinc-800" />
            <h1 className="text-lg font-semibold tracking-tight">Study Timetable</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={view === "W1" ? "default" : "outline"} size="sm" onClick={() => setView("W1")} aria-label="Show Week 1">
              <ChevronLeft className="h-4 w-4 mr-1" /> Week 1
            </Button>
            <Button variant={view === "W2" ? "default" : "outline"} size="sm" onClick={() => setView("W2")} aria-label="Show Week 2">
              Week 2 <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant={view === "EX" ? "default" : "outline"} size="sm" onClick={() => setView("EX")} aria-label="Show Exam Season">
              Exam Season
            </Button>
            <Button size="sm" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" />
              Print / PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 print:py-4">
        {/* Legend */}
        <div className="mb-5 hidden sm:flex flex-wrap gap-2 print:flex">
          {Object.keys(SUBJECTS).map((k) => (
            <span key={k} className={cx("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]", SUBJECTS[k].color)}>
              {SUBJECTS[k].label}
            </span>
          ))}
        </div>

        {/* Rules */}
        <div className="mb-4 text-sm text-zinc-600">
          Non–study-group days start at 11:00 • Max 1.5 h blocks (study groups excluded) • Eve = VCAA only • Checkboxes save locally.
        </div>

        {/* Grid */}
        {view === "EX" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
            {EXAM_SEASON.map((d) => {
              const base = `EX|${sanitize(d.date)}`;
              return (
                <ExamCard
                  key={d.date}
                  day={d}
                  getKey={(i) => `${base}|${i}`}
                  get={checks.get}
                  toggle={checks.toggle}
                />
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
            {dataFortnight.map((d) => {
              const base = `${view}|${sanitize(d.day)}`;
              return (
                <FortnightDayCard
                  key={`${view}-${d.day}`}
                  weekId={view}
                  day={d.day}
                  studyGroup={(d as any).studyGroup}
                  slots={(d as any).slots}
                  getKey={(i) => `${base}|${i}`}
                  get={checks.get}
                  toggle={checks.toggle}
                />
              );
            })}
          </div>
        )}

        {/* Footer tip */}
        <div className="mt-6 text-xs text-zinc-500 print:text-[10px]">
          Tip: Use the Print / PDF button for a clean A4 export. Your checkboxes persist on this device.
        </div>
      </main>

      {/* Print tweaks */}
      <style>{`
        @media print {
          header{ display:none; }
          main{ padding:0 !important; }
          .print\\:grid-cols-2{ grid-template-columns: repeat(2,minmax(0,1fr)); }
        }
      `}</style>
    </div>
  );
}
