/**
 * Five AI tools — one product, one visual language. Each returns
 * structured output inside <AIResponseBlock>, and each can honestly
 * refuse when it lacks data (devState "refusal" shows that state).
 */
import { AIToolId } from "../types";
import {
  scholarshipById,
  universityById,
  samplePathway,
} from "../mock/sample-data";
import { useApp } from "../state";
import {
  AIResponseBlock,
  DataValue,
  ErrorState,
  ScreenHeader,
  SkeletonLine,
  fmtDate,
  fmtMoney,
} from "../components/primitives";

export const TOOLS: {
  id: AIToolId;
  name: string;
  tagline: string;
  icon: string;
}[] = [
  {
    id: "pathway_generator",
    name: "Pathway Generator",
    tagline: "Your ranked route, from profile to campus",
    icon: "◆",
  },
  {
    id: "scholarship_finder",
    name: "Scholarship Finder",
    tagline: "Awards you actually qualify for, with deadlines",
    icon: "◈",
  },
  {
    id: "skill_gap",
    name: "Skill Gap Analyzer",
    tagline: "What's between you and your target programs",
    icon: "◧",
  },
  {
    id: "country_fit",
    name: "Country Fit",
    tagline: "Where your budget and goals travel best",
    icon: "◍",
  },
  {
    id: "career_projection",
    name: "Career Projection",
    tagline: "How each pathway maps to the job you want",
    icon: "◭",
  },
];

