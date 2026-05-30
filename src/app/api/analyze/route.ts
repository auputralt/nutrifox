import { NextRequest, NextResponse } from "next/server";

const BLUESMINDS_API_KEY = process.env.BLUESMINDS_API_KEY;
const BLUESMINDS_BASE_URL =
  process.env.BLUESMINDS_BASE_URL || "https://api.bluesminds.com";
// gpt-4o is broken on Bluesminds; gpt-4o-mini works for vision
const ANALYSIS_MODEL = process.env.ANALYSIS_MODEL || "gpt-4o-mini";
// Fallback models to try if primary fails
const FALLBACK_MODELS = ["qwen3.6-27b"];

const SYSTEM_PROMPT = `You are a professional nutritionist and food analyst. Your task is to analyze food images and provide accurate, detailed nutritional information.

Analyze the food in the image the user provides. Identify each food item, estimate portion sizes, and calculate nutritional values.

You MUST respond with valid JSON only — no markdown, no code fences, no commentary. Use this exact structure:

{
  "foods": [
    {
      "name": "Food item name",
      "portion": "estimated portion (e.g., '1 cup', '150g')",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "fiber": 0
    }
  ],
  "total": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "fiber": 0
  },
  "dailyGoalPercentage": 0,
  "allergenWarnings": [],
  "restrictionConflicts": [],
  "notes": "Brief analysis notes or tips"
}

Rules:
- "total" must be the sum of all "foods" entries.
- "dailyGoalPercentage" = (total.calories / user's daily calorie target) * 100.
- "allergenWarnings" lists common allergens present (nuts, dairy, gluten, soy, shellfish, eggs, etc.).
- "restrictionConflicts" lists any conflicts with the user's stated dietary restrictions.
- All numeric values should be reasonable estimates based on standard nutrition databases.
- If you cannot identify any food, set foods to an empty array and notes to an explanation.`;

function buildUserPrompt(preferences: Record<string, unknown>): string {
  const goalLabels: Record<string, string> = {
    weight_loss: "weight loss",
    muscle_gain: "muscle gain",
    maintenance: "maintenance",
    custom: "custom",
  };

  const goal = preferences.goal as string;
  const dailyCalorieTarget = preferences.dailyCalorieTarget as number;
  const restrictions = preferences.restrictions as string[];
  const allergies = preferences.allergies as string;

  let prompt = "Analyze the food in this image.\n\nUser dietary context:\n";
  prompt += `- Goal: ${goalLabels[goal] || goal}\n`;
  prompt += `- Daily calorie target: ${dailyCalorieTarget} kcal\n`;

  if (restrictions?.length > 0) {
    prompt += `- Dietary restrictions: ${restrictions.join(", ")}\n`;
  }
  if (allergies?.trim()) {
    prompt += `- Allergies: ${allergies}\n`;
  }

  prompt += `\nCalculate dailyGoalPercentage based on the ${dailyCalorieTarget} kcal target. Return ONLY the JSON object.`;

  return prompt;
}

function imageToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

async function callBluesminds(
  model: string,
  messages: Array<Record<string, unknown>>
): Promise<{ ok: boolean; content: string | null; error?: string }> {
  try {
    const response = await fetch(
      `${BLUESMINDS_BASE_URL}/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BLUESMINDS_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          stream: false,
          messages,
          max_tokens: 2048,
          temperature: 0.2,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return { ok: false, content: null, error: `[${response.status}] ${errorBody.substring(0, 200)}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { ok: false, content: null, error: "Empty response from model" };
    }

    return { ok: true, content };
  } catch (err) {
    return { ok: false, content: null, error: String(err) };
  }
}

function extractJSON(raw: string): Record<string, unknown> | null {
  let cleaned = raw.trim();
  // Strip markdown code fences
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find JSON object in the response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

// GET /api/analyze — health check
export async function GET() {
  if (!BLUESMINDS_API_KEY) {
    return NextResponse.json(
      { status: "error", message: "BLUESMINDS_API_KEY not set" },
      { status: 500 }
    );
  }

  // Quick text test to verify API is reachable
  const result = await callBluesminds(ANALYSIS_MODEL, [
    { role: "user", content: "hi" },
  ]);

  if (!result.ok) {
    // Try fallback
    for (const fallback of FALLBACK_MODELS) {
      const fb = await callBluesminds(fallback, [
        { role: "user", content: "hi" },
      ]);
      if (fb.ok) {
        return NextResponse.json({
          status: "ok",
          primary: ANALYSIS_MODEL,
          primaryOk: false,
          fallback: fallback,
          fallbackOk: true,
          note: `Primary model ${ANALYSIS_MODEL} is down. Using fallback ${fallback}.`,
        });
      }
    }
    return NextResponse.json(
      { status: "error", message: "All models unreachable", detail: result.error },
      { status: 502 }
    );
  }

  return NextResponse.json({
    status: "ok",
    primary: ANALYSIS_MODEL,
    primaryOk: true,
  });
}

export async function POST(request: NextRequest) {
  if (!BLUESMINDS_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured. Set BLUESMINDS_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const preferencesStr = formData.get("preferences") as string | null;

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }
    if (!preferencesStr) {
      return NextResponse.json({ error: "No preferences provided" }, { status: 400 });
    }

    let preferences: Record<string, unknown>;
    try {
      preferences = JSON.parse(preferencesStr);
    } catch {
      return NextResponse.json({ error: "Invalid preferences JSON" }, { status: 400 });
    }

    // Convert image to base64
    const imageBuffer = await imageFile.arrayBuffer();
    const base64Image = imageToBase64(imageBuffer);
    const mimeType = imageFile.type || "image/jpeg";

    const userPrompt = buildUserPrompt(preferences);
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } },
        ],
      },
    ];

    // Try primary model, then fallbacks
    const modelsToTry = [ANALYSIS_MODEL, ...FALLBACK_MODELS];
    let lastError = "";

    for (const model of modelsToTry) {
      console.log(`Trying model: ${model}`);
      const result = await callBluesminds(model, messages);

      if (!result.ok) {
        lastError = result.error || "Unknown error";
        console.error(`Model ${model} failed:`, lastError);
        continue;
      }

      // Parse the JSON response
      const analysis = extractJSON(result.content!);
      if (!analysis) {
        lastError = `Failed to parse response from ${model}`;
        console.error(lastError, result.content!.substring(0, 300));
        continue;
      }

      // Validate required fields
      const total = analysis.total as Record<string, unknown> | undefined;
      if (
        !analysis.foods ||
        !Array.isArray(analysis.foods) ||
        !total ||
        typeof total.calories !== "number"
      ) {
        lastError = `Invalid analysis format from ${model}`;
        console.error(lastError);
        continue;
      }

      // Add which model was used
      (analysis as Record<string, unknown>)._model = model;
      return NextResponse.json(analysis);
    }

    return NextResponse.json(
      { error: `AI service unavailable. All models failed. Last error: ${lastError}` },
      { status: 502 }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
