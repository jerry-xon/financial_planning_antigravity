import { json } from "../_shared/http.ts";

Deno.serve(async (req: Request) => {
  // Verify the secret is present
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return json(500, {
      success: false,
      error: "GEMINI_API_KEY not set in Supabase Secrets",
    });
  }

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest",
      {
        method: "GET",
        headers: {
          "x-goog-api-key": apiKey.trim(),
        },
      }
    );
    const body = await res.text();
    return json(200, {
      success: true,
      fetchStatus: res.status,
      fetchOk: res.ok,
      responseBody: body,
    });
  } catch (e) {
    return json(500, {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    });
  }
});