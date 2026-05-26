import { useMemo, useState } from "react"

const recipeBank = [
  {
    name: "Joojeh Chicken Bowl",
    tags: ["high protein", "persian", "anti-inflammatory", "glute growth"],
    calories: 560,
    protein: 48,
    carbs: 58,
    fat: 16,
    fiber: 8,
    score: 9,
    ingredients: [
      { item: "chicken breast", amount: 6, unit: "oz" },
      { item: "basmati rice", amount: 0.75, unit: "cup dry" },
      { item: "Greek yogurt", amount: 0.25, unit: "cup" },
      { item: "saffron lemon marinade", amount: 2, unit: "tbsp" },
      { item: "cucumber tomato salad", amount: 2, unit: "cups" },
    ],
  },
  {
    name: "Salmon Herb Plate",
    tags: ["anti-inflammatory", "omega-3", "recovery"],
    calories: 620,
    protein: 42,
    carbs: 52,
    fat: 26,
    fiber: 10,
    score: 10,
    ingredients: [
      { item: "salmon", amount: 6, unit: "oz" },
      { item: "sweet potato", amount: 1, unit: "medium" },
      { item: "broccoli", amount: 2, unit: "cups" },
      { item: "olive oil", amount: 1, unit: "tbsp" },
      { item: "dill and parsley", amount: 0.5, unit: "cup" },
    ],
  },
  {
    name: "Tofu Veggie Noodle Bowl",
    tags: ["plant-forward", "high fiber", "dance fuel"],
    calories: 610,
    protein: 34,
    carbs: 76,
    fat: 18,
    fiber: 12,
    score: 8,
    ingredients: [
      { item: "extra firm tofu", amount: 7, unit: "oz" },
      { item: "rice noodles", amount: 2, unit: "oz dry" },
      { item: "mushrooms", amount: 1, unit: "cup" },
      { item: "bell peppers", amount: 1, unit: "cup" },
      { item: "ginger garlic sauce", amount: 2, unit: "tbsp" },
    ],
  },
  {
    name: "Turkey Kofta Meal Prep",
    tags: ["high protein", "meal prep", "fat loss"],
    calories: 520,
    protein: 46,
    carbs: 44,
    fat: 18,
    fiber: 9,
    score: 8,
    ingredients: [
      { item: "lean ground turkey", amount: 6, unit: "oz" },
      { item: "lentil cucumber salad", amount: 2, unit: "cups" },
      { item: "whole wheat pita", amount: 1, unit: "small" },
      { item: "tzatziki", amount: 0.25, unit: "cup" },
      { item: "mint and parsley", amount: 0.5, unit: "cup" },
    ],
  },
]

const mealPatterns = {
  coach: ["breakfast", "lunch", "dinner", "afternoonSnack"],
  2: ["brunch", "dinner"],
  3: ["breakfast", "lunch", "dinner"],
  4: ["breakfast", "lunch", "afternoonSnack", "dinner"],
  5: ["breakfast", "morningSnack", "lunch", "afternoonSnack", "dinner"],
}

const mealSlotDetails = {
  breakfast: { id: "breakfast", label: "Breakfast", detail: "" },
  brunch: { id: "brunch", label: "Brunch", detail: "" },
  morningSnack: { id: "morningSnack", label: "Snack", detail: "Morning" },
  lunch: { id: "lunch", label: "Lunch", detail: "" },
  afternoonSnack: { id: "afternoonSnack", label: "Snack", detail: "Afternoon" },
  dinner: { id: "dinner", label: "Dinner", detail: "" },
}

const micronutrients = [
  { key: "iron", label: "Iron", unit: "mg", target: 18 },
  { key: "calcium", label: "Calcium", unit: "mg", target: 1000 },
  { key: "magnesium", label: "Magnesium", unit: "mg", target: 320 },
  { key: "potassium", label: "Potassium", unit: "mg", target: 2600 },
  { key: "zinc", label: "Zinc", unit: "mg", target: 8 },
  { key: "selenium", label: "Selenium", unit: "mcg", target: 55 },
  { key: "vitaminD", label: "Vitamin D", unit: "mcg", target: 15 },
  { key: "vitaminC", label: "Vitamin C", unit: "mg", target: 75 },
  { key: "vitaminE", label: "Vitamin E", unit: "mg", target: 15 },
  { key: "omega3", label: "Omega-3", unit: "g", target: 1.1 },
  { key: "polyphenols", label: "Polyphenols", unit: "mg", target: 500 },
  { key: "curcumin", label: "Curcumin", unit: "mg", target: 100 },
]

