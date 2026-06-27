/**
 * /api/places/city-crawl
 *
 * Systematically fetches every café/coffee shop across Delhi NCR by running
 * a Google Places Nearby Search at each point in the predefined grid, then
 * saves everything to the Supabase master `cafes` table (upsert, no duplicates).
 *
 * POST  ?start=0&end=47   — crawl tiles [start, end)  (default: all)
 * GET                     — return current row count from Supabase
 */

import { NextRequest, NextResponse } from "next/server";
import { DELHI_NCR_GRID, TILE_RADIUS_M } from "@/lib/delhi-ncr-grid";
import { savePlacesToCache } from "@/lib/supabase-cafes";
import { getSupabaseClient } from "@/lib/supabase";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.photos",
  "places.regularOpeningHours",
  "places.currentOpeningHours",
  "places.types",
  "places.primaryType",
  "places.editorialSummary",
  "places.googleMapsUri",
  "places.websiteUri",
].join(",");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchTile(
  apiKey: string,
  lat: number,
  lng: number,
  radius: number
): Promise<Record<string, unknown>[]> {
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        includedTypes: ["cafe", "coffee_shop"],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius,
          },
        },
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.places ?? [];
  } catch {
    return [];
  }
}

// ── POST: run the crawl ───────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || apiKey === "your_google_places_api_key_here") {
    return NextResponse.json({ error: "API_KEY_NOT_CONFIGURED" }, { status: 400 });
  }

  const { searchParams } = request.nextUrl;
  const start = parseInt(searchParams.get("start") || "0");
  const end = parseInt(searchParams.get("end") || String(DELHI_NCR_GRID.length));
  const tiles = DELHI_NCR_GRID.slice(start, end);

  const summary: { area: string; found: number; saved: number }[] = [];
  const allIds = new Set<string>();
  let totalRaw = 0;
  let totalNew = 0;

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    console.log(`[City Crawl] Tile ${start + i + 1}/${DELHI_NCR_GRID.length} — ${tile.area} (${tile.lat.toFixed(4)}, ${tile.lng.toFixed(4)})`);

    const places = await fetchTile(apiKey, tile.lat, tile.lng, TILE_RADIUS_M);
    totalRaw += places.length;

    // Deduplicate within this batch (against all tiles so far)
    const fresh = places.filter((p) => {
      const id = p.id as string;
      if (!id || allIds.has(id)) return false;
      allIds.add(id);
      return true;
    });
    totalNew += fresh.length;

    if (fresh.length > 0) {
      await savePlacesToCache(fresh as never[]);
    }

    summary.push({ area: tile.area, found: places.length, saved: fresh.length });
    console.log(`[City Crawl]   → found: ${places.length}, new unique: ${fresh.length}`);

    // Respect Google rate limits: 200ms between requests (= ~5 req/s, well under 10 req/s limit)
    if (i < tiles.length - 1) await sleep(200);
  }

  console.log(`[City Crawl] DONE — tiles: ${tiles.length}, raw results: ${totalRaw}, unique new: ${totalNew}`);

  return NextResponse.json({
    tilesProcessed: tiles.length,
    totalTiles: DELHI_NCR_GRID.length,
    rawResults: totalRaw,
    uniqueNewPlaces: totalNew,
    summary,
  });
}

// ── GET: status ───────────────────────────────────────────────────────────────
export async function GET() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({
      totalCafes: 0,
      totalTiles: DELHI_NCR_GRID.length,
      tileRadius: TILE_RADIUS_M,
      areas: DELHI_NCR_GRID.map((g) => g.area),
      message: "Supabase not configured — run with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY",
    });
  }

  const { count } = await supabase
    .from("cafes")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({
    totalCafes: count ?? 0,
    totalTiles: DELHI_NCR_GRID.length,
    tileRadius: TILE_RADIUS_M,
    areas: DELHI_NCR_GRID.map((g) => g.area),
  });
}
