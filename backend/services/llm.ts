// All LLM work lives in this one file: the API call, the prompts, and response validation.
// Provider: Google Gemini (Google AI Studio key), called with plain fetch so there is no extra SDK to learn.
// The API key is read from process.env on the server and never sent to the browser.
import { z } from "zod";
import { foods } from "../data/foods";

export class LlmNotConfiguredError extends Error {}

type ChatMessage = { role: "user" | "assistant"; content: string };

// Models to try, in order. If one is busy or unavailable, the next one is used automatically.
// Override the whole list in backend/.env with:  LLM_MODELS=model-a,model-b,model-c
const DEFAULT_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash", // older; Google may limit it, in which case it is simply skipped
];

function getModelChain(): string[] {
  const fromEnv = (process.env.LLM_MODELS || "").split(",").map((m) => m.trim()).filter(Boolean);
  const list = fromEnv.length ? fromEnv : [process.env.LLM_MODEL, process.env.LLM_FALLBACK_MODEL, ...DEFAULT_MODELS];
  return Array.from(new Set(list.filter((m): m is string => !!m)));
}

// HTTP statuses that mean "this model can't help right now" -> try the next model.
const TRY_NEXT_STATUSES = [404, 429, 500, 502, 503, 504];

// Sends the system prompt + conversation to Gemini and returns the reply text.
// Set json=true when we want the model to answer with pure JSON.
async function callLLM(system: string, messages: ChatMessage[], maxTokens = 1024, json = false): Promise<string> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new LlmNotConfiguredError("AI is not configured yet. Add LLM_API_KEY to backend/.env and restart the server.");
  }
  const key: string = apiKey; // narrowed: we threw above if it was missing
  const chain = getModelChain();

  // Sends one request to one model (with a 25 second timeout so a stuck model can't block the chain).
  async function requestModel(modelName: string): Promise<Response> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
    // Newer Gemini models "think" before answering, and thinking tokens count against maxOutputTokens.
    // Our tasks are simple, so we ask for minimal thinking and leave extra room for the answer.
    //  - Gemini 3.x uses named levels (low/medium/high; "minimal" is NOT allowed on 3.8)
    //  - Gemini 2.5 Flash uses a token budget (0 = off)
    const thinkingConfig = modelName.includes("gemini-3")
      ? { thinkingLevel: "low" }
      : modelName.includes("2.5-flash")
        ? { thinkingBudget: 0 }
        : undefined;

    const send = (useThinkingConfig: boolean) => {
      const generationConfig: Record<string, unknown> = {
        maxOutputTokens: thinkingConfig && useThinkingConfig ? maxTokens + 1500 : maxTokens,
      };
      if (json) generationConfig.responseMimeType = "application/json";
      if (thinkingConfig && useThinkingConfig) generationConfig.thinkingConfig = thinkingConfig;
      return fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        signal: AbortSignal.timeout(25000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          // Gemini calls the assistant role "model"
          contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
          generationConfig,
        }),
      });
    };

    let response = await send(true);
    // If Google rejects the thinking setting itself (HTTP 400), retry once without it.
    if (response.status === 400 && thinkingConfig) response = await send(false);
    return response;
  }

  let lastStatus = 0;
  let lastDetail = "";

  for (let i = 0; i < chain.length; i++) {
    const model = chain[i];
    let res: Response;
    try {
      res = await requestModel(model);
      // 503 = Google is busy. On the main model only, wait a moment and retry once before moving on.
      if (res.status === 503 && i === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        res = await requestModel(model);
      }
    } catch (err) {
      if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
        console.warn(`Gemini ${model} timed out, trying next model...`);
        lastStatus = 504;
        continue;
      }
      throw new Error("Could not reach the Google AI service. Check your internet connection.");
    }

    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
      if (text) {
        if (i > 0) console.log(`Answered by backup model ${model}`);
        return text;
      }
      console.warn(`Gemini ${model} returned an empty answer, trying next model...`);
      lastStatus = 204;
      continue;
    }

    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    lastDetail = body.error?.message ? ` ${body.error.message}` : "";
    lastStatus = res.status;
    console.error(`Gemini ${model} error ${res.status}:${lastDetail}`);

    // Problems with the key itself will fail on every model, so stop right away.
    const badKey = res.status === 401 || res.status === 403 || (res.status === 400 && /api key/i.test(lastDetail));
    if (badKey) throw new Error(`Google AI rejected the request (${res.status}). Check LLM_API_KEY in backend/.env.${lastDetail}`);

    if (TRY_NEXT_STATUSES.includes(res.status) || res.status === 400) {
      if (i < chain.length - 1) console.warn(`Gemini ${model} unavailable (${res.status}), trying ${chain[i + 1]}...`);
      continue;
    }
    throw new Error(`The AI service returned an error (${res.status}).${lastDetail}`);
  }

  // Every model in the chain failed.
  if (lastStatus === 429) throw new Error("Google AI rate limit reached on all models. Wait a minute and try again.");
  if (lastStatus === 404) throw new Error(`None of the configured models were found. Check LLM_MODELS / LLM_MODEL in backend/.env.${lastDetail}`);
  throw new Error("Google AI is very busy right now (all backup models failed). Please try again in a minute.");
}

