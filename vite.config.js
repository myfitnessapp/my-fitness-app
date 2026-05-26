import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    fitnessAiApi(),
  ],
})

function fitnessAiApi() {
  return {
    name: "fitness-ai-api",
    configureServer(server) {
      server.middlewares.use("/api/fitness-plan", async (request, response) => {
        if (request.method !== "POST") {
          response.statusCode = 405
          response.setHeader("Content-Type", "application/json")
          response.end(JSON.stringify({ error: "Method not allowed" }))
          return
        }

        try {
          const body = await readJsonBody(request)
          const plan = await generateFitnessPlan(body)

          response.setHeader("Content-Type", "application/json")
          response.end(JSON.stringify(plan))
        } catch (error) {
          response.statusCode = error.statusCode || 500
          response.setHeader("Content-Type", "application/json")
          response.end(JSON.stringify({
            error: error.message || "Unable to generate fitness plan",
          }))
        }
      })
    },
  }
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = ""

    request.on("data", (chunk) => {
      body += chunk
    })

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(Object.assign(new Error("Invalid JSON body"), { statusCode: 400 }))
      }
    })

    request.on("error", reject)
  })
}

async function generateFitnessPlan(payload) {
  if (!process.env.OPENAI_API_KEY) {
    throw Object.assign(
      new Error("OPENAI_API_KEY is not set. Add it to your local environment, then restart npm run dev."),
      { statusCode: 500 }
    )
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
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

  const data = await response.json()

  if (!response.ok) {
    throw Object.assign(
      new Error(data.error?.message || "OpenAI request failed"),
      { statusCode: response.status }
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
