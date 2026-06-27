import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { CURATED_CAFES } from "@/lib/curated-data";

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

async function searchPlace(apiKey: string, query: string) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: query + " Delhi NCR cafe coffee",
      maxResultCount: 3,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.places?.[0] ?? null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || apiKey === "your_google_places_api_key_here") {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY not configured" }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });
  }

  // Find which cafés still need syncing
  const { data: existing } = await supabase
    .from("curated_cafes")
    .select("curated_name, google_place_id")
    .not("google_place_id", "is", null);

  const syncedNames = new Set((existing ?? []).map((r: { curated_name: string }) => r.curated_name));
  const toSync = CURATED_CAFES.filter((c) => !syncedNames.has(c.curatedName));

  const results: { name: string; status: "synced" | "not_found" | "error" }[] = [];

  for (const cafe of toSync) {
    try {
      const place = await searchPlace(apiKey, cafe.searchQuery);
      if (!place) {
        results.push({ name: cafe.curatedName, status: "not_found" });
        await sleep(200);
        continue;
      }

      const photoNames = (place.photos ?? []).slice(0, 6).map((p: { name: string }) => p.name);
      const openingHours = place.regularOpeningHours?.weekdayDescriptions ?? [];

      await supabase.from("curated_cafes").upsert(
        {
          curated_name: cafe.curatedName,
          search_query: cafe.searchQuery,
          google_place_id: place.id,
          display_name: place.displayName?.text ?? cafe.curatedName,
          formatted_address: place.formattedAddress,
          latitude: place.location?.latitude,
          longitude: place.location?.longitude,
          rating: place.rating,
          user_rating_count: place.userRatingCount,
          price_level: place.priceLevel
            ? ["PRICE_LEVEL_FREE","PRICE_LEVEL_INEXPENSIVE","PRICE_LEVEL_MODERATE","PRICE_LEVEL_EXPENSIVE","PRICE_LEVEL_VERY_EXPENSIVE"].indexOf(place.priceLevel)
            : null,
          photo_names: photoNames,
          opening_hours: openingHours,
          google_maps_uri: place.googleMapsUri,
          website_uri: place.websiteUri,
          category_tags: cafe.categoryTags,
          specialty_tags: cafe.specialtyTags,
          visited_by_me: cafe.visitedByMe,
          matcha_available: cafe.matchaAvailable,
          coffee_available: cafe.coffeeAvailable,
          city_area: cafe.cityArea,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "curated_name" }
      );

      results.push({ name: cafe.curatedName, status: "synced" });
      await sleep(150); // stay under rate limits
    } catch {
      results.push({ name: cafe.curatedName, status: "error" });
    }
  }

  const synced = results.filter((r) => r.status === "synced").length;
  const notFound = results.filter((r) => r.status === "not_found").length;

  return NextResponse.json({
    synced,
    notFound,
    alreadySynced: syncedNames.size,
    results,
  });
}

// GET returns sync status
export async function GET() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ synced: 0, total: CURATED_CAFES.length, configured: false });
  }

  const { count } = await supabase
    .from("curated_cafes")
    .select("*", { count: "exact", head: true })
    .not("google_place_id", "is", null);

  return NextResponse.json({
    synced: count ?? 0,
    total: CURATED_CAFES.length,
    configured: true,
  });
}
