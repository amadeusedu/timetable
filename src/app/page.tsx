"use client"; // tells Next this is a client-side (interactive) component

import React from "react";

/* -------------------------- DATA: your timetable -------------------------- */
/* We store Week 1 and Week 2 as arrays of days; each day has time + activity */

type Slot = { time: string; subject: string; text: string };
type Day = { day: string; studyGroup?: boolean; slots: Slot[] };

const WEEK1: Day[] = [
  // Each object here = a day. Same pattern repeats for the week.
  {
    day: "Mon",
    slots: [
      { time: "11:00–12:30", subject: "Methods", text: "Practice Exam (Part A)" },
      { time: "13:00–14:30", subject: "Methods", text: "Review & error log (re-work top 3)" },
      { time: "15:00–16:30", subject: "English", text: "Exam Block 1: Analytical Essay (~60m) + quick skim" },
      { time: "17:00–18:30", subject: "English", text: "Exam Block 2: Argument Analysis (~60m) + notes for Creative" },
    ],
  },
  {
    day: "Tue",
    studyGroup: true, // visually mark this day as a study group day
    slots: [
      { time: "10:30–16:00", subject: "Study Group", text: "Methods & Chemistry: 10:30–12:00 Methods • 12:00–12:30 Lunch • 12:30–14:00 Chem • 14:15–16:00 Mixed exam Qs" },
      { time: "17:30–19:00", subject: "English", text: "Plans bank (3 prompts, ~30m each)" },
    ],
  },
  {
    day: "Wed",
    slots: [
      { time: "11:00–12:30", subject: "Physics", text: "Practice Exam (Part A)" },
      { time: "13:00–14:30", subject: "Physics", text: "Review & formula sheet updates" },
      { time: "15:00–16:30", subject: "General Maths", text: "Practice Exam (Part A)" },
      { time: "17:00–18:30", subject: "Methods", text: "Concept top-ups (derivatives/integration sets)" },
    ],
  },
  {
    day: "Thu",
    studyGroup: true,
    slots: [
      { time: "10:30–16:00", subject: "Study Group", text: "Physics: 10:30–12:00 timed • 12:00–12:30 Lunch • 12:30–14:00 pracs/data • 14:15–16:00 concept Qs" },
      { time: "17:30–19:00", subject: "Methods", text: "Section A mini-exam (timed)" },
    ],
  },
  {
    day: "Fri",
    studyGroup: true,
    slots: [
      { time: "10:30–16:00", subject: "Study Group", text: "Methods & Chem: 10:30–12:00 Methods • 12:00–12:30 Lunch • 12:30–14:00 Chem • 14:15–16:00 Mixed sets" },
      { time: "17:30–19:00", subject: "English", text: "Quick-write (intro + 2 body paras → polish)" },
    ],
  },
  {
    day: "Sat",
    slots: [
      { time: "11:00–12:30", subject: "Chemistry", text: "Practice Exam (Part A)" },
      { time: "13:00–14:30", subject: "Chemistry", text: "Review & one-pager (topic summary)" },
      { time: "15:00–16:30", subject: "English", text: "Creative ~60m write + ~30m self-mark (completes 3 pieces)" },
      { time: "17:00–18:30", subject: "General Maths", text: "Targeted drills (from error log)" },
    ],
  },
];

const WEEK2: Day[] = [
  {
    day: "Mon",
    slots: [
      { time: "11:00–12:30", subject: "General Maths", text: "Practice Exam (Part A)" },
      { time: "13:00–14:30", subject: "General Maths", text: "Review & re-work" },
      { time: "15:00–16:30", subject: "Chemistry", text: "Topic sprint (2 weakest areas)" },
      { time: "17:00–18:30", subject: "English", text: "Quotes/themes bank + one refined paragraph" },
    ],
  },
  {
    day: "Tue",
    studyGroup: true,
    slots: [
      { time: "10:30–16:00", subject: "Study Group", text: "Methods & Chemistry: long-form problems • rotations • peer marking" },
      { time: "17:30–19:00", subject: "Physics", text: "Derivation drills (6–8 marks worth)" },
    ],
  },
  {
    day: "Wed",
    slots: [
      { time: "11:00–12:30", subject: "Chemistry", text: "Practice Exam (Part A)" },
      { time: "13:00–14:30", subject: "Chemistry", text: "Review & one-pager (e.g., redox/Ka/Ksp)" },
      { time: "15:00–16:30", subject: "English", text: "Exam Block 1: Analytical Essay (~60m)" },
      { time: "17:00–18:30", subject: "English", text: "Exam Block 2: Argument Analysis (~60m)" },
    ],
  },
  {
    day: "Thu",
    studyGroup: true,
    slots: [
      { time: "10:30–16:00", subject: "Study Group", text: "Physics: mock test + full debrief & error classes" },
      { time: "17:30–19:00", subject: "General Maths", text: "Tech-free mini-exam (timed)" },
    ],
  },
  {
    day: "Fri",
    studyGroup: true,
    slots: [
      { time: "10:30–16:00", subject: "Study Group", text: "Methods & Chem: final mixed sets & paper swaps" },
      { time: "17:30–19:00", subject: "English", text: "Intro bank (draft 3 strong openings)" },
    ],
  },
  {
    day: "Sat",
    slots: [
      { time: "11:00–12:30", subject: "English", text: "Exam Block 3: Creative ~60m + 0–30m self-mark" },
      { time: "13:00–14:30", subject: "Methods", text: "Practice Exam (Part A)" },
      { time: "15:00–16:30", subject: "Methods", text: "Review & formula recall" },
      { time: "17:00–17:40", subject: "Debrief", text: "Fortnight debrief (scores trend + top-5 fixes)" },
    ],
  },
];

