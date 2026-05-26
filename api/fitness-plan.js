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
        required: ["day", "title", "focus", "location", "prescription", "duration", "strengthIncluded", "cardioIncluded", "mobilityIncluded", "exercises", "cardio", "mobility"],
        properties: {
          day: { type: "string" },
          title: { type: "string" },
          focus: { type: "string" },
          location: { type: "string" },
          prescription: { type: "string" },
          duration: { type: "string" },
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
