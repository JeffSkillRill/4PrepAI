import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { createContext, useState, useContext, useId, useRef, useEffect, useMemo } from "react";
const Ctx = createContext(null);
function AppProvider({ children }) {
  const [route, setRoute] = useState({ name: "intake" });
  const [profile, setProfile] = useState(null);
  const [pathway, setPathway] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [devState, setDevState] = useState("normal");
  const [loggedIn, setLoggedIn] = useState(true);
  const navigate = (r) => {
    setRoute(r);
    window.scrollTo({ top: 0 });
  };
  return /* @__PURE__ */ jsx(
    Ctx.Provider,
    {
      value: {
        route,
        navigate,
        profile,
        setProfile,
        pathway,
        setPathway,
        savedPlans,
        setSavedPlans,
        compareIds,
        setCompareIds,
        devState,
        setDevState,
        loggedIn,
        setLoggedIn
      },
      children
    }
  );
}
function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside AppProvider");
  return v;
}
const known = (value, sourceId) => ({
  status: "known",
  value,
  sourceId
});
const unknown = (reason, suggestedAction) => ({ status: "unknown", reason, suggestedAction });
const sources = [
  {
    id: "src-uni-site",
    name: "SAMPLE — stands in for: university official website",
    url: "https://example.com/placeholder",
    retrievedAt: "2026-07-01",
    verification: "unverified_sample"
  },
  {
    id: "src-scholarship-portal",
    name: "SAMPLE — stands in for: scholarship program portal",
    url: "https://example.com/placeholder",
    retrievedAt: "2026-06-28",
    verification: "unverified_sample"
  },
  {
    id: "src-gov-agency",
    name: "SAMPLE — stands in for: national education agency",
    url: "https://example.com/placeholder",
    retrievedAt: "2026-06-15",
    verification: "unverified_sample"
  },
  {
    id: "src-numbeo-like",
    name: "SAMPLE — stands in for: cost-of-living database",
    url: "https://example.com/placeholder",
    retrievedAt: "2026-07-05",
    verification: "unverified_sample"
  }
];
const sourceById = (id) => sources.find((s) => s.id === id);
const universities = [
  {
    id: "uni-danubia",
    name: "Danubia Technical University",
    city: "Debrecen",
    country: "Hungary",
    countryCode: "HU",
    founded: known(1912, "src-uni-site"),
    languagesOfInstruction: ["English", "Hungarian"],
    tuitionPerYear: known(
      { amount: 6500, currency: "USD", period: "year" },
      "src-uni-site"
    ),
    livingCostPerYear: known(
      { amount: 4800, currency: "USD", period: "year" },
      "src-numbeo-like"
    ),
    applicationFee: known(
      { amount: 150, currency: "USD", period: "one_time" },
      "src-uni-site"
    ),
    acceptanceRate: unknown(
      "Not published by the university",
      "Ask the admissions office directly — we can draft the email"
    ),
    applicationDeadline: known("2026-11-15", "src-uni-site"),
    ieltsMinimum: known(6, "src-uni-site"),
    requirements: [
      {
        id: "req-dan-ielts",
        key: "ielts_min",
        label: "IELTS overall",
        requirement: known(6, "src-uni-site")
      },
      {
        id: "req-dan-gpa",
        key: "gpa_min",
        label: "Secondary school GPA",
        requirement: known("3.5 / 5.0 equivalent", "src-uni-site")
      },
      {
        id: "req-dan-exam",
        key: "entrance_exam",
        label: "Entrance examination",
        requirement: known("Online math + logic test", "src-uni-site")
      },
      {
        id: "req-dan-docs",
        key: "document",
        label: "Motivation letter",
        requirement: known("Required, max 500 words", "src-uni-site")
      }
    ],
    programs: [
      {
        id: "prog-dan-cs",
        name: "BSc Computer Science Engineering",
        degree: "bachelor",
        field: "Computer Science",
        durationYears: 3.5,
        languageOfInstruction: "English",
        tuitionPerYear: known(
          { amount: 6500, currency: "USD", period: "year" },
          "src-uni-site"
        )
      },
      {
        id: "prog-dan-ee",
        name: "BSc Electrical Engineering",
        degree: "bachelor",
        field: "Engineering",
        durationYears: 3.5,
        languageOfInstruction: "English",
        tuitionPerYear: unknown(
          "Not published by the university",
          "Check the faculty page or contact admissions"
        )
      }
    ],
    scholarshipIds: ["sch-state-hu", "sch-danubia-merit"],
    about: "A public technical university with a large international cohort and English-taught engineering programs."
  },
  {
    id: "uni-hangang",
    name: "Hangang National University",
    city: "Seoul",
    country: "South Korea",
    countryCode: "KR",
    founded: known(1954, "src-uni-site"),
    languagesOfInstruction: ["English", "Korean"],
    tuitionPerYear: known(
      { amount: 5900, currency: "USD", period: "year" },
      "src-uni-site"
    ),
    livingCostPerYear: known(
      { amount: 7200, currency: "USD", period: "year" },
      "src-numbeo-like"
    ),
    applicationFee: known(
      { amount: 80, currency: "USD", period: "one_time" },
      "src-uni-site"
    ),
    acceptanceRate: known(0.34, "src-uni-site"),
    applicationDeadline: known("2026-09-30", "src-uni-site"),
    ieltsMinimum: known(5.5, "src-uni-site"),
    requirements: [
      {
        id: "req-han-ielts",
        key: "ielts_min",
        label: "IELTS overall",
        requirement: known(5.5, "src-uni-site"),
        notes: "TOPIK 3+ accepted as an alternative for Korean-taught tracks"
      },
      {
        id: "req-han-gpa",
        key: "gpa_min",
        label: "Secondary school GPA",
        requirement: unknown(
          "Not published by the university",
          "Admissions reviews transcripts holistically — contact them for guidance"
        )
      },
      {
        id: "req-han-docs",
        key: "document",
        label: "Two recommendation letters",
        requirement: known("Required", "src-uni-site")
      }
    ],
    programs: [
      {
        id: "prog-han-cs",
        name: "BEng Software Convergence",
        degree: "bachelor",
        field: "Computer Science",
        durationYears: 4,
        languageOfInstruction: "English",
        tuitionPerYear: known(
          { amount: 5900, currency: "USD", period: "year" },
          "src-uni-site"
        )
      },
      {
        id: "prog-han-biz",
        name: "BBA Global Business",
        degree: "bachelor",
        field: "Business",
        durationYears: 4,
        languageOfInstruction: "English",
        tuitionPerYear: known(
          { amount: 5400, currency: "USD", period: "year" },
          "src-uni-site"
        )
      }
    ],
    scholarshipIds: ["sch-gks", "sch-hangang-intl"],
    about: "A private university in Seoul known for engineering and a structured international student track."
  },
  {
    id: "uni-anatolia",
    name: "Anatolia Institute of Technology",
    city: "Ankara",
    country: "Türkiye",
    countryCode: "TR",
    founded: known(1967, "src-uni-site"),
    languagesOfInstruction: ["English"],
    tuitionPerYear: known(
      { amount: 3800, currency: "USD", period: "year" },
      "src-uni-site"
    ),
    livingCostPerYear: known(
      { amount: 3600, currency: "USD", period: "year" },
      "src-numbeo-like"
    ),
    applicationFee: unknown(
      "Not published by the university",
      "The application portal shows the fee at checkout — verify before paying"
    ),
    acceptanceRate: known(0.21, "src-uni-site"),
    applicationDeadline: known("2026-08-10", "src-uni-site"),
    ieltsMinimum: known(6.5, "src-uni-site"),
    requirements: [
      {
        id: "req-ana-ielts",
        key: "ielts_min",
        label: "IELTS overall",
        requirement: known(6.5, "src-uni-site")
      },
      {
        id: "req-ana-exam",
        key: "entrance_exam",
        label: "SAT or institutional exam",
        requirement: known("SAT 1200+ or AIT entrance exam", "src-uni-site")
      },
      {
        id: "req-ana-gpa",
        key: "gpa_min",
        label: "Secondary school GPA",
        requirement: known("4.0 / 5.0 equivalent", "src-uni-site")
      }
    ],
    programs: [
      {
        id: "prog-ana-cs",
        name: "BSc Computer Engineering",
        degree: "bachelor",
        field: "Computer Science",
        durationYears: 4,
        languageOfInstruction: "English",
        tuitionPerYear: known(
          { amount: 3800, currency: "USD", period: "year" },
          "src-uni-site"
        )
      },
      {
        id: "prog-ana-ai",
        name: "BSc Artificial Intelligence Engineering",
        degree: "bachelor",
        field: "Computer Science",
        durationYears: 4,
        languageOfInstruction: "English",
        tuitionPerYear: known(
          { amount: 4100, currency: "USD", period: "year" },
          "src-uni-site"
        )
      }
    ],
    scholarshipIds: ["sch-turkiye-gov", "sch-ana-merit"],
    about: "A selective, research-oriented institute with all instruction in English and strong CS placement."
  },
  {
    id: "uni-alatau",
    name: "Alatau International University",
    city: "Almaty",
    country: "Kazakhstan",
    countryCode: "KZ",
    founded: known(1998, "src-uni-site"),
    languagesOfInstruction: ["English", "Russian", "Kazakh"],
    tuitionPerYear: known(
      { amount: 2900, currency: "USD", period: "year" },
      "src-uni-site"
    ),
    livingCostPerYear: known(
      { amount: 2400, currency: "USD", period: "year" },
      "src-numbeo-like"
    ),
    applicationFee: known(
      { amount: 25, currency: "USD", period: "one_time" },
      "src-uni-site"
    ),
    acceptanceRate: unknown("Not published by the university"),
    applicationDeadline: known("2027-01-20", "src-uni-site"),
    ieltsMinimum: known(5.5, "src-uni-site"),
    requirements: [
      {
        id: "req-ala-ielts",
        key: "ielts_min",
        label: "IELTS overall",
        requirement: known(5.5, "src-uni-site"),
        notes: "Internal English placement test accepted if no IELTS"
      },
      {
        id: "req-ala-docs",
        key: "document",
        label: "School diploma + transcript",
        requirement: known("Notarized translation required", "src-uni-site")
      }
    ],
    programs: [
      {
        id: "prog-ala-cs",
        name: "BSc Information Systems",
        degree: "bachelor",
        field: "Computer Science",
        durationYears: 4,
        languageOfInstruction: "English",
        tuitionPerYear: known(
          { amount: 2900, currency: "USD", period: "year" },
          "src-uni-site"
        )
      }
    ],
    scholarshipIds: ["sch-alatau-regional"],
    about: "A regional university close to home with an English-taught IT track and an internal English pathway for students without IELTS."
  }
];
const universityById = (id) => universities.find((u) => u.id === id);
const scholarships = [
  {
    id: "sch-state-hu",
    name: "State Bilateral Scholarship (sample)",
    provider: "Government program",
    type: "government",
    award: known({ kind: "full_ride" }, "src-gov-agency"),
    deadline: known("2027-01-15", "src-gov-agency"),
    eligibilitySummary: "Citizens of partner countries applying to state universities; requires separate government application.",
    universityIds: ["uni-danubia"]
  },
  {
    id: "sch-danubia-merit",
    name: "Danubia Merit Award (sample)",
    provider: "Danubia Technical University",
    type: "merit",
    award: known({ kind: "percent_tuition", percent: 50 }, "src-uni-site"),
    deadline: unknown(
      "Not published by the university",
      "Usually announced with admission results — ask admissions to confirm"
    ),
    eligibilitySummary: "Automatic consideration for applicants above the entrance exam threshold.",
    universityIds: ["uni-danubia"]
  },
  {
    id: "sch-gks",
    name: "Global Korea-style Government Scholarship (sample)",
    provider: "Government program",
    type: "government",
    award: known({ kind: "full_ride" }, "src-gov-agency"),
    deadline: known("2026-10-01", "src-gov-agency"),
    eligibilitySummary: "Highly competitive; covers tuition, stipend, and a language year. Applied through embassy or university track.",
    universityIds: ["uni-hangang"]
  },
  {
    id: "sch-hangang-intl",
    name: "Hangang International Excellence (sample)",
    provider: "Hangang National University",
    type: "university",
    award: known({ kind: "percent_tuition", percent: 30 }, "src-uni-site"),
    deadline: known("2026-09-30", "src-uni-site"),
    eligibilitySummary: "All international applicants with IELTS 6.0+ considered automatically.",
    universityIds: ["uni-hangang"]
  },
  {
    id: "sch-turkiye-gov",
    name: "National Scholarship Program (sample)",
    provider: "Government program",
    type: "government",
    award: known({ kind: "full_ride" }, "src-gov-agency"),
    deadline: known("2027-02-20", "src-gov-agency"),
    eligibilitySummary: "Covers tuition, housing, and stipend. Separate portal; essays and interview required.",
    universityIds: ["uni-anatolia"]
  },
  {
    id: "sch-ana-merit",
    name: "AIT Dean's Scholarship (sample)",
    provider: "Anatolia Institute of Technology",
    type: "merit",
    award: unknown(
      "Award amount not published",
      "Amounts vary by year — admissions confirms with the offer letter"
    ),
    deadline: known("2026-08-10", "src-uni-site"),
    eligibilitySummary: "Top entrance-exam performers; no separate application.",
    universityIds: ["uni-anatolia"]
  },
  {
    id: "sch-alatau-regional",
    name: "Alatau Regional Talent Grant (sample)",
    provider: "Alatau International University",
    type: "need",
    award: known({ kind: "percent_tuition", percent: 25 }, "src-uni-site"),
    deadline: known("2026-12-15", "src-uni-site"),
    eligibilitySummary: "Central Asian citizens with demonstrated financial need; short form plus household income letter.",
    universityIds: ["uni-alatau"]
  }
];
const scholarshipById = (id) => scholarships.find((s) => s.id === id);
const sampleProfile = {
  gpa: { value: 4.4, scale: 5 },
  budgetPerYear: { amount: 8e3, currency: "USD", period: "year" },
  english: { kind: "ielts", score: 6.5 },
  fieldOfInterest: "Computer Science",
  careerGoal: "Software engineer",
  geographyPreference: ["HU", "KR", "TR"],
  homeCity: "Tashkent"
};
const sampleFitScores = [
  {
    universityId: "uni-danubia",
    overall: 86,
    computedAt: "2026-07-20",
    components: [
      {
        key: "academic",
        label: "Academic fit",
        score: 88,
        reason: "Your 4.4/5 GPA is above their 3.5/5 equivalent minimum"
      },
      {
        key: "financial",
        label: "Financial fit",
        score: 82,
        reason: "Tuition + living (~$11,300/yr sample) exceeds your $8,000 budget — the state scholarship closes the gap"
      },
      {
        key: "language",
        label: "Language readiness",
        score: 95,
        reason: "Your IELTS 6.5 clears their 6.0 minimum"
      },
      {
        key: "career",
        label: "Career alignment",
        score: 84,
        reason: "English-taught CS engineering matches your software goal"
      },
      {
        key: "geographic",
        label: "Geographic alignment",
        score: 80,
        reason: "Hungary is your first-choice region"
      }
    ]
  },
  {
    universityId: "uni-anatolia",
    overall: 79,
    computedAt: "2026-07-20",
    components: [
      {
        key: "academic",
        label: "Academic fit",
        score: 72,
        reason: "Their SAT/entrance-exam requirement is a hurdle you haven't cleared yet"
      },
      {
        key: "financial",
        label: "Financial fit",
        score: 90,
        reason: "Tuition + living (~$7,400/yr sample) fits inside your $8,000 budget"
      },
      {
        key: "language",
        label: "Language readiness",
        score: 78,
        reason: "Your IELTS 6.5 meets their 6.5 minimum exactly — no margin"
      },
      {
        key: "career",
        label: "Career alignment",
        score: 88,
        reason: "Dedicated AI engineering program aligns with your goal"
      },
      {
        key: "geographic",
        label: "Geographic alignment",
        score: 68,
        reason: "Türkiye is your third-choice region"
      }
    ]
  },
  {
    universityId: "uni-hangang",
    overall: 74,
    computedAt: "2026-07-20",
    components: [
      {
        key: "academic",
        label: "Academic fit",
        score: 80,
        reason: "No published GPA minimum; your transcript is competitive"
      },
      {
        key: "financial",
        label: "Financial fit",
        score: 58,
        reason: "Seoul living costs push the total (~$13,100/yr sample) well past your budget without a major scholarship"
      },
      {
        key: "language",
        label: "Language readiness",
        score: 92,
        reason: "Your IELTS 6.5 clears their 5.5 minimum comfortably"
      },
      {
        key: "career",
        label: "Career alignment",
        score: 82,
        reason: "Software Convergence program matches your goal"
      },
      {
        key: "geographic",
        label: "Geographic alignment",
        score: 74,
        reason: "South Korea is your second-choice region"
      }
    ]
  },
  {
    universityId: "uni-alatau",
    overall: 71,
    computedAt: "2026-07-20",
    components: [
      {
        key: "academic",
        label: "Academic fit",
        score: 85,
        reason: "Your GPA is well above their published requirements"
      },
      {
        key: "financial",
        label: "Financial fit",
        score: 96,
        reason: "Total cost (~$5,300/yr sample) is far inside your budget"
      },
      {
        key: "language",
        label: "Language readiness",
        score: 93,
        reason: "Your IELTS 6.5 clears their 5.5 minimum"
      },
      {
        key: "career",
        label: "Career alignment",
        score: 60,
        reason: "Information Systems is adjacent to, not exactly, your software engineering goal"
      },
      {
        key: "geographic",
        label: "Geographic alignment",
        score: 55,
        reason: "Kazakhstan wasn't in your preference list — it's the close-to-home option"
      }
    ]
  }
];
const samplePathway = {
  id: "pathway-sample-1",
  createdAt: "2026-07-20",
  profileSnapshot: sampleProfile,
  strategySummary: "Your strongest route is Hungary: your IELTS and GPA already clear Danubia's bar, and the state scholarship — deadline January — is the single highest-leverage application you can make. Anatolia is your value pick if you can prepare for their entrance exam by August. Keep Hangang only if you're willing to chase the government scholarship; without it, Seoul breaks your budget. Alatau is a solid close-to-home fallback that needs almost nothing extra from you.",
  rankedUniversityIds: ["uni-danubia", "uni-anatolia", "uni-hangang", "uni-alatau"],
  fitScores: sampleFitScores,
  matchedScholarshipIds: [
    "sch-state-hu",
    "sch-turkiye-gov",
    "sch-danubia-merit",
    "sch-gks",
    "sch-alatau-regional"
  ],
  actionPlan: [
    {
      month: "2026-08",
      title: "Lock the target list",
      items: [
        "Confirm Anatolia entrance-exam date — their deadline is Aug 10",
        "Request notarized translations of your transcript",
        "Draft one master motivation letter to adapt per university"
      ]
    },
    {
      month: "2026-09",
      title: "First applications",
      items: [
        "Submit Hangang application (deadline Sep 30)",
        "Register for the government scholarship portal (Korea track, opens Oct 1)"
      ]
    },
    {
      month: "2026-10",
      title: "Scholarship season",
      items: [
        "Submit Korea government scholarship application",
        "Ask two teachers for recommendation letters"
      ]
    },
    {
      month: "2026-11",
      title: "Hungary deadline",
      items: [
        "Submit Danubia application (deadline Nov 15)",
        "Book IELTS retake only if a program asks for a higher band"
      ]
    },
    {
      month: "2027-01",
      title: "Government scholarships",
      items: [
        "Submit State Bilateral Scholarship (deadline Jan 15)",
        "Submit Alatau application as fallback (deadline Jan 20)"
      ]
    },
    {
      month: "2027-02",
      title: "Final applications",
      items: ["Submit National Scholarship Program, Türkiye (deadline Feb 20)"]
    },
    {
      month: "2027-04",
      title: "Decisions",
      items: [
        "Compare offers with the family using the Compare tool",
        "Confirm scholarship terms in writing before accepting"
      ]
    },
    {
      month: "2027-06",
      title: "Visa & housing",
      items: [
        "Start student visa application the week the acceptance letter arrives",
        "Apply for dormitory — cheapest options fill first"
      ]
    },
    {
      month: "2027-08",
      title: "Departure",
      items: [
        "Book flights 6+ weeks ahead",
        "Carry originals + notarized copies of every document"
      ]
    }
  ]
};
const STEPS = ["Grades", "Budget", "English", "Field", "Goal", "Where"];
function OptionButton({
  label,
  hint,
  selected,
  onClick
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      "aria-pressed": selected,
      onClick,
      className: `flex min-h-[52px] w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${selected ? "border-accent bg-accent-soft" : "border-stone-200 bg-white hover:border-stone-300"}`,
      children: [
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("span", { className: "block text-[15px] font-medium text-stone-900", children: label }),
          hint && /* @__PURE__ */ jsx("span", { className: "block text-[12px] text-stone-500", children: hint })
        ] }),
        /* @__PURE__ */ jsx(
          "span",
          {
            "aria-hidden": true,
            className: `flex h-5 w-5 items-center justify-center rounded-full border ${selected ? "border-accent bg-accent text-white" : "border-stone-300"}`,
            children: selected && /* @__PURE__ */ jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ jsx(
              "path",
              {
                d: "M5 13l4 4L19 7",
                stroke: "currentColor",
                strokeWidth: "3",
                strokeLinecap: "round"
              }
            ) })
          }
        )
      ]
    }
  );
}
function IntakeScreen() {
  const { navigate, setProfile, setPathway } = useApp();
  const [step, setStep] = useState(0);
  const [gpa, setGpa] = useState(null);
  const [budget, setBudget] = useState(null);
  const [currency] = useState("USD");
  const [englishKind, setEnglishKind] = useState(null);
  const [englishScore, setEnglishScore] = useState(null);
  const [planned, setPlanned] = useState(null);
  const [field, setField] = useState(null);
  const [goal, setGoal] = useState(null);
  const [geo, setGeo] = useState([]);
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const canContinue = [
    gpa !== null,
    budget !== null,
    englishKind === "none" ? true : englishKind !== null && englishScore !== null,
    field !== null,
    goal !== null,
    true
    // geography optional — "open to anywhere" is valid
  ][step];
  const finish = () => {
    const profile = {
      gpa: gpa !== null ? { value: gpa, scale: 5 } : void 0,
      budgetPerYear: { amount: budget ?? 0, currency, period: "year" },
      english: englishKind === "none" ? { kind: "none", plannedTestDate: planned ?? void 0 } : { kind: englishKind ?? "ielts", score: englishScore ?? void 0 },
      fieldOfInterest: field ?? "",
      careerGoal: goal ?? "",
      geographyPreference: geo,
      homeCity: "Tashkent"
    };
    setProfile(profile);
    setPathway({ ...samplePathway, profileSnapshot: profile });
    navigate({ name: "results" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto flex min-h-[80vh] max-w-md flex-col px-4 pt-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: back,
            disabled: step === 0,
            "aria-label": "Previous step",
            className: "flex h-11 w-11 items-center justify-center rounded-lg text-stone-500 disabled:opacity-0",
            children: /* @__PURE__ */ jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { d: "M15 18l-6-6 6-6", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }) })
          }
        ),
        /* @__PURE__ */ jsxs("span", { className: "text-[12px] font-medium text-stone-500", children: [
          step + 1,
          " of ",
          STEPS.length,
          " · ",
          STEPS[step]
        ] }),
        /* @__PURE__ */ jsx("span", { className: "w-11", "aria-hidden": true })
      ] }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "mt-2 h-1 rounded-full bg-stone-200",
          role: "progressbar",
          "aria-valuenow": step + 1,
          "aria-valuemin": 1,
          "aria-valuemax": STEPS.length,
          children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-1 rounded-full bg-accent transition-all",
              style: { width: `${(step + 1) / STEPS.length * 100}%` }
            }
          )
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
      step === 0 && /* @__PURE__ */ jsxs("fieldset", { children: [
        /* @__PURE__ */ jsx("legend", { className: "text-lg font-bold text-stone-900", children: "How are your grades?" }),
        /* @__PURE__ */ jsx("p", { className: "mb-4 mt-1 text-[13px] text-stone-500", children: "Your average on the 5-point scale. A rough answer is fine — you can edit this any time." }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [
          { v: 4.8, label: "Mostly 5s", hint: "≈ 4.6–5.0" },
          { v: 4.4, label: "5s and 4s", hint: "≈ 4.2–4.5" },
          { v: 3.9, label: "Mostly 4s", hint: "≈ 3.6–4.1" },
          { v: 3.3, label: "4s and 3s", hint: "≈ 3.0–3.5" }
        ].map((o) => /* @__PURE__ */ jsx(
          OptionButton,
          {
            label: o.label,
            hint: o.hint,
            selected: gpa === o.v,
            onClick: () => setGpa(o.v)
          },
          o.v
        )) })
      ] }),
      step === 1 && /* @__PURE__ */ jsxs("fieldset", { children: [
        /* @__PURE__ */ jsx("legend", { className: "text-lg font-bold text-stone-900", children: "What can your family spend per year?" }),
        /* @__PURE__ */ jsx("p", { className: "mb-4 mt-1 text-[13px] text-stone-500", children: "Tuition plus living costs, in US dollars. This shapes which scholarships matter most for you." }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [
          { v: 4e3, label: "Under $4,000" },
          { v: 8e3, label: "$4,000 – $8,000" },
          { v: 15e3, label: "$8,000 – $15,000" },
          { v: 25e3, label: "Over $15,000" }
        ].map((o) => /* @__PURE__ */ jsx(
          OptionButton,
          {
            label: o.label,
            selected: budget === o.v,
            onClick: () => setBudget(o.v)
          },
          o.v
        )) })
      ] }),
      step === 2 && /* @__PURE__ */ jsxs("fieldset", { children: [
        /* @__PURE__ */ jsx("legend", { className: "text-lg font-bold text-stone-900", children: "Do you have an English test score?" }),
        /* @__PURE__ */ jsx("p", { className: "mb-4 mt-1 text-[13px] text-stone-500", children: "Most students don't yet — that's completely fine. We'll plan around it." }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(
            OptionButton,
            {
              label: "I have an IELTS score",
              selected: englishKind === "ielts",
              onClick: () => setEnglishKind("ielts")
            }
          ),
          /* @__PURE__ */ jsx(
            OptionButton,
            {
              label: "I have a TOEFL score",
              selected: englishKind === "toefl",
              onClick: () => setEnglishKind("toefl")
            }
          ),
          /* @__PURE__ */ jsx(
            OptionButton,
            {
              label: "No test yet",
              hint: "We'll include test prep in your plan",
              selected: englishKind === "none",
              onClick: () => setEnglishKind("none")
            }
          )
        ] }),
        (englishKind === "ielts" || englishKind === "toefl") && /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "mb-2 text-[13px] font-medium text-stone-700", children: [
            "Your ",
            englishKind === "ielts" ? "IELTS band" : "TOEFL score"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: (englishKind === "ielts" ? [5, 5.5, 6, 6.5, 7, 7.5] : [60, 72, 80, 90, 100]).map((s) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              "aria-pressed": englishScore === s,
              onClick: () => setEnglishScore(s),
              className: `min-h-[44px] min-w-[56px] rounded-lg border text-[14px] font-semibold tabular-nums ${englishScore === s ? "border-accent bg-accent text-white" : "border-stone-300 bg-white text-stone-700"}`,
              children: s
            },
            s
          )) })
        ] }),
        englishKind === "none" && /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsx("p", { className: "mb-2 text-[13px] font-medium text-stone-700", children: "When could you take IELTS? (optional)" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: [
            { v: "2026-10", label: "In ~3 months" },
            { v: "2027-01", label: "In ~6 months" },
            { v: "unsure", label: "Not sure yet" }
          ].map((o) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              "aria-pressed": planned === o.v,
              onClick: () => setPlanned(o.v),
              className: `min-h-[44px] rounded-lg border px-4 text-[13px] font-medium ${planned === o.v ? "border-accent bg-accent text-white" : "border-stone-300 bg-white text-stone-700"}`,
              children: o.label
            },
            o.v
          )) })
        ] })
      ] }),
      step === 3 && /* @__PURE__ */ jsxs("fieldset", { children: [
        /* @__PURE__ */ jsx("legend", { className: "text-lg font-bold text-stone-900", children: "What do you want to study?" }),
        /* @__PURE__ */ jsx("p", { className: "mb-4 mt-1 text-[13px] text-stone-500", children: "Pick the closest — programs vary by university." }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: ["Computer Science", "Engineering", "Business", "Medicine", "Design"].map(
          (f) => /* @__PURE__ */ jsx(
            OptionButton,
            {
              label: f,
              selected: field === f,
              onClick: () => setField(f)
            },
            f
          )
        ) })
      ] }),
      step === 4 && /* @__PURE__ */ jsxs("fieldset", { children: [
        /* @__PURE__ */ jsx("legend", { className: "text-lg font-bold text-stone-900", children: "What's the goal after graduation?" }),
        /* @__PURE__ */ jsx("p", { className: "mb-4 mt-1 text-[13px] text-stone-500", children: "This tunes career alignment in your fit scores." }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [
          "Software engineer",
          "Start a company",
          "Work abroad after graduating",
          "Return home with a strong degree",
          "Not sure yet"
        ].map((g) => /* @__PURE__ */ jsx(
          OptionButton,
          {
            label: g,
            selected: goal === g,
            onClick: () => setGoal(g)
          },
          g
        )) })
      ] }),
      step === 5 && /* @__PURE__ */ jsxs("fieldset", { children: [
        /* @__PURE__ */ jsx("legend", { className: "text-lg font-bold text-stone-900", children: "Where would you like to go?" }),
        /* @__PURE__ */ jsx("p", { className: "mb-4 mt-1 text-[13px] text-stone-500", children: "Choose up to three, in order of preference — or skip to stay open to anywhere." }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [
          { code: "HU", label: "Hungary" },
          { code: "KR", label: "South Korea" },
          { code: "TR", label: "Türkiye" },
          { code: "KZ", label: "Kazakhstan" }
        ].map((c) => {
          const idx = geo.indexOf(c.code);
          return /* @__PURE__ */ jsx(
            OptionButton,
            {
              label: c.label,
              hint: idx >= 0 ? `Choice ${idx + 1}` : void 0,
              selected: idx >= 0,
              onClick: () => setGeo(
                (g) => g.includes(c.code) ? g.filter((x) => x !== c.code) : g.length < 3 ? [...g, c.code] : g
              )
            },
            c.code
          );
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "sticky bottom-20 mt-6 pb-2", children: [
      step < STEPS.length - 1 ? /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: next,
          disabled: !canContinue,
          className: "min-h-[48px] w-full rounded-xl bg-accent text-[15px] font-semibold text-white disabled:bg-stone-300",
          children: "Continue"
        }
      ) : /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: finish,
          className: "min-h-[48px] w-full rounded-xl bg-accent text-[15px] font-semibold text-white",
          children: "Build my pathway"
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-[11px] text-stone-400", children: "Everything here stays editable from your results." })
    ] })
  ] });
}
const fmtMoney = (m) => {
  const sym = { USD: "$", EUR: "€" };
  const n = m.amount.toLocaleString("en-US");
  const core = sym[m.currency] ? `${sym[m.currency]}${n}` : `${n} ${m.currency}`;
  const per = {
    year: "/yr",
    semester: "/sem",
    month: "/mo",
    one_time: ""
  };
  return `${core}${per[m.period] ?? ""}`;
};
const fmtDate = (iso) => (/* @__PURE__ */ new Date(iso + (iso.length === 7 ? "-01" : ""))).toLocaleDateString("en-US", {
  day: iso.length === 7 ? void 0 : "numeric",
  month: "short",
  year: "numeric"
});
const fmtMonth = (iso) => (/* @__PURE__ */ new Date(iso + "-01")).toLocaleDateString("en-US", {
  month: "long",
  year: "numeric"
});
function SourceChip({ sourceId }) {
  const [open, setOpen] = useState(false);
  const src = sourceById(sourceId);
  const id = useId();
  if (!src) return null;
  return /* @__PURE__ */ jsxs("span", { className: "relative inline-flex", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        "aria-expanded": open,
        "aria-controls": id,
        onClick: (e) => {
          e.stopPropagation();
          setOpen(!open);
        },
        className: "ml-1 inline-flex min-h-[24px] items-center gap-0.5 rounded-full border border-stone-300 bg-white px-1.5 text-[10px] font-medium text-stone-500 hover:border-accent hover:text-accent",
        title: `Source: ${src.name}`,
        children: [
          /* @__PURE__ */ jsx("svg", { width: "9", height: "9", viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, children: /* @__PURE__ */ jsx(
            "path",
            {
              d: "M12 2 3 7v2h18V7l-9-5Zm-7 9v7H3v3h18v-3h-2v-7h-3v7h-3v-7h-2v7H8v-7H5Z",
              fill: "currentColor"
            }
          ) }),
          "src"
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs(
      "span",
      {
        id,
        role: "tooltip",
        className: "absolute bottom-full left-1/2 z-40 mb-1.5 w-56 -translate-x-1/2 rounded-lg border border-stone-200 bg-white p-2.5 text-left shadow-lg",
        children: [
          /* @__PURE__ */ jsx("span", { className: "block text-[11px] font-semibold leading-snug text-stone-800", children: src.name }),
          /* @__PURE__ */ jsxs("span", { className: "mt-1 block text-[10px] text-stone-500", children: [
            "Retrieved ",
            fmtDate(src.retrievedAt)
          ] }),
          src.verification === "unverified_sample" && /* @__PURE__ */ jsx("span", { className: "mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800", children: "Sample — not verified" })
        ]
      }
    )
  ] });
}
function MissingValue({
  reason,
  suggestedAction,
  compact
}) {
  if (compact) {
    return /* @__PURE__ */ jsxs(
      "span",
      {
        className: "inline-flex items-center gap-1 text-[13px] italic text-stone-500",
        title: suggestedAction,
        children: [
          /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "text-stone-400", children: "◌" }),
          reason
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-dashed border-stone-300 bg-stone-50 px-3 py-2", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[13px] italic text-stone-600", children: reason }),
    suggestedAction && /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-[12px] text-accent", children: [
      "→ ",
      suggestedAction
    ] })
  ] });
}
function DataValue({
  point,
  render,
  compactMissing = true,
  className = ""
}) {
  if (point.status === "unknown") {
    return /* @__PURE__ */ jsx(
      MissingValue,
      {
        reason: point.reason,
        suggestedAction: point.suggestedAction,
        compact: compactMissing
      }
    );
  }
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-baseline ${className}`, children: [
    /* @__PURE__ */ jsx("span", { children: render(point.value) }),
    /* @__PURE__ */ jsx(SourceChip, { sourceId: point.sourceId })
  ] });
}
const tone = (score) => score >= 80 ? "bg-emerald-50 text-emerald-800 border-emerald-200" : score >= 60 ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-stone-100 text-stone-600 border-stone-200";
function FitScoreBadge({
  score,
  size = "md"
}) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: `inline-flex items-center justify-center rounded-lg border font-semibold tabular-nums ${tone(
        score
      )} ${size === "lg" ? "h-12 w-12 text-lg" : "h-10 w-10 text-sm"}`,
      "aria-label": `Fit score ${score} out of 100`,
      children: score
    }
  );
}
function FitBreakdown({ fit }) {
  return /* @__PURE__ */ jsx("ul", { className: "space-y-2.5", children: fit.components.map((c) => /* @__PURE__ */ jsxs("li", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[13px] font-medium text-stone-800", children: c.label }),
      /* @__PURE__ */ jsx("span", { className: "text-[13px] font-semibold tabular-nums text-stone-700", children: c.score })
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "mt-1 h-1.5 w-full rounded-full bg-stone-200",
        role: "img",
        "aria-label": `${c.label}: ${c.score} out of 100`,
        children: /* @__PURE__ */ jsx(
          "div",
          {
            className: `h-1.5 rounded-full ${c.score >= 80 ? "bg-emerald-500" : c.score >= 60 ? "bg-amber-500" : "bg-stone-400"}`,
            style: { width: `${c.score}%` }
          }
        )
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-[12px] leading-snug text-stone-500", children: c.reason })
  ] }, c.key)) });
}
function ExpandableFit({ fit }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        "aria-expanded": open,
        "aria-controls": id,
        onClick: (e) => {
          e.stopPropagation();
          setOpen(!open);
        },
        className: "flex min-h-[44px] w-full items-center gap-3 rounded-lg px-1 text-left",
        children: [
          /* @__PURE__ */ jsx(FitScoreBadge, { score: fit.overall }),
          /* @__PURE__ */ jsxs("span", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("span", { className: "block text-[13px] font-medium text-stone-800", children: "Fit score" }),
            /* @__PURE__ */ jsxs("span", { className: "block text-[11px] text-stone-500", children: [
              open ? "Hide" : "See",
              " the five components"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "svg",
            {
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              "aria-hidden": true,
              className: `text-stone-400 transition-transform ${open ? "rotate-180" : ""}`,
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  d: "m6 9 6 6 6-6",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round"
                }
              )
            }
          )
        ]
      }
    ),
    open && /* @__PURE__ */ jsx("div", { id, className: "mt-2 rounded-lg bg-stone-50 p-3", children: /* @__PURE__ */ jsx(FitBreakdown, { fit }) })
  ] });
}
function AIResponseBlock({
  title = "Your counselor",
  children,
  variant = "ok",
  refusal
}) {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      "aria-label": title,
      className: "rounded-xl border border-stone-200 bg-white p-4",
      children: [
        /* @__PURE__ */ jsxs("header", { className: "mb-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              "aria-hidden": true,
              className: "flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-[11px] font-bold text-accent",
              children: "4P"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-[12px] font-semibold uppercase tracking-wide text-stone-500", children: title }),
          /* @__PURE__ */ jsx("span", { className: "ml-auto rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-500", children: "AI · based on your profile" })
        ] }),
        variant === "refusal" && refusal ? /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[14px] leading-relaxed text-stone-800", children: refusal.explanation }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-lg border border-accent/20 bg-accent-soft p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[12px] font-semibold uppercase tracking-wide text-accent", children: "To help you better" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-[14px] text-stone-800", children: refusal.clarifyingQuestion })
          ] })
        ] }) : /* @__PURE__ */ jsx("div", { className: "text-[14px] leading-relaxed text-stone-800", children })
      ]
    }
  );
}
function SkeletonLine({ w = "100%", h = 14 }) {
  return /* @__PURE__ */ jsx("div", { className: "skeleton", style: { width: w, height: h }, "aria-hidden": true });
}
function SkeletonCard() {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "rounded-xl border border-stone-200 bg-white p-4",
      role: "status",
      "aria-label": "Loading",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "skeleton h-10 w-10" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
            /* @__PURE__ */ jsx(SkeletonLine, { w: "60%" }),
            /* @__PURE__ */ jsx(SkeletonLine, { w: "40%", h: 11 })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2", children: [
          /* @__PURE__ */ jsx(SkeletonLine, {}),
          /* @__PURE__ */ jsx(SkeletonLine, { w: "80%" })
        ] })
      ]
    }
  );
}
function ScreenHeader({
  title,
  subtitle,
  onBack,
  action
}) {
  return /* @__PURE__ */ jsxs("header", { className: "mb-4 flex items-start gap-2", children: [
    onBack && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: onBack,
        "aria-label": "Back",
        className: "-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100",
        children: /* @__PURE__ */ jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, children: /* @__PURE__ */ jsx(
          "path",
          {
            d: "M15 18l-6-6 6-6",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round"
          }
        ) })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold tracking-tight text-stone-900", children: title }),
      subtitle && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[13px] text-stone-500", children: subtitle })
    ] }),
    action
  ] });
}
function EmptyState({
  icon = "○",
  title,
  body,
  cta
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center", children: [
    /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "text-2xl text-stone-300", children: icon }),
    /* @__PURE__ */ jsx("h2", { className: "mt-2 text-[15px] font-semibold text-stone-800", children: title }),
    /* @__PURE__ */ jsx("p", { className: "mx-auto mt-1 max-w-[28ch] text-[13px] text-stone-500", children: body }),
    cta && /* @__PURE__ */ jsx("div", { className: "mt-4", children: cta })
  ] });
}
function ErrorState({ retry }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "alert",
      className: "rounded-xl border border-red-200 bg-red-50 px-5 py-6 text-center",
      children: [
        /* @__PURE__ */ jsx("h2", { className: "text-[15px] font-semibold text-red-900", children: "Something went wrong on our side" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-[13px] text-red-700", children: "Your profile and saved plans are untouched." }),
        retry && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: retry,
            className: "mt-3 min-h-[44px] rounded-lg bg-red-700 px-5 text-[14px] font-semibold text-white",
            children: "Try again"
          }
        )
      ]
    }
  );
}
function OfflineState() {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "status",
      className: "rounded-xl border border-stone-300 bg-stone-100 px-5 py-6 text-center",
      children: [
        /* @__PURE__ */ jsx("h2", { className: "text-[15px] font-semibold text-stone-800", children: "You're offline" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-[13px] text-stone-600", children: "Showing your last loaded results. Deadlines and figures may be out of date until you reconnect." })
      ]
    }
  );
}
function UniversityCard({
  university,
  fit,
  rank,
  onOpen,
  onToggleCompare,
  inCompare
}) {
  const scholarships2 = university.scholarshipIds.map(scholarshipById).filter(Boolean);
  return /* @__PURE__ */ jsxs("article", { className: "rounded-xl border border-stone-200 bg-white p-4", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: onOpen,
        className: "block w-full text-left",
        "aria-label": `Open ${university.name}`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            rank !== void 0 && /* @__PURE__ */ jsx(
              "span",
              {
                "aria-label": `Rank ${rank}`,
                className: "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-900 text-[12px] font-bold text-white",
                children: rank
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-[15px] font-semibold leading-snug text-stone-900", children: university.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-[12px] text-stone-500", children: [
                university.city,
                ", ",
                university.country,
                " ·",
                " ",
                university.languagesOfInstruction.join(" / ")
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("dl", { className: "mt-3 grid grid-cols-2 gap-x-3 gap-y-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-[11px] uppercase tracking-wide text-stone-400", children: "Tuition" }),
              /* @__PURE__ */ jsx("dd", { className: "text-[14px] font-semibold text-stone-800", children: /* @__PURE__ */ jsx(DataValue, { point: university.tuitionPerYear, render: fmtMoney }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-[11px] uppercase tracking-wide text-stone-400", children: "Deadline" }),
              /* @__PURE__ */ jsx("dd", { className: "text-[14px] font-semibold text-stone-800", children: /* @__PURE__ */ jsx(
                DataValue,
                {
                  point: university.applicationDeadline,
                  render: fmtDate
                }
              ) })
            ] })
          ] })
        ]
      }
    ),
    fit && /* @__PURE__ */ jsx("div", { className: "mt-3 border-t border-stone-100 pt-2", children: /* @__PURE__ */ jsx(ExpandableFit, { fit }) }),
    scholarships2.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: scholarships2.map(
      (s) => s && /* @__PURE__ */ jsx(
        "span",
        {
          className: "rounded-full bg-accent-soft px-2 py-1 text-[11px] font-medium text-accent",
          children: s.name.replace(" (sample)", "")
        },
        s.id
      )
    ) }),
    onToggleCompare && /* @__PURE__ */ jsx("div", { className: "mt-3 flex justify-end border-t border-stone-100 pt-2", children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: onToggleCompare,
        "aria-pressed": inCompare,
        className: `min-h-[44px] rounded-lg px-3 text-[13px] font-medium ${inCompare ? "bg-accent text-white" : "text-accent hover:bg-accent-soft"}`,
        children: inCompare ? "✓ In compare" : "+ Compare"
      }
    ) })
  ] });
}
function ResultsScreen() {
  const {
    navigate,
    pathway,
    profile,
    devState,
    savedPlans,
    setSavedPlans,
    compareIds,
    setCompareIds
  } = useApp();
  if (devState === "loading") {
    return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md px-4 pt-4", children: [
      /* @__PURE__ */ jsx(ScreenHeader, { title: "Your pathway", subtitle: "Building your plan…" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", "aria-busy": "true", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-stone-200 bg-white p-4", children: [
          /* @__PURE__ */ jsx(SkeletonLine, { w: "30%", h: 11 }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-2", children: [
            /* @__PURE__ */ jsx(SkeletonLine, {}),
            /* @__PURE__ */ jsx(SkeletonLine, {}),
            /* @__PURE__ */ jsx(SkeletonLine, { w: "70%" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(SkeletonCard, {}),
        /* @__PURE__ */ jsx(SkeletonCard, {})
      ] })
    ] });
  }
  if (devState === "error") {
    return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md px-4 pt-4", children: [
      /* @__PURE__ */ jsx(ScreenHeader, { title: "Your pathway" }),
      /* @__PURE__ */ jsx(ErrorState, { retry: () => {
      } })
    ] });
  }
  const effectivePathway = devState === "empty" ? null : pathway ?? samplePathway;
  if (!effectivePathway) {
    return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md px-4 pt-4", children: [
      /* @__PURE__ */ jsx(ScreenHeader, { title: "Your pathway" }),
      /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: "◇",
          title: "No pathway yet",
          body: "Answer six quick questions and we'll rank universities that fit your grades, budget, and goals.",
          cta: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => navigate({ name: "intake" }),
              className: "min-h-[44px] rounded-lg bg-accent px-5 text-[14px] font-semibold text-white",
              children: "Start — about 90 seconds"
            }
          )
        }
      )
    ] });
  }
  const p = effectivePathway;
  const isSaved = savedPlans.some((s) => s.id === p.id);
  const englishNote = profile?.english.kind === "none" ? "You told us you don't have an IELTS score yet — your plan includes test prep before the first deadline." : null;
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md px-4 pb-24 pt-4", children: [
    /* @__PURE__ */ jsx(
      ScreenHeader,
      {
        title: "Your pathway",
        subtitle: `Based on your profile · ${p.rankedUniversityIds.length} matches`,
        action: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => navigate({ name: "intake" }),
            className: "min-h-[44px] rounded-lg px-3 text-[13px] font-medium text-accent",
            children: "Edit profile"
          }
        )
      }
    ),
    devState === "offline" && /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsx(OfflineState, {}) }),
    /* @__PURE__ */ jsxs(AIResponseBlock, { title: "Strategy summary", children: [
      /* @__PURE__ */ jsx("p", { children: p.strategySummary }),
      englishNote && /* @__PURE__ */ jsx("p", { className: "mt-2 rounded-lg bg-stone-50 p-2.5 text-[13px] text-stone-600", children: englishNote })
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "mb-2 mt-6 text-[13px] font-semibold uppercase tracking-wide text-stone-500", children: "Ranked for you" }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children: p.rankedUniversityIds.map((id, i) => {
      const u = universityById(id);
      const fit = p.fitScores.find((f) => f.universityId === id);
      if (!u) return null;
      return /* @__PURE__ */ jsx(
        UniversityCard,
        {
          university: u,
          fit,
          rank: i + 1,
          onOpen: () => navigate({ name: "university", id }),
          inCompare: compareIds.includes(id),
          onToggleCompare: () => setCompareIds(
            (c) => c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c
          )
        },
        id
      );
    }) }),
    /* @__PURE__ */ jsx("h2", { className: "mb-2 mt-8 text-[13px] font-semibold uppercase tracking-wide text-stone-500", children: "Your plan, month by month" }),
    /* @__PURE__ */ jsx("ol", { className: "relative ml-2 space-y-5 border-l border-stone-200 pb-2 pl-5", children: p.actionPlan.map((m) => /* @__PURE__ */ jsxs("li", { className: "relative", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          "aria-hidden": true,
          className: "absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white bg-accent"
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-[12px] font-semibold uppercase tracking-wide text-accent", children: fmtMonth(m.month) }),
      /* @__PURE__ */ jsx("p", { className: "text-[14px] font-semibold text-stone-900", children: m.title }),
      /* @__PURE__ */ jsx("ul", { className: "mt-1 space-y-1", children: m.items.map((it, j) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2 text-[13px] text-stone-600", children: [
        /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "text-stone-300", children: "–" }),
        it
      ] }, j)) })
    ] }, m.month)) }),
    /* @__PURE__ */ jsx("div", { className: "fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md px-4", children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        disabled: isSaved,
        onClick: () => setSavedPlans((s) => [
          ...s,
          { ...p, savedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) }
        ]),
        className: `min-h-[48px] w-full rounded-xl text-[15px] font-semibold shadow-lg ${isSaved ? "bg-emerald-600 text-white" : "bg-stone-900 text-white hover:bg-stone-800"}`,
        children: isSaved ? "✓ Plan saved" : "Save this plan"
      }
    ) })
  ] });
}
function Section({
  title,
  children
}) {
  return /* @__PURE__ */ jsxs("section", { className: "mt-6", children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-2 text-[13px] font-semibold uppercase tracking-wide text-stone-500", children: title }),
    children
  ] });
}
const awardLabel = (a) => a.kind === "full_ride" ? "Full ride" : a.kind === "percent_tuition" ? `${a.percent}% of tuition` : fmtMoney(a.money);
function CompareRow$1({
  req,
  profile
}) {
  let verdict = null;
  if (req.requirement.status === "known" && profile) {
    if (req.key === "ielts_min") {
      if (profile.english.kind === "ielts" && profile.english.score != null) {
        const min = Number(req.requirement.value);
        const s = profile.english.score;
        verdict = s >= min ? {
          label: `You clear it — your ${s} vs their ${min}`,
          cls: "text-emerald-700 bg-emerald-50"
        } : {
          label: `Below their ${min} — you have ${s}`,
          cls: "text-amber-800 bg-amber-50"
        };
      } else if (profile.english.kind === "none") {
        verdict = {
          label: "No score yet — plan a test before the deadline",
          cls: "text-stone-600 bg-stone-100"
        };
      }
    }
    if (req.key === "gpa_min" && profile.gpa) {
      verdict = {
        label: `Your GPA: ${profile.gpa.value}/${profile.gpa.scale}`,
        cls: "text-stone-600 bg-stone-100"
      };
    }
  }
  return /* @__PURE__ */ jsxs("li", { className: "rounded-lg border border-stone-200 bg-white p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[13px] font-medium text-stone-800", children: req.label }),
      /* @__PURE__ */ jsx("span", { className: "text-[13px] font-semibold text-stone-800", children: /* @__PURE__ */ jsx(DataValue, { point: req.requirement, render: (v) => String(v) }) })
    ] }),
    req.notes && /* @__PURE__ */ jsx("p", { className: "mt-1 text-[12px] text-stone-500", children: req.notes }),
    verdict && /* @__PURE__ */ jsx(
      "p",
      {
        className: `mt-1.5 inline-block rounded px-2 py-0.5 text-[12px] font-medium ${verdict.cls}`,
        children: verdict.label
      }
    )
  ] });
}
function UniversityProfileScreen({ id }) {
  const { navigate, profile, devState } = useApp();
  const u = universityById(id);
  if (devState === "loading") {
    return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md px-4 pt-4", "aria-busy": "true", children: [
      /* @__PURE__ */ jsx(SkeletonCard, {}),
      /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(SkeletonCard, {}) })
    ] });
  }
  if (devState === "error" || !u) {
    return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md px-4 pt-4", children: [
      /* @__PURE__ */ jsx(ScreenHeader, { title: "University", onBack: () => navigate({ name: "results" }) }),
      /* @__PURE__ */ jsx(ErrorState, { retry: () => {
      } })
    ] });
  }
  const fit = sampleFitScores.find((f) => f.universityId === u.id);
  const partial = devState === "partial";
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md px-4 pb-24 pt-4", children: [
    /* @__PURE__ */ jsx(
      ScreenHeader,
      {
        title: u.name,
        subtitle: `${u.city}, ${u.country} · Founded ${u.founded.status === "known" ? u.founded.value : "—"}`,
        onBack: () => navigate({ name: "results" })
      }
    ),
    devState === "offline" && /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsx(OfflineState, {}) }),
    u.about && /* @__PURE__ */ jsx("p", { className: "text-[14px] text-stone-600", children: u.about }),
    /* @__PURE__ */ jsx(Section, { title: "Costs", children: /* @__PURE__ */ jsxs("dl", { className: "grid grid-cols-1 gap-2", children: [
      [
        ["Tuition", u.tuitionPerYear],
        ["Living costs", u.livingCostPerYear],
        ["Application fee", partial ? { status: "unknown", reason: "Couldn't load this figure", suggestedAction: "Reconnect to refresh" } : u.applicationFee]
      ].map(([label, point]) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2.5",
          children: [
            /* @__PURE__ */ jsx("dt", { className: "text-[13px] text-stone-600", children: label }),
            /* @__PURE__ */ jsx("dd", { className: "text-[14px] font-semibold text-stone-900", children: /* @__PURE__ */ jsx(DataValue, { point, render: fmtMoney }) })
          ]
        },
        label
      )),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2.5", children: [
        /* @__PURE__ */ jsx("dt", { className: "text-[13px] text-stone-600", children: "Acceptance rate" }),
        /* @__PURE__ */ jsx("dd", { className: "text-[14px] font-semibold text-stone-900", children: /* @__PURE__ */ jsx(
          DataValue,
          {
            point: u.acceptanceRate,
            render: (v) => `${Math.round(v * 100)}%`
          }
        ) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Section, { title: "Key deadline", children: /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-stone-200 bg-white px-3 py-2.5", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[14px] font-semibold text-stone-900", children: /* @__PURE__ */ jsx(DataValue, { point: u.applicationDeadline, render: fmtDate }) }),
      /* @__PURE__ */ jsx("span", { className: "ml-2 text-[12px] text-stone-500", children: "application deadline" })
    ] }) }),
    /* @__PURE__ */ jsx(Section, { title: "Programs", children: /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: u.programs.map((prog) => /* @__PURE__ */ jsxs(
      "li",
      {
        className: "rounded-lg border border-stone-200 bg-white p-3",
        children: [
          /* @__PURE__ */ jsx("p", { className: "text-[14px] font-semibold text-stone-900", children: prog.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-[12px] text-stone-500", children: [
            prog.durationYears,
            " years · ",
            prog.languageOfInstruction
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 text-[13px] font-medium text-stone-800", children: /* @__PURE__ */ jsx(DataValue, { point: prog.tuitionPerYear, render: fmtMoney, compactMissing: false }) })
        ]
      },
      prog.id
    )) }) }),
    /* @__PURE__ */ jsx(Section, { title: "Requirements — how you compare", children: profile ? /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: u.requirements.map((r) => /* @__PURE__ */ jsx(CompareRow$1, { req: r, profile }, r.id)) }) : /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: u.requirements.map((r) => /* @__PURE__ */ jsx(CompareRow$1, { req: r, profile: null }, r.id)) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => navigate({ name: "intake" }),
          className: "mt-3 min-h-[44px] w-full rounded-lg border border-accent text-[13px] font-semibold text-accent",
          children: "Enter your profile to see how you compare"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(Section, { title: "Scholarships here", children: /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: u.scholarshipIds.map((sid) => {
      const s = scholarshipById(sid);
      if (!s) return null;
      return /* @__PURE__ */ jsxs(
        "li",
        {
          className: "rounded-lg border border-stone-200 bg-white p-3",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[14px] font-semibold text-stone-900", children: s.name.replace(" (sample)", "") }),
              /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[13px] font-semibold text-accent", children: /* @__PURE__ */ jsx(DataValue, { point: s.award, render: awardLabel }) })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-[12px] text-stone-500", children: s.eligibilitySummary }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1.5 text-[12px] text-stone-600", children: [
              "Deadline:",
              " ",
              /* @__PURE__ */ jsx(DataValue, { point: s.deadline, render: fmtDate })
            ] })
          ]
        },
        s.id
      );
    }) }) }),
    fit && /* @__PURE__ */ jsx(Section, { title: "Your fit", children: /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-stone-200 bg-white p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(FitScoreBadge, { score: fit.overall, size: "lg" }),
        /* @__PURE__ */ jsx("p", { className: "text-[13px] text-stone-500", children: "Built from five components — each with its reason." })
      ] }),
      /* @__PURE__ */ jsx(FitBreakdown, { fit })
    ] }) }),
    !profile && /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      MissingValue,
      {
        reason: "Fit score needs your profile",
        suggestedAction: "Complete the 90-second intake to see your fit",
        compact: false
      }
    ) })
  ] });
}
const emptyFilters = {
  budgetMax: null,
  country: null,
  field: null,
  language: null,
  ieltsMax: null,
  deadlineOpenOnly: false
};
function activeFilterCount(f) {
  return [
    f.budgetMax !== null,
    f.country !== null,
    f.field !== null,
    f.language !== null,
    f.ieltsMax !== null,
    f.deadlineOpenOnly
  ].filter(Boolean).length;
}
function Chip({
  label,
  selected,
  onClick
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      "aria-pressed": selected,
      onClick,
      className: `min-h-[44px] rounded-full border px-4 text-[13px] font-medium ${selected ? "border-accent bg-accent text-white" : "border-stone-300 bg-white text-stone-700"}`,
      children: label
    }
  );
}
function Row({ label, children }) {
  return /* @__PURE__ */ jsxs("fieldset", { className: "border-b border-stone-100 py-3", children: [
    /* @__PURE__ */ jsx("legend", { className: "mb-2 text-[12px] font-semibold uppercase tracking-wide text-stone-500", children: label }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children })
  ] });
}
function FilterSheet({
  open,
  onClose,
  filters,
  onChange,
  resultCount
}) {
  const sheetRef = useRef(null);
  useEffect(() => {
    if (open) sheetRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  const set = (k, v) => onChange({ ...filters, [k]: v });
  const toggle = (k, v) => set(k, filters[k] === v ? null : v);
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50", role: "dialog", "aria-modal": "true", "aria-label": "Filters", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        "aria-label": "Close filters",
        onClick: onClose,
        className: "absolute inset-0 bg-stone-900/40"
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: sheetRef,
        tabIndex: -1,
        className: "absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white px-4 pb-4 pt-2 shadow-2xl",
        children: [
          /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "mx-auto mb-2 h-1 w-10 rounded-full bg-stone-300" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-[16px] font-bold text-stone-900", children: "Filters" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => onChange(emptyFilters),
                className: "min-h-[44px] px-2 text-[13px] font-medium text-accent",
                children: "Clear all"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Row, { label: "Annual budget ceiling (tuition + living)", children: [6e3, 8e3, 12e3, 18e3].map((b) => /* @__PURE__ */ jsx(
            Chip,
            {
              label: `≤ $${b.toLocaleString()}`,
              selected: filters.budgetMax === b,
              onClick: () => toggle("budgetMax", b)
            },
            b
          )) }),
          /* @__PURE__ */ jsx(Row, { label: "Country", children: ["Hungary", "South Korea", "Türkiye", "Kazakhstan"].map((c) => /* @__PURE__ */ jsx(
            Chip,
            {
              label: c,
              selected: filters.country === c,
              onClick: () => toggle("country", c)
            },
            c
          )) }),
          /* @__PURE__ */ jsx(Row, { label: "Field", children: ["Computer Science", "Engineering", "Business"].map((f) => /* @__PURE__ */ jsx(
            Chip,
            {
              label: f,
              selected: filters.field === f,
              onClick: () => toggle("field", f)
            },
            f
          )) }),
          /* @__PURE__ */ jsx(Row, { label: "Language of instruction", children: ["English", "Korean", "Russian"].map((l) => /* @__PURE__ */ jsx(
            Chip,
            {
              label: l,
              selected: filters.language === l,
              onClick: () => toggle("language", l)
            },
            l
          )) }),
          /* @__PURE__ */ jsx(Row, { label: "IELTS requirement", children: [
            { label: "≤ 5.5", v: 5.5 },
            { label: "≤ 6.0", v: 6 },
            { label: "≤ 6.5", v: 6.5 }
          ].map((o) => /* @__PURE__ */ jsx(
            Chip,
            {
              label: o.label,
              selected: filters.ieltsMax === o.v,
              onClick: () => toggle("ieltsMax", o.v)
            },
            o.v
          )) }),
          /* @__PURE__ */ jsx(Row, { label: "Deadlines", children: /* @__PURE__ */ jsx(
            Chip,
            {
              label: "Still open",
              selected: filters.deadlineOpenOnly,
              onClick: () => set("deadlineOpenOnly", !filters.deadlineOpenOnly)
            }
          ) }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: onClose,
              className: "mt-4 min-h-[48px] w-full rounded-xl bg-accent text-[15px] font-semibold text-white",
              children: [
                "Show ",
                resultCount,
                " ",
                resultCount === 1 ? "university" : "universities"
              ]
            }
          )
        ]
      }
    )
  ] });
}
const TODAY = "2026-07-22";
function SearchScreen() {
  const { navigate, devState, compareIds, setCompareIds } = useApp();
  const [filters, setFilters] = useState(emptyFilters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    if (devState === "no_results") return [];
    return universities.filter((u) => {
      if (query && !`${u.name} ${u.city} ${u.country}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (filters.country && u.country !== filters.country) return false;
      if (filters.language && !u.languagesOfInstruction.includes(filters.language))
        return false;
      if (filters.field && !u.programs.some((p) => p.field === filters.field))
        return false;
      if (filters.ieltsMax !== null) {
        if (u.ieltsMinimum.status !== "known") return false;
        if (u.ieltsMinimum.value > filters.ieltsMax) return false;
      }
      if (filters.budgetMax !== null) {
        if (u.tuitionPerYear.status !== "known" || u.livingCostPerYear.status !== "known")
          return false;
        if (u.tuitionPerYear.value.amount + u.livingCostPerYear.value.amount > filters.budgetMax)
          return false;
      }
      if (filters.deadlineOpenOnly) {
        if (u.applicationDeadline.status !== "known") return false;
        if (u.applicationDeadline.value < TODAY) return false;
      }
      return true;
    });
  }, [filters, query, devState]);
  const nFilters = activeFilterCount(filters);
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md px-4 pb-24 pt-4", children: [
    /* @__PURE__ */ jsx(
      ScreenHeader,
      {
        title: "Browse universities",
        subtitle: "Every figure is sourced — tap any “src” chip to see where it came from."
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxs("label", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Search universities" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "search",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: "University, city, or country",
            className: "min-h-[44px] w-full rounded-xl border border-stone-300 bg-white px-3 text-[14px] placeholder:text-stone-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => setSheetOpen(true),
          className: "relative min-h-[44px] rounded-xl border border-stone-300 bg-white px-4 text-[14px] font-medium text-stone-800",
          children: [
            "Filters",
            nFilters > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white", children: nFilters })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-3", children: devState === "loading" ? /* @__PURE__ */ jsxs("div", { "aria-busy": "true", className: "space-y-3", children: [
      /* @__PURE__ */ jsx(SkeletonCard, {}),
      /* @__PURE__ */ jsx(SkeletonCard, {}),
      /* @__PURE__ */ jsx(SkeletonCard, {})
    ] }) : devState === "error" ? /* @__PURE__ */ jsx(ErrorState, { retry: () => {
    } }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      devState === "offline" && /* @__PURE__ */ jsx(OfflineState, {}),
      /* @__PURE__ */ jsxs("p", { className: "text-[12px] text-stone-500", "aria-live": "polite", children: [
        results.length,
        " ",
        results.length === 1 ? "university" : "universities",
        nFilters > 0 && " match your filters"
      ] }),
      results.length === 0 ? /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: "◎",
          title: "Nothing matches all of those filters",
          body: "Try raising the budget ceiling or removing the IELTS filter — those two cut the most options.",
          cta: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setFilters(emptyFilters),
              className: "min-h-[44px] rounded-lg border border-accent px-5 text-[14px] font-semibold text-accent",
              children: "Clear filters"
            }
          )
        }
      ) : results.map((u) => /* @__PURE__ */ jsx(
        UniversityCard,
        {
          university: u,
          fit: sampleFitScores.find((f) => f.universityId === u.id),
          onOpen: () => navigate({ name: "university", id: u.id }),
          inCompare: compareIds.includes(u.id),
          onToggleCompare: () => setCompareIds(
            (c) => c.includes(u.id) ? c.filter((x) => x !== u.id) : c.length < 3 ? [...c, u.id] : c
          )
        },
        u.id
      ))
    ] }) }),
    /* @__PURE__ */ jsx(
      FilterSheet,
      {
        open: sheetOpen,
        onClose: () => setSheetOpen(false),
        filters,
        onChange: setFilters,
        resultCount: results.length
      }
    )
  ] });
}
function CompareRow({
  label,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("dt", { className: "text-[11px] uppercase tracking-wide text-stone-400", children: label }),
    /* @__PURE__ */ jsx("dd", { className: "text-[14px] font-semibold text-stone-800", children })
  ] });
}
function CompareScreen() {
  const { navigate, compareIds, setCompareIds } = useApp();
  const unis = compareIds.map(universityById).filter(Boolean);
  if (unis.length < 2) {
    return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md px-4 pt-4", children: [
      /* @__PURE__ */ jsx(
        ScreenHeader,
        {
          title: "Compare",
          subtitle: "Side by side, up to three universities"
        }
      ),
      /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: "⇄",
          title: unis.length === 0 ? "Nothing to compare yet" : "Add one more to compare",
          body: "Tap “+ Compare” on any university card in your pathway or in browse.",
          cta: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => navigate({ name: "search" }),
              className: "min-h-[44px] rounded-lg bg-accent px-5 text-[14px] font-semibold text-white",
              children: "Browse universities"
            }
          )
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "pb-24 pt-4", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-md px-4", children: /* @__PURE__ */ jsx(
      ScreenHeader,
      {
        title: "Compare",
        subtitle: "Swipe sideways to page between universities"
      }
    ) }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "snap-x-page no-scrollbar flex gap-3 overflow-x-auto px-4",
        role: "region",
        "aria-label": "University comparison, horizontally scrollable",
        children: unis.map((u) => {
          if (!u) return null;
          const fit = sampleFitScores.find((f) => f.universityId === u.id);
          return /* @__PURE__ */ jsxs(
            "article",
            {
              className: "w-[82vw] max-w-[340px] shrink-0 rounded-xl border border-stone-200 bg-white p-4",
              children: [
                /* @__PURE__ */ jsxs("header", { className: "flex items-start justify-between gap-2", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("h2", { className: "text-[15px] font-bold leading-snug text-stone-900", children: u.name }),
                    /* @__PURE__ */ jsxs("p", { className: "text-[12px] text-stone-500", children: [
                      u.city,
                      ", ",
                      u.country
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      "aria-label": `Remove ${u.name} from comparison`,
                      onClick: () => setCompareIds((c) => c.filter((x) => x !== u.id)),
                      className: "flex h-11 w-11 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100",
                      children: "✕"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("dl", { className: "mt-3 space-y-2.5 border-t border-stone-100 pt-3", children: [
                  /* @__PURE__ */ jsx(CompareRow, { label: "Tuition", children: /* @__PURE__ */ jsx(DataValue, { point: u.tuitionPerYear, render: fmtMoney }) }),
                  /* @__PURE__ */ jsx(CompareRow, { label: "Living costs", children: /* @__PURE__ */ jsx(DataValue, { point: u.livingCostPerYear, render: fmtMoney }) }),
                  /* @__PURE__ */ jsx(CompareRow, { label: "Application fee", children: /* @__PURE__ */ jsx(DataValue, { point: u.applicationFee, render: fmtMoney }) }),
                  /* @__PURE__ */ jsx(CompareRow, { label: "Deadline", children: /* @__PURE__ */ jsx(DataValue, { point: u.applicationDeadline, render: fmtDate }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("dt", { className: "text-[11px] uppercase tracking-wide text-stone-400", children: "IELTS minimum" }),
                    /* @__PURE__ */ jsx("dd", { className: "text-[14px] font-semibold text-stone-800", children: /* @__PURE__ */ jsx(DataValue, { point: u.ieltsMinimum, render: (v) => v.toFixed(1) }) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("dt", { className: "text-[11px] uppercase tracking-wide text-stone-400", children: "Acceptance rate" }),
                    /* @__PURE__ */ jsx("dd", { className: "text-[14px] font-semibold text-stone-800", children: /* @__PURE__ */ jsx(
                      DataValue,
                      {
                        point: u.acceptanceRate,
                        render: (v) => `${Math.round(v * 100)}%`
                      }
                    ) })
                  ] })
                ] }),
                fit && /* @__PURE__ */ jsxs("div", { className: "mt-3 border-t border-stone-100 pt-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(FitScoreBadge, { score: fit.overall }),
                    /* @__PURE__ */ jsx("span", { className: "text-[12px] text-stone-500", children: "Your fit, in five parts" })
                  ] }),
                  /* @__PURE__ */ jsx(FitBreakdown, { fit })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => navigate({ name: "university", id: u.id }),
                    className: "mt-3 min-h-[44px] w-full rounded-lg border border-accent text-[13px] font-semibold text-accent",
                    children: "Full profile"
                  }
                )
              ]
            },
            u.id
          );
        })
      }
    ),
    /* @__PURE__ */ jsxs("p", { className: "mt-3 px-4 text-center text-[11px] text-stone-400", children: [
      unis.length,
      " of 3 slots used"
    ] })
  ] });
}
const TOOLS = [
  {
    id: "pathway_generator",
    name: "Pathway Generator",
    tagline: "Your ranked route, from profile to campus",
    icon: "◆"
  },
  {
    id: "scholarship_finder",
    name: "Scholarship Finder",
    tagline: "Awards you actually qualify for, with deadlines",
    icon: "◈"
  },
  {
    id: "skill_gap",
    name: "Skill Gap Analyzer",
    tagline: "What's between you and your target programs",
    icon: "◧"
  },
  {
    id: "country_fit",
    name: "Country Fit",
    tagline: "Where your budget and goals travel best",
    icon: "◍"
  },
  {
    id: "career_projection",
    name: "Career Projection",
    tagline: "How each pathway maps to the job you want",
    icon: "◭"
  }
];
function ToolsHubScreen() {
  const { navigate, profile } = useApp();
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md px-4 pb-24 pt-4", children: [
    /* @__PURE__ */ jsx(
      ScreenHeader,
      {
        title: "Tools",
        subtitle: "Five ways to interrogate your pathway — all working from the same profile"
      }
    ),
    !profile && /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => navigate({ name: "intake" }),
        className: "mb-4 w-full rounded-xl border border-accent/30 bg-accent-soft p-3 text-left",
        children: [
          /* @__PURE__ */ jsx("p", { className: "text-[13px] font-semibold text-accent", children: "Tools work best with your profile" }),
          /* @__PURE__ */ jsx("p", { className: "text-[12px] text-stone-600", children: "90 seconds of questions → every tool below gets personal." })
        ]
      }
    ),
    /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: TOOLS.map((t) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => navigate({ name: "tool", id: t.id }),
        className: "flex min-h-[64px] w-full items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 text-left hover:border-stone-300",
        children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              "aria-hidden": true,
              className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-lg text-accent",
              children: t.icon
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("span", { className: "block text-[15px] font-semibold text-stone-900", children: t.name }),
            /* @__PURE__ */ jsx("span", { className: "block text-[12px] text-stone-500", children: t.tagline })
          ] }),
          /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "ml-auto text-stone-300", children: "›" })
        ]
      }
    ) }, t.id)) })
  ] });
}
const REFUSALS = {
  pathway_generator: {
    explanation: "I can't rank universities for you yet — I don't have your budget, and financial fit drives most of the ranking. Guessing it would give you a misleading list.",
    clarifyingQuestion: "Roughly how much can your family spend per year, including living costs?"
  },
  scholarship_finder: {
    explanation: "I don't have verified scholarship data for the country you asked about, and I won't estimate award amounts — a wrong number here could cost you a real application.",
    clarifyingQuestion: "Would you like me to search the three countries where I do have sourced scholarship data?"
  },
  skill_gap: {
    explanation: "I can't assess your skill gap for this program — the university hasn't published its entrance exam syllabus, so I don't know what it tests.",
    clarifyingQuestion: "Do you have last year's exam guide from them? If you upload it, I can map your gaps against it."
  },
  country_fit: {
    explanation: "I don't have post-study work visa data for that country that I can source, and visa rules change too often to answer from memory.",
    clarifyingQuestion: "Is work-after-graduation the deciding factor for you, or should I compare on cost and admission odds first?"
  },
  career_projection: {
    explanation: "I can't project salaries for this career in that market — I have no sourced salary data there, and an invented figure would be worse than none.",
    clarifyingQuestion: "Should I show the career paths where I do have sourced data, or would a skills-demand view (no salary figures) help more?"
  }
};
function ToolFrame({
  toolId,
  children
}) {
  const { navigate, devState } = useApp();
  const tool = TOOLS.find((t) => t.id === toolId);
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md px-4 pb-24 pt-4", children: [
    /* @__PURE__ */ jsx(
      ScreenHeader,
      {
        title: tool.name,
        subtitle: tool.tagline,
        onBack: () => navigate({ name: "tools" })
      }
    ),
    devState === "loading" ? /* @__PURE__ */ jsxs(
      "div",
      {
        "aria-busy": "true",
        className: "rounded-xl border border-stone-200 bg-white p-4",
        children: [
          /* @__PURE__ */ jsx(SkeletonLine, { w: "35%", h: 11 }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-2", children: [
            /* @__PURE__ */ jsx(SkeletonLine, {}),
            /* @__PURE__ */ jsx(SkeletonLine, {}),
            /* @__PURE__ */ jsx(SkeletonLine, { w: "60%" })
          ] })
        ]
      }
    ) : devState === "error" ? /* @__PURE__ */ jsx(ErrorState, { retry: () => {
    } }) : devState === "refusal" ? /* @__PURE__ */ jsx(AIResponseBlock, { variant: "refusal", refusal: REFUSALS[toolId] }) : children,
    /* @__PURE__ */ jsx("p", { className: "mt-4 text-center text-[11px] text-stone-400", children: "Results use your saved profile. Structured, sourced — and the counselor says so when it doesn't know." })
  ] });
}
function ToolScreen({ toolId }) {
  const { navigate } = useApp();
  if (toolId === "pathway_generator") {
    return /* @__PURE__ */ jsxs(ToolFrame, { toolId, children: [
      /* @__PURE__ */ jsx(AIResponseBlock, { title: "Pathway Generator", children: /* @__PURE__ */ jsx("p", { children: samplePathway.strategySummary }) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => navigate({ name: "results" }),
          className: "mt-3 min-h-[48px] w-full rounded-xl bg-accent text-[15px] font-semibold text-white",
          children: "Open full pathway"
        }
      )
    ] });
  }
  if (toolId === "scholarship_finder") {
    return /* @__PURE__ */ jsxs(ToolFrame, { toolId, children: [
      /* @__PURE__ */ jsx(AIResponseBlock, { title: "Scholarship Finder", children: /* @__PURE__ */ jsx("p", { className: "mb-3", children: "Five awards match your profile. Sorted by deadline — the January government scholarship is your highest-value target." }) }),
      /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-2", children: samplePathway.matchedScholarshipIds.map((sid) => {
        const s = scholarshipById(sid);
        if (!s) return null;
        const uni = universityById(s.universityIds[0]);
        return /* @__PURE__ */ jsxs(
          "li",
          {
            className: "rounded-xl border border-stone-200 bg-white p-3",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[14px] font-semibold text-stone-900", children: s.name.replace(" (sample)", "") }),
                /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[13px] font-semibold text-accent", children: /* @__PURE__ */ jsx(
                  DataValue,
                  {
                    point: s.award,
                    render: (a) => a.kind === "full_ride" ? "Full ride" : a.kind === "percent_tuition" ? `${a.percent}% tuition` : fmtMoney(a.money)
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-[12px] text-stone-500", children: [
                uni?.name,
                " · ",
                s.type
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 text-[12px] text-stone-600", children: [
                "Deadline: ",
                /* @__PURE__ */ jsx(DataValue, { point: s.deadline, render: fmtDate })
              ] })
            ]
          },
          s.id
        );
      }) })
    ] });
  }
  if (toolId === "skill_gap") {
    return /* @__PURE__ */ jsxs(ToolFrame, { toolId, children: [
      /* @__PURE__ */ jsx(AIResponseBlock, { title: "Skill Gap Analyzer", children: /* @__PURE__ */ jsx("p", { children: "Against your top-ranked target (Danubia CS), two gaps matter and one is already closed:" }) }),
      /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-2", children: [
        {
          status: "gap",
          title: "Entrance exam: math + logic",
          detail: "Danubia's online test covers calculus basics your school program hasn't reached yet. Their sample test is the fastest way to check."
        },
        {
          status: "gap",
          title: "SAT (only if Anatolia stays on your list)",
          detail: "Anatolia asks for SAT 1200+ or their own exam. Registering for the exam skips the SAT entirely."
        },
        {
          status: "ok",
          title: "English requirement",
          detail: "Your IELTS 6.5 clears every university on your list."
        }
      ].map((g) => /* @__PURE__ */ jsxs(
        "li",
        {
          className: `rounded-xl border p-3 ${g.status === "gap" ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`,
          children: [
            /* @__PURE__ */ jsxs(
              "p",
              {
                className: `text-[13px] font-semibold ${g.status === "gap" ? "text-amber-900" : "text-emerald-900"}`,
                children: [
                  g.status === "gap" ? "Gap · " : "Cleared · ",
                  g.title
                ]
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[13px] text-stone-700", children: g.detail })
          ]
        },
        g.title
      )) })
    ] });
  }
  if (toolId === "country_fit") {
    return /* @__PURE__ */ jsxs(ToolFrame, { toolId, children: [
      /* @__PURE__ */ jsx(AIResponseBlock, { title: "Country Fit", children: /* @__PURE__ */ jsx("p", { children: "Ranked on your budget, language readiness, and stated preferences — costs below are sample fixtures with sources attached:" }) }),
      /* @__PURE__ */ jsx("ol", { className: "mt-3 space-y-2", children: [
        ["uni-danubia", "Best overall — scholarship makes it affordable"],
        ["uni-anatolia", "Cheapest total cost that matches your field"],
        ["uni-hangang", "Strong programs; budget only works with a major award"],
        ["uni-alatau", "Close to home; lowest risk, lowest cost"]
      ].map(([uid, note], i) => {
        const u = universityById(uid);
        if (!u) return null;
        return /* @__PURE__ */ jsxs(
          "li",
          {
            className: "flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-3",
            children: [
              /* @__PURE__ */ jsx("span", { className: "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-900 text-[12px] font-bold text-white", children: i + 1 }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[14px] font-semibold text-stone-900", children: u.country }),
                /* @__PURE__ */ jsx("p", { className: "text-[12px] text-stone-500", children: note }),
                /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[13px] font-medium text-stone-700", children: [
                  "Tuition:",
                  " ",
                  /* @__PURE__ */ jsx(DataValue, { point: u.tuitionPerYear, render: fmtMoney }),
                  " · Living:",
                  " ",
                  /* @__PURE__ */ jsx(DataValue, { point: u.livingCostPerYear, render: fmtMoney })
                ] })
              ] })
            ]
          },
          uid
        );
      }) })
    ] });
  }
  return /* @__PURE__ */ jsxs(ToolFrame, { toolId, children: [
    /* @__PURE__ */ jsx(AIResponseBlock, { title: "Career Projection", children: /* @__PURE__ */ jsx("p", { children: "Your goal — software engineer — maps onto each pathway differently. No salary figures here: I don't have sourced salary data for these markets, so I'm showing structural factors instead." }) }),
    /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-2", children: [
      {
        title: "Hungary (Danubia)",
        points: [
          "EU degree recognized across Europe",
          "English-speaking tech job market concentrated in Budapest"
        ]
      },
      {
        title: "Türkiye (Anatolia)",
        points: [
          "Dedicated AI engineering track is the closest program match",
          "Large domestic tech sector; language matters for local roles"
        ]
      },
      {
        title: "South Korea (Hangang)",
        points: [
          "Strong hardware/software industry ties",
          "Korean proficiency strongly affects hiring after graduation"
        ]
      }
    ].map((c) => /* @__PURE__ */ jsxs(
      "li",
      {
        className: "rounded-xl border border-stone-200 bg-white p-3",
        children: [
          /* @__PURE__ */ jsx("p", { className: "text-[14px] font-semibold text-stone-900", children: c.title }),
          /* @__PURE__ */ jsx("ul", { className: "mt-1 space-y-1", children: c.points.map((pt) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2 text-[13px] text-stone-600", children: [
            /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "text-stone-300", children: "–" }),
            pt
          ] }, pt)) })
        ]
      },
      c.title
    )) })
  ] });
}
function SavedScreen() {
  const { navigate, savedPlans, loggedIn, setLoggedIn, setPathway } = useApp();
  if (!loggedIn) {
    return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md px-4 pt-4", children: [
      /* @__PURE__ */ jsx(ScreenHeader, { title: "Saved plans" }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-stone-200 bg-white px-6 py-10 text-center", children: [
        /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "text-2xl text-stone-300", children: "◫" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-2 text-[15px] font-semibold text-stone-800", children: "Sign in to keep your plans" }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-1 max-w-[30ch] text-[13px] text-stone-500", children: "Saved pathways sync across devices, so you can review them with your parents on any phone." }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setLoggedIn(true),
            className: "mt-4 min-h-[48px] w-full rounded-xl bg-accent text-[15px] font-semibold text-white",
            children: "Sign in"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-[11px] text-stone-400", children: "(Phase 1: simulated — no real authentication)" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md px-4 pb-24 pt-4", children: [
    /* @__PURE__ */ jsx(
      ScreenHeader,
      {
        title: "Saved plans",
        subtitle: savedPlans.length > 0 ? `${savedPlans.length} ${savedPlans.length === 1 ? "plan" : "plans"}` : void 0,
        action: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setLoggedIn(false),
            className: "min-h-[44px] px-2 text-[12px] text-stone-400",
            children: "Sign out"
          }
        )
      }
    ),
    savedPlans.length === 0 ? /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: "◫",
        title: "No saved plans yet",
        body: "Run your pathway, then tap “Save this plan” to keep a dated snapshot you can revisit and share.",
        cta: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => navigate({ name: "intake" }),
            className: "min-h-[44px] rounded-lg bg-accent px-5 text-[14px] font-semibold text-white",
            children: "Build a pathway"
          }
        )
      }
    ) : /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: savedPlans.map((plan) => {
      const top = universityById(plan.rankedUniversityIds[0]);
      return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            setPathway(plan);
            navigate({ name: "results" });
          },
          className: "w-full rounded-xl border border-stone-200 bg-white p-4 text-left hover:border-stone-300",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-[14px] font-semibold text-stone-900", children: [
                plan.profileSnapshot.fieldOfInterest,
                " pathway"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "shrink-0 text-[11px] text-stone-400", children: [
                "Run ",
                fmtDate(plan.createdAt)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-[12px] text-stone-500", children: [
              "Top match: ",
              top?.name ?? "—",
              " ·",
              " ",
              plan.rankedUniversityIds.length,
              " universities ·",
              " ",
              plan.matchedScholarshipIds.length,
              " scholarships"
            ] }),
            plan.savedAt && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[11px] text-stone-400", children: [
              "Saved ",
              fmtDate(plan.savedAt)
            ] })
          ]
        }
      ) }, plan.id + (plan.savedAt ?? ""));
    }) })
  ] });
}
const DEV_STATES = [
  "normal",
  "loading",
  "empty",
  "partial",
  "no_results",
  "refusal",
  "error",
  "offline"
];
function DevRibbon() {
  const { devState, setDevState } = useApp();
  return /* @__PURE__ */ jsx("div", { className: "sticky top-0 z-40 border-b border-amber-200 bg-amber-50", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-md items-center gap-2 px-4 py-1.5", children: [
    /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[11px] font-semibold text-amber-900", children: "⚠ Sample data — not verified" }),
    /* @__PURE__ */ jsxs("label", { className: "ml-auto flex items-center gap-1 text-[11px] text-amber-800", children: [
      /* @__PURE__ */ jsx("span", { className: "sr-only sm:not-sr-only", children: "State:" }),
      /* @__PURE__ */ jsx(
        "select",
        {
          value: devState,
          onChange: (e) => setDevState(e.target.value),
          className: "max-w-[110px] rounded border border-amber-300 bg-white px-1 py-1 text-[11px]",
          "aria-label": "Dev state switcher",
          children: DEV_STATES.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: s.replace("_", " ") }, s))
        }
      )
    ] })
  ] }) });
}
function NavButton({
  label,
  icon,
  active,
  onClick,
  badge
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick,
      "aria-current": active ? "page" : void 0,
      className: `relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 ${active ? "text-accent" : "text-stone-400"}`,
      children: [
        /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "text-[17px] leading-none", children: icon }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium", children: label }),
        badge !== void 0 && badge > 0 && /* @__PURE__ */ jsx("span", { className: "absolute right-[22%] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white", children: badge })
      ]
    }
  );
}
function BottomNav() {
  const { route, navigate, compareIds, pathway } = useApp();
  const name = route.name;
  return /* @__PURE__ */ jsx(
    "nav",
    {
      "aria-label": "Main",
      className: "fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur",
      children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-md", children: [
        /* @__PURE__ */ jsx(
          NavButton,
          {
            label: "Pathway",
            icon: "◆",
            active: name === "results" || name === "intake" || name === "university",
            onClick: () => navigate({ name: pathway ? "results" : "intake" })
          }
        ),
        /* @__PURE__ */ jsx(
          NavButton,
          {
            label: "Browse",
            icon: "◎",
            active: name === "search",
            onClick: () => navigate({ name: "search" })
          }
        ),
        /* @__PURE__ */ jsx(
          NavButton,
          {
            label: "Compare",
            icon: "⇄",
            active: name === "compare",
            onClick: () => navigate({ name: "compare" }),
            badge: compareIds.length
          }
        ),
        /* @__PURE__ */ jsx(
          NavButton,
          {
            label: "Tools",
            icon: "◧",
            active: name === "tools" || name === "tool",
            onClick: () => navigate({ name: "tools" })
          }
        ),
        /* @__PURE__ */ jsx(
          NavButton,
          {
            label: "Saved",
            icon: "◫",
            active: name === "saved",
            onClick: () => navigate({ name: "saved" })
          }
        )
      ] })
    }
  );
}
function Screen() {
  const { route } = useApp();
  switch (route.name) {
    case "intake":
      return /* @__PURE__ */ jsx(IntakeScreen, {});
    case "results":
      return /* @__PURE__ */ jsx(ResultsScreen, {});
    case "university":
      return /* @__PURE__ */ jsx(UniversityProfileScreen, { id: route.id });
    case "search":
      return /* @__PURE__ */ jsx(SearchScreen, {});
    case "compare":
      return /* @__PURE__ */ jsx(CompareScreen, {});
    case "tools":
      return /* @__PURE__ */ jsx(ToolsHubScreen, {});
    case "tool":
      return /* @__PURE__ */ jsx(ToolScreen, { toolId: route.id });
    case "saved":
      return /* @__PURE__ */ jsx(SavedScreen, {});
  }
}
function App() {
  return /* @__PURE__ */ jsx(AppProvider, { children: /* @__PURE__ */ jsxs("div", { className: "min-h-screen pb-16", children: [
    /* @__PURE__ */ jsx(DevRibbon, {}),
    /* @__PURE__ */ jsx("main", { children: /* @__PURE__ */ jsx(Screen, {}) }),
    /* @__PURE__ */ jsx(BottomNav, {})
  ] }) });
}
const html = renderToString(/* @__PURE__ */ jsx(App, {})).replace(/<!--.*?-->/g, "");
const checks = [
  ["ribbon present", html.includes("Sample data — not verified")],
  ["intake first question", html.includes("How are your grades?")],
  ["progress visible", html.includes("1 of 6")],
  ["bottom nav", html.includes("Pathway") && html.includes("Compare")]
];
for (const [name, ok] of checks) console.log((ok ? "PASS" : "FAIL") + " " + name);
if (checks.some(([, ok]) => !ok)) process.exit(1);