/* --------------------------- UI helper components ------------------------- */

// Subject bubble with light color based on subject name
function SubjectTag({ name }: { name: string }) {
  const bg =
    name === "Methods" ? "#EEF2FF" :
    name === "Physics" ? "#ECFDF5" :
    name === "General Maths" ? "#E0F2FE" :
    name === "Chemistry" ? "#FFE4E6" :
    name === "English" ? "#FEF3C7" :
    name === "Study Group" ? "#111827" :
    name === "Debrief" ? "#ECFCCB" : "#F4F4F5";

  const color = name === "Study Group" ? "white" : "#111827";

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 8px", borderRadius: 999, background: bg, color,
      fontSize: 12, fontWeight: 600
    }}>
      {name}
    </span>
  );
}

// A single day card
function DayCard({ day, studyGroup, slots }: Day) {
  return (
    <div style={{
      border: "1px solid #e5e7eb", borderRadius: 16, padding: 12,
      background: studyGroup ? "#111827" : "white", color: studyGroup ? "white" : "#111827",
      boxShadow: "0 1px 4px rgba(15,15,15,0.05)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: studyGroup ? "white" : "#f4f4f5", color: studyGroup ? "#111827" : "#111827",
          fontWeight: 700
        }}>
          {day}
        </div>
        {studyGroup && (
          <span style={{
            padding: "4px 8px", borderRadius: 999, background: "white", color: "#111827",
            fontSize: 12, fontWeight: 700
          }}>
            Study Group
          </span>
        )}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {slots.map((s, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "120px 1fr", gap: 10,
            border: "1px solid #e5e7eb", borderRadius: 12, padding: 10,
            background: studyGroup ? "#0f172a" : "white", // slightly darker inside on studyGroup
          }}>
            <div style={{ fontWeight: 600, color: studyGroup ? "#cbd5e1" : "#4b5563" }}>{s.time}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
              <SubjectTag name={s.subject} />
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>{s.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ MAIN PAGE UI ------------------------------ */

export default function Page() {
  // state: which week are we showing? 1 or 2
  const [week, setWeek] = React.useState<1 | 2>(1);

  // pick the right dataset based on current week
  const data = week === 1 ? WEEK1 : WEEK2;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(#ffffff, #fafafa)" }}>
      {/* Top bar with title + week buttons + print */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30, background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(6px)", borderBottom: "1px solid #e5e7eb"
      }}>
        <div style={{
          maxWidth: 1000, margin: "0 auto", padding: "10px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700 }}>Two-Week Study Timetable</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setWeek(1)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: week===1?"#111827":"white", color: week===1?"white":"#111827", fontWeight: 600 }}
              aria-label="Show Week 1"
            >
              Week 1
            </button>
            <button
              onClick={() => setWeek(2)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: week===2?"#111827":"white", color: week===2?"white":"#111827", fontWeight: 600 }}
              aria-label="Show Week 2"
            >
              Week 2
            </button>
            <button
              onClick={() => window.print()}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", fontWeight: 600 }}
            >
              Print / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Small rules blurb */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "12px 16px", color: "#4b5563", fontSize: 14 }}>
        Rules: Non–study-group days start at 11:00 • Max 1.5 h blocks (study groups excluded) • English exam = 3 × ~60m pieces • Keep an error log daily.
      </div>

      {/* Two-column grid (one column on phone) */}
      <div style={{
        maxWidth: 1000, margin: "0 auto", padding: "0 16px 24px",
        display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr"
      }}>
        {/* Responsive: single column on narrow screens */}
        <style>{`
          @media (max-width: 760px) {
            .grid-two-col { grid-template-columns: 1fr !important; }
          }
          @media print {
            .no-print { display: none; }
          }
        `}</style>

        {/* Wrap the grid in a class the small CSS above can target */}
        <div className="grid-two-col" style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          {data.map((d) => (
            <DayCard key={d.day} {...d} />
          ))}
        </div>
      </div>
    </div>
  );
}

