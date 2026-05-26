import { useEffect, useState } from "react"
import GoalsSection from "./Components/GoalsSection"
import NutritionSection from "./Components/NutritionSection"
import FitnessSection from "./Components/FitnessSection"

const defaultProfile = {
  name: "",
  age: "",
  genderIdentity: "",
  sex: "",
  height: "",
  heightFeet: "",
  heightInches: "",
  weight: "",
  measurements: {},
  activityLevel: "moderate",
  equipment: "",
  dietaryPreferences: "",
  mealPreference: "coach",
  allergies: "",
  limitations: "",
  sportsInterests: "",
  trainingDaysMode: "coach",
  trainingDays: "",
}

const measurementOptions = [
  { value: "shoulders", label: "Shoulders" },
  { value: "chest", label: "Chest" },
  { value: "waist", label: "Waist" },
  { value: "hips", label: "Hips" },
  { value: "glutes", label: "Glutes" },
  { value: "thighs", label: "Thighs" },
]

const activityLevelOptions = [
  {
    value: "low",
    label: "Low activity - mostly seated desk work",
  },
  {
    value: "moderate",
    label: "Moderate activity - desk work with regular movement",
  },
  {
    value: "high",
    label: "High activity - athlete or physically demanding job",
  },
]

const profileTextareaSuggestions = {
  equipment:
    "Commercial gym, dumbbells, barbells, Smith machine, cable machine, leg press, lat pulldown, treadmill, step machine, rower, spin bike, kettlebells, resistance bands, pull-up bar, bench",
  sportsInterests:
    "Dance, running, rowing, skating, hiking, tennis, soccer, strength training, Pilates, yoga",
  limitations:
    "Lower-back sensitivity, hamstring tightness, knee pain, shoulder limits, ankle mobility, postpartum recovery",
  dietaryPreferences:
    "High-protein, anti-inflammatory, Mediterranean, vegetarian, quick meal prep, budget-friendly, higher fiber",
  allergies:
    "Dairy, gluten, shellfish, peanuts, tree nuts, soy, eggs, foods you avoid by choice",
}

const defaultGoals = {
  goalBrief: "",
  programGoal: "",
  activitiesGoal: "",
  mobilityPainGoal: "",
  compositionGoal: "",
  fitnessGoal: "",
  bodyGoal: "",
  strengthGoal: "",
  cardioGoal: "",
  mobilityGoal: "",
  sportGoal: "",
  measurementGoals: {},
}

const defaultDashboardItems = ["weight", "waist", "trainingDays"]

function readStoredValue(key, fallback) {
  const storedValue = localStorage.getItem(key)

  if (!storedValue) return fallback

  try {
    return {
      ...fallback,
      ...JSON.parse(storedValue),
    }
  } catch {
    return fallback
  }
}

