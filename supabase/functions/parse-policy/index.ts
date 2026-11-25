// Edge function to parse insurance policy PDFs via Gemini
import { handleCors } from '../_shared/cors.ts';
import { requireUser } from '../_shared/auth.ts';
import { json, readJsonBody } from '../_shared/http.ts';

// ==== Schemas ------------------------------------------------------------
const MOTOR_SCHEMA = {
  type: "OBJECT",
  properties: {
    odPremium: { type: "STRING", description: "Own Damage (OD) premium amount without taxes (e.g. 8500)" },
    tpPremium: { type: "STRING", description: "Third Party (TP) premium amount without taxes (e.g. 3200)" },
    gstPercent: { type: "STRING", description: "GST percentage rate, typically 18" },
    gstAmount: { type: "STRING", description: "Total GST amount in INR" },
    totalPremium: { type: "STRING", description: "Final total premium including GST" },
    insuredName: { type: "STRING", description: "Full name of the policyholder / insured vehicle owner" },
    makeModel: { type: "STRING", description: "Vehicle make and model variant (e.g. Hyundai Creta SX, Honda Activa 6G)" },
    registrationCity: { type: "STRING", description: "City or RTO of registration (e.g. Mumbai, Delhi, Bengaluru)" },
    mfgYear: { type: "STRING", description: "Year of manufacture as 4-digit number (e.g. 2022)" },
    vehicleNo: { type: "STRING", description: "Registration number of vehicle (e.g. MH02AB1234)" },
    fuelType: { type: "STRING", description: "One of: Petrol, Diesel, Electric (EV), CNG, Hybrid" },
    odTenure: { type: "STRING", description: "OD policy duration in years, usually 1 or 3" },
    tpTenure: { type: "STRING", description: "TP policy duration in years, usually 1, 3, or 5" },
    odStartDate: { type: "STRING", description: "OD cover start date in YYYY-MM-DD format" },
    odEndDate: { type: "STRING", description: "OD cover end date in YYYY-MM-DD format" },
    tpStartDate: { type: "STRING", description: "TP cover start date in YYYY-MM-DD format" },
    tpEndDate: { type: "STRING", description: "TP cover end date in YYYY-MM-DD format" },
    idv: { type: "STRING", description: "Insured Declared Value in INR (e.g. 650000)" },
    insurer: { type: "STRING", description: "Insurance company name (e.g. Tata AIG, HDFC ERGO, ICICI Lombard)" },
    claimsMade: { type: "STRING", description: "Whether any claim was made in current/past year: Yes or No" },
    addons: { type: "STRING", description: "Comma-separated list of add‑on covers opted (e.g. Zero Depreciation, Engine Protect, RSA)" },
  },
};

const HEALTH_SCHEMA = {
  type: "OBJECT",
  properties: {
    premiumAmount: { type: "STRING", description: "Total health insurance premium amount including taxes" },
    frequency: { type: "STRING", description: "One of: Annual, Half-yearly, Quarterly, Monthly" },
    membersCount: { type: "STRING", description: "Number of members covered under this policy" },
    planType: { type: "STRING", description: "One of: Family Floater, Individual" },
    insuredName: { type: "STRING", description: "Name of insured member (if individual policy) or primary policyholder" },
    policyStartDate: { type: "STRING", description: "Policy inception or renewal start date in YYYY-MM-DD format" },
    policyEndDate: { type: "STRING", description: "Policy expiry or end date in YYYY-MM-DD format" },
    policyTenure: { type: "STRING", description: "Tenure in years (1 to 5)" },
    insurer: { type: "STRING", description: "Insurance company name (e.g. Star Health, HDFC ERGO, Care, Niva Bupa)" },
    planName: { type: "STRING", description: "Specific plan name (e.g. Optima Secure, Comprehensive, Care Supreme)" },
    sumInsured: { type: "STRING", description: "Base sum insured coverage amount in INR (e.g. 1000000)" },
    pedDetails: { type: "STRING", description: "Pre‑existing diseases declared if mentioned (e.g. Diabetes, Hypertension)" },
    planDescription: { type: "STRING", description: "Short description of key benefits (e.g. 2x restore, room rent waiver)" },
  },
};

