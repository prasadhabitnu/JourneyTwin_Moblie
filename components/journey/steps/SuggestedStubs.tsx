/**
 * Lightweight placeholder components for the 4 Nu-suggested steps
 * (Weekly Reflection / Meal Planning / Provider Prep / Learn One Thing).
 *
 * They show the concept with real chrome + Nu narration, so the demo reveals
 * the extensibility of the journey without requiring full feature builds.
 */

export function WeeklyReflection() {
  return (
    <div className="space-y-4">
      <StubHeader eyebrow="Sunday recap"
                  emoji="📓"
                  title="What worked. What didn't."
                  sub="Three minutes to name your best moves and blockers."
                  gradient="from-indigo-500 to-violet-500" />

      <div className="grid md:grid-cols-3 gap-3">
        <StatTile label="Best day"          value="Sun Jun 28" sub="92% TIR"       color="#10B981" />
        <StatTile label="Movement"          value="4 walks"    sub="Target 5"      color="#4F5FE5" />
        <StatTile label="Weekly momentum"   value="78 → 82" sub="+4 pts"      color="#8B5CF6" />
      </div>

      <ReflectionCard question="What worked this week?" chips={[
        "Post-dinner walks stuck",
        "Protein-first breakfast",
        "Water intake goal",
        "Sunday semaglutide dose"
      ]} />

      <ReflectionCard question="What got in your way?" chips={[
        "Missed 2 semaglutide doses",
        "Wed carb-heavy lunch",
        "Sleep dropped to 6h Thu",
        "Nothing - solid week"
      ]} />

      <ReflectionCard question="One focus for next week?" chips={[
        "Consistent semaglutide timing",
        "Breakfast protein",
        "8+ hrs sleep",
        "Pick one Best Path and stick"
      ]} />
    </div>
  );
}

export function MealPlanning() {
  return (
    <div className="space-y-4">
      <StubHeader eyebrow="Meal planning" emoji="🛒"
                  title="Plan the next 7 dinners."
                  sub="Wednesday grocery run - line up protein-first winners."
                  gradient="from-amber-500 to-orange-500" />

      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-3">This week&apos;s 7 dinners</div>
        <div className="space-y-2">
          <MealRow day="Mon" name="Grilled salmon + quinoa + spinach"     tone="emerald" />
          <MealRow day="Tue" name="Turkey chili + roasted broccoli"        tone="emerald" />
          <MealRow day="Wed" name="Sheet-pan chicken + peppers + rice"    tone="emerald" />
          <MealRow day="Thu" name="Family taco night (portion-controlled)" tone="amber"   />
          <MealRow day="Fri" name="Baked cod + sweet potato + kale"        tone="emerald" />
          <MealRow day="Sat" name="Slow-cooker beef stew + green salad"    tone="emerald" />
          <MealRow day="Sun" name="Roast chicken + roasted veg"            tone="emerald" />
        </div>
      </div>

      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18l-2 13H5z" /><path d="M8 6V4a2 2 0 0 1 4 0v2" />
          </svg>
        </span>
        <div className="flex-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Grocery list ready</div>
          <div className="text-[13px] font-bold text-slate-800">Nu built your 27-item list from these 7 dinners</div>
        </div>
        <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider shadow">
          View list
        </button>
      </div>
    </div>
  );
}

export function ProviderPrep() {
  return (
    <div className="space-y-4">
      <StubHeader eyebrow="Doctor visit prep" emoji="📋"
                  title="Three questions worth asking."
                  sub="Dr. Adams on Thursday, 2 PM. Pick your top three."
                  gradient="from-sky-500 to-cyan-500" />

      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-3">Nu prepared these based on your last 30 days</div>
        <div className="space-y-2">
          <QuestionRow n={1} q="Should I raise semaglutide to 1.0mg given my 87% TIR plateau?" tag="Dose review"    />
          <QuestionRow n={2} q="The nausea is gone - can we discuss going off metformin?"      tag="Med review"     />
          <QuestionRow n={3} q="My fasting glucose is stable - update my A1c prediction?"      tag="Labs"           />
          <QuestionRow n={4} q="I've lost 7 lbs - is my dose still right for the new weight?" tag="Dose review"    />
          <QuestionRow n={5} q="Are there any interactions with the new B12 supplement?"      tag="Supplements"    />
        </div>
        <div className="mt-3 text-[11px] text-slate-500 font-medium italic">
          Tap to pick your three &mdash; Nu will format them into a printable prep sheet.
        </div>
      </div>
    </div>
  );
}

