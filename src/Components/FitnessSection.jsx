import { useMemo, useState } from "react"

const exerciseLibrary = [
  {
    name: "Smith Machine Hip Thrust",
    focus: "Glutes",
    equipment: ["smith machine", "gym"],
    sets: "4",
    reps: "8-12",
    cue: "Tuck ribs, drive through heels, pause hard at the top.",
    mistake: "Overarching the lower back instead of finishing with glutes.",
  },
  {
    name: "Romanian Deadlift",
    focus: "Glutes / Hamstrings",
    equipment: ["barbell", "dumbbells", "gym"],
    sets: "4",
    reps: "8-10",
    cue: "Push hips back, keep lats tight, stop when hamstrings limit you.",
    mistake: "Squatting the rep instead of hinging.",
  },
  {
    name: "Cable Row",
    focus: "Back",
    equipment: ["cables", "gym"],
    sets: "3",
    reps: "10-12",
    cue: "Pull elbows toward back pockets and pause with shoulder blades set.",
    mistake: "Shrugging or yanking with momentum.",
  },
  {
    name: "Dumbbell Shoulder Press",
    focus: "Arms / Shoulders",
    equipment: ["dumbbells", "home", "gym"],
    sets: "3",
    reps: "8-12",
    cue: "Stack wrists over elbows and press without flaring ribs.",
    mistake: "Turning it into a lower-back arch.",
  },
  {
    name: "Kettlebell Swing",
    focus: "Power / Conditioning",
    equipment: ["kettlebells", "home", "gym"],
    sets: "5",
    reps: "12-15",
    cue: "Snap hips forward and let the bell float from power, not arms.",
    mistake: "Lifting with shoulders instead of hinging.",
  },
  {
    name: "Incline Treadmill",
    focus: "Cardio",
    equipment: ["treadmill", "gym"],
    sets: "1",
    reps: "20-30 min",
    cue: "Keep tall posture and use a pace you can sustain.",
    mistake: "Holding the rails so hard the legs stop doing the work.",
  },
  {
    name: "Rowing Intervals",
    focus: "Cardio / Rowing",
    equipment: ["rower", "rowing machine", "gym"],
    sets: "8",
    reps: "45 sec hard / 75 sec easy",
    cue: "Legs, body, arms on the drive; arms, body, legs on recovery.",
    mistake: "Pulling early with the arms.",
  },
  {
    name: "Dance Hip Isolation Drill",
    focus: "Dance / Mobility",
    equipment: ["home", "bodyweight"],
    sets: "3",
    reps: "60 sec each side",
    cue: "Keep ribs quiet and make the pelvis move intentionally.",
    mistake: "Letting shoulders twist to create the motion.",
  },
  {
    name: "Hamstring Mobility Flow",
    focus: "Flexibility",
    equipment: ["home", "bodyweight"],
    sets: "2",
    reps: "5 min",
    cue: "Move slowly between active stretch and gentle contraction.",
    mistake: "Forcing range while the lower back rounds hard.",
  },
]