function NutritionSection({ profile, goals }) {
  const [mealForm, setMealForm] = useState({
    slot: "",
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
    iron: "",
    calcium: "",
    magnesium: "",
    potassium: "",
    zinc: "",
    selenium: "",
    vitaminD: "",
    vitaminC: "",
    vitaminE: "",
    omega3: "",
    polyphenols: "",
    curcumin: "",
  })
  const [mealPhotoName, setMealPhotoName] = useState("")
  const [meals, setMeals] = useState([])
  const [plannedMeals, setPlannedMeals] = useState([])
  const [showMicronutrients, setShowMicronutrients] = useState(false)
  const [showMealMicronutrients, setShowMealMicronutrients] = useState(false)
  const [activeMealSlot, setActiveMealSlot] = useState("")
  const [mealTrackerView, setMealTrackerView] = useState("all")
  const [planningView, setPlanningView] = useState("ideas")
  const [aiPrompt, setAiPrompt] = useState("What can I make for dinner this week that fits my goals?")
  const [aiFocus, setAiFocus] = useState("Dinner ideas")
  const [aiNutritionPlan, setAiNutritionPlan] = useState(null)

  const targets = useMemo(() => createMacroTargets(profile, goals), [profile, goals])
  const micronutrientTargets = useMemo(
    () => createMicronutrientTargets(profile, goals),
    [profile, goals]
  )
  const activeMealSlots = useMemo(
    () => createMealSlots(profile, goals),
    [profile, goals]
  )
  const mealTargets = useMemo(
    () => createMealTargets(targets, activeMealSlots),
    [targets, activeMealSlots]
  )
  const totals = useMemo(() => totalMeals(meals), [meals])
  const micronutrientTotals = useMemo(() => totalMicronutrients(meals), [meals])
  const mealsBySlot = useMemo(() => groupMealsBySlot(meals), [meals])
  const recipes = useMemo(
    () => suggestRecipes(aiPrompt, profile, goals),
    [aiPrompt, profile, goals]
  )
  const groceryList = useMemo(
    () => createGroceryList(plannedMeals, 1),
    [plannedMeals]
  )
  const visibleMealSlots = mealTrackerView === "all"
    ? activeMealSlots
    : activeMealSlots.filter((slot) => slot.id === mealTrackerView)

  function addMeal(event) {
    event.preventDefault()

    const photoEstimate = mealPhotoName
      ? createPhotoMealEstimate(mealPhotoName, mealForm.slot, mealTargets[mealForm.slot])
      : null
    const finalMealForm = photoEstimate
      ? fillMealFormFromEstimate(mealForm, photoEstimate)
      : mealForm

    if (!finalMealForm.name.trim()) return

    setMeals([
      ...meals,
      {
        slot: finalMealForm.slot,
        name: finalMealForm.name,
        calories: Number(finalMealForm.calories || 0),
        protein: Number(finalMealForm.protein || 0),
        carbs: Number(finalMealForm.carbs || 0),
        fat: Number(finalMealForm.fat || 0),
        fiber: Number(finalMealForm.fiber || 0),
        micronutrients: getMealMicronutrients(finalMealForm),
        score: estimateAntiInflammatoryScore(finalMealForm),
        source: mealPhotoName ? `AI photo estimate: ${mealPhotoName}` : "manual",
      },
    ])

    setMealForm({
      slot: mealForm.slot,
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      fiber: "",
      iron: "",
      calcium: "",
      magnesium: "",
      potassium: "",
      zinc: "",
      selenium: "",
      vitaminD: "",
      vitaminC: "",
      vitaminE: "",
      omega3: "",
      polyphenols: "",
      curcumin: "",
    })
    setMealPhotoName("")
    setActiveMealSlot("")
  }

  function openMealTracker(slotId) {
    setMealTrackerView(slotId)
    setActiveMealSlot(activeMealSlot === slotId ? "" : slotId)
    setMealForm({
      ...mealForm,
      slot: slotId,
    })
  }

  function analyzeMealPhoto(fileName, slotId) {
    if (!fileName) {
      setMealPhotoName("")
      return
    }

    const estimate = createPhotoMealEstimate(fileName, slotId, mealTargets[slotId])

    setMealPhotoName(fileName)
    setMealForm(fillMealFormFromEstimate({ ...mealForm, slot: slotId }, estimate))
  }

  function addToPlan(name) {
    if (!plannedMeals.includes(name)) {
      setPlannedMeals([...plannedMeals, name])
    }
  }

  function removeFromPlan(name) {
    setPlannedMeals(plannedMeals.filter((mealName) => mealName !== name))
  }

  function generateAiNutritionPlan(event) {
    event.preventDefault()
    setAiNutritionPlan(
      createAiNutritionPlan(aiPrompt, aiFocus, profile, goals, targets, micronutrientTargets)
    )
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Nutrition</h2>
            <p className="mt-2 text-sm text-stone-600">
              Track meals, estimate macros from photos, plan dinners, and turn
              a week of recipes into a grocery list.
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
            Hydration target: {targets.hydration}
          </div>
        </div>

        <MacroSummaryBar
          stats={[
            { label: "Calories", current: totals.calories, target: targets.calories },
            { label: "Protein", current: `${totals.protein}g`, target: `${targets.protein}g` },
            { label: "Carbs", current: `${totals.carbs}g`, target: `${targets.carbs}g` },
            { label: "Fat", current: `${totals.fat}g`, target: `${targets.fat}g` },
            { label: "Fiber", current: `${totals.fiber}g`, target: `${targets.fiber}g` },
            { label: "Quality", current: `${totals.averageScore}/10`, target: "8+/10" },
          ]}
        />
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div>
          <h3 className="text-xl font-semibold">Daily Meal Tracker</h3>
          <p className="mt-2 text-sm text-stone-600">
            Click a meal to log food, macros, an optional photo, and optional micronutrients.
          </p>
        </div>
        <SegmentedControl
          className="mt-4"
          options={[
            { value: "all", label: "All" },
            ...activeMealSlots.map((slot) => ({
              value: slot.id,
              label: getMealName(slot),
            })),
          ]}
          value={mealTrackerView}
          onChange={(value) => {
            setMealTrackerView(value)
            if (value !== "all") {
              setActiveMealSlot(value)
              setMealForm({ ...mealForm, slot: value })
            }
          }}
        />
        <div className="mt-4 space-y-4">
            {visibleMealSlots.map((slot) => (
            <MealSlotCard
              key={slot.id}
              slot={slot}
              target={mealTargets[slot.id]}
              meals={mealsBySlot[slot.id] || []}
              isOpen={activeMealSlot === slot.id}
              onOpen={() => openMealTracker(slot.id)}
              mealForm={mealForm}
              setMealForm={setMealForm}
              mealPhotoName={mealPhotoName}
              onMealPhotoSelected={(fileName) => analyzeMealPhoto(fileName, slot.id)}
              showMealMicronutrients={showMealMicronutrients}
              setShowMealMicronutrients={setShowMealMicronutrients}
              onAddMeal={addMeal}
            />
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <form onSubmit={generateAiNutritionPlan}>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              AI nutrition coach
            </p>
            <h3 className="mt-1 text-xl font-semibold">Ask for a meal plan or dinner idea</h3>
            <p className="mt-2 text-sm text-stone-600">
              This is the first AI workflow. For now it creates a local coach
              draft from your profile, goals, macros, and preferences. Later
              this button will call the AI API through a backend.
            </p>

            <div className="mt-4 grid gap-3">
              <label className="block">
                <span className="text-xs font-medium text-stone-500">Focus</span>
                <select
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-3 outline-none focus:border-emerald-600"
                  value={aiFocus}
                  onChange={(event) => setAiFocus(event.target.value)}
                >
                  <option>Dinner ideas</option>
                  <option>Full day plan</option>
                  <option>Meal prep</option>
                  <option>Grocery list</option>
                  <option>Macro adjustment</option>
                </select>
              </label>
              <textarea
                className="min-h-28 rounded-lg border border-stone-300 p-3 outline-none focus:border-emerald-600"
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
              />
              <button className="rounded-lg bg-stone-900 px-5 py-3 font-semibold text-white">
                Generate Coach Draft
              </button>
            </div>
          </form>

          <AiNutritionPlan plan={aiNutritionPlan} />
        </div>

        <div className="mt-6 border-t pt-5">
          <h3 className="text-xl font-semibold">Meal Ideas + Weekly Plan</h3>
          <p className="mt-2 text-sm text-stone-600">
            Recommendations from the coach prompt can be planned here and turned
            into a grocery list.
          </p>
          <SegmentedControl
            className="mt-4"
            options={[
              { value: "ideas", label: "Meal Ideas" },
              { value: "plan", label: "Weekly Plan" },
              { value: "grocery", label: "Grocery List" },
              { value: "all", label: "All" },
            ]}
            value={planningView}
            onChange={setPlanningView}
          />

          {(planningView === "ideas" || planningView === "all") && (
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.name} recipe={recipe} onAdd={addToPlan} />
              ))}
            </div>
          )}

          {(planningView === "plan" || planningView === "grocery" || planningView === "all") && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            {(planningView === "plan" || planningView === "all") && (
            <div className="rounded-lg border bg-stone-50 p-4">
              <h4 className="font-semibold">Weekly Meal Plan</h4>
              <div className="mt-4 space-y-2">
                {plannedMeals.length === 0 && (
                  <p className="rounded-lg bg-white p-3 text-sm text-stone-500">
                    No meals planned yet. Add coach meal ideas to build a grocery list.
                  </p>
                )}
                {plannedMeals.map((mealName) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 text-sm"
                    key={mealName}
                  >
                    <span>{mealName}</span>
                    <button
                      className="rounded-lg border border-stone-300 px-3 py-1 text-xs"
                      onClick={() => removeFromPlan(mealName)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            )}

            {(planningView === "grocery" || planningView === "all") && (
            <div className="rounded-lg border bg-stone-50 p-4">
              <h4 className="font-semibold">Grocery List</h4>
              <div className="mt-3 space-y-2 text-sm">
                {groceryList.length === 0 && (
                  <p className="rounded-lg bg-white p-3 text-sm text-stone-500">
                    Grocery items will appear after meals are added to the plan.
                  </p>
                )}
                {groceryList.map((ingredient) => (
                  <div className="flex justify-between gap-3 border-b border-stone-100 pb-2" key={ingredient.item}>
                    <span>{ingredient.item}</span>
                    <span className="font-medium">{ingredient.amount} {ingredient.unit}</span>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Micronutrients</h3>
            <p className="mt-2 text-sm text-stone-600">
              Optional deeper tracking for vitamins, minerals, omega-3, and
              anti-inflammatory compounds.
            </p>
          </div>
          <button
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold"
            onClick={() => setShowMicronutrients(!showMicronutrients)}
          >
            {showMicronutrients ? "Hide Micronutrients" : "Show Micronutrients"}
          </button>
        </div>

        {showMicronutrients && (
          <div className="mt-4 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {micronutrients.map((nutrient) => (
              <NutritionCard
                key={nutrient.key}
                label={nutrient.label}
                current={`${formatNumber(micronutrientTotals[nutrient.key] || 0)}${nutrient.unit}`}
                target={`${micronutrientTargets[nutrient.key]}${nutrient.unit}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function createMacroTargets(profile, goals) {
  const weight = Number(profile.weight || 150)
  const goalText = getGoalsText(goals).toLowerCase()
  let calories = Math.round(weight * 14)
  let protein = Math.round(weight * 0.9)
  let fat = Math.round(weight * 0.4)

  if (goalText.includes("fat loss") || goalText.includes("shrink")) {
    calories = Math.round(weight * 12)
    protein = Math.round(weight * 1)
  }

  if (goalText.includes("glute") || goalText.includes("muscle")) {
    protein = Math.round(weight * 1)
  }

  const carbs = Math.max(
    80,
    Math.round((calories - protein * 4 - fat * 9) / 4)
  )

  return {
    calories,
    protein,
    carbs,
    fat,
    fiber: 30,
    hydration: "2.5 to 3 L",
  }
}

function createMicronutrientTargets(profile, goals) {
  const goalText = `${profile.dietaryPreferences} ${profile.allergies} ${getGoalsText(goals)}`.toLowerCase()
  const targets = micronutrients.reduce((targetMap, nutrient) => {
    targetMap[nutrient.key] = nutrient.target
    return targetMap
  }, {})

  if (goalText.includes("anti-inflammatory") || goalText.includes("recovery")) {
    targets.omega3 = 1.6
    targets.magnesium = 360
    targets.potassium = 3000
    targets.vitaminC = 100
    targets.vitaminE = 18
    targets.polyphenols = 800
    targets.curcumin = 250
    targets.selenium = 70
  }

  if (goalText.includes("fat loss") || goalText.includes("waist")) {
    targets.calcium = 1100
    targets.iron = 18
    targets.zinc = 10
  }

  return targets
}

function totalMeals(meals) {
  const totals = meals.reduce(
    (sum, meal) => ({
      calories: sum.calories + meal.calories,
      protein: sum.protein + meal.protein,
      carbs: sum.carbs + meal.carbs,
      fat: sum.fat + meal.fat,
      fiber: sum.fiber + meal.fiber,
      score: sum.score + meal.score,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, score: 0 }
  )

  return {
    ...totals,
    averageScore: meals.length ? Math.round(totals.score / meals.length) : 0,
  }
}

function totalMicronutrients(meals) {
  return meals.reduce((sum, meal) => {
    micronutrients.forEach((nutrient) => {
      sum[nutrient.key] =
        (sum[nutrient.key] || 0) + Number(meal.micronutrients?.[nutrient.key] || 0)
    })

    return sum
  }, {})
}

function getMealMicronutrients(mealForm) {
  return micronutrients.reduce((mealMicros, nutrient) => {
    mealMicros[nutrient.key] = Number(mealForm[nutrient.key] || 0)
    return mealMicros
  }, {})
}

function createMealSlots(profile, goals) {
  const selectedPreference = profile.mealPreference || inferMealPreference(profile, goals)
  const pattern = mealPatterns[selectedPreference] || mealPatterns.coach
  const shareMap = createMealShareMap(pattern)

  return pattern.map((slotId) => ({
    ...mealSlotDetails[slotId],
    targetShare: shareMap[slotId],
  }))
}

function inferMealPreference(profile, goals) {
  const text = `${profile.dietaryPreferences} ${getGoalsText(goals)}`.toLowerCase()

  if (text.includes("snack")) return "5"
  if (text.includes("meal prep") || text.includes("fat loss")) return "4"

  return "coach"
}

function createMealShareMap(pattern) {
  if (pattern.length === 2) {
    return { brunch: 0.45, dinner: 0.55 }
  }

  if (pattern.length === 3) {
    return { breakfast: 0.3, lunch: 0.35, dinner: 0.35 }
  }

  if (pattern.length === 4) {
    return { breakfast: 0.25, lunch: 0.3, afternoonSnack: 0.15, dinner: 0.3 }
  }

  return { breakfast: 0.25, morningSnack: 0.1, lunch: 0.3, afternoonSnack: 0.1, dinner: 0.25 }
}

function createMealTargets(targets, activeMealSlots) {
  return activeMealSlots.reduce((mealTargetMap, slot) => {
    mealTargetMap[slot.id] = {
      calories: Math.round(targets.calories * slot.targetShare),
      protein: Math.round(targets.protein * slot.targetShare),
      carbs: Math.round(targets.carbs * slot.targetShare),
      fat: Math.round(targets.fat * slot.targetShare),
      fiber: Math.round(targets.fiber * slot.targetShare),
    }

    return mealTargetMap
  }, {})
}

function groupMealsBySlot(meals) {
  return meals.reduce((mealMap, meal) => {
    const slot = meal.slot || "breakfast"
    mealMap[slot] = [...(mealMap[slot] || []), meal]

    return mealMap
  }, {})
}

function getMealName(slot) {
  return slot.detail ? `${slot.detail} ${slot.label}` : slot.label
}

function suggestRecipes(prompt, profile, goals) {
  const searchText = `${prompt} ${profile.dietaryPreferences} ${profile.allergies} ${getGoalsText(goals)}`.toLowerCase()

  return recipeBank
    .map((recipe) => ({
      ...recipe,
      matchScore: recipe.tags.filter((tag) => searchText.includes(tag.split(" ")[0])).length,
    }))
    .sort((a, b) => b.matchScore - a.matchScore || b.score - a.score)
}

function createAiNutritionPlan(prompt, focus, profile, goals, targets, micronutrientTargets) {
  const goalText = getGoalsText(goals).toLowerCase()
  const preferenceText = profile.dietaryPreferences || "balanced meals"
  const avoidText = profile.allergies ? ` Avoid: ${profile.allergies}.` : ""
  const recipes = suggestRecipes(prompt, profile, goals).slice(0, 3)
  const proteinAnchor = Math.round(targets.protein / 4)
  const carbStrategy = goalText.includes("running") || goalText.includes("rowing") || goalText.includes("hockey")
    ? "Put more carbs around training and keep dinner colorful but not too heavy."
    : "Keep carbs steady across meals and pair them with protein and fiber."

  return {
    focus,
    summary: `For ${focus.toLowerCase()}, prioritize ${preferenceText.toLowerCase()} while aiming for about ${targets.calories} calories, ${targets.protein}g protein, ${targets.carbs}g carbs, and ${targets.fat}g fat today.${avoidText}`,
    strategy: [
      `Build each main meal around roughly ${proteinAnchor}g protein.`,
      carbStrategy,
      `Aim for ${targets.fiber}g fiber and use herbs, colorful plants, and omega-3 foods to support the anti-inflammatory goal.`,
      `Key micronutrient targets to watch: magnesium ${micronutrientTargets.magnesium}mg, potassium ${micronutrientTargets.potassium}mg, zinc ${micronutrientTargets.zinc}mg, omega-3 ${micronutrientTargets.omega3}g.`,
    ],
    meals: recipes.map((recipe) => ({
      name: recipe.name,
      reason: `Good fit because it is ${recipe.tags.slice(0, 3).join(", ")}.`,
      macros: `${recipe.calories} cal / ${recipe.protein}P / ${recipe.carbs}C / ${recipe.fat}F`,
    })),
    grocery: createGroceryList(recipes.map((recipe) => recipe.name), 1).slice(0, 8),
    nextStep: "When the real AI API is connected, this same panel can return live recipe ideas, exact ingredient amounts, macro math, and substitutions from the internet.",
  }
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

function createGroceryList(plannedMeals, householdSize) {
  const ingredientMap = new Map()

  plannedMeals.forEach((mealName) => {
    const recipe = recipeBank.find((item) => item.name === mealName)
    if (!recipe) return

    recipe.ingredients.forEach((ingredient) => {
      const key = `${ingredient.item}-${ingredient.unit}`
      const current = ingredientMap.get(key) || {
        item: ingredient.item,
        amount: 0,
        unit: ingredient.unit,
      }

      ingredientMap.set(key, {
        ...current,
        amount: current.amount + ingredient.amount * householdSize,
      })
    })
  })

  return Array.from(ingredientMap.values()).map((ingredient) => ({
    ...ingredient,
    amount: Number.isInteger(ingredient.amount)
      ? ingredient.amount
      : ingredient.amount.toFixed(2),
  }))
}

function estimateAntiInflammatoryScore(mealForm) {
  const fiber = Number(mealForm.fiber || 0)
  const protein = Number(mealForm.protein || 0)
  const fat = Number(mealForm.fat || 0)
  let score = 6

  if (fiber >= 8) score += 2
  if (protein >= 25) score += 1
  if (fat <= 25) score += 1

  return Math.min(score, 10)
}

function createPhotoMealEstimate(fileName, slotId, target = {}) {
  const name = fileName.toLowerCase()
  const isDinner = slotId === "dinner"
  const isSnack = slotId?.toLowerCase().includes("snack")
  const base = {
    name: isSnack ? "AI-estimated snack plate" : "AI-estimated meal plate",
    calories: target.calories || 450,
    protein: target.protein || 35,
    carbs: target.carbs || 40,
    fat: target.fat || 15,
    fiber: target.fiber || 6,
    omega3: "",
    potassium: "",
    magnesium: "",
    zinc: "",
    vitaminC: "",
    polyphenols: "",
  }

  if (name.includes("salmon") || name.includes("fish")) {
    return {
      ...base,
      name: "AI-estimated salmon plate",
      protein: Math.max(base.protein, 38),
      fat: Math.max(base.fat, 22),
      omega3: "1.5",
      vitaminC: "45",
    }
  }

  if (name.includes("salad") || name.includes("bowl") || name.includes("veg")) {
    return {
      ...base,
      name: "AI-estimated protein veggie bowl",
      fiber: Math.max(base.fiber, 9),
      vitaminC: "65",
      potassium: "700",
      polyphenols: "250",
    }
  }

  if (name.includes("yogurt") || name.includes("breakfast")) {
    return {
      ...base,
      name: "AI-estimated breakfast bowl",
      calories: target.calories || 380,
      protein: Math.max(base.protein, 28),
      carbs: target.carbs || 42,
      fat: target.fat || 10,
      fiber: target.fiber || 5,
      calcium: "250",
    }
  }

  if (name.includes("chicken") || isDinner) {
    return {
      ...base,
      name: "AI-estimated chicken dinner plate",
      protein: Math.max(base.protein, 42),
      zinc: "2",
      potassium: "650",
    }
  }

  return base
}

function fillMealFormFromEstimate(mealForm, estimate) {
  return {
    ...mealForm,
    name: mealForm.name || estimate.name,
    calories: mealForm.calories || String(estimate.calories),
    protein: mealForm.protein || String(estimate.protein),
    carbs: mealForm.carbs || String(estimate.carbs),
    fat: mealForm.fat || String(estimate.fat),
    fiber: mealForm.fiber || String(estimate.fiber),
    calcium: mealForm.calcium || estimate.calcium || "",
    magnesium: mealForm.magnesium || estimate.magnesium || "",
    potassium: mealForm.potassium || estimate.potassium || "",
    zinc: mealForm.zinc || estimate.zinc || "",
    vitaminC: mealForm.vitaminC || estimate.vitaminC || "",
    omega3: mealForm.omega3 || estimate.omega3 || "",
    polyphenols: mealForm.polyphenols || estimate.polyphenols || "",
  }
}

function formatNumber(value) {
  return Number.isInteger(value) ? value : value.toFixed(1)
}

function NutritionCard({ label, current, target }) {
  return (
    <div className="rounded-lg border bg-stone-50 p-4">
      <div className="text-sm text-stone-500">{label}</div>
      <div className="mt-2 text-2xl font-bold">{current}</div>
      <div className="mt-1 text-sm text-stone-500">Goal: {target}</div>
    </div>
  )
}

function MacroSummaryBar({ stats }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-lg border bg-stone-50 p-2">
      <div className="grid min-w-max auto-cols-[minmax(120px,1fr)] grid-flow-col gap-2">
        {stats.map((stat) => (
          <div className="rounded-lg bg-white px-3 py-2" key={stat.label}>
            <div className="text-[0.68rem] font-semibold uppercase tracking-wide text-stone-400">
              {stat.label}
            </div>
            <div className="mt-1 text-lg font-bold leading-none text-stone-900">
              {stat.current}
            </div>
            <div className="mt-1 text-xs text-stone-500">
              Goal {stat.target}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SegmentedControl({ options, value, onChange, className = "" }) {
  return (
    <div className={`flex flex-wrap gap-2 rounded-lg bg-stone-100 p-1 ${className}`}>
      {options.map((option) => (
        <button
          className={
            value === option.value
              ? "rounded-lg bg-white px-3 py-2 text-sm font-semibold text-stone-900 shadow-sm"
              : "rounded-lg px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-white"
          }
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function AiNutritionPlan({ plan }) {
  if (!plan) {
    return (
      <div className="rounded-lg border bg-stone-50 p-5">
        <h4 className="font-semibold">Coach draft will appear here</h4>
        <p className="mt-2 text-sm text-stone-600">
          Ask for dinner, meal prep, a grocery list, or a full day of eating.
          The first real AI version will use this same space for generated
          recommendations.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-stone-50 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            {plan.focus}
          </p>
          <h4 className="mt-1 font-semibold">Coach draft</h4>
        </div>
        <span className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          AI-ready
        </span>
      </div>

      <p className="mt-3 text-sm text-stone-700">{plan.summary}</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h5 className="font-semibold">Strategy</h5>
          <div className="mt-2 space-y-2">
            {plan.strategy.map((item) => (
              <p className="rounded-lg bg-white p-3 text-sm text-stone-600" key={item}>
                {item}
              </p>
            ))}
          </div>
        </div>

        <div>
          <h5 className="font-semibold">Suggested meals</h5>
          <div className="mt-2 space-y-2">
            {plan.meals.map((meal) => (
              <div className="rounded-lg bg-white p-3 text-sm" key={meal.name}>
                <div className="font-medium">{meal.name}</div>
                <p className="mt-1 text-stone-600">{meal.reason}</p>
                <p className="mt-1 text-xs text-stone-500">{meal.macros}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-white p-4">
        <h5 className="font-semibold">Grocery preview</h5>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {plan.grocery.map((ingredient) => (
            <div className="flex justify-between gap-3 text-sm" key={`${ingredient.item}-${ingredient.unit}`}>
              <span>{ingredient.item}</span>
              <span className="font-medium">{ingredient.amount} {ingredient.unit}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-stone-500">{plan.nextStep}</p>
    </div>
  )
}

function MacroInput({ label, field, mealForm, setMealForm }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-stone-500">{label}</span>
      <input
        className="mt-1 w-full rounded-lg border border-stone-300 p-3 outline-none focus:border-emerald-600"
        type="number"
        value={mealForm[field]}
        onChange={(event) =>
          setMealForm({ ...mealForm, [field]: event.target.value })
        }
      />
    </label>
  )
}

function MealSlotCard({
  slot,
  target,
  meals,
  isOpen,
  onOpen,
  mealForm,
  setMealForm,
  mealPhotoName,
  onMealPhotoSelected,
  showMealMicronutrients,
  setShowMealMicronutrients,
  onAddMeal,
}) {
  const totals = totalMeals(meals)
  const mealName = getMealName(slot)

  return (
    <div className="rounded-lg border bg-stone-50 p-4">
      <div className="flex flex-col gap-3 border-b border-stone-200 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <button
          className="text-left"
          onClick={onOpen}
          type="button"
        >
          <h4 className="font-semibold">
            {mealName}
          </h4>
          <p className="mt-1 text-xs text-stone-500">
            Goal: {target.calories} cal / {target.protein}P / {target.carbs}C / {target.fat}F / {target.fiber} fiber
          </p>
        </button>
        <div className="flex flex-col gap-2 sm:items-end">
          <button
            className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-stone-700"
            onClick={onOpen}
            type="button"
          >
            {isOpen ? "Close" : `Track ${mealName}`}
          </button>
          <div className="rounded-lg bg-white px-3 py-2 text-xs text-stone-600">
            Logged: {totals.calories} cal / {totals.protein}P / {totals.carbs}C / {totals.fat}F
          </div>
        </div>
      </div>

      {isOpen && (
        <MealEntryForm
          mealName={mealName}
          mealForm={mealForm}
          setMealForm={setMealForm}
          mealPhotoName={mealPhotoName}
          onMealPhotoSelected={onMealPhotoSelected}
          showMealMicronutrients={showMealMicronutrients}
          setShowMealMicronutrients={setShowMealMicronutrients}
          onAddMeal={onAddMeal}
        />
      )}

      <div className="mt-3 space-y-3">
        {meals.length === 0 && (
          <p className="rounded-lg bg-white p-3 text-sm text-stone-500">
            No meal logged yet.
          </p>
        )}
        {meals.map((meal) => (
          <MealCard key={`${meal.slot}-${meal.name}-${meal.source}`} meal={meal} />
        ))}
      </div>
    </div>
  )
}

function MealEntryForm({
  mealName,
  mealForm,
  setMealForm,
  mealPhotoName,
  onMealPhotoSelected,
  showMealMicronutrients,
  setShowMealMicronutrients,
  onAddMeal,
}) {
  return (
    <form className="mt-4 rounded-lg border bg-white p-4" onSubmit={onAddMeal}>
      <h4 className="font-semibold">Log {mealName}</h4>
      <div className="mt-4 grid gap-3">
        <input
          className="rounded-lg border border-stone-300 p-3 outline-none focus:border-emerald-600"
          placeholder="Meal name"
          value={mealForm.name}
          onChange={(event) => setMealForm({ ...mealForm, name: event.target.value })}
        />
        <div className="grid gap-3 sm:grid-cols-5">
          <MacroInput label="Cal" field="calories" mealForm={mealForm} setMealForm={setMealForm} />
          <MacroInput label="P" field="protein" mealForm={mealForm} setMealForm={setMealForm} />
          <MacroInput label="C" field="carbs" mealForm={mealForm} setMealForm={setMealForm} />
          <MacroInput label="F" field="fat" mealForm={mealForm} setMealForm={setMealForm} />
          <MacroInput label="Fiber" field="fiber" mealForm={mealForm} setMealForm={setMealForm} />
        </div>
        <div className="rounded-lg border bg-stone-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="font-semibold">Meal Micronutrients</h4>
              <p className="mt-1 text-xs text-stone-500">
                Optional details for people who want more than macros.
              </p>
            </div>
            <button
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold"
              onClick={() => setShowMealMicronutrients(!showMealMicronutrients)}
              type="button"
            >
              {showMealMicronutrients ? "Hide" : "Add Micros"}
            </button>
          </div>
          {showMealMicronutrients && (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {micronutrients.map((nutrient) => (
                <MacroInput
                  key={nutrient.key}
                  label={`${nutrient.label} (${nutrient.unit})`}
                  field={nutrient.key}
                  mealForm={mealForm}
                  setMealForm={setMealForm}
                />
              ))}
            </div>
          )}
        </div>
        <label className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
          <span className="font-medium text-stone-800">Upload meal photo</span>
          <input
            className="mt-2 block w-full text-sm"
            type="file"
            accept="image/*"
            onChange={(event) => onMealPhotoSelected(event.target.files?.[0]?.name || "")}
          />
          {mealPhotoName && (
            <span className="mt-2 block text-emerald-700">
              AI estimate drafted from: {mealPhotoName}
            </span>
          )}
        </label>
        <button className="rounded-lg bg-stone-900 px-5 py-3 font-semibold text-white">
          Add Meal
        </button>
      </div>
    </form>
  )
}

function MealCard({ meal }) {
  const loggedMicros = micronutrients.filter(
    (nutrient) => Number(meal.micronutrients?.[nutrient.key] || 0) > 0
  )

  return (
    <div className="rounded-lg border bg-stone-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="font-semibold">{meal.name}</h4>
          <p className="mt-1 text-sm text-stone-600">
            {meal.protein}P / {meal.carbs}C / {meal.fat}F / {meal.fiber} fiber
          </p>
          <p className="mt-1 text-xs text-stone-500">{meal.source}</p>
          {loggedMicros.length > 0 && (
            <p className="mt-2 text-xs text-stone-500">
              {loggedMicros
                .map(
                  (nutrient) =>
                    `${nutrient.label}: ${formatNumber(meal.micronutrients[nutrient.key])}${nutrient.unit}`
                )
                .join(" / ")}
            </p>
          )}
        </div>
        <div className="text-left sm:text-right">
          <div className="font-semibold">{meal.calories} cal</div>
          <div className="mt-1 text-sm text-emerald-700">
            Anti-inflammatory: {meal.score}/10
          </div>
        </div>
      </div>
    </div>
  )
}

function RecipeCard({ recipe, onAdd }) {
  return (
    <div className="rounded-lg border bg-stone-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold">{recipe.name}</h4>
          <p className="mt-1 text-sm text-stone-600">
            {recipe.calories} cal / {recipe.protein}P / {recipe.carbs}C / score {recipe.score}/10
          </p>
        </div>
        <button
          className="rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white"
          onClick={() => onAdd(recipe.name)}
        >
          Plan
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {recipe.tags.map((tag) => (
          <span className="rounded-lg bg-white px-2 py-1 text-xs text-stone-600" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export default NutritionSection