export function LearnOneThing() {
  return (
    <div className="space-y-4">
      <StubHeader eyebrow="Nu teaches" emoji="🎓"
                  title="One idea. Ninety seconds."
                  sub="Picked for where you are today - protein-first order at breakfast."
                  gradient="from-fuchsia-500 to-rose-500" />

      <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-lg bg-white">
        {/* Video placeholder */}
        <div className="relative aspect-video bg-gradient-to-br from-indigo-100 via-fuchsia-100 to-amber-100 flex items-center justify-center">
          <button className="w-16 h-16 rounded-full bg-white/95 shadow-lg flex items-center justify-center hover:scale-110 transition">
            <svg className="w-6 h-6 text-indigo-700 ml-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-black tracking-wider">1:32</div>
        </div>
        <div className="p-5">
          <div className="text-[10px] font-black uppercase tracking-wider text-indigo-700 mb-1">Protein-first order</div>
          <div className="text-lg font-black text-slate-900 mb-2">Why eating veggies + protein before carbs cuts your peak by 40 mg/dL</div>
          <div className="text-[13px] text-slate-600 font-medium leading-relaxed">
            A 90-second walkthrough of the science plus a live glucose comparison on identical meals - carbs first vs carbs last.
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8" fill="currentColor"/></svg>
              4.9 from your cohort
            </div>
            <div className="text-[11px] font-bold text-slate-500">- 3,214 have watched</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Shared stub sub-components
// ============================================================================

function StubHeader({ eyebrow, emoji, title, sub, gradient }:
  { eyebrow: string; emoji: string; title: string; sub: string; gradient: string }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-r ${gradient} p-[3px] shadow-lg`}>
      <div className="rounded-[15px] bg-white p-5 md:p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl">{emoji}</div>
          <div className="text-[11px] font-black uppercase tracking-[0.14em] text-indigo-700">{eyebrow}</div>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-1">{title}</h2>
        <p className="text-[13px] text-slate-600 font-medium">{sub}</p>
      </div>
    </div>
  );
}

function StatTile({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-2xl font-black mt-1 tabular-nums" style={{ color }}>{value}</div>
      <div className="text-[11px] text-slate-500 font-medium">{sub}</div>
    </div>
  );
}

function ReflectionCard({ question, chips }: { question: string; chips: string[] }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
      <div className="text-[14px] font-black text-slate-900 mb-3">{question}</div>
      <div className="flex flex-wrap gap-2">
        {chips.map(c => (
          <button key={c} className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-[12px] font-bold text-slate-800 border border-slate-200 hover:border-indigo-300 transition">
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function MealRow({ day, name, tone }: { day: string; name: string; tone: "emerald" | "amber" }) {
  const t = tone === "emerald" ? { bg: "#ECFDF5", ring: "#A7F3D0", fg: "#047857" } : { bg: "#FEF3C7", ring: "#FDE68A", fg: "#B45309" };
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl border" style={{ background: t.bg, borderColor: t.ring }}>
      <div className="w-10 h-10 rounded-full bg-white text-slate-700 flex items-center justify-center font-black text-[11px] shadow-sm">{day}</div>
      <div className="flex-1 text-[13px] font-bold text-slate-800">{name}</div>
      <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: t.fg }}>
        {tone === "emerald" ? "Protein-first" : "Flex meal"}
      </span>
    </div>
  );
}

function QuestionRow({ n, q, tag }: { n: number; q: string; tag: string }) {
  return (
    <button className="w-full text-left flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/60 transition">
      <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-[12px] shrink-0">{n}</span>
      <div className="flex-1">
        <div className="text-[13px] font-bold text-slate-800 leading-snug">{q}</div>
        <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 mt-1">{tag}</div>
      </div>
    </button>
  );
}