export function ToolsHubScreen() {
  const { navigate, profile } = useApp();
  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-4">
      <ScreenHeader
        title="Tools"
        subtitle="Five ways to interrogate your pathway — all working from the same profile"
      />
      {!profile && (
        <button
          type="button"
          onClick={() => navigate({ name: "intake" })}
          className="mb-4 w-full rounded-xl border border-accent/30 bg-accent-soft p-3 text-left"
        >
          <p className="text-[13px] font-semibold text-accent">
            Tools work best with your profile
          </p>
          <p className="text-[12px] text-stone-600">
            90 seconds of questions → every tool below gets personal.
          </p>
        </button>
      )}
      <ul className="space-y-2">
        {TOOLS.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => navigate({ name: "tool", id: t.id })}
              className="flex min-h-[64px] w-full items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 text-left hover:border-stone-300"
            >
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-lg text-accent"
              >
                {t.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-stone-900">
                  {t.name}
                </span>
                <span className="block text-[12px] text-stone-500">
                  {t.tagline}
                </span>
              </span>
              <span aria-hidden className="ml-auto text-stone-300">
                ›
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Individual tool result screens ─────────────────────────────────────────

const REFUSALS: Record<AIToolId, { explanation: string; clarifyingQuestion: string }> = {
  pathway_generator: {
    explanation:
      "I can't rank universities for you yet — I don't have your budget, and financial fit drives most of the ranking. Guessing it would give you a misleading list.",
    clarifyingQuestion:
      "Roughly how much can your family spend per year, including living costs?",
  },
  scholarship_finder: {
    explanation:
      "I don't have verified scholarship data for the country you asked about, and I won't estimate award amounts — a wrong number here could cost you a real application.",
    clarifyingQuestion:
      "Would you like me to search the three countries where I do have sourced scholarship data?",
  },
  skill_gap: {
    explanation:
      "I can't assess your skill gap for this program — the university hasn't published its entrance exam syllabus, so I don't know what it tests.",
    clarifyingQuestion:
      "Do you have last year's exam guide from them? If you upload it, I can map your gaps against it.",
  },
  country_fit: {
    explanation:
      "I don't have post-study work visa data for that country that I can source, and visa rules change too often to answer from memory.",
    clarifyingQuestion:
      "Is work-after-graduation the deciding factor for you, or should I compare on cost and admission odds first?",
  },
  career_projection: {
    explanation:
      "I can't project salaries for this career in that market — I have no sourced salary data there, and an invented figure would be worse than none.",
    clarifyingQuestion:
      "Should I show the career paths where I do have sourced data, or would a skills-demand view (no salary figures) help more?",
  },
};

function ToolFrame({
  toolId,
  children,
}: {
  toolId: AIToolId;
  children: React.ReactNode;
}) {
  const { navigate, devState } = useApp();
  const tool = TOOLS.find((t) => t.id === toolId)!;

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-4">
      <ScreenHeader
        title={tool.name}
        subtitle={tool.tagline}
        onBack={() => navigate({ name: "tools" })}
      />
      {devState === "loading" ? (
        <div
          aria-busy="true"
          className="rounded-xl border border-stone-200 bg-white p-4"
        >
          <SkeletonLine w="35%" h={11} />
          <div className="mt-3 space-y-2">
            <SkeletonLine />
            <SkeletonLine />
            <SkeletonLine w="60%" />
          </div>
        </div>
      ) : devState === "error" ? (
        <ErrorState retry={() => {}} />
      ) : devState === "refusal" ? (
        <AIResponseBlock variant="refusal" refusal={REFUSALS[toolId]} />
      ) : (
        children
      )}
      <p className="mt-4 text-center text-[11px] text-stone-400">
        Results use your saved profile. Structured, sourced — and the counselor
        says so when it doesn't know.
      </p>
    </div>
  );
}

export function ToolScreen({ toolId }: { toolId: AIToolId }) {
  const { navigate } = useApp();

  if (toolId === "pathway_generator") {
    return (
      <ToolFrame toolId={toolId}>
        <AIResponseBlock title="Pathway Generator">
          <p>{samplePathway.strategySummary}</p>
        </AIResponseBlock>
        <button
          type="button"
          onClick={() => navigate({ name: "results" })}
          className="mt-3 min-h-[48px] w-full rounded-xl bg-accent text-[15px] font-semibold text-white"
        >
          Open full pathway
        </button>
      </ToolFrame>
    );
  }

  if (toolId === "scholarship_finder") {
    return (
      <ToolFrame toolId={toolId}>
        <AIResponseBlock title="Scholarship Finder">
          <p className="mb-3">
            Five awards match your profile. Sorted by deadline — the January
            government scholarship is your highest-value target.
          </p>
        </AIResponseBlock>
        <ul className="mt-3 space-y-2">
          {samplePathway.matchedScholarshipIds.map((sid) => {
            const s = scholarshipById(sid);
            if (!s) return null;
            const uni = universityById(s.universityIds[0]);
            return (
              <li
                key={s.id}
                className="rounded-xl border border-stone-200 bg-white p-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[14px] font-semibold text-stone-900">
                    {s.name.replace(" (sample)", "")}
                  </p>
                  <span className="shrink-0 text-[13px] font-semibold text-accent">
                    <DataValue
                      point={s.award}
                      render={(a) =>
                        a.kind === "full_ride"
                          ? "Full ride"
                          : a.kind === "percent_tuition"
                            ? `${a.percent}% tuition`
                            : fmtMoney(a.money)
                      }
                    />
                  </span>
                </div>
                <p className="text-[12px] text-stone-500">
                  {uni?.name} · {s.type}
                </p>
                <div className="mt-1 text-[12px] text-stone-600">
                  Deadline: <DataValue point={s.deadline} render={fmtDate} />
                </div>
              </li>
            );
          })}
        </ul>
      </ToolFrame>
    );
  }

  if (toolId === "skill_gap") {
    return (
      <ToolFrame toolId={toolId}>
        <AIResponseBlock title="Skill Gap Analyzer">
          <p>
            Against your top-ranked target (Danubia CS), two gaps matter and
            one is already closed:
          </p>
        </AIResponseBlock>
        <ul className="mt-3 space-y-2">
          {[
            {
              status: "gap",
              title: "Entrance exam: math + logic",
              detail:
                "Danubia's online test covers calculus basics your school program hasn't reached yet. Their sample test is the fastest way to check.",
            },
            {
              status: "gap",
              title: "SAT (only if Anatolia stays on your list)",
              detail:
                "Anatolia asks for SAT 1200+ or their own exam. Registering for the exam skips the SAT entirely.",
            },
            {
              status: "ok",
              title: "English requirement",
              detail: "Your IELTS 6.5 clears every university on your list.",
            },
          ].map((g) => (
            <li
              key={g.title}
              className={`rounded-xl border p-3 ${
                g.status === "gap"
                  ? "border-amber-200 bg-amber-50"
                  : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <p
                className={`text-[13px] font-semibold ${
                  g.status === "gap" ? "text-amber-900" : "text-emerald-900"
                }`}
              >
                {g.status === "gap" ? "Gap · " : "Cleared · "}
                {g.title}
              </p>
              <p className="mt-0.5 text-[13px] text-stone-700">{g.detail}</p>
            </li>
          ))}
        </ul>
      </ToolFrame>
    );
  }

  if (toolId === "country_fit") {
    return (
      <ToolFrame toolId={toolId}>
        <AIResponseBlock title="Country Fit">
          <p>
            Ranked on your budget, language readiness, and stated preferences —
            costs below are sample fixtures with sources attached:
          </p>
        </AIResponseBlock>
        <ol className="mt-3 space-y-2">
          {(
            [
              ["uni-danubia", "Best overall — scholarship makes it affordable"],
              ["uni-anatolia", "Cheapest total cost that matches your field"],
              ["uni-hangang", "Strong programs; budget only works with a major award"],
              ["uni-alatau", "Close to home; lowest risk, lowest cost"],
            ] as const
          ).map(([uid, note], i) => {
            const u = universityById(uid);
            if (!u) return null;
            return (
              <li
                key={uid}
                className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-3"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-900 text-[12px] font-bold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-stone-900">
                    {u.country}
                  </p>
                  <p className="text-[12px] text-stone-500">{note}</p>
                  <p className="mt-1 text-[13px] font-medium text-stone-700">
                    Tuition:{" "}
                    <DataValue point={u.tuitionPerYear} render={fmtMoney} /> ·
                    Living:{" "}
                    <DataValue point={u.livingCostPerYear} render={fmtMoney} />
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </ToolFrame>
    );
  }

  // career_projection
  return (
    <ToolFrame toolId={toolId}>
      <AIResponseBlock title="Career Projection">
        <p>
          Your goal — software engineer — maps onto each pathway differently.
          No salary figures here: I don't have sourced salary data for these
          markets, so I'm showing structural factors instead.
        </p>
      </AIResponseBlock>
      <ul className="mt-3 space-y-2">
        {[
          {
            title: "Hungary (Danubia)",
            points: [
              "EU degree recognized across Europe",
              "English-speaking tech job market concentrated in Budapest",
            ],
          },
          {
            title: "Türkiye (Anatolia)",
            points: [
              "Dedicated AI engineering track is the closest program match",
              "Large domestic tech sector; language matters for local roles",
            ],
          },
          {
            title: "South Korea (Hangang)",
            points: [
              "Strong hardware/software industry ties",
              "Korean proficiency strongly affects hiring after graduation",
            ],
          },
        ].map((c) => (
          <li
            key={c.title}
            className="rounded-xl border border-stone-200 bg-white p-3"
          >
            <p className="text-[14px] font-semibold text-stone-900">{c.title}</p>
            <ul className="mt-1 space-y-1">
              {c.points.map((pt) => (
                <li key={pt} className="flex gap-2 text-[13px] text-stone-600">
                  <span aria-hidden className="text-stone-300">
                    –
                  </span>
                  {pt}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </ToolFrame>
  );
}