// ==== Main handler -------------------------------------------------------
Deno.serve(async (req: Request) => {
  // CORS handling
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return json(405, { success: false, error: "Method not allowed" });
  }

  // ---- Auth ----
  const authRes = await requireUser(req);
  if (!authRes.ok) return authRes.response;

  // ---- API key ----
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return json(500, {
      success: false,
      error: "GEMINI_API_KEY is not configured on Supabase Edge Functions. Please add it to Project Settings → Secrets.",
    });
  }

  // ---- Parse request body ----
  const bodyRes = await readJsonBody(req);
  if (!bodyRes.ok) return bodyRes.response;
  const { fileBase64, mimeType, policyCategory } = bodyRes.body as {
    fileBase64?: string;
    mimeType?: string;
    policyCategory?: string;
  };

  if (!fileBase64 || !mimeType) {
    return json(400, { success: false, error: "Both fileBase64 and mimeType are required" });
  }

  const isMotor = ["motor", "car", "bike"].includes(policyCategory ?? "");
  const targetSchema = isMotor ? MOTOR_SCHEMA : HEALTH_SCHEMA;

  const systemInstruction = isMotor
    ? `You are an expert Indian motor insurance document parser. Extract all key fields from this vehicle insurance policy schedule (car or two‑wheeler). Return clean, unformatted numbers for amounts (e.g. "8500" not "Rs. 8,500.00"). Format all dates as YYYY-MM-DD. If a field is not found, return an empty string "".`
    : `You are an expert Indian health insurance document parser. Extract all key fields from this health insurance policy schedule / card. Return clean, unformatted numbers for amounts (e.g. "1000000" not "10 Lakhs"). Format all dates as YYYY-MM-DD. If a field is not found, return an empty string "".`;

  const models = ["gemini-flash-latest", "gemini-3.8-flash"]; // fallback order
  let lastError = "";
  let candidateText = "";

  // ==== Retry / fallback loop ====
  outer: for (const model of models) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    // Build the payload *once* per model (size is logged for debugging)
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              inline_data: { mime_type: mimeType, data: fileBase64 },
            },
            { text: systemInstruction },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        response_schema: targetSchema,
        temperature: 0.1,
      },
    };

    // Single attempt per model – if this fails we fall back to the next model
    for (let attempt = 0; attempt < 1; attempt++) {
      console.log(`Calling Gemini model ${model} (attempt ${attempt + 1}) payload bytes ${JSON.stringify(payload).length}`);
      let res: Response;
      try {
        res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey.trim(),
          },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`Network error calling model ${model}: ${msg}`);
        lastError = msg;
        // retry immediately for network failures (if we have attempts left)
        if (attempt < 1) continue;
        break; // move to next model
      }

        if (res.status === 503) {
          const body = await res.text();
          console.warn(`Model ${model} returned 503 (busy): ${body}`);
          lastError = body;
          // move to next model
          break;
        }

      if (!res.ok) {
        const body = await res.text();
        console.warn(`Model ${model} returned ${res.status}: ${body}`);
        lastError = body;
        // retry on non‑503 errors (if attempts remain)
        if (attempt < 1) continue;
        break; // move to next model
      }

      // Successful HTTP response – extract candidate text
      const data = await res.json();
      candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText) {
        console.log(`Model ${model} succeeded on attempt ${attempt + 1}`);
        break outer; // we have a result, exit both loops
      }
    }
  }

  // ==== No successful extraction ====
  if (!candidateText) {
    // Both models failed (or returned non‑200). Respond with 429 and a friendly message.
    return json(429, {
      success: false,
      error: "All Gemini models are unavailable. Please try again later.",
      details: lastError || "no response",
    });
  }

  // ==== Parse Gemini JSON output ====
  try {
    const parsed = JSON.parse(candidateText);
    return json(200, { success: true, data: parsed });
  } catch (e) {
    return json(500, {
      success: false,
      error: "Failed to parse JSON response from Gemini model",
      rawText: candidateText,
    });
  }
});
