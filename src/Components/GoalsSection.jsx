import { useMemo, useState } from "react"

const aiGoalQuestions = [
  {
    field: "programGoal",
    label: "What do you want a fitness program to do for you?",
    suggestions:
      "Build muscle, lose fat, feel athletic, improve energy, improve mobility, build curves, improve endurance, feel stronger, age well",
  },
  {
    field: "activitiesGoal",
    label: "Are there any sports, movement styles or activities you train for or that you enjoy?",
    suggestions:
      "Running, dance, rowing, yoga, hiking, strength training, martial arts, skating, hockey, Pilates",
  },
  {
    field: "mobilityPainGoal",
    label: "Do you have mobility, pain or recovery goals?",
    suggestions:
      "Increase hip flexibility, touch my toes, better posture, injury recovery, core stability, less lower-back tightness",
  },
  {
    field: "compositionGoal",
    label: "What are your body composition goals?",
    suggestions:
      "Build glutes, lean out, maintain curves, smaller waist, build shoulders, improve definition",
  },
  {
    field: "fitnessGoal",
    label: "What are your fitness goals?",
    suggestions:
      "Decrease my mile time in running, lift heavier weights, improve my split time on the erg, complete a pull-up, improve sprint speed, train for a race, increase weekly stamina",
  },
]