// LLMs sometimes wrap JSON in extra text. Grab everything from the first { to the last }.
function parseJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("The AI did not return valid data. Please try again.");
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new Error("The AI returned malformed data. Please try again.");
  }
}

// ---------- 1. Meal analyzer ----------

const mealAnalysisSchema = z.object({
  mealName: z.string().min(1).max(120),
  calories: z.number().min(0).max(5000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(800),
  fat: z.number().min(0).max(400),
  assumptions: z.array(z.string()).max(12),
});

export async function analyzeMeal(description: string) {
  const system = `You are a nutrition estimator. The user describes a meal in plain language.
Estimate its total nutrition. Reply with ONLY a JSON object, no other text, in this exact shape:
{"mealName": string, "calories": number, "protein": number, "carbs": number, "fat": number, "assumptions": string[]}
Rules:
- calories in kcal; protein, carbs, fat in grams; all numbers, no units.
- "assumptions" lists the portion sizes you assumed (e.g. "2 medium paneer parathas").
- If a food matches this reference list, use these per-serving values:
${JSON.stringify(foods)}`;
  const text = await callLLM(system, [{ role: "user", content: description }], 1024, true);
  const result = mealAnalysisSchema.parse(parseJson(text)); // validate the AI output
  return {
    ...result,
    calories: Math.round(result.calories),
    protein: Math.round(result.protein * 10) / 10,
    carbs: Math.round(result.carbs * 10) / 10,
    fat: Math.round(result.fat * 10) / 10,
  };
}

// ---------- 2. Nutrition assistant ----------

export interface AssistantContext {
  name: string;
  goal: string;
  diet: string;
  targetCalories: number;
  proteinG: number;
  caloriesToday: number;
  proteinToday: number;
}

export async function chatWithAssistant(context: AssistantContext, history: ChatMessage[], message: string) {
  const system = `You are NutrAI, a friendly nutrition assistant inside a meal-tracking app.
User context:
- Name: ${context.name}
- Goal: ${context.goal} weight
- Diet: ${context.diet}
- Daily targets: ${context.targetCalories} kcal, ${context.proteinG} g protein
- Eaten so far today: ${context.caloriesToday} kcal, ${context.proteinToday} g protein
- Remaining today: ${context.targetCalories - context.caloriesToday} kcal, ${Math.max(0, context.proteinG - context.proteinToday)} g protein
Rules: respect the user's diet, keep answers short and practical (under 150 words), give approximate numbers,
and remember these are estimates. You are not a doctor; suggest a professional for medical questions.`;
  return callLLM(system, [...history, { role: "user", content: message }], 600);
}

// ---------- 3. Diet plan generator ----------

const dietPlanSchema = z.object({
  meals: z
    .array(
      z.object({
        mealType: z.string(),
        foods: z.array(z.object({ name: z.string(), portion: z.string(), calories: z.number() })),
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
      })
    )
    .min(1)
    .max(8),
  tips: z.array(z.string()).max(6),
});
export type DietPlanContent = z.infer<typeof dietPlanSchema>;

export async function generateDietPlan(
  profile: { goal: string; diet: string; targetCalories: number; proteinG: number; carbsG: number; fatG: number },
  mealsCount: number
) {
  const system = `You are a nutrition planner. Create a one-day diet plan.
Reply with ONLY a JSON object, no other text, in this exact shape:
{"meals": [{"mealType": string, "foods": [{"name": string, "portion": string, "calories": number}], "calories": number, "protein": number, "carbs": number, "fat": number}], "tips": string[]}
Rules:
- Exactly ${mealsCount} meals, named like Breakfast, Lunch, Snack, Dinner.
- Diet: ${profile.diet.replace("_", "-")}. Use only foods that fit this diet. Prefer common Indian and everyday foods.
- Total about ${profile.targetCalories} kcal, ${profile.proteinG} g protein, ${profile.carbsG} g carbs, ${profile.fatG} g fat.
- Goal: ${profile.goal} weight. Give 2-4 short tips.
- Numbers only (no units). Portions as text like "1 cup" or "100 g".`;
  const text = await callLLM(system, [{ role: "user", content: "Generate my plan." }], 4000, true);
  return dietPlanSchema.parse(parseJson(text));
}