function readStoredArray(key, fallback) {
  const storedValue = localStorage.getItem(key)

  if (!storedValue) return fallback

  try {
    const parsedValue = JSON.parse(storedValue)
    return Array.isArray(parsedValue) ? parsedValue : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [activeTab, setActiveTab] = useState("profile")
  const [showDashboardSettings, setShowDashboardSettings] = useState(false)
  const [profile, setProfile] = useState(() =>
    readStoredValue("profile", defaultProfile)
  )
  const [goals, setGoals] = useState(() =>
    readStoredValue("goals", defaultGoals)
  )
  const [dashboardItems, setDashboardItems] = useState(() =>
    readStoredArray("dashboardItems", defaultDashboardItems)
  )
  const profileMeasurements = getProfileMeasurements(profile)
  const dashboardOptions = getDashboardOptions(profile, profileMeasurements)
  const selectedDashboardStats = dashboardOptions.filter((option) =>
    dashboardItems.includes(option.value)
  )

  useEffect(() => {
    localStorage.setItem("profile", JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals))
  }, [goals])

  useEffect(() => {
    localStorage.setItem("dashboardItems", JSON.stringify(dashboardItems))
  }, [dashboardItems])

  function toggleDashboardItem(value) {
    if (dashboardItems.includes(value)) {
      if (dashboardItems.length === 1) return

      setDashboardItems(dashboardItems.filter((item) => item !== value))
      return
    }

    setDashboardItems([...dashboardItems, value])
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <header className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Personal fitness + nutrition operating system
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Nourish & Train
            </h1>

            <p className="mt-3 max-w-3xl text-base text-stone-600">
              Track meals, plan dinners, generate grocery lists, translate
              goals into workouts, and log progress from one adaptive dashboard.
            </p>
          </div>

          <div className="relative rounded-lg border bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid flex-1 auto-cols-fr grid-flow-col gap-2 overflow-x-auto">
              {selectedDashboardStats.map((stat) => (
                <MiniStat key={stat.value} label={stat.label} value={stat.displayValue} />
              ))}
              </div>
              <button
                className="shrink-0 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-500 hover:border-emerald-500 hover:text-emerald-700"
                onClick={() => setShowDashboardSettings(!showDashboardSettings)}
                type="button"
              >
                Edit
              </button>
            </div>

            {showDashboardSettings && (
              <div className="absolute right-0 top-full z-20 mt-2 grid w-72 gap-2 rounded-lg border bg-white p-3 shadow-lg sm:grid-cols-2">
                {dashboardOptions.map((option) => (
                  <label
                    className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-700"
                    key={option.value}
                  >
                    <input
                      checked={dashboardItems.includes(option.value)}
                      onChange={() => toggleDashboardItem(option.value)}
                      type="checkbox"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </header>

        <nav className="flex flex-wrap gap-2 rounded-lg border bg-white p-2 shadow-sm">
          <TabButton label="Profile" value="profile" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton label="Goals" value="goals" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton label="Nutrition" value="nutrition" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton label="Fitness" value="fitness" activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>

        {activeTab === "profile" && (
          <ProfileSection profile={profile} setProfile={setProfile} />
        )}
        {activeTab === "goals" && (
          <GoalsSection goals={goals} setGoals={setGoals} profile={profile} />
        )}
        {activeTab === "nutrition" && (
          <NutritionSection profile={profile} goals={goals} />
        )}
        {activeTab === "fitness" && (
          <FitnessSection profile={profile} goals={goals} />
        )}
      </div>
    </div>
  )
}

function ProfileSection({ profile, setProfile }) {
  const [showMeasurements, setShowMeasurements] = useState(false)
  const [measurementForm, setMeasurementForm] = useState({
    type: "waist",
    value: "",
  })
  const measurements = getProfileMeasurements(profile)

  function updateProfile(field, value) {
    setProfile({
      ...profile,
      [field]: value,
    })
  }

  function updateHeight(field, value) {
    const parsedHeight = parseHeight(profile.height)
    const nextHeight = {
      feet: profile.heightFeet || parsedHeight.feet,
      inches: profile.heightInches || parsedHeight.inches,
      [field === "heightFeet" ? "feet" : "inches"]: value,
    }

    setProfile({
      ...profile,
      heightFeet: nextHeight.feet,
      heightInches: nextHeight.inches,
      height: `${nextHeight.feet} ft ${nextHeight.inches} in`,
    })
  }

  function addMeasurement(event) {
    event.preventDefault()

    if (!measurementForm.value.trim()) return

    setProfile({
      ...profile,
      measurements: {
        ...measurements,
        [measurementForm.type]: measurementForm.value,
      },
    })

    setMeasurementForm({
      ...measurementForm,
      value: "",
    })
  }

  function removeMeasurement(type) {
    const nextMeasurements = { ...measurements }
    delete nextMeasurements[type]

    setProfile({
      ...profile,
      measurements: nextMeasurements,
    })
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-semibold">Profile</h2>
        <p className="mt-2 text-sm text-stone-600">
          This is the base layer for nutrition targets, training plans,
          equipment filtering, mobility work, and meal planning.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ProfileInput label="Name" value={profile.name} onChange={(value) => updateProfile("name", value)} />
          <ProfileInput label="Age" value={profile.age} onChange={(value) => updateProfile("age", value)} />
          <ProfileInput
            label="Gender identity"
            value={profile.genderIdentity || profile.sex || ""}
            onChange={(value) => updateProfile("genderIdentity", value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <ProfileInput
              label="Height feet"
              value={profile.heightFeet || parseHeight(profile.height).feet}
              onChange={(value) => updateHeight("heightFeet", value)}
            />
            <ProfileInput
              label="Height inches"
              value={profile.heightInches || parseHeight(profile.height).inches}
              onChange={(value) => updateHeight("heightInches", value)}
            />
          </div>
          <ProfileInput label="Weight (lb)" value={profile.weight} onChange={(value) => updateProfile("weight", value)} />
          <ProfileSelect
            label="Training days preference"
            value={profile.trainingDaysMode}
            onChange={(value) => updateProfile("trainingDaysMode", value)}
            options={[
              { value: "coach", label: "Use coach recommendation" },
              { value: "manual", label: "I will choose my days" },
            ]}
          />
          {profile.trainingDaysMode === "manual" && (
            <ProfileInput
              label="Training days per week"
              value={profile.trainingDays}
              onChange={(value) => updateProfile("trainingDays", value)}
            />
          )}
        </div>

        <div className="mt-6 rounded-lg border bg-stone-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Measurements</h3>
              <p className="mt-1 text-sm text-stone-600">
                Optional body measurements for goals and dashboard stats.
              </p>
            </div>
            <button
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold"
              onClick={() => setShowMeasurements(!showMeasurements)}
              type="button"
            >
              {showMeasurements ? "Hide" : "Open"}
            </button>
          </div>

          {!showMeasurements && Object.keys(measurements).length > 0 && (
            <p className="mt-3 text-sm text-stone-600">
              {formatMeasurements(measurements)}
            </p>
          )}

          {showMeasurements && (
            <>
              <form className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={addMeasurement}>
                <ProfileSelect
                  label="Measurement"
                  value={measurementForm.type}
                  onChange={(value) => setMeasurementForm({ ...measurementForm, type: value })}
                  options={measurementOptions}
                />
                <ProfileInput
                  label="Value"
                  value={measurementForm.value}
                  onChange={(value) => setMeasurementForm({ ...measurementForm, value })}
                />
                <button className="self-end rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white">
                  Add
                </button>
              </form>

              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {Object.keys(measurements).length === 0 && (
                  <p className="rounded-lg bg-white p-3 text-sm text-stone-500">
                    No measurements added yet.
                  </p>
                )}
                {measurementOptions
                  .filter((option) => measurements[option.value])
                  .map((option) => (
                    <div
                      className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 text-sm"
                      key={option.value}
                    >
                      <span>
                        <strong>{option.label}:</strong> {measurements[option.value]} in
                      </span>
                      <button
                        className="rounded-lg border border-stone-300 px-3 py-1 text-xs"
                        onClick={() => removeMeasurement(option.value)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-4 grid gap-4">
          <ProfileSelect
            label="Activity level"
            value={getActivityLevelValue(profile.activityLevel)}
            onChange={(value) => updateProfile("activityLevel", value)}
            options={activityLevelOptions}
          />
          <ProfileTextarea
            label="Equipment available"
            value={profile.equipment}
            onChange={(value) => updateProfile("equipment", value)}
            suggestions={profileTextareaSuggestions.equipment}
          />
          <ProfileTextarea
            label="Sports / dance interests"
            value={profile.sportsInterests}
            onChange={(value) => updateProfile("sportsInterests", value)}
            suggestions={profileTextareaSuggestions.sportsInterests}
          />
          <ProfileTextarea
            label="Injuries / limitations"
            value={profile.limitations}
            onChange={(value) => updateProfile("limitations", value)}
            suggestions={profileTextareaSuggestions.limitations}
          />
          <ProfileTextarea
            label="General nutrition preferences"
            value={profile.dietaryPreferences}
            onChange={(value) => updateProfile("dietaryPreferences", value)}
            suggestions={profileTextareaSuggestions.dietaryPreferences}
          />
          <ProfileSelect
            label="Meal pattern preference"
            value={profile.mealPreference || "coach"}
            onChange={(value) => updateProfile("mealPreference", value)}
            options={[
              { value: "coach", label: "Coach recommendation" },
              { value: "2", label: "2 meals per day" },
              { value: "3", label: "3 meals per day" },
              { value: "4", label: "4 meals per day" },
              { value: "5", label: "3 meals + 2 snacks" },
            ]}
          />
          <ProfileTextarea
            label="Allergies / foods to avoid"
            value={profile.allergies || ""}
            onChange={(value) => updateProfile("allergies", value)}
            suggestions={profileTextareaSuggestions.allergies}
          />
        </div>
      </div>

      <aside className="rounded-lg border bg-white p-5 shadow-sm">
        <h3 className="text-xl font-semibold">Personalization Inputs</h3>
        <div className="mt-4 space-y-3 text-sm text-stone-700">
          <SummaryRow label="Activity" value={formatActivityLevel(profile.activityLevel)} />
          <SummaryRow label="Equipment" value={profile.equipment} />
          <SummaryRow label="Sports" value={profile.sportsInterests} />
          <SummaryRow label="Limitations" value={profile.limitations} />
          <SummaryRow label="Diet" value={profile.dietaryPreferences} />
          <SummaryRow label="Meal Pattern" value={formatMealPreference(profile.mealPreference)} />
          <SummaryRow label="Avoids / Allergies" value={profile.allergies || "No allergies or avoidances added yet"} />
          <SummaryRow label="Measurements" value={formatMeasurements(measurements)} />
        </div>
      </aside>
    </section>
  )
}

function getProfileMeasurements(profile) {
  return {
    ...(profile.shoulders ? { shoulders: profile.shoulders } : {}),
    ...(profile.chest ? { chest: profile.chest } : {}),
    ...(profile.waist ? { waist: profile.waist } : {}),
    ...(profile.hips ? { hips: profile.hips } : {}),
    ...(profile.glutes ? { glutes: profile.glutes } : {}),
    ...(profile.thighs ? { thighs: profile.thighs } : {}),
    ...(profile.measurements || {}),
  }
}

function formatMeasurements(measurements) {
  const measurementText = measurementOptions
    .filter((option) => measurements[option.value])
    .map((option) => `${option.label}: ${measurements[option.value]} in`)
    .join(", ")

  return measurementText || "No measurements added yet"
}

function parseHeight(height = "") {
  const numbers = String(height).match(/\d+(\.\d+)?/g) || []

  return {
    feet: numbers[0] || "",
    inches: numbers[1] || "",
  }
}

function formatMealPreference(value = "coach") {
  const labels = {
    coach: "Coach recommendation",
    2: "2 meals per day",
    3: "3 meals per day",
    4: "4 meals per day",
    5: "3 meals + 2 snacks",
  }

  return labels[value] || labels.coach
}

function getActivityLevelValue(value = "moderate") {
  return activityLevelOptions.some((option) => option.value === value)
    ? value
    : "moderate"
}

function formatActivityLevel(value = "moderate") {
  const selectedOption = activityLevelOptions.find(
    (option) => option.value === getActivityLevelValue(value)
  )

  return selectedOption?.label || activityLevelOptions[1].label
}

function getDashboardOptions(profile, measurements) {
  return [
    { value: "weight", label: "Weight", displayValue: `${profile.weight || "-"} lb` },
    { value: "trainingDays", label: "Days", displayValue: profile.trainingDaysMode === "coach" ? "Coach" : `${profile.trainingDays || "-"}/wk` },
    { value: "age", label: "Age", displayValue: profile.age || "-" },
    { value: "height", label: "Height", displayValue: profile.height || "-" },
    { value: "shoulders", label: "Shoulders", displayValue: `${measurements.shoulders || "-"} in` },
    { value: "chest", label: "Chest", displayValue: `${measurements.chest || "-"} in` },
    { value: "waist", label: "Waist", displayValue: `${measurements.waist || "-"} in` },
    { value: "hips", label: "Hips", displayValue: `${measurements.hips || "-"} in` },
    { value: "glutes", label: "Glutes", displayValue: `${measurements.glutes || "-"} in` },
    { value: "thighs", label: "Thighs", displayValue: `${measurements.thighs || "-"} in` },
    { value: "sport", label: "Sport", displayValue: getShortValue(profile.sportsInterests) },
    { value: "equipment", label: "Equipment", displayValue: getShortValue(profile.equipment) },
  ]
}

function getShortValue(value) {
  if (!value) return "-"

  return value.split(",")[0].trim()
}

function ProfileInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <input
        className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-3 outline-none focus:border-emerald-600"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function ProfileSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <select
        className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-3 outline-none focus:border-emerald-600"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function ProfileTextarea({ label, value, onChange, suggestions }) {
  return (
    <label className="group relative block">
      <span className="flex items-center gap-2 text-sm font-medium text-stone-700">
        {label}
        {suggestions && (
          <span
            className="relative inline-flex h-5 w-5 items-center justify-center rounded-full border border-stone-300 text-xs font-semibold text-stone-500"
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
        className="mt-1 min-h-24 w-full rounded-lg border border-stone-300 bg-white p-3 outline-none focus:border-emerald-600"
        title={suggestions ? `Suggestions: ${suggestions}` : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function TabButton({ label, value, activeTab, setActiveTab }) {
  const isActive = activeTab === value

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={
        isActive
          ? "rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white"
          : "rounded-lg bg-stone-100 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-200"
      }
    >
      {label}
    </button>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="min-w-20 border-r border-stone-100 px-2 last:border-r-0">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-stone-400">{label}</p>
      <p className="mt-1 truncate text-xl font-bold leading-none text-stone-900">{value}</p>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="rounded-lg bg-stone-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </p>
      <p className="mt-1">{value}</p>
    </div>
  )
}

export default App
