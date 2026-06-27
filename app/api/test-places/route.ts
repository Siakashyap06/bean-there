import { NextResponse } from "next/server";

/**
 * Diagnostic route — proves Google Places API works independently of the UI.
 * GET /api/test-places
 * Returns: { ok, keyPresent, httpStatus, googleError?, count, places[] }
 */
export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // Step 1: key present?
  if (!apiKey || apiKey === "your_google_places_api_key_here") {
    return NextResponse.json({
      ok: false,
      keyPresent: false,
      diagnosis: "GOOGLE_PLACES_API_KEY is missing or still set to the placeholder value in .env.local",
      fix: "Add your real Google Places API key to .env.local as GOOGLE_PLACES_API_KEY=AIza...",
    });
  }

  // Step 2: make one simple searchText call — coffee shops in Delhi
  let httpStatus = 0;
  let googleError: unknown = null;
  let places: { name: string; address: string; rating?: number }[] = [];

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating",
      },
      body: JSON.stringify({
        textQuery: "coffee shop Delhi India",
        maxResultCount: 5,
      }),
      // No cache — always fresh for diagnostics
      cache: "no-store",
    });

    httpStatus = res.status;

    if (!res.ok) {
      try { googleError = await res.json(); } catch { googleError = await res.text(); }
      const errMsg = (googleError as Record<string, Record<string, string>>)?.error?.message ?? JSON.stringify(googleError);

      // Decode common error codes
      let diagnosis = `Google returned HTTP ${httpStatus}`;
      let fix = "";
      if (httpStatus === 403) {
        diagnosis = "403 Forbidden — API key does not have Places API (New) enabled, OR billing is not active on this GCP project";
        fix = "Go to console.cloud.google.com → APIs & Services → Enable 'Places API (New)'. Also verify billing is enabled.";
      } else if (httpStatus === 400) {
        diagnosis = `400 Bad Request — ${errMsg}`;
        fix = "The request format is wrong. Check the field mask or request body.";
      } else if (httpStatus === 429) {
        diagnosis = "429 Quota exceeded — you have hit your daily/per-minute request limit";
        fix = "Check quotas at console.cloud.google.com → APIs & Services → Quotas.";
      } else if (httpStatus === 401) {
        diagnosis = "401 Unauthorized — the API key is invalid or has been deleted";
        fix = "Verify the key exists and is not restricted to an IP/referrer that blocks server-side calls.";
      }

      return NextResponse.json({
        ok: false,
        keyPresent: true,
        httpStatus,
        googleError,
        diagnosis,
        fix,
        count: 0,
        places: [],
      });
    }

    const data = await res.json();
    const raw = (data.places ?? []) as Array<{
      id: string;
      displayName?: { text: string };
      formattedAddress?: string;
      rating?: number;
    }>;

    places = raw.map((p) => ({
      name: p.displayName?.text ?? "(no name)",
      address: p.formattedAddress ?? "(no address)",
      rating: p.rating,
    }));

    return NextResponse.json({
      ok: true,
      keyPresent: true,
      httpStatus,
      diagnosis: `SUCCESS — Google Places API is working. Found ${places.length} coffee shops in Delhi.`,
      count: places.length,
      places,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      keyPresent: true,
      httpStatus,
      diagnosis: "Network error — could not reach places.googleapis.com",
      error: String(err),
      count: 0,
      places: [],
    });
  }
}