function GoalsSection({ goals, setGoals, profile }) {
  const [openCoachingSections, setOpenCoachingSections] = useState({})
  const analysis = useMemo(
    () => analyzeGoals(goals, profile),
    [goals, profile]
  )
  const coachingSections = [
    { title: "Nutrition", text: analysis.nutrition },
    { title: "Strength", text: analysis.strength },
    { title: "Cardio", text: analysis.cardio },
    { title: "Mobility / Sport", text: analysis.mobility },
    { title: "Recovery", text: analysis.recovery },
  ]

  function updateGoal(field, value) {
    setGoals({
      ...goals,
      [field]: value,
    })
  }

  function toggleCoachingSection(title) {
    setOpenCoachingSections({
      ...openCoachingSections,
      [title]: !openCoachingSections[title],
    })
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-semibold">Goals</h2>
        <p className="mt-2 text-sm text-stone-600">
          Answer the AI-powered prompts naturally. The app classifies the goal
          themes and turns them into nutrition, strength, cardio, mobility, and
          sport guidance.
        </p>

        <div className="mt-6 grid gap-4">
          {aiGoalQuestions.map((question) => (
            <GoalTextarea
              key={question.field}
              label={question.label}
              suggestions={question.suggestions}
              value={goals[question.field] || ""}
              onChange={(value) => updateGoal(question.field, value)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="text-xl font-semibold">Detected Goal Themes</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {analysis.tags.map((tag) => (
              <span
                className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="text-xl font-semibold">Coaching Output</h3>
          <div className="mt-4 grid gap-3">
            {coachingSections.map((section) => (
              <RecommendationCard
                key={section.title}
                isOpen={Boolean(openCoachingSections[section.title])}
                onToggle={() => toggleCoachingSection(section.title)}
                title={section.title}
                text={section.text}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function analyzeGoals(goals, profile = {}) {
  const allGoals = `${getGoalAnswerText(goals)} ${getProfileGoalContext(profile)}`.toLowerCase()
  const tags = []

  if (!allGoals.trim()) {
    return {
      tags: ["waiting for goals"],
      nutrition: "Add goals to receive nutrition guidance.",
      strength: "Add goals to receive strength guidance.",
      cardio: "Add goals to receive cardio guidance.",
      mobility: "Add goals to receive mobility or sport guidance.",
      recovery: "Add goals to receive recovery guidance.",
    }
  }

  let nutrition =
    "Use a steady high-protein plan with whole-food meals, enough fiber, and carbs timed around training."
  let strength =
    "Train 3 to 4 days per week with full-body structure and progressive overload."
  let cardio =
    "Use 2 to 3 cardio sessions per week, mixing zone 2 work and one interval day."
  let mobility =
    "Add 10 minutes of mobility or technique practice on most training days."
  let recovery =
    "Track sleep, soreness, hydration, and performance drops before increasing volume."
  const activity = formatActivityLevel(profile.activityLevel)
  const equipment = profile.equipment || "available equipment"
  const sports = goals.activitiesGoal || profile.sportsInterests || "preferred activities"
  const limitations = goals.mobilityPainGoal || profile.limitations
  const diet = profile.dietaryPreferences || "balanced meals"
  const mealPattern = formatMealPreference(profile.mealPreference)
  const programGoal = goals.programGoal || getGoalAnswerText(goals) || "the goals you entered"
  const compositionGoal = goals.compositionGoal || goals.bodyGoal
  const performanceGoal = goals.fitnessGoal || goals.cardioGoal || goals.strengthGoal

  if (includesAny(allGoals, ["fat loss", "lose fat", "shrink", "waist", "recomp"])) {
    tags.push("fat loss / waist")
    nutrition =
      "Use a small calorie deficit, high protein, 25 to 35g fiber, and anti-inflammatory meals so fat loss does not flatten strength or glute progress."
  }

  if (includesAny(allGoals, ["glute", "hips", "booty"])) {
    tags.push("glute growth")
    strength =
      "Prioritize 2 glute-biased lower-body days with hip thrusts, RDLs, split squats, leg press, abduction, and measurable load progression."
  }

  if (includesAny(allGoals, ["arms", "back", "upper body", "posture"])) {
    tags.push("arms / back")
    strength += " Include 2 upper-body exposures with rows, pulldowns, presses, rear delts, biceps, and triceps."
  }

  if (includesAny(allGoals, ["run", "running", "speed", "row", "rowing", "endurance"])) {
    tags.push("cardio performance")
    cardio =
      "Use 1 interval session, 1 zone 2 endurance session, and 1 optional rower or incline session, with volume rising gradually."
  }

  if (includesAny(allGoals, ["flexibility", "mobility", "hamstring", "lower back", "hip"])) {
    tags.push("mobility")
    mobility =
      "Use hamstring, hip flexor, thoracic, ankle, and lower-back mobility 4 to 6 days per week, after warm-ups or training."
  }

  if (includesAny(allGoals, ["dance", "baladi", "persian", "skating", "sport", "pahlavani"])) {
    tags.push("sport / dance")
    mobility += " Add skill blocks for rhythm, hip isolation, rotational control, single-leg balance, and right-left symmetry."
  }

  if (tags.length === 0) {
    tags.push("general wellness")
  }

  return {
    tags,
    nutrition: `${nutrition} Personalize it around ${diet.toLowerCase()} and a ${mealPattern.toLowerCase()} structure, with protein and carbs adjusted for ${programGoal.toLowerCase()}.`,
    strength: `${strength} Build sessions around ${equipment.toLowerCase()} and bias exercise selection toward ${compositionGoal || programGoal}.`,
    cardio: `${cardio} Tie conditioning to ${performanceGoal || sports}, while keeping intensity appropriate for ${activity.toLowerCase()}.`,
    mobility: `${mobility} Connect mobility and skill work to ${sports}${limitations ? `, with extra care for ${limitations.toLowerCase()}` : ""}.`,
    recovery: `${recovery}${limitations ? ` Recovery choices should protect ${limitations.toLowerCase()}` : ""} and match ${profile.trainingDaysMode === "manual" ? `${profile.trainingDays || "the selected"} training days per week` : "the coach-recommended training frequency"}.`,
  }
}

function getProfileGoalContext(profile = {}) {
  return [
    profile.activityLevel,
    profile.equipment,
    profile.dietaryPreferences,
    profile.limitations,
    profile.sportsInterests,
    profile.trainingDaysMode,
  ]
    .filter(Boolean)
    .join(" ")
}

function getGoalAnswerText(goals) {
  const textFields = [
    "goalBrief",
    "programGoal",
    "activitiesGoal",
    "mobilityPainGoal",
    "compositionGoal",
    "fitnessGoal",
    "bodyGoal",
    "strengthGoal",
    "cardioGoal",
    "mobilityGoal",
    "sportGoal",
  ]

  return textFields.map((field) => goals[field]).filter(Boolean).join(" ")
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word))
}

function formatActivityLevel(value = "moderate") {
  const labels = {
    low: "Low activity",
    moderate: "Moderate activity",
    high: "High activity",
  }

  return labels[value] || value || labels.moderate
}

function formatMealPreference(value = "coach") {
  const labels = {
    coach: "Coach recommendation",
    2: "2 meals per day",
    3: "3 meals per day",
    4: "4 meals per day",
    5: "3 meals plus 2 snacks",
  }

  return labels[value] || labels.coach
}

function GoalTextarea({ label, value, onChange, suggestions }) {
  return (
    <label className="group relative block">
      <span className="flex items-center gap-2 text-sm font-medium text-stone-700">
        {label}
        {suggestions && (
          <span
            className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-stone-300 text-xs font-semibold text-stone-500"
            tabIndex="0"
            title={`Suggestions: ${suggestions}`}
          >
            ?
            <span className="pointer-events-none absolute left-0 top-7 z-20 hidden w-72 rounded-lg border border-stone-200 bg-white p-3 text-left text-xs font-normal leading-relaxed text-stone-600 shadow-lg group-hover:block group-focus-within:block">
              Suggestions: {suggestions}
            </span>
          </span>
        )}
      </span>
      <textarea
        className="mt-1 min-h-24 w-full rounded-lg border border-stone-300 p-3 outline-none focus:border-emerald-600"
        title={suggestions ? `Suggestions: ${suggestions}` : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function RecommendationCard({ title, text, isOpen, onToggle }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
      <button
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 text-left font-semibold"
        onClick={onToggle}
        type="button"
      >
        <span>{title}</span>
        <span className="text-lg leading-none text-stone-500">{isOpen ? "-" : "+"}</span>
      </button>
      {isOpen && <p className="mt-3 text-sm leading-relaxed text-stone-600">{text}</p>}
    </div>
  )
}

export default GoalsSection
