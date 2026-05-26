export default async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" })
  }

  try {
    const body = await readJsonBody(request)
    const plan = await generateFitnessPlan(body)

    return sendJson(response, 200, plan)
  } catch (error) {
    return sendJson(response, error.statusCode || 500, {
      error: error.message || "Unable to generate fitness plan",
    })
  }
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader("Content-Type", "application/json")
  response.end(JSON.stringify(payload))
}

async function readJsonBody(request) {
  if (request.body && typeof request.body === "object") {
    return request.body
  }

  if (typeof request.body === "string") {
    return parseJson(request.body)
  }

  return new Promise((resolve, reject) => {
    let body = ""

    request.on("data", (chunk) => {
      body += chunk
    })

    request.on("end", () => {
      try {
        resolve(body ? parseJson(body) : {})
      } catch (error) {
        reject(error)
      }
    })

    request.on("error", reject)
  })
}

function parseJson(body) {
  try {
    return JSON.parse(body)
  } catch {
    throw Object.assign(new Error("Invalid JSON body"), { statusCode: 400 })
  }
}

async function generateFitnessPlan(payload) {
  if (!process.env.OPENAI_API_KEY) {
    throw Object.assign(
      new Error("OPENAI_API_KEY is not set. Add it in Vercel Project Settings > Environment Variables."),
      { statusCode: 500 }
    )
  }

  const apiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.2",
      input: [
        {
          role: "system",
          content: [
            "You are an expert personal trainer and sports performance coach.",
            "Create practical weekly fitness plans from profile, goals, equipment, limitations, and style preferences.",
            "Use every freeform profile write-in when it is present, especially equipment, sport or dance interests, injuries or limitations, nutrition preferences, and foods to avoid.",
            "The coach recommendation fields must be brief, specific, and individualized to the person's profile and goals.",
            "Priorities should name the person's actual goal, sport, limitation, or equipment context when relevant.",
            "Rationale should explain why the weekly structure fits this person. Recovery should explain how to manage fatigue for this person.",
            "Every Train Like A archetype must have a distinct training identity, not a generic hypertrophy split with renamed titles. Translate the archetype into sport-specific or fantasy-specific movement demands, energy systems, equipment choices, session blocks, and progression logic.",
            "Use structured workout blocks for every workout: warm-up, strength, circuit or conditioning, finisher, and cool-down. If a block is intentionally minimal, still explain why in sessionFlow.",
            "Give accurate duration estimates based on warm-up time, sets, reps, rest periods, cardio intervals, transitions, and cool-down. Do not label a high-volume workout as short.",
            "Include beginner, intermediate, and advanced modifications for each workout, plus safety substitutions for injuries, joint sensitivity, or low-impact needs.",
            "For Warrior: make sessions intense, powerful, athletic, and functional. Include functional strength, compound lifts, HIIT, athletic conditioning, loaded carries, core bracing, short rest periods, and optional plyometrics. Include running intervals inside the workout when treadmill or outdoor running is available. Use safety substitutions such as sled pushes, incline walks, bike, rower, step-ups, med-ball throws, or low-impact carries when needed.",
            "For Dragon Slayer: keep the same functional strength, HIIT, athletic conditioning, loaded carries, core bracing, and optional plyometric base, but make the workout feel like playful dragon-slaying preparation: hill or treadmill charges, rower or bike chases, shield-style carries, anti-rotation bracing, explosive escapes, and battle-ready finishers. Keep it fun without becoming silly or unsafe.",
            "For Runner or running-related archetypes: incorporate the person's running goal, race distance, current ability, and available days. Build sophisticated running programming with easy runs, intervals or tempo work, long-run progression when appropriate, strength training, mobility, and cross-training such as bike, rower, or incline walking to improve running without overloading recovery.",
            "For other archetypes such as rower, dancer, basketball player, pahlavani, skater, or custom styles: infer the real performance demands of that activity and make the plan specific to them through movement selection, conditioning format, mobility, skill qualities, and recovery.",
            "Return only JSON that matches the schema. Do not include medical claims.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "fitness_plan",
          strict: true,
          schema: fitnessPlanSchema,
        },
      },
    }),
  })

  const data = await apiResponse.json()

  if (!apiResponse.ok) {
    throw Object.assign(
      new Error(data.error?.message || "OpenAI request failed"),
      { statusCode: apiResponse.status }
    )
  }

  return JSON.parse(extractResponseText(data))
}

function extractResponseText(data) {
  if (data.output_text) return data.output_text

  const text = data.output
    ?.flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .join("")

  if (!text) {
    throw new Error("OpenAI response did not include JSON text")
  }

  return text
}

const fitnessPlanSchema = {
  type: "object",
  additionalProperties: false,
  required: ["coachSummary", "priorities", "rationale", "strengthDays", "cardioDays", "mobilityDays", "recovery", "workouts"],
  properties: {
    coachSummary: { type: "string" },
    priorities: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string" },
    },
    rationale: { type: "string" },
    strengthDays: { type: "integer" },
    cardioDays: { type: "integer" },
    mobilityDays: { type: "integer" },
    recovery: { type: "string" },
    workouts: {
      type: "array",
      minItems: 1,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "title", "focus", "location", "prescription", "duration", "sessionFlow", "modifications", "safetySubstitutions", "strengthIncluded", "cardioIncluded", "mobilityIncluded", "exercises", "cardio", "mobility"],
        properties: {
          day: { type: "string" },
          title: { type: "string" },
          focus: { type: "string" },
          location: { type: "string" },
          prescription: { type: "string" },
          duration: { type: "string" },
          sessionFlow: {
            type: "array",
            minItems: 5,
            maxItems: 6,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["label", "minutes", "detail"],
              properties: {
                label: { type: "string" },
                minutes: { type: "integer" },
                detail: { type: "string" },
              },
            },
          },
          modifications: {
            type: "object",
            additionalProperties: false,
            required: ["beginner", "intermediate", "advanced"],
            properties: {
              beginner: { type: "string" },
              intermediate: { type: "string" },
              advanced: { type: "string" },
            },
          },
          safetySubstitutions: {
            type: "array",
            minItems: 1,
            maxItems: 5,
            items: { type: "string" },
          },
          strengthIncluded: { type: "boolean" },
          cardioIncluded: { type: "boolean" },
          mobilityIncluded: { type: "boolean" },
          exercises: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["name", "focus", "sets", "reps", "cue", "mistake", "equipment"],
              properties: {
                name: { type: "string" },
                focus: { type: "string" },
                sets: { type: "string" },
                reps: { type: "string" },
                cue: { type: "string" },
                mistake: { type: "string" },
                equipment: {
                  type: "array",
                  items: { type: "string" },
                },
              },
            },
          },
          cardio: {
            type: ["object", "null"],
            additionalProperties: false,
            required: ["title", "modality", "amount", "intensity", "note", "zone"],
            properties: {
              title: { type: "string" },
              modality: { type: "string" },
              amount: { type: "string" },
              intensity: { type: "string" },
              note: { type: "string" },
              zone: {
                type: "object",
                additionalProperties: false,
                required: ["name", "bpm"],
                properties: {
                  name: { type: "string" },
                  bpm: { type: "string" },
                },
              },
            },
          },
          mobility: {
            type: ["object", "null"],
            additionalProperties: false,
            required: ["placement", "amount", "drills"],
            properties: {
              placement: { type: "string" },
              amount: { type: "string" },
              drills: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
}
