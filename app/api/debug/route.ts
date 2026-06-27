/**
 * GET /api/debug
 * Checks all environment variables and connectivity.
 * DELETE THIS FILE before deploying to production.
 */
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const report: Record<string, unknown> = {};

  // ── 1. Env var presence ────────────────────────────────────────────────────
  report.env = {
    GOOGLE_PLACES_API_KEY: !apiKey
      ? "❌ MISSING"
      : apiKey === "your_google_places_api_key_here"
      ? "❌ PLACEHOLDER (not replaced)"
      : `✅ SET (starts with ${apiKey.slice(0, 8)}…)`,

    SUPABASE_URL: !supabaseUrl
      ? "❌ MISSING"
      : supabaseUrl === "https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
      ? "❌ PLACEHOLDER (not replaced)"
      : `✅ SET (${supabaseUrl})`,

    SUPABASE_SERVICE_ROLE_KEY: !supabaseKey
      ? "❌ MISSING"
      : supabaseKey.startsWith("eyJ")
      ? `✅ SET (JWT, starts with ${supabaseKey.slice(0, 20)}…)`
      : "⚠️ SET but unusual format",
  };

  // ── 2. Google Places API test ──────────────────────────────────────────────
  if (!apiKey || apiKey === "your_google_places_api_key_here") {
    report.google = { status: "❌ SKIPPED — API key not configured" };
  } else {
    try {
      const testRes = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
        },
        body: JSON.stringify({
          includedTypes: ["cafe"],
          maxResultCount: 3,
          locationRestriction: {
            circle: {
              center: { latitude: 28.6304, longitude: 77.2177 }, // Connaught Place
              radius: 1000,
            },
          },
        }),
      });

      if (!testRes.ok) {
        const err = await testRes.json().catch(() => ({}));
        report.google = {
          status: `❌ API ERROR — HTTP ${testRes.status}`,
          error: err,
          hint: testRes.status === 403
            ? "API key valid but Places API (New) not enabled — go to Google Cloud Console → APIs & Services → Library → enable 'Places API (New)'"
            : testRes.status === 400
            ? "API key format invalid"
            : "Unknown error",
        };
      } else {
        const data = await testRes.json();
        const places = data.places ?? [];
        const withPhotos = places.filter((p: { photos?: unknown[] }) => (p.photos ?? []).length > 0);
        report.google = {
          status: "✅ CONNECTED",
          placesReturned: places.length,
          placesWithPhotos: withPhotos.length,
          samplePlace: places[0]?.displayName?.text ?? "none",
          samplePhotoName: places[0]?.photos?.[0]?.name ? places[0].photos[0].name.slice(0, 60) + "…" : "none",
        };
      }
    } catch (err) {
      report.google = { status: "❌ NETWORK ERROR", error: String(err) };
    }
  }

  // ── 3. Supabase test ───────────────────────────────────────────────────────
  const supabase = getSupabaseClient();
  if (!supabase) {
    report.supabase = { status: "❌ SKIPPED — SUPABASE_URL or SERVICE_ROLE_KEY not set" };
  } else {
    try {
      const { count: curatedCount, error: e1 } = await supabase
        .from("curated_cafes")
        .select("*", { count: "exact", head: true });

      const { count: cafesCount, error: e2 } = await supabase
        .from("cafes")
        .select("*", { count: "exact", head: true });

      const { count: withPhotos, error: e3 } = await supabase
        .from("cafes")
        .select("*", { count: "exact", head: true })
        .not("photo_names", "eq", "{}");

      report.supabase = {
        status: e1 || e2 ? "⚠️ CONNECTED but table error" : "✅ CONNECTED",
        tables: {
          curated_cafes: e1 ? `❌ ${e1.message}` : `✅ ${curatedCount} rows`,
          cafes: e2 ? `❌ ${e2.message}` : `✅ ${cafesCount} rows`,
          cafes_with_photos: e3 ? `❌ ${e3.message}` : `${withPhotos} rows have photos`,
        },
        hint: (cafesCount ?? 0) === 0
          ? "Run migrations first: supabase/migrations/001_curated_cafes.sql then 002_master_cafes.sql"
          : null,
      };
    } catch (err) {
      report.supabase = { status: "❌ ERROR", error: String(err) };
    }
  }

  // ── 4. Photo proxy self-test ───────────────────────────────────────────────
  report.photoProxy = {
    endpoint: "/api/places/photo?name=<place_photo_name>&w=400",
    note: "Returns 204 when API key missing, real JPEG when key is valid and photo name is correct",
    keyStatus: (report.env as Record<string, unknown>)?.GOOGLE_PLACES_API_KEY,
  };

  // ── 5. Summary ─────────────────────────────────────────────────────────────
  const googleOk = typeof report.google === "object" && (report.google as Record<string, unknown>).status?.toString().startsWith("✅");
  const supabaseOk = typeof report.supabase === "object" && (report.supabase as Record<string, unknown>).status?.toString().startsWith("✅");

  report.summary = {
    googlePlacesConnected: googleOk ? "YES" : "NO",
    supabaseConnected: supabaseOk ? "YES" : "NO",
    photosWillLoad: googleOk ? "YES — real Google photos" : "NO — No Photo Available shown",
    curatedCafesAvailable: 51,
    liveSearchWorking: googleOk ? "YES" : "NO",
    nextSteps: !googleOk
      ? ["1. Set GOOGLE_PLACES_API_KEY in .env.local", "2. Enable Places API (New) in Google Cloud Console", "3. Restart dev server (next dev)"]
      : !supabaseOk
      ? ["1. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local", "2. Run SQL migrations in Supabase dashboard", "3. POST /api/places/curated-sync to populate 51 curated cafés with real photos"]
      : ["1. POST /api/places/curated-sync — sync all 51 curated cafés", "2. POST /api/places/city-crawl — crawl all Delhi NCR", "3. Everything is working ✅"],
  };

  return NextResponse.json(report, {
    headers: { "Cache-Control": "no-store" },
  });
}