function FitnessSection({ profile, goals }) {
  const [preferences, setPreferences] = useState({
    location: "Gym",
    style: "athlete",
    daysOverride: "",
    duration: "coach",
    mobilityPlacement: "end",
    cardioPlacement: "ai",
  })
  const [showCustomStyle, setShowCustomStyle] = useState(false)
  const [customStyleName, setCustomStyleName] = useState("")
  const [workoutView, setWorkoutView] = useState("day")
  const [showGeneratedWorkouts, setShowGeneratedWorkouts] = useState(true)
  const [showCoachNotes, setShowCoachNotes] = useState(false)
  const [activeCoachInsight, setActiveCoachInsight] = useState("trainingDays")
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [workoutDurationsByDay, setWorkoutDurationsByDay] = useState({})
  const [extraExercisesByDay, setExtraExercisesByDay] = useState({})
  const [showHeartRateZones, setShowHeartRateZones] = useState(false)
  const [exerciseLog, setExerciseLog] = useState([])
  const [activeTutorial, setActiveTutorial] = useState(null)
  const [aiFitnessPlan, setAiFitnessPlan] = useState(null)
  const [isGeneratingFitnessPlan, setIsGeneratingFitnessPlan] = useState(false)
  const [fitnessAiError, setFitnessAiError] = useState("")
  const styleOptions = useMemo(
    () => createStyleOptions(profile, preferences.style),
    [profile, preferences.style]
  )
  const activeStyle = styleOptions.some((style) => style.value === preferences.style)
    ? preferences.style
    : styleOptions[0]?.value || "athlete"
  const activePreferences = useMemo(
    () => ({
      ...preferences,
      style: activeStyle,
      workoutDurationsByDay,
    }),
    [preferences, activeStyle, workoutDurationsByDay]
  )
  const heartRateZones = useMemo(() => createHeartRateZones(profile), [profile])
  const selectedStyle = styleOptions.find((style) => style.value === activeStyle)
  const coachRecommendation = useMemo(
    () => createCoachRecommendation(profile, goals, selectedStyle),
    [profile, goals, selectedStyle]
  )
  const activeTrainingDays = getActiveTrainingDays(profile, preferences, coachRecommendation)

  const localPlan = useMemo(
    () => createWorkoutPlan(profile, goals, activePreferences, styleOptions, heartRateZones, coachRecommendation, activeTrainingDays),
    [profile, goals, activePreferences, styleOptions, heartRateZones, coachRecommendation, activeTrainingDays]
  )
  const planSource = aiFitnessPlan?.workouts?.length ? aiFitnessPlan.workouts : localPlan
  const plan = useMemo(
    () => planSource.map((workout) =>
      applyWorkoutTiming(workout, workoutDurationsByDay[workout.day] || preferences.duration)
    ),
    [planSource, preferences.duration, workoutDurationsByDay]
  )
  const activeCoachRecommendation = useMemo(
    () => ({
      ...coachRecommendation,
      strengthDays: aiFitnessPlan?.strengthDays || coachRecommendation.strengthDays,
      cardioDays: aiFitnessPlan?.cardioDays || coachRecommendation.cardioDays,
      mobilityDays: aiFitnessPlan?.mobilityDays || coachRecommendation.mobilityDays,
      priorities: aiFitnessPlan?.priorities?.length ? aiFitnessPlan.priorities : coachRecommendation.priorities,
      rationale: aiFitnessPlan?.rationale || coachRecommendation.rationale,
      recovery: aiFitnessPlan?.recovery || coachRecommendation.recovery,
    }),
    [aiFitnessPlan, coachRecommendation]
  )
  const safeSelectedDayIndex = Math.min(selectedDayIndex, Math.max(plan.length - 1, 0))
  const selectedWorkout = plan[safeSelectedDayIndex]
  const coachInsights = useMemo(
    () => createCoachInsights(profile, goals, heartRateZones, activeCoachRecommendation, activeTrainingDays, plan, aiFitnessPlan),
    [profile, goals, heartRateZones, activeCoachRecommendation, activeTrainingDays, plan, aiFitnessPlan]
  )

  function addExerciseLog(log) {
    setExerciseLog([
      {
        ...log,
        date: new Date().toLocaleDateString(),
      },
      ...exerciseLog,
    ])
  }

  function addWorkoutExercise(day, exercise) {
    if (!exercise.name.trim()) return

    setExtraExercisesByDay({
      ...extraExercisesByDay,
      [day]: [...(extraExercisesByDay[day] || []), exercise],
    })
  }

  function changeWorkoutDuration(day, duration) {
    setWorkoutDurationsByDay({
      ...workoutDurationsByDay,
      [day]: duration,
    })
  }

  function addCustomStyle(event) {
    event.preventDefault()

    const cleanedStyle = cleanStyleName(customStyleName)
    if (!cleanedStyle) return

    setPreferences({
      ...preferences,
      style: createStyleOption(cleanedStyle, "custom").value,
    })
    setCustomStyleName("")
    setShowCustomStyle(false)
  }

  async function generateAiFitnessPlan() {
    setIsGeneratingFitnessPlan(true)
    setFitnessAiError("")

    try {
      const response = await fetch("/api/fitness-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          goals,
          preferences: activePreferences,
          coachRecommendation,
          activeTrainingDays,
          heartRateZones,
          style: selectedStyle,
          request: "Create a personalized weekly workout plan and AI-generated coach recommendation. Priorities, rationale, and recovery must be brief and individualized from the person's profile, goals, equipment, limitations, sport interests, and weekly availability.",
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate AI fitness plan")
      }

      setAiFitnessPlan(data)
      setSelectedDayIndex(0)
    } catch (error) {
      setFitnessAiError(error.message)
    } finally {
      setIsGeneratingFitnessPlan(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_520px]">
          <div>
            <h2 className="text-2xl font-semibold">Fitness</h2>
            <p className="mt-2 text-sm text-stone-600">
              Generate weekly workouts from goals, equipment, location, style,
              sport interests, limitations, and training frequency.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SelectField
              label="Location"
              value={preferences.location}
              onChange={(value) => setPreferences({ ...preferences, location: value })}
              options={["Gym", "Home", "Hybrid"]}
            />
            <SelectField
              label="Train like a"
              value={activeStyle}
              onChange={(value) => {
                if (value === "custom") {
                  setShowCustomStyle(true)
                  return
                }

                setPreferences({ ...preferences, style: value })
              }}
              options={[
                ...styleOptions,
                { value: "custom", label: "Add own freestyle..." },
              ]}
            />
            <SelectField
              label="Days this week"
              value={preferences.daysOverride || "profile"}
              onChange={(value) =>
                setPreferences({
                  ...preferences,
                  daysOverride: value === "profile" ? "" : value,
                })
              }
              options={[
                {
                  value: "profile",
                  label: profile.trainingDaysMode === "coach"
                    ? `Coach recommendation (${coachRecommendation.recommendedTotalDays})`
                    : `Profile preference (${profile.trainingDays || 4})`,
                },
                "3",
                "4",
                "5",
                "6",
              ]}
            />
            <SelectField
              label="Mobility"
              value={preferences.mobilityPlacement}
              onChange={(value) => setPreferences({ ...preferences, mobilityPlacement: value })}
              options={[
                { value: "end", label: "End of workouts" },
                { value: "warmup", label: "Warm-up" },
                { value: "separate", label: "Separate day" },
                { value: "mixed", label: "Mixed into strength" },
                { value: "ai", label: "Coach decides" },
              ]}
            />
            <SelectField
              label="Cardio"
              value={preferences.cardioPlacement}
              onChange={(value) => setPreferences({ ...preferences, cardioPlacement: value })}
              options={[
                { value: "ai", label: "Coach decides" },
                { value: "after", label: "After strength" },
                { value: "separate", label: "Separate days" },
                { value: "mixed", label: "Mixed in" },
                { value: "minimal", label: "Minimum effective" },
              ]}
            />
          </div>
        </div>

        {showCustomStyle && (
          <form className="mt-4 grid gap-3 rounded-lg border bg-stone-50 p-4 sm:grid-cols-[1fr_auto_auto]" onSubmit={addCustomStyle}>
            <input
              className="rounded-lg border border-stone-300 bg-white p-3 outline-none focus:border-emerald-600"
              placeholder="Add your own train-like style"
              value={customStyleName}
              onChange={(event) => setCustomStyleName(event.target.value)}
            />
            <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
              Add
            </button>
            <button
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold"
              onClick={() => setShowCustomStyle(false)}
              type="button"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
          <span className="font-semibold">Train-like emphasis:</span>{" "}
          {selectedStyle?.description || createGenericStyleDescription(preferences.style)}
          {selectedStyle?.source === "profile" && (
            <span className="mt-1 block text-xs text-emerald-800">
              Personalized from profile sports / dance interests.
            </span>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold">AI Coach Recommendation</h3>
            <p className="mt-2 max-w-3xl text-sm text-stone-600">
              A connected weekly training plan sized from goals, equipment,
              limitations, cardio zones, recovery needs, and available days.
            </p>
            {aiFitnessPlan && (
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                AI plan active
              </p>
            )}
          </div>
          <button
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-400"
            disabled={isGeneratingFitnessPlan}
            onClick={generateAiFitnessPlan}
            type="button"
          >
            {isGeneratingFitnessPlan ? "Generating..." : "Generate AI Plan"}
          </button>
        </div>

        {fitnessAiError && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {fitnessAiError}
          </p>
        )}
        {aiFitnessPlan?.coachSummary && (
          <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
            {aiFitnessPlan.coachSummary}
          </p>
        )}

        <div className="mt-5 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CoachMetric
            isActive={activeCoachInsight === "trainingDays"}
            label="Training days"
            onClick={() => setActiveCoachInsight("trainingDays")}
            value={`${activeTrainingDays}/wk`}
          />
          <CoachMetric
            isActive={activeCoachInsight === "strength"}
            label="Strength"
            onClick={() => setActiveCoachInsight("strength")}
            value={`${activeCoachRecommendation.strengthDays}/wk`}
          />
          <CoachMetric
            isActive={activeCoachInsight === "cardio"}
            label="Cardio"
            onClick={() => setActiveCoachInsight("cardio")}
            value={`${activeCoachRecommendation.cardioDays}/wk`}
          />
          <CoachMetric
            isActive={activeCoachInsight === "mobility"}
            label="Mobility"
            onClick={() => setActiveCoachInsight("mobility")}
            value={`${activeCoachRecommendation.mobilityDays}/wk`}
          />
        </div>

        <CoachInsightPanel insight={coachInsights[activeCoachInsight]} />

        <div className="mt-3 text-xs text-stone-500">
          Click a coach metric to see why it is structured that way.
        </div>

        <div className="mt-6 border-t pt-5">
          <button
            className="flex w-full items-start justify-between gap-4 rounded-lg text-left"
            onClick={() => setShowGeneratedWorkouts(!showGeneratedWorkouts)}
            type="button"
          >
            <span>
              <span className="block text-xl font-semibold">Generated Workouts</span>
              <span className="mt-2 block text-sm text-stone-600">
                View the full weekly plan or focus on one workout at a time.
              </span>
            </span>
            <span className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold">
              {showGeneratedWorkouts ? "Minimize" : "Open"}
            </span>
          </button>

          {showGeneratedWorkouts && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <button
                  className={
                    workoutView === "week"
                      ? "rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
                      : "rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold"
                  }
                  onClick={() => setWorkoutView("week")}
                >
                  Week
                </button>
                <button
                  className={
                    workoutView === "day"
                      ? "rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
                      : "rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold"
                  }
                  onClick={() => setWorkoutView("day")}
                >
                  Day
                </button>
              </div>

              {workoutView === "day" && (
                <div className="mt-4">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {plan.map((workout, index) => (
                      <button
                        className={
                          safeSelectedDayIndex === index
                            ? "rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
                            : "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold"
                        }
                        key={workout.day}
                        onClick={() => setSelectedDayIndex(index)}
                      >
                        {workout.day}
                      </button>
                    ))}
                  </div>
                  {selectedWorkout && (
                    <WorkoutCard
                      workout={selectedWorkout}
                      onTrackExercise={addExerciseLog}
                      extraExercises={extraExercisesByDay[selectedWorkout.day] || []}
                      onAddExercise={addWorkoutExercise}
                      onOpenTutorial={setActiveTutorial}
                      onChangeDuration={changeWorkoutDuration}
                    />
                  )}
                </div>
              )}

              {workoutView === "week" && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {plan.map((workout) => (
                    <WorkoutCard
                      key={workout.day}
                      workout={workout}
                      onTrackExercise={addExerciseLog}
                      extraExercises={extraExercisesByDay[workout.day] || []}
                      onAddExercise={addWorkoutExercise}
                      onOpenTutorial={setActiveTutorial}
                      onChangeDuration={changeWorkoutDuration}
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 rounded-lg border bg-stone-50 p-4">
                <h3 className="text-xl font-semibold">Progression Coach</h3>
                <p className="mt-2 text-sm text-stone-600">
                  If all sets hit the top of the rep range twice, increase load by
                  5 lb for lower-body lifts or 2.5 lb for upper-body lifts.
                </p>
                <div className="mt-4 space-y-2">
                  {exerciseLog.length === 0 && (
                    <p className="text-sm text-stone-500">No exercise logs yet.</p>
                  )}
                  {exerciseLog.map((log) => (
                    <div className="rounded-lg bg-white p-3 text-sm" key={`${log.name}-${log.date}-${log.weight}`}>
                      <strong>{log.name}</strong>: {log.sets} sets x {log.reps} reps at {log.weight} lb
                      <span className="block text-xs text-stone-500">
                        {log.day ? `${log.day} - ` : ""}{log.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-lg border bg-stone-50 p-4">
                <button
                  className="flex w-full items-center justify-between gap-4 text-left"
                  onClick={() => setShowCoachNotes(!showCoachNotes)}
                  type="button"
                >
                  <span>
                    <span className="block text-lg font-semibold">Coach Notes</span>
                    <span className="mt-1 block text-sm text-stone-600">
                      Priorities, rationale, and recovery.
                    </span>
                  </span>
                  <span className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold">
                    {showCoachNotes ? "Minimize" : "Open"}
                  </span>
                </button>

                {showCoachNotes && (
                  <div className="mt-4 grid w-full gap-3 text-sm text-stone-700 lg:grid-cols-3">
                    <CoachPlanNote
                      label={aiFitnessPlan?.priorities?.length ? "AI priorities" : "Priorities"}
                      value={activeCoachRecommendation.priorities.join(", ")}
                    />
                    <CoachPlanNote
                      label={aiFitnessPlan?.rationale ? "AI rationale" : "Rationale"}
                      value={activeCoachRecommendation.rationale}
                    />
                    <CoachPlanNote
                      label={aiFitnessPlan?.recovery ? "AI recovery" : "Recovery"}
                      value={activeCoachRecommendation.recovery}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">Heart Rate Zones</h3>
              <p className="mt-2 text-sm text-stone-600">
                Estimated max: {heartRateZones.maxHeartRate} bpm.
              </p>
            </div>
            <button
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold"
              onClick={() => setShowHeartRateZones(!showHeartRateZones)}
            >
              {showHeartRateZones ? "Hide" : "Show"}
            </button>
          </div>
          {showHeartRateZones && (
            <div className="mt-4 grid gap-2">
              {heartRateZones.zones.map((zone) => (
                <ZoneRow key={zone.name} zone={zone} />
              ))}
            </div>
          )}
      </div>

      {activeTutorial && (
        <TutorialPanel
          tutorial={activeTutorial}
          onClose={() => setActiveTutorial(null)}
        />
      )}
    </section>
  )
}

function createCoachRecommendation(profile, goals, selectedStyle) {
  const goalsText = getGoalsText(goals)
  const profileText = `${profile.activityLevel} ${profile.sportsInterests} ${profile.limitations} ${profile.equipment}`
  const goalText = `${goalsText} ${profileText}`.toLowerCase()
  const priorities = []
  let strengthDays = 3
  let cardioDays = 2
  let mobilityDays = 3

  if (includesAny(goalText, ["glute", "muscle", "strength", "arms", "back"])) {
    strengthDays = 4
    priorities.push(createPriorityLabel("Progressive strength", goalsText, profile.sportsInterests))
  }

  if (includesAny(goalText, ["fat loss", "waist", "conditioning"])) {
    cardioDays = Math.max(cardioDays, 3)
    priorities.push(createPriorityLabel("Energy expenditure", goalsText, profile.activityLevel))
  }

  if (includesAny(goalText, ["hockey", "basketball", "soccer", "skating", "speed", "running", "rowing"])) {
    cardioDays = Math.max(cardioDays, 3)
    strengthDays = Math.max(strengthDays, 3)
    priorities.push(createPriorityLabel("Sport conditioning", profile.sportsInterests, goalsText))
    priorities.push(createPriorityLabel("Power and deceleration", profile.sportsInterests, profile.activityLevel))
  }

  if (includesAny(goalText, ["dance", "mobility", "flexibility", "hamstring", "hip", "lower back"])) {
    mobilityDays = 5
    priorities.push(createPriorityLabel("Mobility and control", profile.limitations, profile.sportsInterests))
  }

  if (priorities.length === 0) {
    priorities.push(createPriorityLabel("Balanced fitness", goalsText, profile.activityLevel))
  }

  const styleLabel = selectedStyle?.label || "Athlete"
  const recommendedTotalDays = Math.min(6, Math.max(strengthDays, cardioDays, Math.ceil(mobilityDays / 2)))
  const namedFocus = createNamedFocus(profile, goals)

  return {
    strengthDays,
    cardioDays,
    mobilityDays,
    recommendedTotalDays,
    priorities: dedupeList(priorities).slice(0, 4),
    rationale: createPersonalizedRationale(profile, goals, styleLabel, {
      strengthDays,
      cardioDays,
      mobilityDays,
      recommendedTotalDays,
      namedFocus,
    }),
    recovery: createPersonalizedRecovery(profile, {
      cardioDays,
      strengthDays,
      mobilityDays,
      namedFocus,
    }),
    mobilityStrategy: createPersonalizedMobilityStrategy(profile, mobilityDays),
    cardioStrategy: createPersonalizedCardioStrategy(profile, goals, cardioDays),
  }
}

function createPriorityLabel(base, primary = "", secondary = "") {
  const context = getShortContext(primary) || getShortContext(secondary)

  return context ? `${base} for ${context}` : base
}

function getShortContext(value = "") {
  const cleaned = String(value)
    .split(/,|;|\band\b|\+|\//)
    .map((item) => item.trim())
    .filter(Boolean)
    .find((item) => item.length > 2)

  return cleaned ? cleaned.toLowerCase() : ""
}

function createNamedFocus(profile, goals) {
  const focusItems = getGoalFocusContexts(goals, profile)

  return dedupeList(focusItems).slice(0, 3)
}

function createPersonalizedRationale(profile, goals, styleLabel, recommendation) {
  const equipment = getShortContext(profile.equipment)
  const focusText = recommendation.namedFocus.length
    ? ` around ${formatList(recommendation.namedFocus)}`
    : ""
  const limitationText = profile.limitations
    ? ` while respecting ${profile.limitations.toLowerCase()}`
    : ""
  const goalBrief = getPrimaryGoalText(goals)
  const goalText = goalBrief ? ` The plan is anchored to "${goalBrief}".` : ""
  const equipmentText = equipment ? ` It uses available ${equipment} work` : " It uses available training tools"

  return `${styleLabel} training is set at ${recommendation.recommendedTotalDays} days to balance ${recommendation.strengthDays} strength, ${recommendation.cardioDays} cardio, and ${recommendation.mobilityDays} mobility exposures${focusText}.${equipmentText}${limitationText}.${goalText}`
}

function createPersonalizedRecovery(profile, recommendation) {
  const limitationText = profile.limitations
    ? ` Extra recovery attention goes to ${profile.limitations.toLowerCase()}.`
    : ""
  const sportText = getShortContext(profile.sportsInterests)
  const sportRecovery = sportText
    ? ` Hard conditioning is separated from heavy strength when possible so ${sportText} performance does not get buried by fatigue.`
    : ""
  const mobilityText = recommendation.mobilityDays >= 4
    ? " Frequent mobility is used as recovery work, not just stretching at the end."
    : " Mobility stays short and consistent so recovery does not become another hard session."

  return `${mobilityText}${sportRecovery}${limitationText} Use Zone 1-2 work or an easier strength day when soreness is high.`
}

function createPersonalizedMobilityStrategy(profile, mobilityDays) {
  const limitationText = profile.limitations
    ? ` with extra attention to ${profile.limitations.toLowerCase()}`
    : ""

  return `${mobilityDays} mobility exposures are placed as warm-ups, finishers, or recovery work${limitationText}.`
}

function createPersonalizedCardioStrategy(profile, goals, cardioDays) {
  const cardioGoal =
    getShortContext(goals.fitnessGoal) ||
    getShortContext(goals.activitiesGoal) ||
    getShortContext(goals.cardioGoal) ||
    getShortContext(profile.sportsInterests)
  const cardioContext = cardioGoal ? ` for ${cardioGoal}` : ""

  return `${cardioDays} cardio exposures support aerobic base and conditioning${cardioContext} without taking quality away from strength days.`
}

function getGoalFocusContexts(goals, profile) {
  return [
    getShortContext(goals.programGoal),
    getShortContext(goals.activitiesGoal),
    getShortContext(goals.mobilityPainGoal),
    getShortContext(goals.compositionGoal),
    getShortContext(goals.fitnessGoal),
    getShortContext(goals.bodyGoal),
    getShortContext(goals.strengthGoal),
    getShortContext(goals.cardioGoal),
    getShortContext(goals.mobilityGoal),
    getShortContext(goals.sportGoal),
    getShortContext(profile.sportsInterests),
  ].filter(Boolean)
}

function getPrimaryGoalText(goals) {
  return [
    goals.goalBrief,
    goals.programGoal,
    goals.fitnessGoal,
    goals.compositionGoal,
    goals.activitiesGoal,
    goals.mobilityPainGoal,
    goals.bodyGoal,
    goals.strengthGoal,
    goals.cardioGoal,
    goals.mobilityGoal,
    goals.sportGoal,
  ].find(Boolean)
}

function dedupeList(items) {
  return Array.from(new Set(items.filter(Boolean)))
}

function formatList(items) {
  if (items.length <= 1) return items[0] || ""
  if (items.length === 2) return `${items[0]} and ${items[1]}`

  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`
}

function getActiveTrainingDays(profile, preferences, coachRecommendation) {
  if (preferences.daysOverride) {
    return Number(preferences.daysOverride)
  }

  if (profile.trainingDaysMode === "coach") {
    return coachRecommendation.recommendedTotalDays
  }

  return Number(profile.trainingDays || coachRecommendation.recommendedTotalDays)
}

function createCoachInsights(profile, goals, heartRateZones, coachRecommendation, activeTrainingDays, plan, aiFitnessPlan) {
  const cardioSummary = createCardioSummary(profile, goals, heartRateZones, coachRecommendation)
  const split = getStrengthSplit(plan)
  const strengthDays = aiFitnessPlan?.strengthDays || coachRecommendation.strengthDays
  const cardioDays = aiFitnessPlan?.cardioDays || coachRecommendation.cardioDays
  const mobilityDays = aiFitnessPlan?.mobilityDays || coachRecommendation.mobilityDays
  const mobilityPlacements = Array.from(
    new Set(plan.filter((workout) => workout.mobilityIncluded).map((workout) => describeMobilityPlacement(workout.mobility?.placement)))
  )

  return {
    trainingDays: {
      title: "Training days",
      text: `AI coach recommends ${activeTrainingDays} days because this covers ${strengthDays} strength, ${cardioDays} cardio, and ${mobilityDays} mobility exposures without crowding recovery.`,
      details: [
        `Split: ${strengthDays} strength / ${cardioDays} cardio / ${mobilityDays} mobility.`,
        coachRecommendation.recovery,
      ],
    },
    strength: {
      title: "Strength",
      text: `AI coach splits strength as ${split.summary}. This keeps progressive work frequent while avoiding too many hard lower-body sessions back to back.`,
      details: split.details,
    },
    cardio: {
      title: "Cardio",
      text: `AI coach uses ${cardioDays} cardio exposures to build the aerobic base and add conditioning only where it supports the week.`,
      details: cardioSummary.map((cardio) =>
        `${cardio.title}: ${cardio.amount} using ${cardio.modality}, ${cardio.zone.name} (${cardio.zone.bpm}).`
      ),
    },
    mobility: {
      title: "Mobility",
      text: `AI coach integrates mobility ${mobilityDays} times so hips, hamstrings, spine, and ankles support the strength and cardio work.`,
      details: [
        `Placement: ${mobilityPlacements.join(", ") || "Coach decides based on the workout."}`,
        "Exercises are short warm-ups or finishers unless the week needs a separate recovery emphasis.",
      ],
    },
  }
}

function getStrengthSplit(plan) {
  const strengthWorkouts = plan.filter((workout) => workout.strengthIncluded)
  const upperDays = strengthWorkouts.filter((workout) =>
    includesAny(`${workout.title} ${workout.focus}`.toLowerCase(), ["upper", "arms", "back", "pull", "posture"])
  ).length
  const lowerDays = strengthWorkouts.filter((workout) =>
    includesAny(`${workout.title} ${workout.focus}`.toLowerCase(), ["lower", "glute", "hamstring", "leg"])
  ).length
  const powerDays = strengthWorkouts.filter((workout) =>
    includesAny(`${workout.title} ${workout.focus}`.toLowerCase(), ["power", "speed", "interval"])
  ).length
  const balancedDays = Math.max(strengthWorkouts.length - upperDays - lowerDays - powerDays, 0)
  const parts = [
    lowerDays ? `${lowerDays} lower-body` : "",
    upperDays ? `${upperDays} upper-body` : "",
    powerDays ? `${powerDays} power/conditioning` : "",
    balancedDays ? `${balancedDays} balanced` : "",
  ].filter(Boolean)

  return {
    summary: parts.join(", ") || "balanced full-body strength days",
    details: strengthWorkouts.map((workout) => `${workout.day}: ${workout.title}`),
  }
}

function createWorkoutPlan(profile, goals, preferences, styleOptions, heartRateZones, coachRecommendation, activeTrainingDays) {
  const days = activeTrainingDays
  const equipmentText = `${profile.equipment} ${preferences.location}`.toLowerCase()
  const goalText = getGoalsText(goals).toLowerCase()
  const selectedStyle = styleOptions.find((style) => style.value === preferences.style)
  const styleLabel = selectedStyle?.label || toTitleCase(preferences.style)
  const styleFocus = selectedStyle?.focus || preferences.style
  const availableExercises = exerciseLibrary.filter((exercise) =>
    exercise.equipment.some((item) => equipmentText.includes(item))
  )
  const selectedExercises = availableExercises.length
    ? availableExercises
    : exerciseLibrary.filter((exercise) => exercise.equipment.includes("bodyweight"))

  const templates = [
    { day: "Day 1", title: "Glutes + Pull Strength", focus: "glutes, back, progressive overload" },
    { day: "Day 2", title: "Cardio + Mobility", focus: `conditioning, hamstrings, ${styleFocus}` },
    { day: "Day 3", title: "Upper Body Shape", focus: "arms, back, posture" },
    { day: "Day 4", title: `${styleLabel} Power + Intervals`, focus: `glutes, speed, conditioning, ${styleFocus}` },
    { day: "Day 5", title: `${styleLabel} Training Session`, focus: styleFocus },
    { day: "Day 6", title: "Recovery Strength", focus: "mobility, core, zone 2" },
  ]
  const adjustedStrengthDays = Math.min(days, coachRecommendation.strengthDays)
  const adjustedCardioDays = preferences.cardioPlacement === "minimal"
    ? Math.min(days, 1)
    : Math.min(days, coachRecommendation.cardioDays)
  const adjustedMobilityDays = Math.min(days, coachRecommendation.mobilityDays)

  return templates.slice(0, days).map((template, index) => {
    const durationPreference = preferences.workoutDurationsByDay?.[template.day] || preferences.duration
    const exercisePool = rankExercises(selectedExercises, goalText, template.focus)
    const isMobilityOnlyDay = preferences.mobilityPlacement === "separate" && index === days - 1 && days > 2
    const isCardioOnlyDay = preferences.cardioPlacement === "separate" && index === 1 && days > 3
    const strengthIncluded = !isMobilityOnlyDay && !isCardioOnlyDay && index < adjustedStrengthDays
    const cardioIncluded = shouldIncludeCardio(index, adjustedCardioDays, preferences.cardioPlacement, days, isCardioOnlyDay)
    const mobilityIncluded = shouldIncludeMobility(index, adjustedMobilityDays, preferences.mobilityPlacement, days, isMobilityOnlyDay)
    const timing = createWorkoutTiming(
      { ...template, strengthIncluded, cardioIncluded, mobilityIncluded },
      durationPreference
    )

    return {
      ...template,
      location: preferences.location,
      prescription: strengthIncluded
        ? `${getStrengthPrescription(durationPreference)} (${describeDurationPreference(durationPreference)})`
        : `No strength block today (${describeDurationPreference(durationPreference)})`,
      duration: formatWorkoutDuration(timing.total),
      durationPreference,
      timeBreakdown: timing,
      strengthIncluded,
      cardioIncluded,
      mobilityIncluded,
      cardio: cardioIncluded ? createWorkoutCardio(template, profile, goals, heartRateZones, durationPreference, timing.cardio) : null,
      mobility: mobilityIncluded ? createMobilityBlock(template, preferences.mobilityPlacement, durationPreference, timing.mobility) : null,
      exercises: strengthIncluded ? exercisePool.slice(0, getExerciseCount(durationPreference)) : [],
    }
  })
}

function shouldIncludeCardio(index, cardioDays, placement, totalDays, isCardioOnlyDay) {
  if (cardioDays === 0) return false
  if (isCardioOnlyDay) return true
  if (placement === "separate") return index < cardioDays && index % 2 === 1
  if (placement === "minimal") return index === totalDays - 1
  if (placement === "after") return index < cardioDays
  if (placement === "mixed") return index < cardioDays
  return index < cardioDays || index === totalDays - 1
}

function shouldIncludeMobility(index, mobilityDays, placement, totalDays, isMobilityOnlyDay) {
  if (mobilityDays === 0) return false
  if (isMobilityOnlyDay) return true
  if (placement === "separate") return index === totalDays - 1
  if (placement === "warmup" || placement === "end" || placement === "mixed") return index < mobilityDays
  return index < mobilityDays
}

const workoutDurationOptions = [
  { value: "coach", label: "Coach recommendation" },
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "60 min" },
  { value: "75", label: "75 min" },
  { value: "90", label: "90 min" },
]

function applyWorkoutTiming(workout, durationPreference = "coach") {
  const timing = createWorkoutTiming(workout, durationPreference)
  const scaledPreference = durationPreferenceFromMinutes(timing.total)
  const nextWorkout = {
    ...workout,
    duration: formatWorkoutDuration(timing.total),
    durationPreference,
    timeBreakdown: timing,
  }

  if (nextWorkout.strengthIncluded) {
    nextWorkout.prescription = `${getStrengthPrescription(scaledPreference)} (${describeDurationPreference(durationPreference)})`
    nextWorkout.exercises = (nextWorkout.exercises || []).slice(0, getExerciseCount(scaledPreference))
  } else {
    nextWorkout.prescription = `No strength block today (${describeDurationPreference(durationPreference)})`
  }

  if (nextWorkout.cardioIncluded && nextWorkout.cardio) {
    nextWorkout.cardio = {
      ...nextWorkout.cardio,
      amount: createTimedCardioAmount(nextWorkout.cardio, timing.cardio),
    }
  }

  if (nextWorkout.mobilityIncluded && nextWorkout.mobility) {
    nextWorkout.mobility = {
      ...nextWorkout.mobility,
      amount: `${timing.mobility} minutes`,
    }
  }

  return nextWorkout
}

function createWorkoutTiming(workout, durationPreference = "coach") {
  const total = getWorkoutMinutes(workout, durationPreference)
  const sections = [
    workout.strengthIncluded ? { key: "strength", weight: getSectionWeight(workout, "strength") } : null,
    workout.cardioIncluded ? { key: "cardio", weight: getSectionWeight(workout, "cardio") } : null,
    workout.mobilityIncluded ? { key: "mobility", weight: getSectionWeight(workout, "mobility") } : null,
  ].filter(Boolean)

  if (sections.length === 0) {
    return { total, strength: 0, cardio: 0, mobility: 0 }
  }

  const rawMinutes = sections.map((section) => ({
    ...section,
    minutes: (total * section.weight) / sections.reduce((sum, item) => sum + item.weight, 0),
  }))
  const rounded = rawMinutes.map((section) => ({
    ...section,
    minutes: Math.max(getSectionMinimum(section.key, total), Math.floor(section.minutes)),
  }))
  let remainingMinutes = total - rounded.reduce((sum, section) => sum + section.minutes, 0)
  const sortedByRemainder = [...rawMinutes].sort(
    (a, b) => (b.minutes - Math.floor(b.minutes)) - (a.minutes - Math.floor(a.minutes))
  )

  while (remainingMinutes > 0) {
    sortedByRemainder.forEach((section) => {
      if (remainingMinutes <= 0) return
      const target = rounded.find((item) => item.key === section.key)
      target.minutes += 1
      remainingMinutes -= 1
    })
  }

  return {
    total,
    strength: rounded.find((section) => section.key === "strength")?.minutes || 0,
    cardio: rounded.find((section) => section.key === "cardio")?.minutes || 0,
    mobility: rounded.find((section) => section.key === "mobility")?.minutes || 0,
  }
}

function getWorkoutMinutes(workout, durationPreference = "coach") {
  if (durationPreference !== "coach") {
    return Number(durationPreference)
  }

  if (workout.strengthIncluded && workout.cardioIncluded && workout.mobilityIncluded) return 60
  if (workout.strengthIncluded && workout.cardioIncluded) return 55
  if (workout.strengthIncluded && workout.mobilityIncluded) return 50
  if (workout.cardioIncluded && workout.mobilityIncluded) return 40
  if (workout.strengthIncluded) return 45
  if (workout.cardioIncluded) return 30
  if (workout.mobilityIncluded) return 30

  return 30
}

function getSectionWeight(workout, section) {
  if (section === "strength") return workout.cardioIncluded ? 5 : 7
  if (section === "cardio") return workout.strengthIncluded ? 3 : 6
  return workout.mobilityIncluded && !workout.strengthIncluded && !workout.cardioIncluded ? 8 : 2
}

function getSectionMinimum(section, total) {
  if (section === "mobility") return total <= 15 ? 3 : 5
  if (section === "cardio") return total <= 15 ? 5 : 8
  return total <= 15 ? 7 : 12
}

function formatWorkoutDuration(minutes) {
  return `${minutes} min total`
}

function durationPreferenceFromMinutes(minutes) {
  if (minutes <= 15) return "15"
  if (minutes <= 30) return "30"
  if (minutes <= 45) return "45"
  if (minutes <= 60) return "60"
  if (minutes <= 75) return "75"

  return "90"
}

function getStrengthPrescription(durationPreference) {
  const prescriptions = {
    15: "1 to 2 focused working sets",
    30: "2 to 3 working sets",
    45: "3 working sets",
    60: "3 to 4 working sets",
    75: "4 working sets with accessory volume",
    90: "4 to 5 working sets with full accessory volume",
    coach: "3 to 4 working sets",
  }

  return prescriptions[durationPreference] || prescriptions.coach
}

function getExerciseCount(durationPreference) {
  const counts = {
    15: 2,
    30: 3,
    45: 4,
    60: 5,
    75: 6,
    90: 7,
    coach: 4,
  }

  return counts[durationPreference] || counts.coach
}

function getMobilityAmount(placement, durationPreference, minutes) {
  if (minutes) return `${minutes} minutes`

  if (placement === "separate") {
    return durationPreference === "15" ? "12-15 minutes" : "20-30 minutes"
  }

  const amounts = {
    15: "3-5 minutes",
    30: "5-8 minutes",
    45: "8-10 minutes",
    60: "10-12 minutes",
    75: "12-15 minutes",
    90: "15-18 minutes",
    coach: "8-12 minutes",
  }

  return amounts[durationPreference] || amounts.coach
}

function getIntervalAmount(modality, durationPreference) {
  const rower = modality.includes("Row")
  const amounts = {
    15: rower ? "5 rounds: 30 sec hard / 60 sec easy" : "6 rounds: 20 sec hard / 70 sec easy",
    30: rower ? "6 rounds: 45 sec hard / 75 sec easy" : "8 rounds: 30 sec hard / 90 sec easy",
    45: rower ? "8 rounds: 45 sec hard / 75 sec easy" : "10 rounds: 30 sec hard / 90 sec easy",
    60: rower ? "10 rounds: 60 sec hard / 90 sec easy" : "12 rounds: 30 sec hard / 90 sec easy",
    75: rower ? "12 rounds: 60 sec hard / 90 sec easy" : "14 rounds: 35 sec hard / 85 sec easy",
    90: rower ? "14 rounds: 60 sec hard / 90 sec easy" : "16 rounds: 40 sec hard / 80 sec easy",
    coach: rower ? "8 rounds: 45 sec hard / 75 sec easy" : "10 rounds: 30 sec hard / 90 sec easy",
  }

  return amounts[durationPreference] || amounts.coach
}

function getCardioAmount(durationPreference, type) {
  if (type === "recovery") {
    const amounts = {
      15: "8-12 minutes",
      30: "15-20 minutes",
      45: "20-30 minutes",
      60: "30-40 minutes",
      75: "35-45 minutes",
      90: "40-50 minutes",
      coach: "20-30 minutes",
    }

    return amounts[durationPreference] || amounts.coach
  }

  const amounts = {
    15: "8-12 minutes",
    30: "15-25 minutes",
    45: "25-35 minutes",
    60: "35-45 minutes",
    75: "40-55 minutes",
    90: "50-65 minutes",
    coach: "25-40 minutes",
  }

  return amounts[durationPreference] || amounts.coach
}

function createTimedCardioAmount(cardio, minutes) {
  if (!minutes) return ""

  const isIntervalSession = cardio.title?.toLowerCase().includes("interval")
  if (!isIntervalSession) return `${minutes} minutes`

  const hardSeconds = minutes <= 10 ? 30 : 45
  const easySeconds = minutes <= 20 ? 75 : 90
  const roundMinutes = (hardSeconds + easySeconds) / 60
  const rounds = Math.max(4, Math.round(minutes / roundMinutes))

  return `${rounds} rounds: ${hardSeconds} sec hard / ${easySeconds} sec easy`
}

function createMobilityBlock(template, placement, durationPreference = "coach", minutes = null) {
  const focus = template.focus.toLowerCase()
  const drills = focus.includes("glute") || focus.includes("speed")
    ? ["90/90 hip switches", "Couch stretch", "Adductor rockbacks", "Ankle dorsiflexion pulses"]
    : ["Thoracic rotations", "Hamstring flossing", "Hip flexor breathing", "Deep squat pry"]

  return {
    placement,
    amount: getMobilityAmount(placement, durationPreference, minutes),
    drills,
  }
}

function createWorkoutCardio(template, profile, goals, heartRateZones, durationPreference = "coach", minutes = null) {
  const equipmentText = `${profile.equipment} ${profile.sportsInterests}`.toLowerCase()
  const goalText = getGoalsText(goals).toLowerCase()
  const modality = chooseCardioModality(equipmentText, goalText, template.focus)

  if (template.focus.toLowerCase().includes("speed") || template.focus.toLowerCase().includes("conditioning")) {
    return {
      title: "Intervals",
      modality,
      amount: createTimedCardioAmount({ title: "Intervals", modality }, minutes) || getIntervalAmount(modality, durationPreference),
      intensity: "Hard but repeatable",
      zone: heartRateZones.zones[3],
      note: "Recover in Zone 1-2 between hard efforts.",
    }
  }

  if (template.focus.toLowerCase().includes("mobility") || template.title.toLowerCase().includes("recovery")) {
    return {
      title: "Easy aerobic flush",
      modality,
      amount: minutes ? `${minutes} minutes` : getCardioAmount(durationPreference, "recovery"),
      intensity: "Easy conversational pace",
      zone: heartRateZones.zones[1],
      note: "Use this to support recovery without adding fatigue.",
    }
  }

  return {
    title: "Zone 2 base",
    modality,
    amount: minutes ? `${minutes} minutes` : getCardioAmount(durationPreference, "base"),
    intensity: "Comfortably challenging, nasal-breathing friendly",
    zone: heartRateZones.zones[1],
    note: "Best for fat loss support, aerobic base, and recovery capacity.",
  }
}

function chooseCardioModality(equipmentText, goalText, focus) {
  const combinedText = `${equipmentText} ${goalText} ${focus}`.toLowerCase()

  if (combinedText.includes("row")) return "Rowing machine"
  if (combinedText.includes("stair")) return "StairMaster"
  if (combinedText.includes("treadmill") || combinedText.includes("run")) return "Treadmill run or incline walk"
  if (combinedText.includes("skating")) return "Skating intervals or lateral conditioning"
  if (combinedText.includes("bike") || combinedText.includes("cycle")) return "Bike"

  return "Incline walk, outdoor walk, or bodyweight conditioning"
}

function createHeartRateZones(profile) {
  const age = Number(profile.age || 35)
  const maxHeartRate = Math.max(120, Math.round(220 - age))
  const zoneDefinitions = [
    { name: "Zone 1", percent: "50-60%", range: [0.5, 0.6], purpose: "warm-up, cooldown, recovery" },
    { name: "Zone 2", percent: "60-70%", range: [0.6, 0.7], purpose: "fat oxidation, aerobic base, easy endurance" },
    { name: "Zone 3", percent: "70-80%", range: [0.7, 0.8], purpose: "tempo conditioning and steady performance" },
    { name: "Zone 4", percent: "80-90%", range: [0.8, 0.9], purpose: "threshold, speed, and hard intervals" },
    { name: "Zone 5", percent: "90-100%", range: [0.9, 1], purpose: "short peak efforts and power" },
  ]

  return {
    maxHeartRate,
    zones: zoneDefinitions.map((zone) => ({
      ...zone,
      bpm: `${Math.round(maxHeartRate * zone.range[0])}-${Math.round(maxHeartRate * zone.range[1])} bpm`,
    })),
  }
}

function createCardioSummary(profile, goals, heartRateZones, coachRecommendation) {
  const equipmentText = `${profile.equipment} ${profile.sportsInterests}`.toLowerCase()
  const goalText = getGoalsText(goals).toLowerCase()
  const modality = chooseCardioModality(equipmentText, goalText, "")
  const hasSpeedGoal = includesAny(goalText, ["speed", "run", "running", "row", "rowing", "basketball", "skating"])

  return [
    {
      title: "Base cardio",
      modality,
      amount: `${Math.max(1, coachRecommendation.cardioDays - 1)} sessions / week, 30-45 min`,
      zone: heartRateZones.zones[1],
      intensity: "Easy conversational pace",
    },
    {
      title: hasSpeedGoal ? "Speed intervals" : "Conditioning intervals",
      modality,
      amount: coachRecommendation.cardioDays >= 2 ? "1 session / week, 12-20 min work" : "Optional, 8-12 min work",
      zone: heartRateZones.zones[3],
      intensity: "Hard efforts with full control",
    },
    {
      title: "Recovery cardio",
      modality: "Walk, easy bike, or gentle row",
      amount: "1-2 optional sessions, 15-25 min",
      zone: heartRateZones.zones[0],
      intensity: "Very easy",
    },
  ]
}

function rankExercises(exercises, goalText, focus) {
  return [...exercises].sort((a, b) => {
    const aScore = scoreExercise(a, goalText, focus)
    const bScore = scoreExercise(b, goalText, focus)
    return bScore - aScore
  })
}

function scoreExercise(exercise, goalText, focus) {
  const text = `${exercise.name} ${exercise.focus}`.toLowerCase()
  const focusText = focus.toLowerCase()
  let score = 0

  if (focusText.includes("glute") && text.includes("glute")) score += 3
  if (focusText.includes("cardio") && text.includes("cardio")) score += 3
  if (focusText.includes("back") && text.includes("back")) score += 2
  if (includesAny(`${goalText} ${focusText}`, ["dance", "dancer"]) && text.includes("dance")) score += 2
  if (includesAny(`${goalText} ${focusText}`, ["row", "rower"]) && text.includes("row")) score += 2
  if (includesAny(`${goalText} ${focusText}`, ["skate", "skater", "basketball", "soccer", "tennis"]) && text.includes("power")) score += 2
  if (includesAny(`${goalText} ${focusText}`, ["flexibility", "mobility"]) && text.includes("flexibility")) score += 2

  return score
}

function createStyleOptions(profile, activeStyleValue) {
  const profileSports = extractSportStyles(profile.sportsInterests)
  const defaults = [
    createStyleOption("athlete", "default"),
    createStyleOption("basketball player", "default"),
    createStyleOption("rower", "default"),
    createStyleOption("raqs sharqi", "default"),
    createStyleOption("dancer", "default"),
    createStyleOption("dragon slayer", "default"),
    createStyleOption("warrior", "default"),
    createStyleOption("pahlavani", "default"),
  ]
  const activeStyle = activeStyleValue && !defaults.some((style) => style.value === activeStyleValue)
    ? [createStyleOption(activeStyleValue.replace(/-/g, " "), "custom")]
    : []
  const mergedStyles = [...defaults, ...profileSports, ...activeStyle]
  const uniqueStyles = new Map()

  mergedStyles.forEach((style) => {
    if (!uniqueStyles.has(style.value)) {
      uniqueStyles.set(style.value, style)
    }
  })

  return Array.from(uniqueStyles.values())
}

function getGoalsText(goals) {
  return Object.values(goals)
    .map((value) => {
      if (value && typeof value === "object") {
        return Object.entries(value)
          .filter(([, nestedValue]) => nestedValue)
          .map(([key, nestedValue]) => `${key} ${nestedValue}`)
          .join(" ")
      }

      return value || ""
    })
    .join(" ")
}

function extractSportStyles(value = "") {
  return value
    .split(/,|;|\band\b|\+|\//)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(cleanStyleName)
    .filter((item) => item.length > 2)
    .map((item) => createStyleOption(item, "profile"))
}

function cleanStyleName(value) {
  return value
    .toLowerCase()
    .replace(/\b(improve|support|training|workout|workouts|technique|interests|sport|sports|style|like|better|for)\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function createStyleOption(styleName, source) {
  const value = styleName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const knownDescriptions = {
    dance: "Fluid strength, posture, single-leg control, hip isolation, rhythm, and mobility.",
    dancer: "Fluid strength, posture, single-leg control, hip isolation, rhythm, and mobility.",
    rowing: "Posterior-chain strength, pulling volume, aerobic base, power endurance, and intervals.",
    rower: "Posterior-chain strength, pulling volume, aerobic base, power endurance, and intervals.",
    "raqs-sharqi": "Fluid hips, core control, posture, shimmies, endurance, mobility, and graceful strength.",
    "dragon-slayer": "Mythic strength, carries, power intervals, trunk control, mobility, and confident conditioning.",
    running: "Speed mechanics, single-leg strength, calves, hamstrings, aerobic base, and intervals.",
    skating: "Lateral strength, balance, glutes, single-leg power, edge control, and rotation.",
    "ice-skater": "Lateral power, single-leg stability, adductors, glutes, rotational control, and landing mechanics.",
    athlete: "Balanced strength, cardio, mobility, power, and recovery for broad performance.",
    basketball: "Jump power, deceleration, lateral agility, ankle strength, conditioning, and upper-body durability.",
    "basketball-player": "Jump power, deceleration, lateral agility, ankle strength, conditioning, and upper-body durability.",
    pahlavani: "Bodyweight strength, clubs-inspired shoulders, rhythm, mobility, and conditioning.",
    warrior: "Heavy compounds, carries, power work, trunk strength, and simple conditioning.",
  }

  return {
    value,
    label: toTitleCase(styleName),
    source,
    focus: styleName,
    description: knownDescriptions[value] || createGenericStyleDescription(styleName),
  }
}

function createGenericStyleDescription(styleName) {
  return `Train like a ${styleName}: build strength, mobility, power, conditioning, balance, and injury resilience around that activity.`
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word))
}

function toTitleCase(value) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ")
}

function SelectField({ label, value, onChange, options }) {
  const normalizedOptions = options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option }
      : option
  )

  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </span>
      <select
        className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-3 outline-none focus:border-emerald-600"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function ZoneRow({ zone }) {
  return (
    <div className="grid gap-2 rounded-lg bg-stone-50 p-3 text-sm sm:grid-cols-[80px_110px_1fr]">
      <div className="font-semibold">{zone.name}</div>
      <div className="text-stone-600">{zone.bpm}</div>
      <div className="text-stone-600">
        {zone.percent} - {zone.purpose}
      </div>
    </div>
  )
}

function CoachMetric({ label, value, isActive, onClick }) {
  return (
    <button
      className={
        isActive
          ? "flex min-h-16 items-center justify-between gap-3 rounded-lg border border-emerald-600 bg-emerald-50 px-4 py-3 text-left shadow-sm"
          : "flex min-h-16 items-center justify-between gap-3 rounded-lg border bg-stone-50 px-4 py-3 text-left hover:border-emerald-300"
      }
      onClick={onClick}
      type="button"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </p>
      <p className="shrink-0 text-2xl font-bold">{value}</p>
    </button>
  )
}

function CoachInsightPanel({ insight }) {
  if (!insight) return null

  return (
    <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-950">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <p className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-emerald-700">
          {insight.title}
        </p>
        <div className="space-y-2">
          <p className="font-medium">{insight.text}</p>
          <div className="flex flex-wrap gap-2">
            {insight.details.map((detail) => (
              <span className="rounded-lg bg-white px-3 py-2 text-xs text-emerald-900" key={detail}>
                {detail}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CoachPlanNote({ label, value }) {
  return (
    <div className="flex min-h-20 items-start gap-3 rounded-lg bg-stone-50 p-4">
      <p className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </p>
      <p className="leading-relaxed">{value}</p>
    </div>
  )
}

function describeMobilityPlacement(value) {
  const labels = {
    end: "At the end of workouts",
    warmup: "As the warm-up",
    separate: "As a separate day",
    mixed: "Mixed into strength",
    ai: "Coach decides",
  }

  return labels[value] || "Coach decides"
}

function describeDurationPreference(value) {
  const labels = {
    coach: "Coach recommendation",
    15: "15 min",
    30: "30 min",
    45: "45 min",
    60: "60 min",
    75: "75 min",
    90: "90 min",
  }

  return labels[value] || labels.coach
}

function WorkoutCard({ workout, onTrackExercise, extraExercises, onAddExercise, onOpenTutorial, onChangeDuration }) {
  return (
    <div className="rounded-lg border bg-stone-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-lg bg-stone-900 px-3 py-1 text-xs font-semibold text-white">
          {workout.day}
        </span>
        <span className="text-xs text-stone-500">{workout.location}</span>
      </div>
      <h4 className="mt-4 font-semibold">{workout.title}</h4>
      <p className="mt-1 text-sm text-stone-600">{workout.focus}</p>
      <p className="mt-2 text-xs font-medium text-emerald-700">
        {workout.prescription}
      </p>
      {workout.timeBreakdown && (
        <div className="mt-4 rounded-lg border bg-white p-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_160px] sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Time target
              </p>
              <p className="mt-1 text-2xl font-bold text-stone-900">
                {workout.timeBreakdown.total} min
              </p>
              <p className="mt-1 text-xs text-stone-500">
                {workout.durationPreference === "coach"
                  ? "Default coach recommendation"
                  : "Adjusted from coach recommendation"}
              </p>
            </div>
            <SelectField
              label="Workout time"
              value={workout.durationPreference || "coach"}
              onChange={(value) => onChangeDuration(workout.day, value)}
              options={workoutDurationOptions}
            />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <TimeBreakdownItem label="Cardio" minutes={workout.timeBreakdown.cardio} tone="emerald" />
            <TimeBreakdownItem label="Strength" minutes={workout.timeBreakdown.strength} tone="stone" />
            <TimeBreakdownItem label="Mobility" minutes={workout.timeBreakdown.mobility} tone="purple" />
          </div>
        </div>
      )}
      <div className="mt-4 rounded-lg border bg-white p-3 text-sm">
        <div className="font-semibold">Strength</div>
        {workout.strengthIncluded ? (
          <div className="mt-2 space-y-2">
            {workout.exercises.map((exercise) => (
              <ExerciseRow
                exercise={exercise}
                key={exercise.name}
                workoutDay={workout.day}
                onLogExercise={onTrackExercise}
                onOpenTutorial={onOpenTutorial}
              />
            ))}
            {extraExercises.map((exercise) => (
              <ExerciseRow
                exercise={exercise}
                key={`${workout.day}-${exercise.name}-${exercise.sets}-${exercise.reps}`}
                workoutDay={workout.day}
                onLogExercise={onTrackExercise}
                onOpenTutorial={onOpenTutorial}
              />
            ))}
            <InlineExerciseAdder
              day={workout.day}
              onAddExercise={onAddExercise}
            />
          </div>
        ) : (
          <p className="mt-2 text-xs text-stone-500">
            Not planned today so recovery and other priorities stay balanced.
          </p>
        )}
      </div>

      <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold text-emerald-950">Cardio</div>
          {workout.cardioIncluded && (
            <TutorialButton
              label={`Open ${workout.cardio.modality} tutorial`}
              onClick={() => onOpenTutorial(createCardioTutorial(workout.cardio))}
            />
          )}
        </div>
        {workout.cardioIncluded ? (
          <>
            <div className="mt-1 text-emerald-900">
              {workout.cardio.title}: {workout.cardio.modality} - {workout.cardio.amount}
            </div>
            <div className="mt-1 text-xs text-emerald-800">
              {workout.cardio.zone.name} ({workout.cardio.zone.bpm}) - {workout.cardio.intensity}
            </div>
            <div className="mt-1 text-xs text-emerald-800">
              {workout.cardio.note}
            </div>
          </>
        ) : (
          <p className="mt-2 text-xs text-emerald-800">
            Not planned today. Keep steps easy and save intensity for the scheduled cardio days.
          </p>
        )}
      </div>

      <div className="mt-3 rounded-lg border border-purple-100 bg-purple-50 p-3 text-sm">
        <div className="font-semibold text-purple-950">Mobility</div>
        {workout.mobilityIncluded ? (
          <>
            <p className="mt-1 text-purple-900">
              {describeMobilityPlacement(workout.mobility.placement)} - {workout.mobility.amount}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {workout.mobility.drills.map((drill) => (
                <button
                  className="rounded-lg bg-white px-2 py-1 text-left text-xs font-medium text-purple-800 hover:text-purple-950"
                  key={drill}
                  onClick={() => onOpenTutorial(createMobilityTutorial(drill, workout.mobility))}
                  type="button"
                >
                  {drill}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-2 text-xs text-purple-800">
            Not planned today. Mobility volume is assigned elsewhere this week.
          </p>
        )}
      </div>
    </div>
  )
}

function TimeBreakdownItem({ label, minutes, tone }) {
  const styles = {
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-900",
    stone: "border-stone-200 bg-stone-50 text-stone-900",
    purple: "border-purple-100 bg-purple-50 text-purple-900",
  }

  return (
    <div className={`rounded-lg border p-3 ${styles[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold">{minutes} min</p>
    </div>
  )
}

function ExerciseRow({ exercise, workoutDay, onLogExercise, onOpenTutorial }) {
  const [isTracking, setIsTracking] = useState(false)
  const [logForm, setLogForm] = useState({
    sets: exercise.sets || "",
    weight: "",
    reps: exercise.reps || "",
  })

  function submitLog(event) {
    event.preventDefault()

    onLogExercise({
      name: exercise.name,
      sets: logForm.sets,
      weight: logForm.weight,
      reps: logForm.reps,
      day: workoutDay,
    })
    setIsTracking(false)
  }

  return (
    <div className="rounded-lg bg-stone-50 p-3 text-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-medium">{exercise.name}</div>
          <div className="text-xs text-stone-500">
            {exercise.sets || "-"} sets x {exercise.reps || "-"} - {exercise.focus || "Added exercise"}
          </div>
        </div>
        <div className="flex gap-2">
          <TutorialButton
            label={`Open ${exercise.name} tutorial`}
            onClick={() => onOpenTutorial(createStrengthTutorial(exercise))}
          />
          <button
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold"
            onClick={() => setIsTracking(!isTracking)}
            type="button"
          >
            {isTracking ? "Cancel" : "Track"}
          </button>
        </div>
      </div>
      {isTracking && (
        <form className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={submitLog}>
          <input
            className="rounded-lg border border-stone-300 bg-white p-2 text-sm outline-none focus:border-emerald-600"
            placeholder="Sets"
            value={logForm.sets}
            onChange={(event) => setLogForm({ ...logForm, sets: event.target.value })}
          />
          <input
            className="rounded-lg border border-stone-300 bg-white p-2 text-sm outline-none focus:border-emerald-600"
            placeholder="Weight"
            value={logForm.weight}
            onChange={(event) => setLogForm({ ...logForm, weight: event.target.value })}
          />
          <input
            className="rounded-lg border border-stone-300 bg-white p-2 text-sm outline-none focus:border-emerald-600"
            placeholder="Reps"
            value={logForm.reps}
            onChange={(event) => setLogForm({ ...logForm, reps: event.target.value })}
          />
          <button className="rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white">
            Save
          </button>
        </form>
      )}
    </div>
  )
}

function InlineExerciseAdder({ day, onAddExercise }) {
  const [isAdding, setIsAdding] = useState(false)
  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    sets: "",
    reps: "",
  })

  function chooseInlineExercise(value) {
    const selectedExercise = exerciseLibrary.find((exercise) => exercise.name === value)

    if (!selectedExercise) {
      setExerciseForm({
        name: "",
        sets: "",
        reps: "",
      })
      return
    }

    setExerciseForm({
      name: selectedExercise.name,
      sets: selectedExercise.sets,
      reps: selectedExercise.reps,
    })
  }

  function addExercise(event) {
    event.preventDefault()

    if (!exerciseForm.name.trim()) return

    onAddExercise(day, {
      ...exerciseForm,
      focus: "Added exercise",
    })
    setExerciseForm({
      name: "",
      sets: "",
      reps: "",
    })
    setIsAdding(false)
  }

  if (!isAdding) {
    return (
      <button
        className="w-full rounded-lg border border-dashed border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 hover:border-emerald-500 hover:text-emerald-700"
        onClick={() => setIsAdding(true)}
        type="button"
      >
        + Add exercise
      </button>
    )
  }

  return (
    <form className="rounded-lg border border-dashed border-stone-300 bg-white p-3" onSubmit={addExercise}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">Add exercise to {day}</div>
        <button
          className="rounded-lg border border-stone-300 px-3 py-1 text-xs font-semibold"
          onClick={() => setIsAdding(false)}
          type="button"
        >
          Cancel
        </button>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-[1.2fr_1.2fr_0.7fr_0.7fr_auto]">
        <select
          className="rounded-lg border border-stone-300 bg-white p-2 text-sm outline-none focus:border-emerald-600"
          value={exerciseLibrary.some((exercise) => exercise.name === exerciseForm.name) ? exerciseForm.name : ""}
          onChange={(event) => chooseInlineExercise(event.target.value)}
        >
          <option value="">Dropdown or freestyle</option>
          {exerciseLibrary.map((exercise) => (
            <option key={exercise.name} value={exercise.name}>
              {exercise.name}
            </option>
          ))}
        </select>
        <input
          className="rounded-lg border border-stone-300 p-2 text-sm outline-none focus:border-emerald-600"
          placeholder="Exercise name"
          value={exerciseForm.name}
          onChange={(event) => setExerciseForm({ ...exerciseForm, name: event.target.value })}
        />
        <input
          className="rounded-lg border border-stone-300 p-2 text-sm outline-none focus:border-emerald-600"
          placeholder="Sets"
          value={exerciseForm.sets}
          onChange={(event) => setExerciseForm({ ...exerciseForm, sets: event.target.value })}
        />
        <input
          className="rounded-lg border border-stone-300 p-2 text-sm outline-none focus:border-emerald-600"
          placeholder="Reps"
          value={exerciseForm.reps}
          onChange={(event) => setExerciseForm({ ...exerciseForm, reps: event.target.value })}
        />
        <button className="rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white">
          Add
        </button>
      </div>
      <p className="mt-2 text-xs text-stone-500">
        AI can later interpret freestyle entries and add the right exercise details automatically.
      </p>
    </form>
  )
}

function TutorialButton({ label, onClick }) {
  return (
    <button
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-lg border border-stone-300 bg-white text-xs font-bold text-stone-700 hover:border-emerald-500 hover:text-emerald-700"
      onClick={onClick}
      title={label}
      type="button"
    >
      ?
    </button>
  )
}

function TutorialPanel({ tutorial, onClose }) {
  return (
    <div className="fixed inset-0 z-40 bg-stone-950/40 p-4">
      <div className="mx-auto flex max-h-[92vh] max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {tutorial.type} tutorial
            </p>
            <h3 className="mt-1 text-xl font-semibold">{tutorial.name}</h3>
            <p className="mt-1 text-sm text-stone-600">{tutorial.summary}</p>
          </div>
          <button
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="grid gap-5 overflow-y-auto p-5 md:grid-cols-[260px_1fr]">
          <AvatarDemo tutorial={tutorial} />

          <div className="space-y-4">
            <TutorialDetail title="Setup" text={tutorial.setup} />
            <TutorialDetail title="How to move" text={tutorial.cue} />
            <TutorialDetail title="Avoid" text={tutorial.mistake} />
            <div className="rounded-lg border bg-stone-50 p-4">
              <h4 className="font-semibold">Focus points</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {tutorial.focusPoints.map((point) => (
                  <span className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-stone-700" key={point}>
                    {point}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AvatarDemo({ tutorial }) {
  return (
    <div className="rounded-lg border bg-stone-50 p-4">
      <div className="relative mx-auto h-64 max-w-56 rounded-lg bg-white">
        <div className="absolute left-1/2 top-8 h-10 w-10 -translate-x-1/2 rounded-full border-4 border-emerald-700 bg-emerald-100" />
        <div className="absolute left-1/2 top-20 h-20 w-12 -translate-x-1/2 rounded-full border-4 border-emerald-700 bg-emerald-50" />
        <div className={tutorial.avatarClass.arms} />
        <div className={tutorial.avatarClass.legs} />
        <div className={tutorial.avatarClass.equipment} />
      </div>
      <p className="mt-3 text-center text-xs text-stone-500">
        AI avatar demo placeholder for {tutorial.name}
      </p>
    </div>
  )
}

function TutorialDetail({ title, text }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-2 text-sm text-stone-600">{text}</p>
    </div>
  )
}

function createStrengthTutorial(exercise) {
  return {
    type: "Strength",
    name: exercise.name,
    summary: `Learn the setup, movement pattern, and most important cue for ${exercise.name}.`,
    setup: createEquipmentSetup(exercise),
    cue: exercise.cue || "Move with control and keep the target muscles doing the work.",
    mistake: exercise.mistake || "Rushing reps or using momentum instead of clean positions.",
    focusPoints: [exercise.focus || "Strength", `${exercise.sets || "-"} sets`, `${exercise.reps || "-"} reps`],
    avatarClass: getAvatarClass(exercise.name),
  }
}

function createCardioTutorial(cardio) {
  const isRowing = cardio.modality.toLowerCase().includes("row")

  return {
    type: "Cardio",
    name: cardio.modality,
    summary: `${cardio.title} technique for ${cardio.amount}.`,
    setup: isRowing
      ? "Set the foot straps across the widest part of the foot, sit tall, grip lightly, and start each stroke from a strong leg drive."
      : "Set the machine so you can keep tall posture, smooth breathing, and the prescribed intensity without gripping or bracing too hard.",
    cue: isRowing
      ? "Drive with legs first, swing the body open, then pull arms. Return arms first, body forward, then knees bend."
      : "Build gradually into the target zone and keep the effort matched to the recommended heart-rate range.",
    mistake: isRowing
      ? "Yanking with the arms before the legs have driven the handle back."
      : "Starting too hard and drifting above the intended zone too early.",
    focusPoints: [cardio.zone.name, cardio.zone.bpm, cardio.intensity],
    avatarClass: getAvatarClass(cardio.modality),
  }
}

function createMobilityTutorial(drill, mobility) {
  return {
    type: "Mobility",
    name: drill,
    summary: `${describeMobilityPlacement(mobility.placement)} for ${mobility.amount}.`,
    setup: "Use a quiet range of motion, support yourself as needed, and make the position feel controlled before adding depth.",
    cue: "Move slowly, breathe into the position, and pause where you feel useful tension without pinching.",
    mistake: "Forcing range, bouncing, or turning the drill into a painful stretch.",
    focusPoints: ["Control", "Breathing", mobility.amount],
    avatarClass: getAvatarClass(drill),
  }
}

function createEquipmentSetup(exercise) {
  const text = `${exercise.name} ${exercise.equipment?.join(" ") || ""}`.toLowerCase()

  if (text.includes("smith")) return "Set the Smith bar at hip height, place upper back on a bench, and line feet up so shins are close to vertical at the top."
  if (text.includes("cable")) return "Set the cable height for the target line of pull, brace tall, and choose a load you can pause without leaning back."
  if (text.includes("dumbbell")) return "Pick weights you can control, stack joints before starting, and keep the rep path smooth."
  if (text.includes("kettlebell")) return "Place the bell slightly in front of you, hinge to grip it, and hike it back before snapping the hips forward."
  if (text.includes("barbell")) return "Set the bar close to the body, brace before the lift, and keep the bar path tight."

  return "Start in a stable position, check the target muscles, and choose a range you can control cleanly."
}

function getAvatarClass(name) {
  const text = name.toLowerCase()
  const base = {
    arms: "absolute left-1/2 top-24 h-2 w-28 -translate-x-1/2 rounded-full bg-emerald-700",
    legs: "absolute left-1/2 top-40 h-24 w-24 -translate-x-1/2 border-x-4 border-emerald-700",
    equipment: "absolute bottom-6 left-1/2 h-2 w-36 -translate-x-1/2 rounded-full bg-stone-300",
  }

  if (text.includes("row")) {
    return {
      arms: "absolute left-1/2 top-28 h-2 w-32 -translate-x-1/2 -rotate-6 rounded-full bg-emerald-700",
      legs: "absolute left-1/2 top-44 h-2 w-32 -translate-x-1/2 rotate-6 rounded-full bg-emerald-700",
      equipment: "absolute bottom-8 left-1/2 h-10 w-44 -translate-x-1/2 rounded-lg border-4 border-stone-300",
    }
  }

  if (text.includes("mobility") || text.includes("stretch") || text.includes("hip") || text.includes("90/90")) {
    return {
      arms: "absolute left-1/2 top-28 h-2 w-28 -translate-x-1/2 rotate-12 rounded-full bg-purple-700",
      legs: "absolute left-1/2 top-44 h-20 w-32 -translate-x-1/2 rounded-b-full border-b-4 border-x-4 border-purple-700",
      equipment: "absolute bottom-6 left-1/2 h-2 w-40 -translate-x-1/2 rounded-full bg-purple-200",
    }
  }

  if (text.includes("dumbbell") || text.includes("press")) {
    return {
      arms: "absolute left-1/2 top-14 h-24 w-28 -translate-x-1/2 border-x-4 border-t-4 border-emerald-700",
      legs: base.legs,
      equipment: "absolute left-1/2 top-10 h-3 w-40 -translate-x-1/2 rounded-full bg-stone-400",
    }
  }

  return base
}

export default FitnessSection
